'use strict';

var nssocket = require('nssocket');
var util = require('util');
var events2 = require('eventemitter2');

var NsuniteServer = exports.Server = function(options) {
	this.options = options;
	this.channels = {};
};

util.inherits(NsuniteServer, events2.EventEmitter2);


NsuniteServer.prototype.start = function() {
	var self = this;
	try {
		this.server = nssocket.createServer(self.onNewSocket.bind(self)).listen(self.options.port);
	} catch (e) {
		throw e;
	}
	this.emit('ready');
};

NsuniteServer.prototype.says = function(channel, data) {
	var self = this;
	return new Promise(function(resolve, reject) {
		
		if(typeof self.channels[channel] !== 'undefined') {
			// loop through all the sockets in the channel and send
			// the data to them
			var socketCount = self.channels[channel].length
			for(var i = 0; i < socketCount; i++) {
				try {
					self.channels[channel][i].send(['serverSays', 'data'], data);
				} catch (e) {
					console.log('Something went wrong sending message to socket: ', e);
				}
			}
			return resolve();
		} else {
			return reject(new Error('channel does not exist'));
		}

	});
};

NsuniteServer.prototype.onNewSocket = function (socket) {
	var self = this;
	this.emit('newSocket', socket);
	
	// set up listeners
	socket.data(['clientSays', 'join'], function(data) {
		self.onJoin.apply(self, [data, socket])
	});
	socket.data(['clientSays', 'data'], this.onClientSays.bind(this));

};

NsuniteServer.prototype.onJoin = function (data, socket) {
	this.emit('join', data, socket);

	// if the channel doesn't exist yet then we should
	if(typeof this.channels[data.channel] === 'undefined') {
		this.channels[data.channel] = [];
	}

	this.channels[data.channel].push(socket);
	
};

NsuniteServer.prototype.onClientSays = function (data) {
	this.emit('clientSays', data);
	
	this.says(data.channel, data.data)
		.then(function() {
			console.log('completed rebroadcasting the message');
		});
};


var NsuniteClient = exports.Client = function(options, channel) {
	var self = this;

	this.socket = nssocket.NsSocket({
		reconnect: options.reconnect
	});

	this.options = options;
	this.channel = channel;
	this.port = options.port || 6789;
	this.host = options.host || '127.0.0.1';

	this.socket.on('start', function () {
	    self.emit('start');
	});

	this.socket.on('close', function() {
		self.emit('close');
	});

	this.socket.on('idle', function() {
		self.emit('idle');
	});

	this.socket.on('error', function(err) {
		self.emit('error', err);
	});

	this.socket.data(['serverSays', 'data'], function(data) {
		self.emit('hears', data);
	});
};

util.inherits(NsuniteClient, events2.EventEmitter2);

NsuniteClient.prototype.connect = function() {
	// connect to the socket and send connecting signal
	this.socket.connect(this.port, this.host, this.onConnect.bind(this));
};

NsuniteClient.prototype.onConnect = function() {
	this.socket.send(['clientSays', 'join'], {channel: this.channel});
	this.emit('ready');
};

NsuniteClient.prototype.says = function(data) {
	console.log('sending data');
	this.socket.send(['clientSays', 'data'], {
		channel: this.channel,
		data: data
	});
};

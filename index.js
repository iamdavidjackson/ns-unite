'use strict';

var nssocket = require('nssocket');
var Promise = require('bluebird');

var nsunite = exports;

nsunite.createServer = function(options) {

	// add default options here...
	return new Promise(function(resolve, reject) {
		var server = new NsuniteServer(options);
		server.createServer(options)
			.then(function() {
				resolve(server);
			})
			.catch(function(e) {
				reject(e);
			});
	});	
	
};

nsunite.createClient = function(options, channel) {
	// add default options here...

	return new Promise(function(resolve, reject) {
		var client = new NsuniteClient(options, channel);
		client.createClient()
			.then(function() {
				resolve(client);
			})
			.catch(function(e) {
				reject(e);
			});
	});	
};

var NsuniteServer = function(options) {
	this.options = options;
	this.channels = {};
};

NsuniteServer.prototype.createServer = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		try {
			self.server = nssocket.createServer(function(socket) {
				console.log('new socket connection');
				
				// set up listeners
				socket.data(['clientSays', 'join'], function(data) {
					console.log('received join request');
					// if the channel doesn't exist yet then we should
					if(typeof self.channels[data.channel] === 'undefined') {
						self.channels[data.channel] = [];
					}

					self.channels[data.channel].push(socket);
				});

				socket.data(['clientSays', 'data'], function(data) {
					console.log(data.channel, ' channel received data: ', data.data);
					console.log('rebroadcasting the message');
					self.says(data.channel, data.data)
						.then(function() {
							console.log('completed rebroadcasting the message');
						});
				});

			}).listen(self.options.port);
		} catch (e) {
			return reject(e);
		}
		console.log('server ready');
		return resolve();
	});
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

var NsuniteClient = function(options, channel) {

	this.socket = nssocket.NsSocket({
		reconnect: options.reconnect
	});
	this.options = options;
	this.channel = channel;
	this.port = options.port || 6789;
	this.host = options.host || '127.0.0.1';

	this.socket.on('start', function () {
	    console.dir('start');
	});
};

NsuniteClient.prototype.createClient = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		// connect to the socket and send connecting signal
		self.socket.connect(self.port, self.host, function() {
			console.log('Connected to server');
			console.log('Joining channel');
			self.socket.send(['clientSays', 'join'], {channel: self.channel});
			resolve();
		});
	});
	
}

NsuniteClient.prototype.says = function(data) {
	var self = this;
	return new Promise(function(resolve, reject) {
		console.log('sending data');
		self.socket.send(['clientSays', 'data'], {
			channel: self.channel,
			data: data
		});
		resolve();
	});
};

NsuniteClient.prototype.hears = function(cb) {
	var self = this;
	return new Promise(function(resolve, reject) {
		console.log('setting up listener');
		self.socket.data(['serverSays', 'data'], cb);
		resolve();
	});
};

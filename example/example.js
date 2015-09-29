'use strict';
var nsunite = require('../index');

var port = 6789;

// create a server
var clientSettings = {
	port: port,
	reconnect: false
};

var serverSettings = {
	port: port
};

var server = new nsunite.Server(serverSettings);

server.on('join', function(data, socket) {
	console.log('new join event: ', data);
});

server.on('clientSays', function(data) {
	console.log('clientSays: ', data);
});

server.on('ready', function() {
	console.log('server is ready');
	initClient();
});

server.start();

function initClient() {
	var client = new nsunite.Client(clientSettings);

	client.on('ready', function() {
		client.says('wooooo');

		client.says('start the car!');
	});

	client.on('hears', function(data) {
		console.log('received data: ', data);
	});

	client.connect();
	
}

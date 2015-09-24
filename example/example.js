'use strict';

var unite = require('../index');
var Promise = require('bluebird');

var server;
var client;
var port = 6789;

// create a server
unite.createServer({
	port: port,
}).then(function(_server) {
	// cache the server if you want to do something with it
	server = _server;

	// awesome now lets connect to it
	var settings = {
		port: port,
		reconnect: false
	};
	return unite.createClient(settings, 'testing');

}).then(function(_client) {
	// cache the client if you want to do something with it
	client = _client;

	// sweet ok lets send a message over there then
	return client.says('wooooo');
}).then(function() {

	// lets add a listener to the client
	return client.hears(function(data) {
		console.log('received data: ', data);
	});
})
.then(function() {
	return client.says('start the car!');
});

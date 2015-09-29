# ns-unite
nssocket wrapper for easily synchronizing data between servers.

## Installation
`$ npm install ns-unite`

## Usage
ns-unite wraps nssocket in some simple functionality to create a server and connect to it with a client.  It exposes a `says` function on the client for sending messages and and `hears` event for receiving them.  

### Create a Server
On one machine you want to create a server like this:

```
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
});

server.start();
```


### Create a Client
On lots of other machines you want to create clients like this:

```
var client = new nsunite.Client(clientSettings);

client.on('ready', function() {
	client.says('wooooo');

	client.says('start the car!');
});

client.on('hears', function(data) {
	console.log('received data: ', data);
});

client.connect();
```
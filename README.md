# ns-unite
nssocket wrapper for easily synchronizing data between servers.

## Installation
`$ npm install ns-unite`

## Usage
ns-unite uses promises powered by Bluebird for all of it's interactions.  It's intentionally made to be super simple and only send messages and receive messages.  Nothing fancy here...

### Create a Server
On one machine you want to create a server like this:

```
var server;
var settings = {
  port: 6789
};
unite.createServer(settings).then(function(_server) {
	// cache the server if you want to do something with it
	server = _server;
});
```


### Create a Client
On lots of other machines you want to create clients like this:

```
var client;
var settings = {
	port: 6789,
	reconnect: false
};

unite.createClient(settings, 'cleverChannelName').then(function(_client) {
	// cache the client if you want to do something with it
	client = _client;
});
```

### Sending messages
Clients have access to `says` and `hears` methods for sending and receiving messages.  The server will rebroadcast any message it receives to all the other clients connected to that channel.

```
client.says('start the car!');
client.says({
  wow: "this",
  is: "awesome"
});
```

```
client.hears(function(data) {
  console.log('received data: ', data);
});
```

That's it for now....

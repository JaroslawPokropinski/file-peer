var PeerServer = require('peer').PeerServer;
var server = new PeerServer({
	port: process.env.PORT || 9000,
	key: 'peerjs'
});
const express = require('express');
const http = require('http');
const https = require('https');
const ExpressPeerServer = require('peer').ExpressPeerServer;

const app = express();

// Express configuration
app.get('/', (req, res) => {
  res.send('Hello world!');
});
//

const options = {
  port: process.env.PORT || 9000,
  expire_timeout: 5000,
  alive_timeout: 60000,
  key: 'peerjs',
  path: '/myapp',
  concurrent_limit: 5000,
  allow_discovery: false,
  proxied: false,
  cleanup_out_msgs: 1000,
  ssl: {
    key: '',
    cert: '',
  },
};

let server;
if (options.ssl && options.ssl.key && options.ssl.cert) {
  server = https.createServer(options.ssl, app);
  delete options.ssl;
} else {
  server = http.createServer(app);
}

const peerjs = ExpressPeerServer(server, options);
app.use(peerjs);

server.listen(options.port);

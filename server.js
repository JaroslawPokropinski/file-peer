const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const https = require('https');
const cors = require('cors');
const ExpressPeerServer = require('peer').ExpressPeerServer;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Express configuration
app.get('/', (req, res) => {
  res.send('Hello world!');
});

let users = new Map();
app.put('/user', (req, res, next) => {
  if (!req.body.id || !req.body.name) {
    next('Bad parameters!');
    return;
  }
  users.set(req.body.name, req.body.id);
  console.log(`${req.body.name} connected`);
  res.send();
});

app.get('/users', (req, res) => {
  let re = [];
  for (let user of users.keys()) {
    re.push(user);
  }
  res.send(re);
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

const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const https = require('https');
const cors = require('cors');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const moment = require('moment');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('react'));
// Express configuration
app.get('/', (req, res) => {
  res.send('Hello world!');
});

let users = new Map();
app.put('/users', (req, res, next) => {
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

let mockFiles = [
  {
    owner: 'jarek',
    ownerId: '',
    name: 'file.txt',
    id: '6e45724b-fb77-4c5f-b06b-edd5128a0236',
    date: moment.utc().format(),
    valid: false,
    size: '40',
  },
];
let files = [];

app.get('/files', (req, res) => {
  res.send(files);
});

app.post('/files', (req, res) => {
  // TODO: validate and authorize
  let file = req.body;
  if (!users.has(file.owner)) {
    console.log(`User ${file.owner} is logged out`);
    res.status(400).send();
    return
  }
  file.valid = true;
  file.date = moment.utc().format();
  file.ownerId = users.get(file.owner);
  files.push(file);
  res.send();
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

peerjs.on('connection', (client) => {
  console.log(`Client ${client.id} connected`);
});

peerjs.on('disconnect', (client) => {
  console.log(`Client ${client.id} disconnected`);
  files.forEach((file) => {
    if (file.ownerId === client.id) {
      file.valid = false;
    }
  });
});
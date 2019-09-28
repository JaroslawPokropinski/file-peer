const express = require('express');
const path = require('path');
const session = require('express-session');
// var MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');

const http = require('http');
const https = require('https');
const cors = require('cors');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const { router: api, onConnect, onDisconnect } = require('./routes/api');

const app = express();
app.use(express.static(path.join(__dirname, 'react')));

app.get('/app/*', (_req, res) => {
  res.sendFile(path.join(__dirname + '/react/index.html'));
});

// var MongoDBStore = require('connect-mongodb-session')(session);
// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
//   collection: 'mySessions',
// });
const DBStore = process.env.PROD
  ? require('connect-pg-simple')(session)
  : require('connect-mongodb-session')(session)
  ;

const store = process.env.PROD
  ? new DBStore()
  : new DBStore({
      uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
      collection: 'mySessions',
    });

app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'shhhh! its a secret1',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    store,
  })
);
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/api', api);

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

peerjs.on('connection', onConnect);

peerjs.on('disconnect', onDisconnect);

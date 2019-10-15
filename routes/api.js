const { Router } = require('express');
const moment = require('moment');
const uuidv1 = require('uuid/v1');

const router = Router();

class UserInfo {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.rooms = [];
  }
}
let users = new Map();
router.post('/session', (req, res) => {
  if (req.body.id === undefined) {
    res.status(400).send();
  }

  if (req.session.name) {
    if (users.has(req.session.name)) {
      users.get(req.session.name).id = req.body.id;
    } else {
      users.set(req.session.name, new UserInfo(req.body.id, req.session.name));
    }

    // users.set(req.session.name, new UserInfo(req.body.id, req.session.name));
    if (req.session.roomId !== undefined && !rooms.has(req.session.roomId)) {
      req.session.roomId = undefined;
    }
    res.send({ name: req.session.name, roomId: req.session.roomId });
  } else {
    res.status(300).send(null);
  }
});

router.post('/login', (req, res) => {
  if (req.body.name === undefined || req.body.id === undefined) {
    return res.status(400).send();
  }
  req.session.name = req.body.name;
  users.set(req.session.name, new UserInfo(req.body.id, req.session.name));
  console.log(`User ${req.session.name} logged in`, req.sessionID);
  res.send();
});

router.post('/logout', (req, res, next) => {
  const name = req.session.name;
  const id = req.sessionID;
  req.session.destroy((err) => {
    if (err) {
      console.log(`User ${name} failed to logout`, id);
      return next(err);
    }
    console.log(`User ${name} logged out`, id);
    return res.send();
  });
});

router.get('/users', (req, res) => {
  let re = [];
  for (let user of users.keys()) {
    re.push(user);
  }
  res.send(re);
});

class Room {
  constructor() {
    this.id = uuidv1();
    this.files = [];
  }
}

let rooms = new Map();

router.get('/rooms', (req, res) => {
  if (!req.session.name) {
    return res.status(300).send();
  }
  res.send(users.get(req.session.name).rooms);
});

router.post('/rooms', (req, res) => {
  const room = new Room();
  rooms.set(room.id, room);
  req.session.roomId = room.id;
  res.send(room.id);
});

router.post('/rooms/join', (req, res) => {
  if (req.body.id === undefined || !rooms.has(req.body.id)) {
    return res.status(400).send();
  }
  req.session.roomId = req.body.id;
  res.send();
});

router.post('/rooms/leave', (req, res) => {
  req.session.roomId = undefined;
  res.send();
});


router.get('/files', (req, res) => {
  if (
    req.session.roomId !== undefined &&
    req.session.roomId !== null &&
    rooms.has(req.session.roomId)
  ) {
    return res.send(rooms.get(req.session.roomId).files);
  }
  res.send([]);
});

const sendFilesInfo = async (req, res) => {
  if (
    req.session.roomId !== undefined &&
    req.session.roomId !== null &&
    rooms.has(req.session.roomId)
  ) {
    return res.write(`data: ${JSON.stringify(rooms.get(req.session.roomId).files)}\n\n`);
  }
  res.write(`data: ${JSON.stringify([])}\n\n`);
}

router.get('/files/stream', (req, res) => {
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  sendFilesInfo(req, res);
  setInterval(() => sendFilesInfo(req, res), 1000);
});

router.post('/files', (req, res) => {
  if (
    req.session.roomId === undefined ||
    req.session.roomId === null ||
    !rooms.has(req.session.roomId)
  ) {
    return res.status(400).send();
  }
  let file = req.body;
  if (!users.has(file.owner)) {
    console.log(`User ${file.owner} is logged out`);
    return res.status(400).send(`User ${file.owner} is logged out`);
  }
  file.valid = true;
  file.date = moment.utc().format();
  file.ownerId = users.get(file.owner).id;
  rooms.get(req.session.roomId).files.push(file);
  res.send();
});

const onConnect = (client) => {
  console.log(`Client ${client.id} connected`);
};

const onDisconnect = (client) => {
  console.log(`Client ${client.id} disconnected`);
  rooms.forEach((key, val) => {
    val.files.forEach((file) => {
      if (file.ownerId === client.id) {
        file.valid = false;
      }
    });
  });

};

module.exports = { router, onConnect, onDisconnect };

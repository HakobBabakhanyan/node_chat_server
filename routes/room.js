const express = require('express');
const router = express.Router();
const RoomController = require('../app/http/controllers/room')
const cors = require('cors')

/* GET users listing. */
router.post('/create', cors(), RoomController.store);
router.get('/index', cors(), RoomController.index);
router.get('/:key', cors(), RoomController.room);

// router.post('/clients', RoomController.clientsAdd);

module.exports = router;

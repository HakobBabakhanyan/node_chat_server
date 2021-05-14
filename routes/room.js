const express = require('express');
const router = express.Router();
const RoomController = require('../app/http/controllers/room')
const cors = require('cors')

/* GET users listing. */
router.post('/create', RoomController.store);
router.get('/create', RoomController.create);
router.get('/:key', cors(), RoomController.room);

// router.post('/clients', RoomController.clientsAdd);

module.exports = router;

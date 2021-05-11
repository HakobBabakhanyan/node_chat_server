var express = require('express');
var router = express.Router();
var RoomController = require('../app/http/controllers/room')

/* GET users listing. */
router.post('/create', RoomController.store);
router.get('/create', RoomController.create);
router.get('/:key', RoomController.room);

// router.post('/clients', RoomController.clientsAdd);

module.exports = router;

var express = require('express');
var router = express.Router();
var SocketIoController = require('../app/http/controllers/socket_io')
var cors = require('cors')

/* GET home page. */
router.post('/connect/:key', cors(), SocketIoController.connect);


module.exports = router;


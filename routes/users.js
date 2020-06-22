var express = require('express');
var router = express.Router();
var UserController = require('../app/http/controllers/user')

/* GET users listing. */
router.get('/clients', UserController.clients);

router.post('/clients', UserController.clientsAdd);

module.exports = router;

var express = require('express');
var router = express.Router();
var UserController = require('../app/http/controllers/user')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/login', UserController.signIn);

router.post('/login', UserController.login)


module.exports = router;


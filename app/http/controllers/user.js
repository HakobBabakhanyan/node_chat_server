const User = require("../../models/user.js");
const Client = require("../../models/client.js");
const bcrypt = require("bcrypt");

async function create(req, res) {
    const { email, password } = req.body;

    const user = await User.create({
        email,
        password
    });

    res.json({
        user,
        message: "create user successfully"
    });
}

async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({
        email
    }).select('+password');
    if (!user) {
        return res.redirect('back')
    }
    if (bcrypt.compareSync(password, user.password)) {
        req.session.auth = true;
        return res.redirect(301,'/users/clients')
    } else {
        return res.redirect('back')
    }
}


function signIn(req, res){
    console.log(req.session.auth)
    if(req.session.auth){
        res.redirect(301,'/users/clients')
    }
    else res.render('./auth/login', { title: 'Express' });
}

async function clients(req, res){
        if(!req.session.auth){
            return res.redirect(301,'/login')
        }
        let clients = await Client.find()

        return res.render('./clients/clients',{clients :clients})
}


function clientsAdd(req, res){
    Client.create({name:req.body.name, key: require('crypto').randomBytes(60).toString('hex')})

    return res.redirect('/users/clients');
}

module.exports = {
    login,
    signIn,
    clients,
    clientsAdd
}
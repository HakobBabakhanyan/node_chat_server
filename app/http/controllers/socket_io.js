const Client = require("../../models/client.js");

let stream = require('../../../chat/stream');


async function connect(req, res){
    // if(req.body.key){
        let io = req.app.get('socket_io');
        io.of('/' + req.params.key).on('connection', stream);
        // let client = await  Client.findOne({'key':req.body.key})
        //  if(client){
        //      io.of('/' + 'test').on('connection', stream);
        //      return  res.json({ url: '/' + 'test' })
        //  }else {
        //      return res.json(404,{'message':'client not fount'})
        //  }
    // }

    return res.json({url:'test'});
}

module.exports = {
    connect
}

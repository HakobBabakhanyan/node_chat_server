const Room = require("../../models/room")


async function store(req, res) {

    const  room  = await  Room.create(
        {
            name : req.body.name
        }
    )

    res.redirect(`/room/${room.key}`)

}
async function create(req, res) {

    res.render('create', { title: 'create' } );
}

async function room(req, res) {
    // const { email, password } = req.body;

    const room = await Room.find({
        key: req.params.key
    });

    if(!room) {
        res.redirect('/room/create')
    }
    const io = req.app.get('socket_io');

    const stream = require('../../../chat/stream')(io);

    if(!io.nsps['/'+room[0].key]) {

        io.of('/'+room[0].key).on('connection', stream);
    }
    // console.log(io.of(room[0].key))
    // io.of('/'+room[0].key).on('connection', stream);
    // console.log(io.of(room[0].key))
    // console.log(io)
    // io.of('/'+room[0].key).on('connection', stream);

    res.render('room', { title:  room[0].name, key: room[0].key } );
}

module.exports = {
    store,
    create,
    room
}

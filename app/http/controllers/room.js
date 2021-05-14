const Room = require("../../models/room")


async function store(req, res) {

    const room = await Room.create(
        {
            name: req.body.name
        }
    )

    res.redirect(`/room/${room.key}`)

}

async function create(req, res) {

    res.render('create', {title: 'create'});
}

async function room(req, res) {
    // const { email, password } = req.body;

    const room = await Room.find({
        key: req.params.key
    });

    if (!room) {
        res.redirect('/room/create')
    }

    return res.json({roomName: room[0].name})
}

module.exports = {
    store,
    create,
    room
}

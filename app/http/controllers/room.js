const Room = require("../../models/room")


async function store(req, res) {


    const room =  await Room.create(
        {
            name: req.body.name
        }
    )

    return res.json(room)
}
async function room(req, res) {
    // const { email, password } = req.body;

    const room = await Room.find({
        key: req.params.key
    });

    if (!room[0]) {
      return  res.json(null, 412)
    }

    return res.json({roomName: room[0].name})
}

async function index(req, res) {
    // const { email, password } = req.body;

    const room = await Room.find({});

    return res.json(room)
}

module.exports = {
    store,
    room,
    index
}

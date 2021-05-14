
module.exports = function (io) {
    const clients = {};

    let counts;

    function getOnlineList(id) {

        return  Object.keys(clients).filter(key =>
             id != key
        ).reduce((obj, key) => {
            obj[key] = clients[key];
            return obj;
        }, {})
    }

    return  (socket)=>{

        socket.nsp.fetchSockets().then( (e) => {
            console.log(e.length)
        })

        socket.on('init', (data)=>{

            clients[data.name] = {
                name: data.name,
                id: socket.id
            }

            socket.join(socket.nsp.name)
            const users = [];
            for (let client in clients){
                users.push(client);
            }
            socket.emit('users:online', users)
        });
        socket.on('message:to', (data) => {
            socket.to(socket.nsp.name).emit('message:from', {
                name : data.name,
                message: data.message
            })
        })

        // socket.on('newUserStart', (data)=>{
        //     socket.to(data.to).emit('newUserStart', {sender:data.sender});
        // });
        //
        //
        // socket.on('sdp', (data)=>{
        //     socket.to(data.to).emit('sdp', {description: data.description, sender:data.sender});
        // });
        //
        // socket.on('ice candidates', (data)=>{
        //     socket.to(data.to).emit('ice candidates', {candidate:data.candidate, sender:data.sender});
        // });
        //
        //
        // socket.on('chat', (data)=>{
        //     socket.to(data.room).emit('chat', {sender: data.sender, msg: data.msg});
        // });


        socket.on('disconnect',() => {
            delete clients[socket.id]
            for (let client in clients){
                socket.to(client).emit('online' , {users: getOnlineList(client)})
            }
        })

    }
};

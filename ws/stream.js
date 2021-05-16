module.exports = (io) => {
    const clients = {};

    return (socket) => {

        socket.nsp.fetchSockets().then((e) => {
            console.log(e.length)
        })

        socket.on('init', (data) => {
            socket.userName = data.userName
            clients[data.userName] = {
                name: data.userName,
                id: socket.id
            }

            socket.join(socket.nsp.name)
            const users = [];
            for (let client in clients) {
                users.push(client);
            }
            socket.emit('users:online', users)
            socket.to(socket.nsp.name).emit('users:online', users)
            socket.to(socket.nsp.name).emit('new:user', {
                name: data.userName
            })
        });

        socket.on('new:userStart', (data) => {
            socket.to(socket.nsp.name).emit('new:userStart', {sender: data.sender});
        })

        socket.on('message:to', (data) => {
            socket.to(socket.nsp.name).emit('message:from', {
                name: data.userName,
                text: data.message
            })
        })
        socket.on('sdp', (data) => {
            socket.to(socket.nsp.name).emit('sdp', {description: data.description, sender: data.sender});
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
        socket.on('ice:candidates', (data) => {
            socket.to(socket.nsp.name).emit('ice:candidates', {candidate: data.candidate, name: data.userName});
        });
        //
        //
        // socket.on('ws', (data)=>{
        //     socket.to(data.room).emit('ws', {sender: data.sender, msg: data.msg});
        // });


        socket.on('disconnect', () => {
            delete clients[socket.userName]
            const users = [];
            for (let client in clients) {
                users.push(client);
            }
            socket.to(socket.nsp.name).emit('users:online', users);
        })

    }
};

var clients = {};


module.exports = function (io) {

    function getOnlineList(id) {

        return  Object.keys(clients).filter(key =>
             id != key
        ).reduce((obj, key) => {
            obj[key] = clients[key];
            return obj;
        }, {})
    }

    return  (socket)=>{

        socket.on('init', (data)=>{

            // console.log(data)

            // clients[socket.id] = data
            // console.log(io.of(socket.nsp.name))
            // socket.emit('new user', data)
            // socket.join(data.room)

            // clients[socket.id] = data
            // for (let client in clients){
            //     socket.to(client).emit('online' , {users: getOnlineList(client)})
            // }
            // socket.emit('online' , {users: getOnlineList(socket.id)})

            // io.of(socket.nsp.name).emit('online' , {users: getOnlineList(socket.conn.id)});

            // console.log(socket.nsp.name)
            //subscribe/join a room
            //     socket.join(data.room);
            //     socket.join(data.socketId);
            //     socket.name = data.name;
            //     clients[data.name] = data.socketId
            //     // console.log(socket.adapter.rooms[data.room],4)
            //     console.log(socket.adapter.sids,4)
            //     console.log(data.room)
            //
            // //Inform other members in the room of new user's arrival
            // // if(socket.adapter.rooms[data.room].length > 1){
            // //     socket.to(data.room).emit('new user', {socketId:data.socketId});
            // // }
            // if(data.to){
            //     socket.to(data.to).emit('new user', {socketId:data.socketId});
            // }

        });

        socket.on('join room', (data)=>{
            socket.join(data.room)

            clients[socket.id] = data
            socket.emit('online' , {users: getOnlineList(socket.id)})

            socket.to(data.room).emit('new user', { name: data.name });
            // socket.to(data.to).emit('newUserStart', {sender:data.sender});
        });

        socket.on('new message', (data) => {
            console.log(data)
            socket.to(data.room).emit('new message', {
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

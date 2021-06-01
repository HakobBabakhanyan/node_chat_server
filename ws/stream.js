module.exports = (io) => {
    const clients = {};

    return (socket) => {

        socket.on('init', (data) => {
            socket.userName = data.userName
            clients[data.socketId] = {
                name: data.userName,
                id: data.socketId
            }

            // socket.nsp.fetchSockets().then((e) => {
            //     console.log(e.map(soc => {
            //         console.log(soc.userName);
            //         return soc.id
            //     }).filter((value, index, self) => self.indexOf(value) === index).length, e.length);
            // });

            socket.join(socket.nsp.name)
            socket.join(data.socketId)

            // const users = [];
            // for (let client in clients) {
            //     users.push({});
            // }
            socket.emit('users:online', clients)
            socket.to(socket.nsp.name).emit('users:online', clients)
            socket.to(socket.nsp.name).emit('new:user', {
                id: socket.id,
                socketId:data.socketId,
            })
        });

        socket.on('new:userStart', (data) => {
            socket.to(data.to).emit('new:userStart', data);
        })

        socket.on('message:to', (data) => {
            socket.to(socket.nsp.name).emit('message:from', {
                name: data.userName,
                text: data.message
            })
        })

        socket.on('disconnect', () => {
            delete clients[socket.id]
            socket.to(socket.nsp.name).emit('users:online', clients);
        })


        socket.on("call-user", data => {
            console.log(data.to);
            socket.to(data.to).emit("call-made", {
                offer: data.offer,
                socketId: data.socketId
            });
        });
        socket.on("make-answer", data => {
            socket.to(data.to).emit("answer-made", {
                answer: data.answer,
                socketId:data.socketId
            });
        });

        socket.on('ice-candidates', (data)=>{
            console.log(data.socketId)
                socket.to(socket.nsp.name).emit('ice-candidates', {
                    candidate:data.candidate,
                    sdpMLineIndex:data.sdpMLineIndex,
                    socketId:data.socketId
                });

        });


    }
};

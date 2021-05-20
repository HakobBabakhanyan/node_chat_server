module.exports = (io) => {
    const clients = {};

    return (socket) => {

        socket.on('init', (data) => {
            socket.userName = data.userName
            clients[data.userName] = {
                name: data.userName,
                id: socket.id
            }

            socket.nsp.fetchSockets().then((e) => {
                console.log(e.map(soc => {
                    console.log(soc.userName);
                    return soc.id
                }).filter((value, index, self) => self.indexOf(value) === index).length, e.length);
            });

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

        socket.on('disconnect', () => {
            delete clients[socket.userName]
            const users = [];
            for (let client in clients) {
                users.push(client);
            }
            socket.to(socket.nsp.name).emit('users:online', users);
        })


        socket.on("call-user", data => {
            socket.to(socket.nsp.name).emit("call-made", {
                offer: data.offer,
                socket: socket.id
            });
        });
        socket.on("make-answer", data => {
            socket.to(socket.nsp.name).emit("answer-made", {
                socket: socket.id,
                answer: data.answer
            });
        });

        socket.on('ice-candidates', (data)=>{
                socket.to(socket.nsp.name).emit('ice-candidates', {
                    candidate:data.candidate,
                    sdpMLineIndex:data.sdpMLineIndex,
                    userName:data.userName
                });

        });


    }
};

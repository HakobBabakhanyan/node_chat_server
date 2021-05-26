module.exports = (io) => {
    const clients = {};

    return (socket) => {

        socket.on('init', (data) => {
            socket.userName = data.userName
            clients[data.userName] = {
                name: data.userName,
                id: socket.id
            }

            // socket.nsp.fetchSockets().then((e) => {
            //     console.log(e.map(soc => {
            //         console.log(soc.userName);
            //         return soc.id
            //     }).filter((value, index, self) => self.indexOf(value) === index).length, e.length);
            // });

            socket.join(socket.nsp.name)
            socket.join(data.userName)

            const users = [];
            for (let client in clients) {
                users.push(client);
            }
            socket.emit('users:online', users)
            socket.to(socket.nsp.name).emit('users:online', users)
            socket.to(socket.nsp.name).emit('new:user', {
                id: socket.id,
                userName:data.userName
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
            delete clients[socket.userName]
            const users = [];
            for (let client in clients) {
                users.push(client);
            }
            socket.to(socket.nsp.name).emit('users:online', users);
        })


        socket.on("call-user", data => {
            socket.to(data.to).emit("call-made", {
                offer: data.offer,
                socket: socket.id,
                userName: data.userName
            });
        });
        socket.on("make-answer", data => {
            socket.to(data.to).emit("answer-made", {
                socket: socket.id,
                answer: data.answer,
                userName:data.userName
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

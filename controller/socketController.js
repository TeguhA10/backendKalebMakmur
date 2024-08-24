

const socketController = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected');
        socketController(socket);
    
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};

module.exports = socketController;

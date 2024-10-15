const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

let users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

   
    socket.on('locationUpdate', (data) => {
        users[socket.id] = data;

        socket.broadcast.emit('userLocations', {
            id: socket.id,
            location: data,
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

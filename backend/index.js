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
    socket.on('connect_user', (deviceId) => {
        console.log(`User connected with device ID: ${deviceId}`);
    });
   
    socket.on('locationUpdate', (data) => {
        console.log('Location update:', data, socket.id);
        users[socket.id] = {
            ...data,
        };

        const sortedUsers = Object.keys(users)
            .map(userId => ({
                id: userId,
                data: users[userId]
            }))
            .sort((a, b) => new Date(b.data.alertDate) - new Date(a.data.alertDate)); 

        socket.broadcast.emit('userLocations', sortedUsers);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
        socket.broadcast.emit('userDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

import { Server } from 'socket.io';

let io;
const onlineUsers = new Map();

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🧩 Initializing Socket.IO...');

    io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('🔌 Socket connected:', socket.id);

      socket.on('join', (username) => {
        socket.username = username;
        onlineUsers.set(socket.id, username);

        io.emit('online-users', Array.from(onlineUsers.values()));
      });

      socket.on('private-message', (msg) => {
        socket.broadcast.emit('private-message', msg);
      });

      socket.on('typing', ({ from, to }) => {
        socket.broadcast.emit('typing', { from, to });
      });

      socket.on('stop-typing', ({ from, to }) => {
        socket.broadcast.emit('stop-typing', { from, to });
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
        onlineUsers.delete(socket.id);
        io.emit('online-users', Array.from(onlineUsers.values()));
      });
    });
  }

  res.end();
}

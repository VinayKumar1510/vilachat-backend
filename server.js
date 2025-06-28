import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS config object
const corsOptions = {
  origin: 'https://vilachat-frontend.vercel.app', // ✅ Your frontend domain
  credentials: true,
};

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('sendMessage', (data) => {
    socket.to(data.receiverId).emit('receiveMessage', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('typing', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// ✅ Start the server once
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

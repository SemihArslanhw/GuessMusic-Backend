const { Server } = require('socket.io');
const http = require('http');

module.exports = function initializeSocket(server) {
  const io = new Server(server, {
    cors: { origin: ['http://localhost:3000'] }
  });

  return io;
};
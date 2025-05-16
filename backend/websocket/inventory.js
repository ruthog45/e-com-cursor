const socketIo = require('socket.io');
const { redisClient } = require('../config/redis');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Join product room for real-time updates
    socket.on('watch_product', (productId) => {
      socket.join(`product:${productId}`);
    });

    // Leave product room
    socket.on('unwatch_product', (productId) => {
      socket.leave(`product:${productId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Subscribe to Redis for inventory updates
  const subscriber = redisClient.duplicate();
  subscriber.subscribe('inventory_updates');

  subscriber.on('message', (channel, message) => {
    const update = JSON.parse(message);
    io.to(`product:${update.productId}`).emit('inventory_update', update);
  });

  return io;
};

// Broadcast inventory update
const broadcastInventoryUpdate = (productId, quantity) => {
  if (io) {
    const update = {
      productId,
      quantity,
      timestamp: new Date().toISOString()
    };

    // Publish to Redis for other server instances
    redisClient.publish('inventory_updates', JSON.stringify(update));

    // Emit to connected clients
    io.to(`product:${productId}`).emit('inventory_update', update);
  }
};

module.exports = {
  initializeSocket,
  broadcastInventoryUpdate
}; 
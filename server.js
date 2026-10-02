import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const NODE_ID = process.env.NODE_ID || `Server-Node-${Math.floor(Math.random() * 900 + 100)}`;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Socket.io Instance (Phase 1: Socket.io Infrastructure)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Redis Adapter Configuration (Phase 3: Horizontal WebSocket Scaling simulation)
let isRedisConnected = false;
try {
  if (process.env.REDIS_URL) {
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { Redis } = await import('ioredis');
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    isRedisConnected = true;
    console.log(`[Redis Adapter] Connected to Redis Pub/Sub Backplane at ${process.env.REDIS_URL}`);
  }
} catch (err) {
  console.warn(`[Redis Adapter Warning] Redis not active, operating with in-memory adapter mode. (${err.message})`);
}

// In-Memory Cluster Message Bus for Multi-Node Simulation
const connectedClients = new Map();
let totalOrdersProcessed = 0;

// Socket.io Connection & Event Handling
io.on('connection', (socket) => {
  console.log(`[Socket Connected] Socket ID: ${socket.id} on ${NODE_ID}`);
  
  connectedClients.set(socket.id, {
    socketId: socket.id,
    nodeId: NODE_ID,
    connectedAt: new Date().toISOString(),
    rooms: []
  });

  // Emit welcome handshake to newly connected client
  socket.emit('welcome-handshake', {
    message: 'Bidirectional Socket.io Tunnel Established',
    socketId: socket.id,
    serverNodeId: NODE_ID,
    redisAdapterActive: isRedisConnected,
    timestamp: new Date().toISOString()
  });

  // Phase 2: Room Subscriptions & Targeted Event Broadcasting
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    const client = connectedClients.get(socket.id);
    if (client && !client.rooms.includes(roomName)) {
      client.rooms.push(roomName);
    }
    
    console.log(`[Room Join] Socket ${socket.id} joined room: '${roomName}' on ${NODE_ID}`);
    
    socket.emit('room-joined', {
      room: roomName,
      status: 'active',
      nodeId: NODE_ID,
      timestamp: new Date().toISOString()
    });

    // Notify others in room
    socket.to(roomName).emit('user-joined-room', {
      socketId: socket.id,
      room: roomName,
      nodeId: NODE_ID
    });
  });

  socket.on('leave-room', (roomName) => {
    socket.leave(roomName);
    console.log(`[Room Leave] Socket ${socket.id} left room: '${roomName}'`);
    socket.emit('room-left', { room: roomName, nodeId: NODE_ID });
  });

  // Client Ping / Telemetry Event
  socket.on('client-heartbeat', (data) => {
    socket.emit('server-heartbeat-ack', {
      receivedAt: new Date().toISOString(),
      nodeId: NODE_ID,
      clientPing: data
    });
  });

  // Handle Client Disconnect
  socket.on('disconnect', (reason) => {
    console.log(`[Socket Disconnected] Socket ID: ${socket.id} (Reason: ${reason})`);
    connectedClients.delete(socket.id);
    io.emit('client-disconnected-telemetry', {
      socketId: socket.id,
      nodeId: NODE_ID,
      totalConnected: connectedClients.size
    });
  });
});

// REST APIs for External Event Triggers & Admin Pipelines

// 1. Health & Cluster Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    nodeId: NODE_ID,
    port: PORT,
    redisPubSubActive: isRedisConnected,
    activeSocketConnections: connectedClients.size,
    totalOrdersProcessed,
    timestamp: new Date().toISOString()
  });
});

// 2. Broadcast Order Event (Phase 2: Event Broadcasting)
app.post('/api/orders/create', (req, res) => {
  const { customerName, items, amount, tableNumber } = req.body;
  totalOrdersProcessed++;

  const newOrder = {
    orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerName: customerName || 'Walk-in Customer',
    items: items || ['Enterprise Coffee Blend', 'Artisan Pastry'],
    amount: amount || 24.50,
    tableNumber: tableNumber || 12,
    processedByNode: NODE_ID,
    timestamp: new Date().toISOString()
  };

  // Broadcast to 'orders-room' and 'admin-room'
  io.to('orders-room').to('admin-room').emit('new-order', newOrder);
  // Also emit global broadcast
  io.emit('global-broadcast-event', {
    type: 'NEW_ORDER_ALERT',
    payload: newOrder,
    nodeId: NODE_ID
  });

  res.status(201).json({
    success: true,
    message: 'Order created and broadcasted to socket rooms instantly',
    order: newOrder
  });
});

// 3. Phase 3: Horizontal Scaling Multi-Node Simulated Pub/Sub Emit
app.post('/api/cluster/broadcast', (req, res) => {
  const { eventType, payload, targetRoom } = req.body;

  const clusterPayload = {
    eventId: `PUB-${Date.now()}`,
    eventType: eventType || 'CROSS_NODE_PUBSUB_BROADCAST',
    payload: payload || { alertMessage: 'Inter-server sync packet dispatched across Redis backplane' },
    originatingNode: NODE_ID,
    timestamp: new Date().toISOString()
  };

  if (targetRoom) {
    io.to(targetRoom).emit('inter-node-pubsub-event', clusterPayload);
  } else {
    io.emit('inter-node-pubsub-event', clusterPayload);
  }

  res.json({
    success: true,
    message: 'Event published across Socket.io Redis Pub/Sub cluster backplane',
    clusterPayload
  });
});

// Start Express + Socket.io Server
httpServer.listen(PORT, () => {
  console.log(`
==================================================
🚀 SPRINT 12: REAL-TIME PIPELINES & WEBSOCKET SERVER
==================================================
- Server Node ID: ${NODE_ID}
- Listening Port: http://localhost:${PORT}
- Socket.io Endpoint: ws://localhost:${PORT}
- Redis Pub/Sub Adapter: ${isRedisConnected ? 'ACTIVE (Multi-Node Scaling Enabled)' : 'IN-MEMORY MODE'}
==================================================
  `);
});

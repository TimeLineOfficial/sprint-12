(function () {
  'use strict';

  // DOM Elements
  const socketStatus = document.getElementById('socket-status');
  const nodeIdDisplay = document.getElementById('node-id-display');
  const socketIdDisplay = document.getElementById('socket-id-display');
  const logTerminal = document.getElementById('log-terminal');
  
  const roomAdminBtn = document.getElementById('room-admin-btn');
  const roomOrdersBtn = document.getElementById('room-orders-btn');
  const roomTelemetryBtn = document.getElementById('room-telemetry-btn');
  
  const customerNameInput = document.getElementById('customer-name-input');
  const triggerOrderBtn = document.getElementById('trigger-order-btn');
  const pubsubPayloadInput = document.getElementById('pubsub-payload-input');
  const triggerPubsubBtn = document.getElementById('trigger-pubsub-btn');
  const clearLogBtn = document.getElementById('clear-log-btn');

  // Track joined rooms
  const activeRooms = new Set();

  // Helper Logger
  function addLog(title, details = {}, isPubSub = false) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${isPubSub ? 'pubsub' : ''}`;
    const timeStr = new Date().toLocaleTimeString();
    entry.innerHTML = `
      <div class="log-time">[${timeStr}] ${title}</div>
      <pre style="margin-top: 4px; white-space: pre-wrap; font-size: 0.75rem;">${JSON.stringify(details, null, 2)}</pre>
    `;
    logTerminal.prepend(entry);
  }

  // Connect to Socket.io Server (Phase 1: Socket.io Infrastructure)
  const socket = io();

  socket.on('connect', () => {
    socketStatus.innerHTML = `<span class="status-dot"></span> Socket Connected (${socket.id})`;
    socketStatus.style.background = 'rgba(16, 185, 129, 0.12)';
    socketStatus.style.color = '#10b981';
    socketIdDisplay.textContent = socket.id;
    addLog('⚡ Socket Connected Successfully', { socketId: socket.id });
  });

  socket.on('welcome-handshake', (data) => {
    nodeIdDisplay.textContent = data.serverNodeId;
    addLog('🤝 Welcome Handshake Received', data);
  });

  // Phase 2: Listen for Event Broadcasting & Target Room Notifications
  socket.on('new-order', (orderData) => {
    addLog('📦 [EVENT BROADCAST] New Order Received!', orderData);
  });

  socket.on('global-broadcast-event', (data) => {
    addLog('📢 [GLOBAL BROADCAST] System Alert', data);
  });

  socket.on('room-joined', (data) => {
    addLog('🚪 [ROOM CONFIRMATION] Room Joined', data);
  });

  socket.on('user-joined-room', (data) => {
    addLog('👤 [ROOM EVENT] User Joined Room', data);
  });

  // Phase 3: Listen for Inter-Node Redis Pub/Sub Events
  socket.on('inter-node-pubsub-event', (data) => {
    addLog('🔄 [REDIS PUB/SUB] Multi-Node Inter-Server Packet Dispatched!', data, true);
  });

  socket.on('disconnect', (reason) => {
    socketStatus.innerHTML = `<span class="status-dot" style="background:#ef4444;"></span> Disconnected (${reason})`;
    socketStatus.style.background = 'rgba(239, 68, 68, 0.12)';
    socketStatus.style.color = '#ef4444';
    addLog('⚠️ Socket Disconnected', { reason });
  });

  // Room Subscription Handlers
  function toggleRoom(roomName, btn) {
    if (activeRooms.has(roomName)) {
      socket.emit('leave-room', roomName);
      activeRooms.delete(roomName);
      btn.classList.remove('active');
      btn.textContent = `Join '${roomName}'`;
    } else {
      socket.emit('join-room', roomName);
      activeRooms.add(roomName);
      btn.classList.add('active');
      btn.textContent = `Leave '${roomName}' (Active)`;
    }
  }

  roomAdminBtn.addEventListener('click', () => toggleRoom('admin-room', roomAdminBtn));
  roomOrdersBtn.addEventListener('click', () => toggleRoom('orders-room', roomOrdersBtn));
  roomTelemetryBtn.addEventListener('click', () => toggleRoom('telemetry-room', roomTelemetryBtn));

  // Trigger Order Event (REST API -> Socket Room Broadcast)
  triggerOrderBtn.addEventListener('click', async () => {
    const customerName = customerNameInput.value.trim() || 'Alex Rivera';
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          items: ['Enterprise Mocha', 'Croissant Artisan'],
          amount: 19.50,
          tableNumber: 8
        })
      });
      const data = await res.json();
      addLog('🚀 Triggered Order API', data);
    } catch (err) {
      addLog('❌ Error Triggering Order API', { error: err.message });
    }
  });

  // Trigger Inter-Node Redis Pub/Sub Broadcast
  triggerPubsubBtn.addEventListener('click', async () => {
    const payload = pubsubPayloadInput.value.trim() || 'Cross-Server Node Sync Payload';
    try {
      const res = await fetch('/api/cluster/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'INTER_NODE_PUBSUB_BROADCAST',
          payload: { message: payload },
          targetRoom: 'admin-room'
        })
      });
      const data = await res.json();
      addLog('🔄 Triggered Inter-Node Pub/Sub API', data, true);
    } catch (err) {
      addLog('❌ Error Triggering Pub/Sub API', { error: err.message });
    }
  });

  clearLogBtn.addEventListener('click', () => {
    logTerminal.innerHTML = '<div class="log-entry"><div class="log-time">[System Log Cleared]</div></div>';
  });

})();

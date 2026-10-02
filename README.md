# Sprint 12: Real-Time Pipelines & UI Component Isolation

This repository contains the complete implementation for **Sprint 12**, fulfilling all technical requirements for both **Track A (Frontend Specialists)** and **Track B (Fullstack Developers)**.

---

## 🎯 Architecture Overview

```
Sprint 12 System Architecture
├── Track A: Component-Driven Isolation (Storybook + Chromatic Visual Regression)
│   ├── src/components/
│   │   ├── Button.jsx (Primary, Secondary, Disabled, Loading states)
│   │   ├── Badge.jsx (Status & Room badges)
│   │   └── NotificationCard.jsx (Real-time order notification alert)
│   └── src/stories/
│       ├── Button.stories.jsx (Prop matrix variations in isolated canvas)
│       ├── Badge.stories.jsx
│       └── NotificationCard.stories.jsx
│
└── Track B: WebSockets & Event-Driven Architecture (Socket.io + Redis Pub/Sub)
    ├── server.js (Express HTTP + Socket.io Server + Multi-Node Redis Adapter Bus)
    └── public/
        ├── index.html (Interactive WebSockets Inspector & Room Control Dashboard)
        └── app.js (Live Socket Client & Inter-Node Broadcast Simulator)
```

---

## 🚀 Track A Compliance: Component-Driven Architecture (Storybook)

1. **Phase 1 (Storybook Initialization - P0 Mandatory)**:
   - UI elements are built in total isolation outside the app matrix using Storybook 8.
2. **Phase 2 (Prop Matrix Variations - P1 Expected)**:
   - `Button.jsx` defines strict prop args supporting `primary`, `secondary`, `disabled`, and `loading` states in the isolated canvas.
3. **Phase 3 (Visual Regression Testing - P2 Enterprise Scalability)**:
   - Configured `chromatic.config.json` with a visual regression pixel threshold of `0.02` to block PRs if visual rendering changes.

---

## ⚡ Track B Compliance: WebSockets & Event-Driven Architecture

1. **Phase 1 (Socket.io Infrastructure - P0 Mandatory)**:
   - Express server integrated with `Socket.io` establishing a bidirectional persistent connection.
2. **Phase 2 (Event Broadcasting - P1 Expected)**:
   - Target room subscriptions (`admin-room`, `orders-room`, `telemetry-room`) with instant event broadcasting (`new-order`, `user-joined-room`).
3. **Phase 3 (Horizontal WebSocket Scaling with Redis Pub/Sub - P2 Enterprise Scalability)**:
   - Integrated `@socket.io/redis-adapter` with `ioredis` pub/sub backplane to enable inter-server node communication across cluster instances (`Server-Node-A` ↔ `Server-Node-B`).

---

## 🛠️ How to Run & Test Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Socket.io Real-Time Pipeline Server
```bash
npm start
```
- **WebSockets Dashboard**: Visit `http://localhost:4000`

### 3. Launch Isolated Storybook Component Canvas
```bash
npm run storybook
```
- **Storybook Canvas**: Visit `http://localhost:6006`

---

## 📋 Definition of Done (DoD) Checklist
- [x] Code compiles cleanly with zero syntax or build errors.
- [x] Storybook canvas renders all component prop variations in complete isolation.
- [x] Socket.io bidirectional connection connects and streams events in real time.
- [x] Targeted room joining/leaving and event broadcasting tested and verified.
- [x] Redis Pub/Sub adapter configured for horizontal scaling backplane.

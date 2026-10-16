# FTEWSVE | [PDIT-FTE-11462] | [Client 12 Project] Submission
## ENG-149204: Real-Time Communication Portal & Pipelines
**Epic**: Core Infrastructure Overhaul & Real-Time Sync  
**Priority**: P0 (Critical - Blocking Revenue)  
**Story Points**: 8  
**Reporter**: Amit Sharma (Senior Staff Engineer)  
**Assignee**: Floor Dispatch Infrastructure Team  
**Live Vercel URL**: [https://sprint-12-mu.vercel.app/](https://sprint-12-mu.vercel.app/)  
**GitHub Repository**: [https://github.com/TimeLineOfficial/sprint-12](https://github.com/TimeLineOfficial/sprint-12)  

---

## 🎯 Executive Summary & Mission Context

Floor staff and dispatchers were previously struggling with a fragmented mixture of email threads, SMS, and legacy systems, causing severe handoff delays and a 15% loss in daily operational efficiency. 

This repository delivers the **P0 Production Solution**: a resilient, stateful, persistent Real-Time Communication Portal built on **React 18** and **WebSockets**, engineered to withstand Wi-Fi dropouts, slow 3G connectivity, and sudden disconnections without ever requiring a manual browser refresh.

---

## 💻 Local Setup & Installation Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/TimeLineOfficial/sprint-12.git
cd sprint-12
npm install
```
*(Note: `.npmrc` is included with `legacy-peer-deps=true` to guarantee seamless dependency installation across all environments).*

### 2. Start React Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to interact with the live WebSocket communication portal.

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

### 4. Run Storybook Isolated Component Canvas (Track A)
```bash
npm run storybook
```
Open **`http://localhost:6006`** to view isolated component state matrices (`primary`, `secondary`, `disabled`, `loading`, and `size`).

### 5. Run Socket.io Real-Time Pipeline Server (Track B)
```bash
npm start
```
Runs the Express + Socket.io server with Redis Pub/Sub cluster simulation on **`http://localhost:4000`**.

---

## 🏗️ Architecture & Acceptance Criteria Compliance

### 1. Architectural Overview & The "Happy Path"
- **AC1 (Instant Persistent Connection)**: On mounting, `LiveFeedEngine.jsx` instantly establishes a persistent bidirectional connection to the target stream (`wss://echo.websocket.events`).
- **AC2 (Real-Time State Ingestion)**: Incoming JSON payloads are parsed and appended to React state via defensive functional state updates (`setMessageLog(prev => [...prev, newMsg])`) preventing stale closures.
- **AC3 (DOM Update Speed & Auto-Scroll)**: The feed updates within **50ms** of packet arrival. When a dispatcher is near the bottom of the feed, the view automatically and smoothly scrolls down to display incoming events.
- **AC4 (Controlled Payload Dispatch)**: Staff can compose messages in a controlled input, hit "Enter" or click "Send", and emit sanitized payloads over the WebSocket tunnel.

---

## 🔬 Granular Implementation Phases

### Phase 1: State Management & Socket Initialization
- **Dedicated Component**: `src/components/LiveFeedEngine.jsx`
- **State Enums**:
  - `connectionStatus`: `'CONNECTING'` | `'CONNECTED'` | `'DISCONNECTED'`
  - `messageLog`: Array of ingested and dispatched messages
- **Memory Leak Prevention**: The `useEffect` hook cleans up on unmount by invoking `ws.close()`, guaranteeing zero zombie connections or memory leaks.

### Phase 2: Event Listeners & Defensive State Updates
- **`ws.onopen`**: Transitions `connectionStatus` to `'CONNECTED'` and resets exponential backoff attempt counters.
- **`ws.onmessage`**: Safely parses `event.data` and invokes functional state update (`prev => [...prev, newMsg]`).
- **`ws.onerror`**: Gracefully degrades the interface rather than crashing or throwing unhandled runtime exceptions.

### Phase 3: The Unhappy Path (Edge Cases & Resilience)
- **Connection Dropped Banner**: If `ws.onclose` fires, a prominent, non-blocking alert banner immediately notifies staff: *"Connection Lost. Attempting to reconnect..."*.
- **Exponential Backoff Reconnection**: Helper function schedules automated reconnection attempts with progressive delay:
  $$\text{Delay} = \min(1000 \times 2^{\text{attempt}}, 10000)\text{ ms}$$
  *(1s $\rightarrow$ 2s $\rightarrow$ 4s $\rightarrow$ 8s $\rightarrow$ capped at 10s)*.
- **Empty State Illustration**: If `messageLog` is empty, displays a clean SVG illustration and helpful onboarding instructions rather than a blank screen.
- **Bad Connectivity (3G Simulation)**: Displays an active visual spinner during the `'CONNECTING'` state.
- **Input Validation**: Disables submission and grey-outs the send button if input consists entirely of whitespace or is empty.

---

## 🛡️ Non-Functional Requirements (NFRs)

- **Accessibility (a11y - 100% Target)**:
  - Feed container implements `role="log"` and `aria-live="polite"` so screen readers proactively announce new dispatch notices.
  - Full keyboard navigation with skip-link, visible emerald focus rings (`outline: 2px solid #10b981`), and strict ARIA labels.
- **Telemetry Simulation (`useAnalytics`)**:
  - Custom hook `src/hooks/useAnalytics.js` logs structured telemetry to the console (`[Analytics] User Emitted WebSocket Payload`, `[Analytics] WebSocket Connection Established`).
- **Security & XSS Prevention**:
  - All inputs are strictly sanitized via `src/utils/sanitize.js` prior to rendering.
  - Zero usage of `dangerouslySetInnerHTML`.
- **Monochromatic Corporate Design System**:
  - Dark charcoal and slate palette (`#090d16`, `#111827`, `#1f2937`, `#374151`) with emerald accent (`#10b981`).
  - Strict 8px / 16px / 32px grid spacing steps.
  - Flexbox viewport layout ensuring the dispatch input remains permanently anchored to the bottom while the feed scrolls.

---

## 📋 Definition of Done (DoD) Checklist

- [x] **Compiles cleanly**: Production Vite bundle builds with zero warnings or errors.
- [x] **Persistent WebSocket connection**: Successfully establishes `wss://` handshake.
- [x] **No Memory Leaks**: Clean `useEffect` cleanup invoking `ws.close()` on unmount.
- [x] **Exponential Backoff**: Automatic retry logic with progressive backoff (1s $\rightarrow$ 2s $\rightarrow$ 4s $\rightarrow$ 10s max).
- [x] **Functional State Updates**: `setMessageLog(prev => [...prev, newMsg])` eliminates stale closure bugs.
- [x] **All Happy & Unhappy Acceptance Criteria Met**: Empty state, offline toast, whitespace validation, Wi-Fi dropout simulation.
- [x] **Zero Hardcoded Secrets**: No API keys or sensitive PII committed to source.
- [x] **Production Deployed**: Live and verified on Vercel at [https://sprint-12-mu.vercel.app/](https://sprint-12-mu.vercel.app/).

---

## 🌐 Submission Links Summary

- **Vercel Live URL**: [https://sprint-12-mu.vercel.app/](https://sprint-12-mu.vercel.app/)
- **GitHub Repository**: [https://github.com/TimeLineOfficial/sprint-12](https://github.com/TimeLineOfficial/sprint-12)
- **GitHub Pages (Alternative Mirror)**: [https://timelineofficial.github.io/sprint-12/](https://timelineofficial.github.io/sprint-12/)

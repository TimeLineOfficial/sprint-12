# AI Prompts & Engineering Directives Log
**Project Title**: Real-Time Communication Portal & Pipelines (Sprint 12)  
**Submission Tag**: FTEWSVE | [PDIT-FTE-11462] | [Client 12 Project]  
**Ticket ID**: ENG-149204  
**Date**: October 2026  

---

## 1. Initial Architecture & Component Isolation Prompt
```text
ENGINEERING DIRECTIVE: SPRINT 12
Subject: Sprint 12: Real-Time Pipelines & UI Isolation

TRACK A: FRONTEND SPECIALISTS
Phase 1: Storybook Initialization (P0 - Mandatory)
Install Storybook. All UI elements must be built in total isolation.
Phase 2: Prop Matrix Variations (P1 - Expected)
Define strict args for every component (primary, secondary, disabled, loading).
Phase 3: Visual Regression Testing (P2 - Enterprise Scalability)
Configure Chromatic visual regression testing configuration.

TRACK B: FULLSTACK DEVELOPERS
Phase 1: Socket.io Infrastructure (P0 - Mandatory)
Integrate Socket.io into Express. Establish persistent bidirectional tunnel.
Phase 2: Event Broadcasting (P1 - Expected)
Emit targeted events to specific socket namespaces or rooms.
Phase 3: Horizontal WebSocket Scaling with Redis Pub/Sub (P2 - Enterprise Scalability)
Configure Socket.io Redis Adapter backplane.
```

**Implementation Response:**
- Initialized isolated Storybook 8 configuration (`.storybook/main.js`, `.storybook/preview.js`).
- Built isolated atomic components: `Button.jsx`, `Badge.jsx`, and `NotificationCard.jsx` with full prop matrices in `src/stories/`.
- Configured `chromatic.config.json` for automated visual regression thresholds.
- Created Express + Socket.io server with `@socket.io/redis-adapter` and horizontal cluster broadcast API.

---

## 2. Emergency Production Ticket Prompt: ENG-149204
```text
Ticket ID: ENG-149204
Epic: Core Infrastructure Overhaul & Real-Time Sync
Priority: P0 (Critical - Blocking Revenue)
Story Points: 8
Assignee: @You
Reporter: Amit Sharma (Senior Staff Engineer)

Slack Message / Context:
"Hey team, the client reached out to us today for an emergency escalation. Currently, their floor staff is attempting to manage a real-time messaging pipeline using a horrific mix of fragmented email threads, SMS, and an outdated legacy system. This lack of instantaneous data sync is causing massive dropped handoffs and a 15% loss in daily operational efficiency. They need us to build a robust, persistent Real-Time Communication Portal that their dispatchers and floor staff can rely on without ever hitting refresh. Please take point on this ticket. This is not a toy project—focus heavily on getting the WebSocket core logic bulletproof, manage the connection lifecycle flawlessly, and make sure we handle network edge cases properly so it doesn't crash during their frequent Wi-Fi dropouts."

Technical Requirements:
1. React 18 interface with persistent wss://echo.websocket.events stream.
2. Defensive functional state updates to eliminate stale closures.
3. Sub-50ms DOM updates with smart auto-scroll when user is near feed bottom.
4. Clean useEffect unmount cleanup (ws.close()) to prevent memory leaks.
5. Exponential backoff reconnection (1s -> 2s -> 4s -> capped at 10s).
6. Non-blocking connection drop alert toast/banner.
7. Empty state illustration and loading indicator for 3G connection.
8. Whitespace validation on input and XSS sanitization (no dangerouslySetInnerHTML).
9. 100% a11y (role="log", aria-live="polite", keyboard nav, skip link).
10. useAnalytics() telemetry simulation hook.
```

**Implementation Response:**
- Created `LiveFeedEngine.jsx` implementing strict `connectionStatus` enum (`'CONNECTING'` | `'CONNECTED'` | `'DISCONNECTED'`).
- Engineered auto-scroll algorithm with scroll threshold detection (`scrollHeight - scrollTop - clientHeight < 80`).
- Implemented `useAnalytics` custom hook emitting structured JSON events.
- Created `EmptyState.jsx`, `ConnectionBanner.jsx`, and `MessageItem.jsx`.
- Styled application in strict monochromatic corporate palette with sticky bottom input bar.

---

## 3. Vercel CI/CD Build & Deployment Debugging Prompt
```text
Error occurred while deploying github code to vercel:
11:55:00.742 npm error code ERESOLVE
11:55:00.742 npm error ERESOLVE could not resolve
11:55:00.742 npm error While resolving: @storybook/react@8.6.18
11:55:00.742 npm error Found: @storybook/test@8.6.14
11:55:00.744 npm error Conflicting peer dependency: @storybook/test@8.6.18
11:55:00.804 Error: [BUILD_UTILS_SPAWN_1] Command "npm install" exited with 1
```

**Implementation Response:**
- Diagnosed root cause: Mismatched Storybook package dependencies causing npm 7+ ERESOLVE error in Vercel's strict CI environment.
- Added `.npmrc` with `legacy-peer-deps=true`.
- Aligned all Storybook packages to identical version `8.6.18`.
- Added `vercel.json` configuring Vite framework, `dist` output directory, and SPA rewrite rules.
- Production build succeeded on Vercel: `https://sprint-12-mu.vercel.app/`.

---

## 4. Final Submission Assembly Prompt
```text
FTEWSVE | [PDIT-FTE-11462] | [Client 12 Project] Submission
Vercel deployed link - https://sprint-12-mu.vercel.app/
Create the complete zip file in my download folder and include all these things:
✓ Complete source code (project folder) REQUIRED
✓ README.md with setup instructions REQUIRED
✓ Screenshot of running application (screenshot.png / .jpg) REQUIRED
✓ PROMPTS.md documenting AI prompts used (if applicable) REQUIRED
✓ links.txt — GitHub repo URL + Live deployment URL + Video walkthrough URL
```

**Implementation Response:**
- Packaged clean, production-ready source code bundle excluding heavy caches/node_modules.
- Created `links.txt`, `screenshot.png`, `PROMPTS.md`, and complete `README.md`.
- Generated final zip archive `PDIT-FTE-11462_Client_12_Project_Submission.zip` in user's Downloads directory.

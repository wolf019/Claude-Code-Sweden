# Story 003: Socket.io Integration

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** developer
**I want** real-time WebSocket communication with HTTP fallback
**So that** participants receive instant updates even on restricted networks

---

## Acceptance Criteria

- [ ] Socket.io server initializes with Express
- [ ] Clients can connect via WebSocket
- [ ] HTTP long-polling works as fallback
- [ ] Connection/disconnection events logged
- [ ] Automatic reconnection works after network drop

---

## Tasks/Subtasks

- [ ] Integrate Socket.io with Express server
- [ ] Configure transports: ['websocket', 'polling']
- [ ] Implement connection event handlers
- [ ] Add disconnect and error handling
- [ ] Emit connection count to admin clients
- [ ] Set CORS configuration for Cloud Run
- [ ] Export io object for testing (add to module.exports in src/app.js)
- [ ] Create isolated test server with random port (use `server.listen(0)` in tests)

---

## Technical Details

**Socket.io Integration (src/app.js):**
```javascript
const { Server } = require('socket.io');

// Use httpServer from Story 002
const io = new Server(httpServer, {
  cors: { origin: '*' }, // Cloud Run compatibility
  transports: ['websocket', 'polling'], // Fallback support
});

// Track connected clients
let connectedClients = 0;
```

**Connection Handling:**
```javascript
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`✅ Client connected: ${socket.id} (Total: ${connectedClients})`);

  // Broadcast connection count to all clients
  io.emit('connection-count', { count: connectedClients });

  socket.on('disconnect', (reason) => {
    connectedClients--;
    console.log(`❌ Client disconnected: ${socket.id} (Reason: ${reason})`);
    io.emit('connection-count', { count: connectedClients });
  });

  socket.on('error', (error) => {
    console.error(`⚠️  Socket error for ${socket.id}:`, error);
  });
});
```

**Module Exports:**
```javascript
module.exports = { app, server, io }; // Export for testing
```

**Testing Strategy:**
- **CRITICAL:** Create isolated server for Socket.io tests to avoid port conflicts
- Test both WebSocket and polling transports
- Verify connection-count broadcast
- Test graceful disconnection
- Use socket.io-client for client simulation

**Example Test Setup:**
```javascript
// Create isolated server - DO NOT import from src/app.js
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
});

// Start on random port
server = httpServer.listen(0, () => {
  PORT = server.address().port;
});
```

**Estimated Effort:** 30 minutes (live demo: 3 minutes)

---

## Dev Agent Record

### Context Reference
- Reference: docs/tech-spec.md
- Reference: docs/best-practices-js-gcloud.md

### Debug Log
_Implementation notes will be added here by the dev agent_

### Completion Notes
_Summary will be added here upon completion_

---

## File List
_Files created/modified will be listed here_

---

## Change Log
_Changes will be logged here_

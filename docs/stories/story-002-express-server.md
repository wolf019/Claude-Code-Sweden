# Story 002: Express Server Foundation

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** developer
**I want** a basic Express server with health checks and static file serving
**So that** I have a working HTTP server ready for Socket.io and frontend assets

---

## Acceptance Criteria

- [ ] Server starts on `npm start`
- [ ] Health endpoint returns 200 status
- [ ] Static files served from `/public` directory
- [ ] Server respects PORT environment variable
- [ ] Logs "Server running on port 8080" message

---

## Tasks/Subtasks

- [ ] Create `src/app.js` with Express setup
- [ ] Configure middleware: express.json(), express.static('public')
- [ ] Add health check endpoint: GET `/health` → 200 OK
- [ ] Environment variable loading from .env
- [ ] Port configuration: `process.env.PORT || 8080`
- [ ] Graceful shutdown handling
- [ ] Export app and httpServer for testing (add at bottom of src/app.js)
- [ ] Use `require.main === module` pattern to conditionally start server

---

## Technical Details

**Server Setup (src/app.js):**
```javascript
// Load environment variables (development only)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;
```

**Middleware Configuration:**
- `express.json()` - Parse JSON request bodies
- `express.static(path.join(__dirname, '../public'))` - Serve static files

**Health Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
```

**Graceful Shutdown:**
- Listen for SIGTERM and SIGINT signals
- Close server gracefully on shutdown
- 10-second timeout for forced shutdown
- Export app, server, io for testing

**Testing Strategy:**
- Use supertest for HTTP endpoint testing
- Create isolated Express app in tests (avoid port conflicts)
- Test health endpoint: status code, JSON response, timestamp format

**Estimated Effort:** 20 minutes (live demo: 2 minutes)

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

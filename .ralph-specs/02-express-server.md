# Express Server Foundation

Create Express server with health checks and static file serving.

## Requirements
- `src/app.js` with Express setup
- Health endpoint: GET `/health` returns 200 OK
- Static files served from `public/`
- Port from `process.env.PORT` (default 8080)
- Graceful shutdown handling

## E2E Test
Verify in terminal:
- `npm start` runs server
- `curl http://localhost:8080/health` returns 200

## Done when
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Static files accessible

**Full details:** docs/stories/story-002-express-server.md

# Socket.io Integration

Add real-time WebSocket communication with HTTP fallback.

## Requirements
- Socket.io integrated with Express server
- Transports: ['websocket', 'polling']
- Connection/disconnect event handlers
- CORS configured for Cloud Run
- Automatic reconnection support

## E2E Test
Verify in browser console:
- Client connects via WebSocket
- Reconnects after network drop

## Done when
- [ ] Socket.io server initializes
- [ ] Clients can connect
- [ ] HTTP polling fallback works

**Full details:** docs/stories/story-003-socketio-integration.md

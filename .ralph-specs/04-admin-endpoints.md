# Admin Endpoints

Simple admin controls for session management during live demo.

## Requirements
- POST `/admin/question` - Set active question
- POST `/admin/reset` - Clear all votes
- GET `/admin/stats` - Participant and vote counts
- Emit 'question-updated' to all clients
- Emit 'session-reset' on reset

## E2E Test
Verify with curl:
- POST /admin/question updates all clients
- POST /admin/reset clears votes in <1 second

## Done when
- [ ] All admin endpoints respond correctly
- [ ] Real-time events broadcast to clients

**Full details:** docs/stories/story-004-admin-endpoints.md

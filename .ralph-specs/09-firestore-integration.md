# Firestore Integration

Persistent storage for votes surviving server restarts.

## Requirements
- Firestore client with project ID from env
- Collection: `votes` with { word, count, timestamp, sessionId }
- Atomic transactions for word count increment
- Stop-word filtering: the, a, an, is, are, and, or, but
- Normalize: toLowerCase() + trim() + strip punctuation

## E2E Test
Verify persistence:
- Submit vote, restart server
- Votes still present after restart
- "Innovation" and "innovation" counted together

## Done when
- [ ] Firestore connects without errors
- [ ] Votes persist across restarts
- [ ] No race conditions on concurrent votes

**Full details:** docs/stories/story-009-firestore-integration.md

# Story 006: Vote Submission Flow

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** participant
**I want** to submit my word and see immediate confirmation
**So that** I know my vote was recorded

---

## Acceptance Criteria

- [x] Empty submissions rejected with validation message
- [x] Rate limiting prevents spam (1 vote/5s)
- [x] Special characters stripped before storage
- [x] User sees "Submitted!" confirmation
- [x] Submit button disabled during rate limit period

---

## Tasks/Subtasks

- [x] Client-side form validation: 1-50 characters, trim whitespace
- [x] Strip emojis and special characters (allow alphanumeric + basic punctuation)
- [x] Rate limiting: 1 vote per 5 seconds per user (track by socket ID)
- [x] Emit 'vote-success' event to user
- [x] Show "Submitted!" message + disable button for 5s
- [x] Create src/utils/wordNormalizer.js with normalizeWord and validateWord functions
- [x] Implement rate limiting with Map tracking socket ID → last vote timestamp
- [x] Add 'join' Socket.io event handler (validate userName, store on socket)
- [x] Add 'vote' Socket.io event handler (validate, rate limit, normalize, store, emit success)

---

## Technical Details

- Client-side form validation: 1-50 characters, trim whitespace
- Strip emojis and special characters (allow alphanumeric + basic punctuation)
- Rate limiting: 1 vote per 5 seconds per user (track by socket ID)
- POST `/vote` endpoint with validation
- Emit 'vote-submitted' event to user
- Show "Submitted!" message + disable button for 5s

**Estimated Effort:** 40 minutes (live demo: 4 minutes)

---

## Dev Agent Record

### Context Reference
- Reference: docs/tech-spec.md
- Reference: docs/best-practices-js-gcloud.md

### Debug Log
- Reviewed existing implementation in `public/js/client.js`, `src/app.js`, and `src/utils/wordNormalizer.js`
- Vote submission flow already fully implemented with client/server validation
- Added comprehensive tests for vote submission, join session, and rate limiting

### Completion Notes
Vote submission flow implemented with:
- **Client-side validation**: `normalizeWord()` strips emojis/special chars, `validateWord()` enforces 1-50 char limit
- **Server-side validation**: Rate limiting via `rateLimitMap` (5s between votes per socket ID)
- **Word normalization**: Allows alphanumeric, spaces, basic punctuation, Swedish/Nordic characters (åäöÅÄÖéÉèÈüÜ)
- **User feedback**: `vote-success` event triggers "Submitted!" message, button disabled for 5 seconds
- **Tests**: 40 tests passing including vote submission, join session, rate limiting, and word normalizer tests

---

## File List
- `src/app.js` - Socket.io join/vote handlers with rate limiting
- `src/utils/wordNormalizer.js` - normalizeWord and validateWord functions
- `src/utils/storage.js` - sessionData storage
- `public/js/client.js` - Client-side validation and UI feedback
- `public/index.html` - Vote form UI
- `tests/socket.test.js` - Comprehensive tests for vote submission flow

---

## Change Log
- 2026-01-31: Story completed - vote submission flow fully implemented with validation, rate limiting, and tests

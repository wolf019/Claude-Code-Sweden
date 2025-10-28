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

- [ ] Empty submissions rejected with validation message
- [ ] Rate limiting prevents spam (1 vote/5s)
- [ ] Special characters stripped before storage
- [ ] User sees "Submitted!" confirmation
- [ ] Submit button disabled during rate limit period

---

## Tasks/Subtasks

- [ ] Client-side form validation: 1-50 characters, trim whitespace
- [ ] Strip emojis and special characters (allow alphanumeric + basic punctuation)
- [ ] Rate limiting: 1 vote per 5 seconds per user (track by socket ID)
- [ ] Emit 'vote-success' event to user
- [ ] Show "Submitted!" message + disable button for 5s
- [ ] Create src/utils/wordNormalizer.js with normalizeWord and validateWord functions
- [ ] Implement rate limiting with Map tracking socket ID → last vote timestamp
- [ ] Add 'join' Socket.io event handler (validate userName, store on socket)
- [ ] Add 'vote' Socket.io event handler (validate, rate limit, normalize, store, emit success)

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
_Implementation notes will be added here by the dev agent_

### Completion Notes
_Summary will be added here upon completion_

---

## File List
_Files created/modified will be listed here_

---

## Change Log
_Changes will be logged here_

# Story 004: Admin Endpoints

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** presenter
**I want** simple admin controls
**So that** I can manage the session during the live demo

---

## Acceptance Criteria

- [ ] POST /admin/question updates question for all users
- [ ] POST /admin/reset clears all votes in <1 second
- [ ] GET /admin/stats returns current counts
- [ ] All clients receive question updates in real-time
- [ ] Reset confirmed via response message

---

## Tasks/Subtasks

- [ ] POST `/admin/question` - Set active question (body: { question: string })
- [ ] POST `/admin/reset` - Clear all votes for fresh start
- [ ] GET `/admin/stats` - Get participant count and vote count
- [ ] No authentication (acceptable for demo, document security limitation)
- [ ] Emit 'question-updated' event to all clients
- [ ] Emit 'session-reset' event on reset
- [ ] Store io instance in app using `app.set('io', io)` in src/app.js
- [ ] Create src/utils/storage.js with shared in-memory sessionData object

---

## Technical Details

- POST `/admin/question` - Set active question (body: { question: string })
- POST `/admin/reset` - Clear all votes for fresh start
- GET `/admin/stats` - Get participant count and vote count
- No authentication (acceptable for demo, document security limitation)
- Emit 'question-updated' event to all clients
- Emit 'session-reset' event on reset

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

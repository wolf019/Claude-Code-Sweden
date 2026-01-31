# Story 008: Real-time Update Engine

**Status:** Done
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** participant
**I want** the wordcloud to update instantly when others vote
**So that** I see collective engagement in real-time

---

## Acceptance Criteria

- [x] Wordcloud updates within 500ms of vote submission
- [x] All connected clients receive updates
- [x] Late joiners see current wordcloud immediately
- [x] No flickering during rapid submissions
- [x] Update works after reconnection

---

## Tasks/Subtasks

- [x] Emit 'wordcloud-update' event to all connected clients
- [x] Client listens for 'wordcloud-update' and re-renders
- [x] Include word frequency data: `{ word: count }`
- [x] Broadcast update within 500ms of vote
- [x] Late joiners receive current state on connection
- [x] Word frequency aggregation from normalized votes
- [x] Create src/utils/wordcloudAggregator.js with aggregateWordFrequencies, getTopWords, buildWordcloudData
- [x] Update join event handler to build current wordcloud and include in join-success
- [x] Update vote event handler to broadcast wordcloud-update via io.emit after each vote

---

## Technical Details

- Emit 'wordcloud-update' event to all connected clients
- Client listens for 'wordcloud-update' and re-renders
- Include word frequency data: `{ word: count }`
- Broadcast update within 500ms of vote
- Late joiners receive current state on connection
- Debounce rapid updates (aggregate 100ms)

**Estimated Effort:** 35 minutes (live demo: 3 minutes)

---

## Dev Agent Record

### Context Reference
- Reference: docs/tech-spec.md
- Reference: docs/best-practices-js-gcloud.md

### Debug Log
- Found existing wordcloudAggregator.js already implemented
- Server already updated with debouncing and join-success wordcloud data
- Client already listening for 'wordcloud-update' event
- All tests passing (40/40)

### Completion Notes
Real-time update engine implemented with:
- 100ms debouncing to prevent flickering during rapid submissions
- `wordcloud-update` event broadcasts word frequency data to all clients
- Late joiners receive current wordcloud state in `join-success` response
- Updates broadcast within 500ms of vote submission

---

## File List
- src/app.js - Added debouncing, join-success wordcloud data, wordcloud-update event
- src/utils/wordcloudAggregator.js - Word frequency aggregation utilities
- public/js/client.js - Handles wordcloud-update events

---

## Change Log
- 2026-01-31: Story completed - all acceptance criteria met

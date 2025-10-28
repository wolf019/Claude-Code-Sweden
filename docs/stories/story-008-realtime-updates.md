# Story 008: Real-time Update Engine

**Status:** Approved
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

- [ ] Wordcloud updates within 500ms of vote submission
- [ ] All connected clients receive updates
- [ ] Late joiners see current wordcloud immediately
- [ ] No flickering during rapid submissions
- [ ] Update works after reconnection

---

## Tasks/Subtasks

- [ ] Emit 'wordcloud-update' event to all connected clients
- [ ] Client listens for 'wordcloud-update' and re-renders
- [ ] Include word frequency data: `{ word: count }`
- [ ] Broadcast update within 500ms of vote
- [ ] Late joiners receive current state on connection
- [ ] Word frequency aggregation from normalized votes
- [ ] Create src/utils/wordcloudAggregator.js with aggregateWordFrequencies, getTopWords, buildWordcloudData
- [ ] Update join event handler to build current wordcloud and include in join-success
- [ ] Update vote event handler to broadcast wordcloud-update via io.emit after each vote

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
_Implementation notes will be added here by the dev agent_

### Completion Notes
_Summary will be added here upon completion_

---

## File List
_Files created/modified will be listed here_

---

## Change Log
_Changes will be logged here_

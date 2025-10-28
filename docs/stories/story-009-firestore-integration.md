# Story 009: Firestore Integration

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** developer
**I want** persistent storage of votes in Firestore
**So that** data survives server restarts and can be analyzed later

---

## Acceptance Criteria

- [ ] Firestore client initializes without errors
- [ ] Votes persist across server restarts
- [ ] Word counts increment atomically (no race conditions)
- [ ] Stop words filtered from wordcloud
- [ ] Case-insensitive aggregation works ("Innovation" === "innovation")

---

## Tasks/Subtasks

- [ ] Initialize Firestore client with project ID from env
- [ ] Create `votes` collection with schema: { word, userName, timestamp, sessionId }
- [ ] Create `wordcounts` collection with schema: { word (doc ID), count, lastUpdated }
- [ ] Use Firestore transactions for atomic increment of word counts
- [ ] **CRITICAL: Add in-memory fallback** - Keep inMemoryWordCounts Map for local dev when Firestore unavailable
- [ ] Stop-word filtering: ["the", "a", "an", "is", "are", "and", "or", "but"]
- [ ] Normalize words: toLowerCase() + trim() + strip punctuation (consistent with existing implementation)
- [ ] Query top 50 words by count for wordcloud data
- [ ] Create src/utils/database.js with Firestore client and in-memory fallback Map
- [ ] Implement saveVote, incrementWordCount (with transactions), getTopWords, clearAllData, isStopWord
- [ ] Update join/vote event handlers to async and integrate database module
- [ ] Update admin endpoints (reset, stats) to async and integrate database module
- [ ] Add stop word validation in vote handler (18 common words)

---

## Technical Details

**Firestore Database Prerequisite:**
- **Local Development:** No setup needed - uses in-memory fallback
- **Production Deployment:** Firestore database must exist before deployment
  - Run `./scripts/setup-firestore.sh` to create database in europe-north1
  - Or manually create via GCP Console
  - Script is idempotent (safe to run multiple times)

**Application Code Implementation:**
- Initialize Firestore client with project ID from env
- Create `votes` collection with schema: { word, count, timestamp, sessionId }
- Use Firestore transactions for atomic increment of word counts
- **CRITICAL: In-memory fallback for local development:**
  - Keep `inMemoryWordCounts` Map from Story 007
  - When `db` is null, use in-memory storage instead of failing silently
  - Ensures wordcloud updates work locally without Firestore
  - Makes local development smooth and testable
- Stop-word filtering: ["the", "a", "an", "is", "are", "and", "or", "but"]
- Normalize words: **toUpperCase()** + trim() + strip punctuation (UPPERCASE for wordcloud visual impact)
- Query top 50 words by count for wordcloud data

**Estimated Effort:** 50 minutes (live demo: 5 minutes)

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

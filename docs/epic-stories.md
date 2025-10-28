# Claude-Code-Sthlm-1 - Epic Breakdown

**Author:** Tom
**Date:** 2025-10-23
**Project Level:** Level 1 (Coherent Feature - Single System)
**Target Scale:** 10 stories, 1 epic, 30-minute live demo repeatability

---

## Epic Overview

**Epic 1: Live Demo Wordcloud System (MVP)**

Deliver a production-ready real-time wordcloud voting application that can be built from scratch in a 30-minute live coding session. The system must handle 40+ concurrent users, provide instant visual feedback, and deploy via automated scripts. Zero tolerance for failures during live demonstrations.

**Value Proposition:**
- Proves Claude Code can execute complex multi-step plans reliably
- Creates engaging audience participation moments
- Demonstrates end-to-end development: frontend → backend → database → deployment
- Reusable for future meetups and presentations

**Success Metrics:**
- ✅ Complete deployment in <3 minutes via `./deploy.sh`
- ✅ 80%+ audience participation rate
- ✅ <500ms wordcloud update latency
- ✅ Zero crashes during 30-minute demo

---

## Epic Details

### Story 1: Project Setup & Structure

**As a** developer
**I want** a properly initialized Node.js project with all dependencies and tooling
**So that** I have a solid foundation following best-practices-js-gcloud.md standards

**Technical Details:**
- Initialize npm project with Node.js 20.x
- Install dependencies: express, socket.io, @google-cloud/firestore, dotenv
- Install dev dependencies: eslint, prettier, jest
- Create directory structure: `src/`, `public/`, `tests/`, `scripts/`
- Configure ESLint and Prettier per best practices
- Create `.env.example` with required variables
- Add `.gitignore` for node_modules, .env

**Acceptance Criteria:**
- [ ] `npm install` completes without errors
- [ ] `npm run lint` passes on initial setup
- [ ] Directory structure matches best practices
- [ ] package.json includes all required dependencies
- [ ] README.md documents how to run locally

**Estimated Effort:** 30 minutes (live demo: 3 minutes)

---

### Story 2: Express Server Foundation

**As a** developer
**I want** a basic Express server with health checks and static file serving
**So that** I have a working HTTP server ready for Socket.io and frontend assets

**Technical Details:**
- Create `src/app.js` with Express setup
- Configure middleware: express.json(), express.static('public')
- Add health check endpoint: GET `/health` → 200 OK
- Environment variable loading from .env
- Port configuration: `process.env.PORT || 8080`
- Graceful shutdown handling

**Acceptance Criteria:**
- [ ] Server starts on `npm start`
- [ ] Health endpoint returns 200 status
- [ ] Static files served from `/public` directory
- [ ] Server respects PORT environment variable
- [ ] Logs "Server running on port 8080" message

**Estimated Effort:** 20 minutes (live demo: 2 minutes)

---

### Story 3: Socket.io Integration

**As a** developer
**I want** real-time WebSocket communication with HTTP fallback
**So that** participants receive instant updates even on restricted networks

**Technical Details:**
- Integrate Socket.io with Express server
- Configure transports: ['websocket', 'polling']
- Implement connection event handlers
- Add disconnect and error handling
- Emit connection count to admin clients
- Set CORS configuration for Cloud Run

**Acceptance Criteria:**
- [ ] Socket.io server initializes with Express
- [ ] Clients can connect via WebSocket
- [ ] HTTP long-polling works as fallback
- [ ] Connection/disconnection events logged
- [ ] Automatic reconnection works after network drop

**Estimated Effort:** 30 minutes (live demo: 3 minutes)

---

### Story 4: Frontend UI Shell

**As a** participant
**I want** a simple, mobile-friendly interface
**So that** I can easily join and participate from my phone

**Technical Details:**
- Create `public/index.html` with Bootstrap 5
- Join page: name input field (2-50 chars) + "Join" button
- Voting page: question display + text input + "Submit" button + wordcloud container
- Responsive grid layout for mobile/tablet/desktop
- CSS for 44x44px minimum touch targets
- Loading states and submission feedback UI

**Acceptance Criteria:**
- [ ] Join page renders correctly on iPhone SE
- [ ] Form inputs have proper validation attributes
- [ ] Touch targets meet 44x44px minimum
- [ ] Layout adapts to portrait and landscape
- [ ] Accessible color contrast (WCAG 2.1 AA)

**Estimated Effort:** 45 minutes (live demo: 4 minutes)

---

### Story 5: Vote Submission Flow

**As a** participant
**I want** to submit my word and see immediate confirmation
**So that** I know my vote was recorded

**Technical Details:**
- Client-side form validation: 1-50 characters, trim whitespace
- Strip emojis and special characters (allow alphanumeric + basic punctuation)
- Rate limiting: 1 vote per 5 seconds per user (track by socket ID)
- POST `/vote` endpoint with validation
- Emit 'vote-submitted' event to user
- Show "Submitted!" message + disable button for 5s

**Acceptance Criteria:**
- [ ] Empty submissions rejected with validation message
- [ ] Rate limiting prevents spam (1 vote/5s)
- [ ] Special characters stripped before storage
- [ ] User sees "Submitted!" confirmation
- [ ] Submit button disabled during rate limit period

**Estimated Effort:** 40 minutes (live demo: 4 minutes)

---

### Story 6: Wordcloud Visualization

**As a** participant
**I want** to see an attractive wordcloud of all submissions
**So that** I can visually understand the collective responses

**Technical Details:**
- Bundle wordcloud2.js locally (no CDN dependency)
- Create `public/js/wordcloud.js` module
- Render top 50 words by frequency
- Color scheme: test on projector (high contrast)
- Minimum font size: 14px for readability
- Canvas size: responsive to container
- Graceful degradation: show word list if Canvas fails

**Acceptance Criteria:**
- [ ] Wordcloud renders in Canvas element
- [ ] Most popular words appear largest
- [ ] Limited to top 50 words for readability
- [ ] Colors readable on actual projector
- [ ] Falls back to text list on Canvas failure

**Estimated Effort:** 40 minutes (live demo: 4 minutes)

---

### Story 7: Real-time Update Engine

**As a** participant
**I want** the wordcloud to update instantly when others vote
**So that** I see collective engagement in real-time

**Technical Details:**
- Emit 'wordcloud-update' event to all connected clients
- Client listens for 'wordcloud-update' and re-renders
- Include word frequency data: `{ word: count }`
- Broadcast update within 500ms of vote
- Late joiners receive current state on connection
- Debounce rapid updates (aggregate 100ms)

**Acceptance Criteria:**
- [ ] Wordcloud updates within 500ms of vote submission
- [ ] All connected clients receive updates
- [ ] Late joiners see current wordcloud immediately
- [ ] No flickering during rapid submissions
- [ ] Update works after reconnection

**Estimated Effort:** 35 minutes (live demo: 3 minutes)

---

### Story 8: Firestore Integration

**As a** developer
**I want** persistent storage of votes in Firestore
**So that** data survives server restarts and can be analyzed later

**Technical Details:**
- Initialize Firestore client with project ID from env
- Create `votes` collection with schema: { word, count, timestamp, sessionId }
- Use Firestore transactions for atomic increment of word counts
- Stop-word filtering: ["the", "a", "an", "is", "are", "and", "or", "but"]
- Normalize words: toLowerCase() + trim() + strip punctuation
- Query top 50 words by count for wordcloud data

**Acceptance Criteria:**
- [ ] Firestore client initializes without errors
- [ ] Votes persist across server restarts
- [ ] Word counts increment atomically (no race conditions)
- [ ] Stop words filtered from wordcloud
- [ ] Case-insensitive aggregation works ("Innovation" === "innovation")

**Estimated Effort:** 50 minutes (live demo: 5 minutes)

---

### Story 9: Admin Endpoints

**As a** presenter
**I want** simple admin controls
**So that** I can manage the session during the live demo

**Technical Details:**
- POST `/admin/question` - Set active question (body: { question: string })
- POST `/admin/reset` - Clear all votes for fresh start
- GET `/admin/stats` - Get participant count and vote count
- No authentication (acceptable for demo, document security limitation)
- Emit 'question-updated' event to all clients
- Emit 'session-reset' event on reset

**Acceptance Criteria:**
- [ ] POST /admin/question updates question for all users
- [ ] POST /admin/reset clears all votes in <1 second
- [ ] GET /admin/stats returns current counts
- [ ] All clients receive question updates in real-time
- [ ] Reset confirmed via response message

**Estimated Effort:** 30 minutes (live demo: 3 minutes)

---

### Story 10: Deployment Automation

**As a** presenter
**I want** one-command deployment scripts
**So that** deployment is quick and reliable during live demo

**Technical Details:**
- Create `Dockerfile` with Node.js 20 base image
- Create `scripts/deploy.sh`:
  - Authenticate gcloud (assumes already configured)
  - Deploy to Cloud Run from source
  - Set environment variables
  - Set min-instances=1
  - Enable unauthenticated access
  - Display public URL
- Create `scripts/setup-firestore.sh`:
  - Create Firestore database in europe-north1
  - Create indexes if needed
- Add deployment docs to README.md

**Acceptance Criteria:**
- [ ] `./scripts/deploy.sh` completes in <3 minutes
- [ ] `./scripts/setup-firestore.sh` completes in <1 minute
- [ ] Deployment outputs public URL
- [ ] Docker build succeeds locally
- [ ] Deployed app accessible at public URL immediately

**Estimated Effort:** 45 minutes (live demo: 3 minutes if pre-tested)

---

## Story Dependencies

```
Story 1 (Setup)
    ↓
Story 2 (Express)
    ↓
Story 3 (Socket.io)
    ↓
Story 4 (Frontend UI) ← Can work in parallel with ↓
    ↓                                              ↓
Story 5 (Vote Flow)                          Story 8 (Firestore)
    ↓                                              ↓
Story 6 (Wordcloud) ← Needs Story 8 for data     ↓
    ↓                                              ↓
Story 7 (Real-time) ← Combines 5, 6, 8           ↓
    ↓                                              ↓
Story 9 (Admin) ← Needs 3, 8                     ↓
    ↓ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
Story 10 (Deployment) ← Requires all previous stories complete
```

## Implementation Timeline

**Day 1 (Development Start):**
- Stories 1-3: Foundation (1.5 hours)
- Stories 4-5: Basic UI and submission (1.5 hours)

**Day 2 (Core Features):**
- Story 6: Wordcloud visualization (45 min)
- Story 7: Real-time updates (45 min)
- Story 8: Firestore integration (1 hour)

**Day 3 (Polish & Deploy):**
- Story 9: Admin endpoints (30 min)
- Story 10: Deployment scripts (45 min)
- Integration testing (1 hour)
- First repeatability test (30 min full run)

**Day 4 (Validation):**
- Second repeatability test
- Adjustments if needed
- Final rehearsal
- Backup deployment ready

---

## Live Demo Speedrun Guide

### Pre-Demo Optimization Checklist

**Critical Setup (Do BEFORE taking the stage):**

- [ ] **Pre-cache Dependencies:** Run `npm install` → commit `package-lock.json`
  - Live benefit: `npm ci` completes in 10-15 seconds vs 2-3 minutes
- [ ] **Pre-configure Firestore:** Run `./scripts/setup-firestore.sh`
  - Live benefit: Skip database creation, just show connection code
- [ ] **Create Boilerplate Templates:** Add `.templates/` directory with:
  - `app-starter.js` - Express skeleton with TODO markers
  - `index-starter.html` - Bootstrap shell with placeholders
  - Live benefit: "Fill in the blanks" vs "write from scratch"
- [ ] **Pre-build Docker Base:** Run `docker build -t wordcloud-app:base .`
  - Live benefit: Deploy only adds final code layer (faster push)
- [ ] **Verify Deploy Speed:** Test `./scripts/deploy.sh` completes in <3 minutes
- [ ] **Backup Deployment:** Have fully working version deployed at fallback URL

### Optimized Execution Timeline (30 minutes + 6 min buffer)

**Fast-Fail Checkpoints:** Every 5 minutes should have a "this works now" moment.

```
00:00-02:00  Intro + Show Plan
             └─ Display HIGH_LEVEL_OVERVIEW.md, explain repeatability goal

02:00-05:00  Cluster 1: Foundation (Stories 1+2)
             ├─ npm ci (10 seconds with package-lock)
             ├─ Copy app-starter.js template
             └─ ✓ Checkpoint: Health check returns 200

05:00-10:00  Cluster 2: UI + Wordcloud (Stories 4+6) ★ FIRST WOW
             ├─ Copy index-starter.html template
             ├─ Add wordcloud2.js bundle
             ├─ Render with mock data: {"awesome": 10, "innovative": 7}
             └─ ✓ Checkpoint: Wordcloud visible in browser

10:00-16:00  Cluster 3: Real-time Magic (Stories 3+7) ★ SECOND WOW
             ├─ Add Socket.io server
             ├─ Add Socket.io client
             ├─ Emit 'wordcloud-update' on vote
             ├─ Test with 2 browser tabs
             └─ ✓ Checkpoint: Both tabs update simultaneously

16:00-20:00  Cluster 4: Vote Flow (Story 5)
             ├─ Wire up form submission
             ├─ Add basic validation (1-50 chars)
             ├─ Show submission feedback
             └─ ✓ Checkpoint: Submit vote, see wordcloud change

20:00-24:00  Cluster 5: Persistence (Story 8)
             ├─ Connect to pre-configured Firestore
             ├─ Write vote to database (show in Firebase console)
             ├─ Add word count increment logic
             └─ ✓ Checkpoint: Restart server, data survives

24:00-27:00  Cluster 6: Admin + Deploy (Stories 9+10)
             ├─ Add POST /admin/reset endpoint (quick)
             ├─ Run ./scripts/deploy.sh
             └─ ✓ Checkpoint: Public URL live

27:00-30:00  Live Test ★ FINAL WOW
             ├─ Display QR code on screen
             ├─ Audience scans, joins, votes
             ├─ Wordcloud updates with real audience data
             └─ ✓ Success: 20+ participants, <500ms updates

30:00-36:00  Buffer for questions/troubleshooting
```

### Strategic Shortcuts for Speed

**Shortcut 1: Mock-First Development**
- Show wordcloud rendering at 10 minutes (Cluster 2)
- Don't wait for backend to demo UI
- People see visual results early = engagement maintained

**Shortcut 2: Progressive Enhancement**
```
Minimum viable demo at 16 minutes:
├─ Frontend works
├─ Real-time updates work
└─ Local testing successful

Then add:
├─ Firestore persistence (show durability)
└─ Cloud Run deployment (show scale)
```

**Shortcut 3: Template-Driven Development**
```javascript
// Pre-prepared in .templates/app-starter.js:
// TODO: Add Socket.io - uncomment below
// const io = require('socket.io')(server);
// io.on('connection', (socket) => { ... });

// During demo: Delete TODO line, uncomment code = instant progress
```

**Shortcut 4: Strategic Copy-Paste**
- Have code snippets ready in separate file
- Tab completion for file paths
- Use `// STEP 1`, `// STEP 2` markers for quick navigation

### Risk Mitigation

**If Behind Schedule at 15 minutes:**
- Skip Story 9 (Admin endpoints) - not critical for audience demo
- Use hard-coded question instead of POST /admin/question
- Focus on getting to deployment

**If Behind Schedule at 20 minutes:**
- Skip Firestore (Story 8) - use in-memory storage
- Deploy with simpler version
- Mention "production version would use Firestore"

**If Behind Schedule at 25 minutes:**
- Jump to pre-deployed backup URL
- Show QR code for backup deployment
- Explain "this is what we just built" (show code quickly)

**Emergency Fallback:**
- Backup URL ready at all times
- Can switch to backup at any checkpoint
- Audience doesn't need to know it's backup

### Time-Saving Techniques

**During Live Coding:**
1. ✅ **Show > Explain** - Run code first, explain while it loads
2. ✅ **Use tab completion** - Save typing time on file paths
3. ✅ **Skip error handling** - Mention it exists, don't write it live
4. ✅ **Copy-paste complex snippets** - Type simple logic, paste boilerplate
5. ✅ **Use TODO markers** - Navigate code quickly with search
6. ✅ **Test incrementally** - Verify each checkpoint immediately
7. ✅ **Narrate while waiting** - Explain next step during npm install/deploy

**Story Clustering Benefits:**
- **Original:** 10 separate stories = 10 context switches
- **Optimized:** 6 clusters = fewer transitions = faster flow
- **Result:** 5+ minute buffer instead of 2-5 minute buffer

### Pre-Demo Rehearsal Checklist

**Run 1 (Timing Baseline):**
- [ ] Execute full plan without shortcuts
- [ ] Note which stories take longer than estimated
- [ ] Identify bottlenecks

**Run 2 (With Optimizations):**
- [ ] Use templates and pre-cached dependencies
- [ ] Verify speedrun timeline accuracy
- [ ] Practice transitions between clusters

**Run 3 (Final Dress Rehearsal):**
- [ ] Simulate on presentation laptop
- [ ] Test with projector (verify wordcloud colors)
- [ ] Practice with backup fallback scenario
- [ ] Verify all checkpoints work

---

## Original Live Demo Execution Order (Reference)

**If you prefer linear story-by-story approach:**

1. **Intro (2 min):** Show HIGH_LEVEL_OVERVIEW.md, explain plan
2. **Stories 1-2 (5 min):** Setup + Express server, verify health check
3. **Story 3 (3 min):** Add Socket.io, test connection in browser console
4. **Story 4 (4 min):** Build frontend HTML, show responsive layout
5. **Story 5 (4 min):** Wire up vote submission, test form validation
6. **Story 6 (4 min):** Integrate wordcloud, render with mock data
7. **Story 7 (3 min):** Connect real-time updates, test with 2 browser tabs
8. **Story 8 (5 min):** Add Firestore, verify persistence across restart
9. **Story 9 (3 min):** Add admin endpoints, test reset
10. **Deploy (3 min):** Run `./scripts/deploy.sh`, show QR code
11. **Live Test (4 min):** Audience joins, votes, wordcloud updates!

**Buffer:** 2-5 minutes for questions/troubleshooting

---

_This epic breakdown is optimized for repeatability and live execution under time pressure. The speedrun guide provides maximum flexibility while maintaining all critical functionality._

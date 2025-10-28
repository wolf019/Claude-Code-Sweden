# Claude-Code-Sthlm-1 Product Requirements Document (PRD)

**Author:** Tom
**Date:** 2025-10-23
**Project Level:** Level 1 (Coherent Feature - Single System)
**Project Type:** Web Application
**Target Scale:** 8-10 stories, 1 epic, 30-minute live demo repeatability

---

## Description, Context and Goals

### Description

A real-time wordcloud voting web application designed specifically for live presentation demos at the Claude Code Stockholm meetup. The application allows participants to join via a public URL (displayed as QR code), enter their name, answer a text-based question posed by the presenter, and watch as their responses are aggregated and visualized as an interactive wordcloud that updates in real-time using WebSocket technology.

**Key differentiators:**
- **Purpose-built for live demos**: Optimized for 30-minute live coding repeatability
- **Zero infrastructure friction**: Pre-scripted deployment (deploy.sh) and database setup (setup-firestore.sh)
- **Audience engagement focus**: QR code join flow, mobile-friendly, instant visual feedback
- **Agentic development showcase**: The development plan itself is the demo - proving repeatable, reliable AI-assisted coding

**Target audience:**
- Primary: Technical developers attending Claude Code Stockholm meetup (20-40 participants)
- Secondary: Reusable for future presentations, workshops, and interactive sessions

### Deployment Intent

**Demo/POC for Live Presentation**

This application serves as a dual-purpose demonstration:
1. **Technical showcase**: Proving that Claude Code can execute complex, multi-step development plans reliably and repeatably
2. **Engagement tool**: Active audience participation during the presentation creates memorable "wow moments"

**Deployment characteristics:**
- **Timeline**: Must be production-ready within 4 days
- **Stability requirement**: Zero-tolerance for failures during 30-minute live demo
- **Reusability**: After proving repeatability, the application becomes a reusable tool for future meetups and presentations
- **Infrastructure**: Google Cloud Run (public internet), Firestore database, deployed via automated scripts

### Context

This project serves as the centerpiece demonstration for the inaugural Claude Code Stockholm user group meeting—potentially the first such gathering in Sweden. With agentic coding tools rapidly transforming software development workflows, developers need to see concrete proof that these tools can deliver production-ready code reliably and repeatably, not just prototype-quality snippets. The 4-day deadline mirrors real-world sprint constraints, while the live 30-minute coding session provides transparent validation that the development plan actually works. By building this application twice (once in preparation, once live on stage), we prove that Claude Code workflows are production-grade tools, not experimental demos—a critical message for adoption by professional development teams.

### Goals

**Goal 1: Demonstrate Repeatable Agentic Development**
- Execute the complete development plan from scratch during live demo
- Showcase Claude Code's ability to follow structured workflows (.claude folder, commands, agents)
- Prove reliability: Plan works identically in development, testing, and live execution
- Success metric: Complete functional application deployed in 30 minutes

**Goal 2: Create Engaging Audience Experience**
- Participants join via QR code on their mobile devices
- Real-time wordcloud updates visible to entire audience (<500ms latency)
- Visual representation of collective audience input
- Success metric: 80%+ of attendees successfully submit responses and see updates

## Requirements

### Functional Requirements

**FR001: User Session Join**
Users can access the application via public URL, enter their name, and join the active voting session without authentication or registration. Implementation includes cold-start mitigation (min-instances=1 on Cloud Run), WebSocket fallback to HTTP long-polling for restricted networks, and input validation (2-50 character names).

**FR002: Question Display**
The application displays the current active question to all connected participants in real-time. Question state persists in Firestore and syncs to late joiners automatically. Includes admin endpoint (POST /admin/question) for live question updates during presentation.

**FR003: Text Response Submission**
Participants can submit text responses (single words or short phrases) via a simple form interface with rate limiting (1 vote per 5 seconds per user) to prevent spam. Input validation enforces 1-50 character limit, strips emojis and special characters, and provides immediate visual feedback on submission.

**FR004: Real-time Wordcloud Visualization**
All participants and the presenter see an interactive wordcloud that visualizes word frequency, with more popular words appearing larger. Uses locally-bundled wordcloud2.js (no CDN dependency), limits display to top 50 words for readability, includes graceful degradation for older browsers, and uses projector-tested color schemes.

**FR005: Live Update Propagation**
When any participant submits a response, all connected clients receive updates via WebSocket within 500ms and the wordcloud re-renders automatically. Socket.io provides automatic reconnection handling for WiFi instability. Server uses Firestore transactions to prevent race conditions during concurrent submissions.

**FR006: Word Frequency Aggregation**
The system aggregates identical words (case-insensitive), tracks frequency counts, and persists data to Firestore for reliability. Includes stop-word filtering (common words like "the", "a", "is"), punctuation normalization, and toLowerCase() standardization to prevent word fragmentation.

**FR007: Mobile-Responsive Interface**
The application interface adapts to mobile, tablet, and desktop screen sizes, ensuring participants can join and vote from any device. Minimum touch target size of 44x44px, tested on iPhone SE (smallest modern device), uses Bootstrap 5 for cross-browser compatibility, and supports both portrait and landscape orientations.

**FR008: Session Management**
The presenter can set the active question, and the system maintains a single active session state accessible to all participants. Enforces single session architecture (fixed session ID), includes emergency reset capability (POST /admin/reset) for clearing votes during demo, and persists session state in Firestore across server restarts.

### Non-Functional Requirements

**NFR001: Performance**
- WebSocket update latency: <500ms from vote submission to wordcloud update on all clients
- Page load time: <2 seconds on 4G mobile connection
- Concurrent user capacity: Support 50+ simultaneous connections without degradation
- Cloud Run cold start: <3 seconds with min-instances=1 configured

**NFR002: Reliability**
- System uptime: 99.9% during 30-minute live demo window (zero tolerance for crashes)
- Graceful degradation: Application remains functional if WebSocket fails (HTTP fallback)
- Data persistence: All votes survive server restarts via Firestore
- Error recovery: Automatic reconnection for disconnected clients within 5 seconds

**NFR003: Usability**
- Zero-learning curve: Participants can join and vote within 30 seconds without instructions
- Mobile-first design: Optimized for phone screens (primary device for 80%+ of users)
- Accessibility: Minimum WCAG 2.1 Level AA for text contrast and touch targets
- Visual feedback: Immediate confirmation for all user actions (join, submit, update)

**NFR004: Deployability**
- One-command deployment: `./deploy.sh` completes full deployment in <3 minutes
- Infrastructure setup: `./setup-firestore.sh` creates database in <1 minute
- Environment portability: Works identically on dev laptop and Cloud Run production
- Rollback capability: Previous version available as backup if live deployment fails

**NFR005: Observability**
- Real-time monitoring: Cloud Run logs accessible during demo for troubleshooting
- Error visibility: Console errors visible in browser dev tools for quick diagnosis
- Health check: `/health` endpoint returns 200 OK when system operational
- Participant count: Admin view shows current connected user count

## User Journeys

**Primary User Journey: Live Demo Session**

**Act 1: Setup (Presenter - Before Demo)**
1. Presenter runs `./deploy.sh` → Application deploys to Cloud Run
2. Public URL appears: `https://wordcloud-app-xxx.run.app`
3. Presenter generates QR code from URL, adds to presentation slide
4. Presenter sets question via POST /admin/question: "What word describes this meetup?"

**Act 2: Participation (Audience - During Demo)**
5. Slide displays: "Join now!" + QR code
6. Participant scans QR → Opens mobile browser → Lands on join page
7. Participant enters name ("Alice") → Clicks "Join" → Sees question
8. Participant types response ("innovative") → Clicks "Submit"
9. Wordcloud appears/updates → "innovative" is visible
10. Participant sees others' words appearing in real-time → Engagement!

**Act 3: Wow Moment (Everyone)**
11. As more participants submit, wordcloud grows dynamically
12. Popular words ("awesome", "innovative", "powerful") grow larger
13. Presenter discusses results: "Look! Most of you said 'innovative'!"
14. Successful demonstration of both the app AND agentic development

**Edge Cases:**
- **Late Joiner**: Participant joins at step 11 → Sees current wordcloud state immediately, catches up seamlessly
- **Emergency Reset**: Presenter runs `curl -X POST /admin/reset` → All votes cleared, fresh start in <1 second

## UX Design Principles

**UXP001: Instant Gratification**
Every action produces immediate visible feedback. Vote submission shows instant "Submitted!" confirmation, wordcloud updates within 500ms, join action immediately reveals the question. No waiting, no wondering "did it work?"

**UXP002: Zero Cognitive Load**
The interface should be so simple that a distracted conference attendee can participate while listening to the presenter. Single-purpose pages: one for joining (name entry), one for voting (question + text field + wordcloud). No navigation, no menus, no decisions.

**UXP003: Mobile-First Wordcloud Readability**
Since 80%+ of participants use phones, the wordcloud must be readable on small screens. Limit to top 50 words, use high-contrast colors tested on actual projector, ensure minimum font size of 14px for smallest words, allow pinch-to-zoom.

**UXP004: Celebration of Participation**
The wordcloud itself is the reward for participating. As your word appears and grows larger when others agree, it creates a sense of collective contribution. The visual design should feel playful and energetic—this is a celebration of the group's thoughts, not a sterile survey.

**UXP005: Fail-Safe Design**
The application should never show error messages to participants during the demo. If WebSocket fails, silently fall back to HTTP polling. If wordcloud can't render, show a simple word list. The presenter needs confidence that nothing will break the audience experience.

## Epics

**Epic 1: Live Demo Wordcloud System (MVP)**

This epic delivers the complete real-time wordcloud voting application optimized for 30-minute live coding demonstrations. All stories focus on reliability, simplicity, and repeatability.

**Story Count:** 10 stories
**Timeline:** 3 development days + 1 testing/rehearsal day

**Stories:**
1. Project Setup & Structure
2. Express Server Foundation
3. Socket.io Integration
4. Frontend UI Shell
5. Vote Submission Flow
6. Wordcloud Visualization
7. Real-time Update Engine
8. Firestore Integration
9. Admin Endpoints
10. Deployment Automation

_Detailed story breakdown with acceptance criteria available in epic-stories.md_

## Out of Scope

**V2 Features (Post-Demo):**
- **User Authentication:** No login system for participants or presenters (acceptable for demo, not production)
- **Multiple Concurrent Sessions:** Single active session only (session ID hard-coded as "demo-session-1")
- **Question Queue Management:** No ability to prepare multiple questions in advance
- **Historical Data Analytics:** No session history, trend analysis, or reporting dashboards
- **Profanity/Content Moderation:** No automated filtering of inappropriate submissions beyond stop-word list
- **Custom Branding:** No theme customization, logo upload, or color scheme options
- **Export Functionality:** No download wordcloud as PNG/SVG/PDF
- **Advanced Admin Panel:** No separate admin UI, all admin functions via API only
- **Internationalization:** English-only interface (no multi-language support)
- **Advanced Rate Limiting:** No per-IP tracking, only per-socket-session rate limiting

**Technical Debt Accepted for Speed:**
- **No comprehensive error handling:** Basic validation only, minimal error messages
- **No automated testing:** Manual testing during prep runs (Jest configured but tests not written)
- **No CI/CD pipeline:** Manual deployment via scripts only
- **No monitoring/alerting:** Cloud Run logs only, no APM or alerting setup
- **Security limitations:** No authentication on admin endpoints (document this risk)

**Integration Features:**
- **Third-party integrations:** No Slack, Teams, or PowerPoint plugins
- **Webhook support:** No ability to trigger external systems on vote events
- **REST API for external consumption:** Internal endpoints only, not designed as public API

## Assumptions and Dependencies

**Assumptions:**

**Infrastructure:**
- GCP project exists with billing enabled
- Presenter has Owner/Editor role on GCP project
- `gcloud` CLI is installed and authenticated on development machine
- Firestore API can be enabled on the GCP project
- Cloud Run API can be enabled on the GCP project

**Venue/Environment:**
- Presentation venue has reliable WiFi for 40+ concurrent users
- Audience members have smartphones with QR code scanner capability
- Projector/screen available for displaying wordcloud and QR code
- No corporate firewall blocking WebSocket connections (or HTTP fallback works)
- Presenter's laptop can run Docker and Node.js 20.x

**Timeline:**
- 4 days from now until presentation (fixed deadline)
- Presenter (Tom) available for 3 days of development + 1 day testing
- Reference code in `refs/Realtime-Poll-Voting-main/` is accessible

**Technical:**
- Node.js 20.x LTS is available
- Bootstrap 5 CDN is accessible (or bundle locally)
- wordcloud2.js library functions as documented
- Firestore free tier limits sufficient: 50K reads/day, 20K writes/day (expected: ~500 writes for demo)

**Dependencies:**

**External Services:**
- Google Cloud Platform (Cloud Run, Firestore)
- npm registry (for package installation)
- Docker Hub (for base images, if not cached)

**Third-party Libraries:**
- express (Web framework)
- socket.io (WebSocket server)
- @google-cloud/firestore (Database client)
- wordcloud2.js (Visualization)
- Bootstrap 5 (UI framework)

**Reference Materials:**
- `refs/Realtime-Poll-Voting-main/` - Base architecture inspiration
- `docs/best-practices-js-gcloud.md` - Development standards
- `specs/HIGH_LEVEL_OVERVIEW.md` - System design reference

**Critical Path Dependencies:**
1. Firestore must be created BEFORE development (Story 8 dependency)
2. Docker image must build successfully BEFORE deployment (Story 10 dependency)
3. Pre-demo optimizations must complete BEFORE live session (speedrun dependency)

---

## Next Steps

### Phase 1: Pre-Development Setup (30 minutes)

- [ ] **Initialize Git Repository**
  - Create GitHub repository
  - Clone locally
  - Add .gitignore (node_modules, .env, etc.)
  - Initial commit with docs (PRD.md, tech-spec.md, epic-stories.md)

- [ ] **Setup GCP Project**
  - Verify GCP project exists with billing enabled
  - Authenticate gcloud CLI: `gcloud auth login`
  - Set active project: `gcloud config set project PROJECT_ID`
  - Enable APIs: `gcloud services enable run.googleapis.com firestore.googleapis.com`

- [ ] **Create Firestore Database**
  - Run: `./scripts/setup-firestore.sh` (or manual command from tech-spec.md)
  - Verify database created in europe-north1

### Phase 2: Development (Days 1-3)

- [ ] **Day 1: Foundation (Stories 1-3)**
  - Story 1: Project Setup & Structure (30 min)
  - Story 2: Express Server Foundation (20 min)
  - Story 3: Socket.io Integration (30 min)
  - Goal: Server running with WebSocket connections

- [ ] **Day 1: Frontend Shell (Stories 4-5)**
  - Story 4: Frontend UI Shell (45 min)
  - Story 5: Vote Submission Flow (40 min)
  - Goal: Users can join and submit votes

- [ ] **Day 2: Core Features (Stories 6-7)**
  - Story 6: Wordcloud Visualization (40 min)
  - Story 7: Real-time Update Engine (35 min)
  - Goal: Wordcloud renders and updates in real-time

- [ ] **Day 2: Persistence (Story 8)**
  - Story 8: Firestore Integration (50 min)
  - Goal: Votes persist across server restarts

- [ ] **Day 3: Polish & Deploy (Stories 9-10)**
  - Story 9: Admin Endpoints (30 min)
  - Story 10: Deployment Automation (45 min)
  - Goal: Application deployed to Cloud Run with public URL

### Phase 3: Testing & Validation (Day 3 afternoon)

- [ ] **Integration Testing**
  - Test all user flows end-to-end
  - Verify 8 FRs and 5 NFRs met
  - Load test with 50+ concurrent connections
  - Test on mobile device (iPhone/Android)
  - Test wordcloud colors on actual projector

- [ ] **First Repeatability Test**
  - Clear git repo (simulate fresh start)
  - Execute Stories 1-10 following epic-stories.md
  - Time each story cluster
  - Note any deviations or issues
  - Document actual vs estimated times

### Phase 4: Speedrun Optimization (Day 4 morning)

- [ ] **Pre-Demo Optimization Checklist**
  - [ ] Pre-cache dependencies: `npm install` → commit `package-lock.json`
  - [ ] Pre-configure Firestore (already done in Phase 1)
  - [ ] Create `.templates/` directory with boilerplate
  - [ ] Pre-build Docker base image
  - [ ] Verify `deploy.sh` completes in <3 minutes
  - [ ] Create backup deployment to fallback URL

### Phase 5: Rehearsal (Day 4)

- [ ] **Rehearsal Run 1: Baseline Timing**
  - Execute full plan without shortcuts
  - Identify bottlenecks and slow steps
  - Note actual times vs speedrun estimates

- [ ] **Rehearsal Run 2: With Optimizations**
  - Use templates and pre-cached dependencies
  - Verify speedrun timeline (30 min + 6 min buffer)
  - Practice transitions between clusters

- [ ] **Rehearsal Run 3: Final Dress Rehearsal**
  - Simulate on presentation laptop
  - Test with actual projector
  - Practice backup fallback scenario
  - Verify all fast-fail checkpoints work
  - Confirm QR code generation process

### Phase 6: Presentation Day

- [ ] **Pre-Presentation Setup (2 hours before)**
  - Deploy backup version to Cloud Run
  - Test backup URL with QR code
  - Set Cloud Run `--min-instances 1` (prevent cold start)
  - Clear Firestore test data
  - Set demo question via POST /admin/question
  - Generate QR code for public URL
  - Add QR code to presentation slides

- [ ] **30 Minutes Before**
  - Test venue WiFi speed
  - Connect laptop to projector
  - Verify wordcloud colors readable on screen
  - Have backup URL ready in separate tab
  - Open gcloud logs in separate terminal (optional)

- [ ] **During Presentation**
  - Execute speedrun guide (30 min)
  - Hit checkpoints every 5 minutes
  - If behind schedule: Use fallback strategies
  - Display QR code at minute 27
  - Audience participation at minute 27-30

### Phase 7: Post-Demo (Optional)

- [ ] Export wordcloud results from Firestore
- [ ] Scale Cloud Run back to `--min-instances 0`
- [ ] Document lessons learned
- [ ] Share demo recording (if recorded)
- [ ] Archive final code to GitHub release
- [ ] Write blog post about repeatable agentic development (optional)

---

## Development Workflow Resources

**Key Documents:**
- `docs/PRD.md` - This document (requirements)
- `docs/tech-spec.md` - Complete technical specification
- `docs/epic-stories.md` - Story breakdown with speedrun guide
- `docs/best-practices-js-gcloud.md` - Development standards
- `docs/project-workflow-analysis.md` - Project assessment
- `docs/PRD-validation-report.md` - Quality validation results

**Reference Materials:**
- `refs/Realtime-Poll-Voting-main/` - Base architecture inspiration
- `specs/HIGH_LEVEL_OVERVIEW.md` - Original system design

**Quick Start Command:**
```bash
# Story 1: Initialize project
npm init -y
npm install express socket.io @google-cloud/firestore dotenv
npm install --save-dev eslint prettier jest nodemon

# Follow epic-stories.md for remaining stories
```

---

## Ready for Implementation?

✅ **PRD Complete** - All requirements documented and validated
✅ **Tech Spec Complete** - Full implementation details provided
✅ **Epic Stories Complete** - 10 stories with acceptance criteria
✅ **Validation Passed** - 97.8% (134/137 checks)
✅ **Risk Analysis Complete** - Failure modes identified and mitigated
✅ **Speedrun Guide Ready** - Optimizations documented
✅ **Timeline Clear** - 4 days to presentation

**You are ready to start Story 1: Project Setup & Structure**

---

## Questions Before Starting?

If you need clarification on any aspect of the implementation, refer to:
- Technical questions → `tech-spec.md`
- Requirements questions → This PRD
- Implementation sequence → `epic-stories.md`
- Development standards → `best-practices-js-gcloud.md`

**Good luck with the Claude Code Stockholm meetup! 🚀**

## Document Status

- [x] Goals and context validated with stakeholders
- [x] All functional requirements reviewed (8 FRs with failure mode analysis)
- [x] User journeys cover all major personas (Presenter + Participant flows)
- [x] Epic structure approved for phased delivery (1 epic, 10 stories)
- [x] Ready for implementation phase (tech-spec.md completed)
- [x] Validation passed: 97.8% (134/137 checks)
- [x] Risk mitigation complete (failure modes, speedrun optimizations)

**Status:** ✅ **APPROVED - Ready for Development**

_Note: Technical decisions documented in tech-spec.md_

---

_This PRD adapts to project level Level 1 - providing appropriate detail without overburden._

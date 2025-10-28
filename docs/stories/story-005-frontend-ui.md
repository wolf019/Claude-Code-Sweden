# Story 005: Frontend UI Shell

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** participant
**I want** a simple, mobile-friendly interface
**So that** I can easily join and participate from my phone

---

## Acceptance Criteria

- [ ] Join page renders correctly on iPhone SE
- [ ] Form inputs have proper validation attributes
- [ ] Touch targets meet 44x44px minimum
- [ ] Layout adapts to portrait and landscape
- [ ] Accessible color contrast (WCAG 2.1 AA)
- [ ] Fullscreen toggle button for wordcloud presentation mode
- [ ] Question displays above wordcloud (not "Live Wordcloud")

---

## Tasks/Subtasks

- [ ] Create `public/index.html` with Bootstrap 5
- [ ] Join page: name input field (2-50 chars) + "Join" button
- [ ] Voting page: question display + text input + "Submit" button + wordcloud container
- [ ] Responsive grid layout for mobile/tablet/desktop
- [ ] CSS for 44x44px minimum touch targets
- [ ] Loading states and submission feedback UI
- [ ] Fullscreen toggle button in upper right corner of wordcloud panel
- [ ] Display question above wordcloud (replaces "Live Wordcloud" heading)
- [ ] Toggle functionality to hide voting panel for presentation mode
- [ ] Update tests/app.test.js static file test to expect 200 (index.html now exists)

---

## Technical Details

**HTML Structure (public/index.html):**
- Bootstrap 5.3.x from CDN
- Join screen: name input (2-50 chars) + "Join Session" button
- Vote screen (hidden by default):
  - Left panel: Question display + word input + "Submit Vote" button + connection status
  - Right panel: Wordcloud container with header + fullscreen toggle button
- Wordcloud container initially hidden (`d-none`), shown after joining
- Responsive two-column layout: `col-lg-4/col-lg-8` for desktop, stacks on mobile

**Lazer Wave Theme (public/css/styles.css):**
- **Color Palette:**
  - Background: `#27212e` (dark purple)
  - Primary: `#bd93f9` (neon purple)
  - Accent: `#ff8adb` (hot pink)
  - Secondary: `#93b4ff` (sky blue)
  - Success: `#84fba2` (neon green)
  - Warning: `#f3e4a2` (yellow)
- **Visual Effects:**
  - Neon glow on buttons, inputs, cards (`box-shadow` with rgba colors)
  - Text shadows on headings (`text-shadow: 0 0 10px rgba(...)`)
  - Pulsing animation on connection status badge
  - Gradient background overlays (radial gradients)
  - Border glow effects on focus states
- **Touch Targets:** All buttons minimum 44x44px (`.touch-target` class)
- **Accessibility:** High contrast neon colors on dark background

**Fullscreen Toggle (public/js/client.js:165-216):**
- Button location: Upper right corner of wordcloud panel
- SVG icon: Fullscreen expand/collapse icons
- Functionality:
  - Toggle `isFullscreen` state
  - Hide left panel (voting form) in fullscreen mode
  - Expand right panel to `col-12` (full width)
  - Show/hide wordcloud container (`d-none` class toggle)
  - Swap button icon between fullscreen and exit-fullscreen
- Use case: Presenter mode for projecting wordcloud

**Question Sync:**
- Question displayed in two locations:
  - Left panel voting area (`#question`)
  - Right panel wordcloud header (`#wordcloud-question`)
- Both update on `question-updated` Socket.io event
- Initial question loaded on `join-success` event

**Client-Side JavaScript (public/js/client.js):**
- Socket.io connection handling
- Join/vote form validation and submission
- Connection status indicator (green/red badge)
- Participant count display
- Vote feedback messages with auto-hide (3s timeout)
- Rate limiting: Disable submit button for 5 seconds after vote

**Estimated Effort:** 45 minutes (live demo: 4 minutes)

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

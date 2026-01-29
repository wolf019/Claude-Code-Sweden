# Story 007: Wordcloud Visualization

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** participant
**I want** to see an attractive wordcloud of all submissions
**So that** I can visually understand the collective responses

---

## Acceptance Criteria

- [ ] Wordcloud renders in Canvas element
- [ ] Most popular words appear largest
- [ ] Limited to top 50 words for readability
- [ ] Colors readable on actual projector
- [ ] Falls back to text list on Canvas failure
- [ ] Canvas fills entire container (no white box)
- [ ] Responsive sizing to container dimensions

---

## Tasks/Subtasks

- [ ] Bundle wordcloud2.js locally (no CDN dependency)
- [ ] Create `public/js/wordcloud-renderer.js` module
- [ ] Render top 50 words by frequency
- [ ] Color scheme: test on projector (high contrast)
- [ ] Dynamic font sizing: handles single-vote words (16-60px range)
- [ ] Canvas size: responsive to container
- [ ] Graceful degradation: show word list if Canvas fails
- [ ] All words visible even with only 1 vote
- [ ] Download wordcloud2.js library from CDN and save to public/js/lib/
- [ ] Add wordcloud2.js and wordcloud-renderer.js script tags to public/index.html
- [ ] Update public/js/client.js to call renderer on wordcloud-update, join-success, session-reset events
- [ ] Update public/css/styles.css for canvas container (min-height 500px, overflow hidden, 100% width/height)

---

## Technical Details

**Wordcloud Renderer (public/js/wordcloud-renderer.js):**

**Canvas Sizing to Fill Parent:**
```javascript
// Make canvas fill the container
const container = canvas.parentElement;
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Set canvas size to fill container
canvas.width = containerWidth;
canvas.height = containerHeight;
```
- Container uses `flex-grow-1` class to fill available vertical space
- Canvas dynamically sized to match container dimensions
- No fixed dimensions - fully responsive

**Lazer Wave Color Palette (7 vibrant neon colors):**
```javascript
const colors = [
  '#bd93f9', // Purple/Magenta - Primary
  '#ff8adb', // Hot Pink - Accent
  '#93b4ff', // Sky Blue - Secondary
  '#84fba2', // Neon Green - Success
  '#f3e4a2', // Yellow - Warning
  '#ffb793', // Orange
  '#86bbcb', // Cyan
];
```
- Random color selection for each word
- High contrast against dark background
- Tested on projectors for visibility

**Background Color:**
- `backgroundColor: '#27212e'` - Matches Lazer Wave dark theme
- Ensures consistency with overall UI

**Font Scaling (handles single-vote words):**
```javascript
weightFactor: function (size) {
  // Scale sizes: single vote = 16px, max votes = 60px
  if (maxCount === 1) {
    // All words have 1 vote - make them medium size
    return 24;
  }
  // Map count to font size range
  const ratio = (size - minCount) / (maxCount - minCount);
  return 16 + (ratio * 44); // 16px to 60px
}
```
- Range: 16px (minimum) to 60px (maximum)
- Single vote words: 24px (ensures visibility)
- Proportional scaling based on vote count

**WordCloud2.js Configuration:**
- `gridSize: 8` - Compact word spacing
- `fontFamily: 'Arial, sans-serif'` - Web-safe font
- `fontWeight: 'bold'` - Improved readability
- `rotateRatio: 0.1` - **IMPORTANT: Keep low (10%) for readability. Higher values cause vertical stacking.**
- `minSize: 16` - Minimum readable size
- `shrinkToFit: true` - Ensure all words fit
- `drawOutOfBound: false` - Keep words in canvas
- `hover: null` - Disable hover effects (not needed for live demo)

**CRITICAL Implementation Notes:**
- **Font scaling must use min/max normalization**: Calculate minCount and maxCount from word list, then scale linearly between 20px and 80px. Do NOT use `Math.pow(size, 1.2)` - this produces barely visible size differences.
- **Use the real wordcloud2.js library**: Download from https://github.com/timdream/wordcloud2.js - do not write a simplified implementation, it will have placement/collision issues.
- **Rotation causes readability issues**: Keep rotateRatio at 0.1 or lower. Values like 0.3 cause words to stack vertically and overlap.

**Graceful Degradation (Canvas Fallback):**
- If `WordCloud` library unavailable or Canvas fails, render word list instead
- Bootstrap list group with word + count badge
- Ensures functionality even in unsupported browsers

**Library Bundling:**
- `wordcloud2.js` bundled locally in `/public/js/lib/`
- No CDN dependency - works offline and on Cloud Run

**Container Styling (public/css/styles.css):**
```css
#wordcloud-container {
  position: relative;
  min-height: 500px;
  background: rgba(39, 33, 46, 0.5);
  border: 2px solid var(--lw-border);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 0 30px rgba(189, 147, 249, 0.1),
    0 0 40px rgba(189, 147, 249, 0.1);
  overflow: hidden;
}

#wordcloud-canvas {
  width: 100% !important;
  height: 100% !important;
  border-radius: 12px;
}
```

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

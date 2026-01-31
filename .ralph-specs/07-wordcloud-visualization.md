# Wordcloud Visualization

Render interactive wordcloud showing word frequency.

## Requirements
- Bundle wordcloud2.js locally (no CDN)
- Render top 50 words by frequency
- High-contrast colors (projector-tested)
- Minimum font 14px for readability
- Graceful fallback to word list if Canvas fails

## E2E Test
Verify in browser:
- Wordcloud renders in Canvas
- Popular words appear larger
- Readable on projector

## Done when
- [ ] Wordcloud displays correctly
- [ ] Top 50 words limited
- [ ] Fallback works without Canvas

**Full details:** docs/stories/story-007-wordcloud-visualization.md

# Real-time Update Engine

Instant wordcloud updates when participants vote.

## Requirements
- Emit 'wordcloud-update' to all clients on vote
- Include word frequency data: `{ word: count }`
- Update within 500ms of vote
- Late joiners receive current state
- Debounce rapid updates (100ms aggregation)

## E2E Test
Open 2 browser tabs:
- Submit vote in tab 1
- Tab 2 updates within 500ms
- New tab shows current wordcloud

## Done when
- [ ] All clients update in real-time
- [ ] Late joiners see current state
- [ ] No flickering on rapid submissions

**Full details:** docs/stories/story-008-realtime-updates.md

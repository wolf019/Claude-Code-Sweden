# Frontend UI Shell

Mobile-friendly interface for participants to join and vote.

## Requirements
- `public/index.html` with Bootstrap 5
- Join page: name input (2-50 chars) + Join button
- Vote page: question + text input + Submit + wordcloud container
- Lazer Wave theme (dark purple bg, neon colors)
- 44x44px minimum touch targets
- Fullscreen toggle for presenter mode

## E2E Test
Verify on iPhone SE viewport:
- Join page renders correctly
- Touch targets meet 44px minimum
- Layout adapts to portrait/landscape

## Done when
- [ ] Responsive layout works
- [ ] WCAG 2.1 AA contrast met
- [ ] Fullscreen toggle functional

**Full details:** docs/stories/story-005-frontend-ui.md

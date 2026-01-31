# Project Setup & Structure

Initialize Node.js project with all dependencies and tooling for real-time wordcloud app.

## Requirements
- Node.js 20.x with express, socket.io, @google-cloud/firestore, dotenv
- Dev tools: eslint, prettier, jest, nodemon
- Directory structure: `src/`, `public/`, `tests/`, `scripts/`
- Dockerfile for Cloud Run (Node.js 20-alpine)

## E2E Test
Verify in terminal:
- `npm install` completes without errors
- `npm run lint` passes

## Done when
- [ ] Build passes
- [ ] Directory structure created
- [ ] package.json has all dependencies

**Full details:** docs/stories/story-001-project-setup.md

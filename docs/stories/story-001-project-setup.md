# Story 001: Project Setup & Structure

**Status:** Approved
**Author:** Tom
**Date:** 2025-10-23
**Epic:** Live Demo Wordcloud System (MVP)

---

## Story

**As a** developer
**I want** a properly initialized Node.js project with all dependencies and tooling
**So that** I have a solid foundation following best-practices-js-gcloud.md standards

---

## Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run lint` passes on initial setup
- [ ] Directory structure matches best practices
- [ ] package.json includes all required dependencies
- [ ] README.md documents how to run locally

---

## Tasks/Subtasks

- [ ] Initialize npm project with Node.js 20.x
- [ ] Install dependencies: express, socket.io, @google-cloud/firestore, dotenv
- [ ] Install dev dependencies: eslint, prettier, jest
- [ ] Create directory structure: `src/`, `public/`, `tests/`, `scripts/`
- [ ] Configure ESLint and Prettier per best practices
- [ ] Create `.env.example` with required variables
- [ ] Add `.gitignore` for node_modules, .env
- [ ] Create minimal `src/app.js` placeholder (enables lint to pass on empty project)
- [ ] Create `Dockerfile` for Cloud Run deployment (Node.js 20-alpine, production-only deps)

---

## Technical Details

**Dependencies (package.json):**
- express@^4.21.2 - Web server framework
- socket.io@^4.8.1 - Real-time WebSocket communication
- @google-cloud/firestore@^7.11.6 - Google Cloud Firestore client
- dotenv@^16.6.1 - Environment variable management

**Dev Dependencies:**
- eslint@^8.57.1, prettier@^3.6.2 - Code quality
- jest@^29.7.0, supertest@^6.3.4 - Testing
- nodemon@^3.1.10 - Development hot-reload
- socket.io-client@^4.6.0 - Testing Socket.io

**Directory Structure:**
Create at project root level
```
src/
  ├── config/         # Firestore, configuration
  ├── utils/          # Helpers, utilities
  └── app.js          # Main application
public/
  ├── css/            # Stylesheets
  ├── js/             # Client-side JavaScript
  │   └── lib/        # Third-party libraries (bundled)
  └── index.html      # Main HTML
tests/                # Jest test files
scripts/              # Deployment scripts
docs/                 # Documentation and stories
```

**Configuration Files:**
- `.env.example` - Template with GCP_PROJECT_ID, PORT, RATE_LIMIT_SECONDS
- `.eslintrc.js` - ESLint config (Node.js, ES2021)
- `.prettierrc` - Prettier config (semi: true, singleQuote: true)
- `jest.config.js` - Jest config (testEnvironment: node)
- `.gitignore` - Exclude node_modules, .env, coverage, .DS_Store

**npm Scripts:**
- `start` - Production server
- `dev` - Development with nodemon
- `test` - Run Jest tests
- `lint` - Run ESLint
- `format` - Run Prettier

**Dockerfile (Cloud Run Deployment):**
```dockerfile
# Node.js 20 LTS on Alpine Linux for minimal image size
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY src ./src
COPY public ./public

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

**Estimated Effort:** 30 minutes (live demo: 3 minutes)

----

## Dev Agent Record

### Context Reference
- Reference: docs/tech-spec.md
- Reference: docs/best-practices-js-gcloud.md
- Ignore: magic-box/

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

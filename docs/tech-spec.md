# Technical Specification: Claude-Code-Sthlm-1

**Project:** Claude-Code-Sthlm-1 (Real-time Wordcloud Voting Application)
**Author:** Tom + Claude Code
**Date:** 2025-10-23
**Project Level:** Level 1
**Status:** Ready for Implementation

---

## Executive Summary

This document provides the complete technical specification for implementing the real-time wordcloud voting application. It defines the exact technology stack, source code structure, API contracts, data models, and deployment configuration required for repeatable development.

**Key Technical Decisions:**
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express.js 4.x
- **Real-time:** Socket.io 4.x (WebSocket + HTTP fallback)
- **Database:** Google Firestore (serverless NoSQL)
- **Frontend:** Vanilla JavaScript + Bootstrap 5 + wordcloud2.js
- **Deployment:** Docker + Google Cloud Run
- **Region:** europe-north1 (Stockholm proximity)

---

## Technology Stack

### Backend

```json
{
  "runtime": "Node.js 20.x LTS",
  "framework": "express@^4.18.0",
  "websocket": "socket.io@^4.6.0",
  "database": "@google-cloud/firestore@^7.1.0",
  "environment": "dotenv@^16.3.0",
  "validation": "express-validator@^7.0.0 (optional)"
}
```

### Frontend

```json
{
  "ui-framework": "Bootstrap 5.3.x (CDN)",
  "websocket-client": "socket.io-client@^4.6.0",
  "visualization": "wordcloud2.js (local bundle)",
  "javascript": "Vanilla ES6+"
}
```

### Development Tools

```json
{
  "linting": "eslint@^8.57.0",
  "formatting": "prettier@^3.2.0",
  "testing": "jest@^29.7.0",
  "containerization": "Docker 24.x"
}
```

### Cloud Infrastructure

- **Compute:** Google Cloud Run (serverless containers)
- **Database:** Google Firestore (Native mode)
- **Region:** europe-north1
- **Scaling:** Min instances 0 (dev), 1 (demo), Max instances 10

---

## Source Tree Structure

```
magic-box/
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── package.json                    # Node.js dependencies
├── package-lock.json               # Locked dependency versions
├── Dockerfile                      # Container build instructions
├── README.md                       # Setup and usage documentation
│
├── src/                            # Backend source code
│   ├── app.js                      # Main Express server + Socket.io setup
│   ├── config/
│   │   └── firestore.js            # Firestore client initialization
│   ├── services/
│   │   ├── vote-service.js         # Vote processing and aggregation logic
│   │   └── wordcloud-service.js    # Word normalization and filtering
│   ├── routes/
│   │   ├── health.js               # Health check endpoint
│   │   └── admin.js                # Admin endpoints (question, reset, stats)
│   └── utils/
│       ├── stop-words.js           # Stop words list for filtering
│       └── validation.js           # Input validation helpers
│
├── public/                         # Frontend static files
│   ├── index.html                  # Main application page
│   ├── css/
│   │   └── styles.css              # Custom styles
│   ├── js/
│   │   ├── client.js               # Socket.io client + UI logic
│   │   ├── wordcloud-renderer.js   # Wordcloud2.js wrapper
│   │   └── lib/
│   │       └── wordcloud2.js       # Bundled wordcloud2 library
│   └── assets/
│       └── favicon.ico             # Browser favicon
│
├── scripts/                        # Deployment and setup scripts
│   ├── deploy.sh                   # Deploy to Cloud Run
│   ├── setup-firestore.sh          # Create Firestore database
│   └── local-dev.sh                # Run locally with hot reload
│
├── .templates/                     # Speedrun demo templates
│   ├── app-starter.js              # Express skeleton with TODOs
│   └── index-starter.html          # Bootstrap shell with placeholders
│
├── tests/                          # Test files (optional for MVP)
│   └── vote-service.test.js        # Unit tests for vote logic
│
├── docs/                           # Project documentation
│   ├── PRD.md                      # Product requirements
│   ├── epic-stories.md             # Story breakdown
│   ├── tech-spec.md                # This document
│   ├── best-practices-js-gcloud.md # Development standards
│   └── HIGH_LEVEL_OVERVIEW.md      # System design
│
└── refs/                           # Reference code (not deployed)
    └── Realtime-Poll-Voting-main/  # Inspiration codebase
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  index.html                                        │     │
│  │  ├─ Bootstrap 5 UI (Join form, Vote form)        │     │
│  │  ├─ client.js (Socket.io client)                 │     │
│  │  └─ wordcloud-renderer.js (Canvas rendering)     │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS + WebSocket
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUD RUN CONTAINER (Port 8080)                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  app.js - Express Server                          │     │
│  │  ├─ HTTP Routes                                   │     │
│  │  │  ├─ GET /health                                │     │
│  │  │  ├─ POST /admin/question                       │     │
│  │  │  ├─ POST /admin/reset                          │     │
│  │  │  └─ GET /admin/stats                           │     │
│  │  │                                                 │     │
│  │  ├─ Socket.io Server                              │     │
│  │  │  ├─ connection (client connects)               │     │
│  │  │  ├─ vote (client submits word)                 │     │
│  │  │  ├─ disconnect (client leaves)                 │     │
│  │  │  └─ emit: wordcloud-update (broadcast)         │     │
│  │  │                                                 │     │
│  │  └─ Services                                       │     │
│  │     ├─ vote-service.js (business logic)           │     │
│  │     └─ wordcloud-service.js (word processing)     │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Firestore SDK
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE FIRESTORE (europe-north1)                │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Collections:                                      │     │
│  │  ├─ sessions (session metadata)                   │     │
│  │  ├─ votes (individual vote records)               │     │
│  │  └─ wordcounts (aggregated word frequencies)      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## API Specification

### HTTP Endpoints

#### GET /health

**Purpose:** Health check for Cloud Run
**Authentication:** None
**Request:** None
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```
**Status Codes:**
- 200: Service healthy

---

#### POST /admin/question

**Purpose:** Set the active question for the session
**Authentication:** None (acceptable for demo)
**Request Body:**
```json
{
  "question": "What word describes this meetup?"
}
```
**Validation:**
- question: required, string, min 5 chars, max 200 chars

**Response:**
```json
{
  "success": true,
  "question": "What word describes this meetup?"
}
```

**Side Effects:**
- Updates Firestore `sessions/demo-session-1`
- Emits Socket.io event: `question-updated`

**Status Codes:**
- 200: Question updated
- 400: Validation error

---

#### POST /admin/reset

**Purpose:** Clear all votes for fresh demo start
**Authentication:** None (acceptable for demo)
**Request:** None

**Response:**
```json
{
  "success": true,
  "message": "All votes cleared",
  "deletedCount": 42
}
```

**Side Effects:**
- Deletes all documents in `votes` collection
- Resets `wordcounts/demo-session-1`
- Emits Socket.io event: `session-reset`

**Status Codes:**
- 200: Reset successful

---

#### GET /admin/stats

**Purpose:** Get current participant and vote counts
**Authentication:** None (acceptable for demo)
**Request:** None

**Response:**
```json
{
  "connectedClients": 23,
  "totalVotes": 67,
  "uniqueWords": 34,
  "topWords": [
    { "word": "innovative", "count": 12 },
    { "word": "awesome", "count": 9 },
    { "word": "powerful", "count": 7 }
  ]
}
```

**Status Codes:**
- 200: Stats retrieved

---

### Socket.io Events

#### Client → Server Events

**Event: `join`**
```javascript
socket.emit('join', {
  userName: "Alice"
});
```
**Validation:**
- userName: required, string, 2-50 chars, alphanumeric + spaces

**Server Response:**
```javascript
socket.emit('join-success', {
  question: "What word describes this meetup?",
  currentWordcloud: { "innovative": 5, "awesome": 3 }
});
```

---

**Event: `vote`**
```javascript
socket.emit('vote', {
  word: "innovative"
});
```
**Validation:**
- word: required, string, 1-50 chars, alphanumeric + basic punctuation
- Rate limit: 1 vote per 5 seconds per socket

**Server Response:**
```javascript
socket.emit('vote-success', {
  message: "Vote submitted!"
});
```

---

#### Server → Client Events

**Event: `wordcloud-update`**
```javascript
// Broadcast to all connected clients
io.emit('wordcloud-update', {
  words: {
    "innovative": 12,
    "awesome": 9,
    "powerful": 7,
    "creative": 5
    // ... top 50 words
  }
});
```

---

**Event: `question-updated`**
```javascript
// Broadcast to all connected clients
io.emit('question-updated', {
  question: "What's your favorite feature of Claude Code?"
});
```

---

**Event: `session-reset`**
```javascript
// Broadcast to all connected clients
io.emit('session-reset', {
  message: "Session reset by admin"
});
```

---

**Event: `error`**
```javascript
socket.emit('error', {
  message: "Rate limit exceeded. Please wait 5 seconds."
});
```

---

## Data Models (Firestore)

### Collection: `sessions`

**Document ID:** `demo-session-1` (fixed for MVP)

**Schema:**
```javascript
{
  id: "demo-session-1",                    // string
  question: "What word describes...",      // string
  active: true,                            // boolean
  createdAt: Timestamp,                    // Firestore Timestamp
  updatedAt: Timestamp                     // Firestore Timestamp
}
```

**Indexes:** None required (single document)

---

### Collection: `votes`

**Document ID:** Auto-generated by Firestore

**Schema:**
```javascript
{
  sessionId: "demo-session-1",             // string
  userName: "Alice",                       // string
  word: "innovative",                      // string (original)
  normalizedWord: "innovative",            // string (lowercase, trimmed)
  timestamp: Timestamp,                    // Firestore Timestamp
  socketId: "abc123..."                    // string (for rate limiting)
}
```

**Indexes:**
- `sessionId` (ascending) - for querying session votes
- `timestamp` (descending) - for recent votes
- Composite: `sessionId` + `timestamp` (auto-created)

---

### Collection: `wordcounts`

**Document ID:** `demo-session-1` (matches session ID)

**Schema:**
```javascript
{
  sessionId: "demo-session-1",             // string
  words: {                                 // map
    "innovative": 12,
    "awesome": 9,
    "powerful": 7
    // ... all unique words with counts
  },
  topWords: [                              // array (top 50)
    { word: "innovative", count: 12 },
    { word: "awesome", count: 9 }
  ],
  totalVotes: 67,                          // number
  uniqueWords: 34,                         // number
  updatedAt: Timestamp                     // Firestore Timestamp
}
```

**Update Strategy:**
- Use Firestore transactions for atomic increments
- Debounce updates (aggregate 100ms of votes before writing)

---

## Business Logic

### Vote Processing Flow

```javascript
// src/services/vote-service.js

async function processVote(socketId, userName, rawWord) {
  // 1. Rate limiting check
  if (await isRateLimited(socketId)) {
    throw new Error('Rate limit exceeded');
  }

  // 2. Word normalization
  const normalizedWord = normalizeWord(rawWord);
  // - toLowerCase()
  // - trim()
  // - strip punctuation
  // - validate 1-50 chars

  // 3. Stop word filtering
  if (isStopWord(normalizedWord)) {
    // Accept vote but don't show in wordcloud
    // Or reject silently - TBD during implementation
  }

  // 4. Store vote in Firestore
  await firestore.collection('votes').add({
    sessionId: 'demo-session-1',
    userName,
    word: rawWord,
    normalizedWord,
    timestamp: FieldValue.serverTimestamp(),
    socketId
  });

  // 5. Update word count atomically
  await firestore.runTransaction(async (transaction) => {
    const countDoc = firestore.doc('wordcounts/demo-session-1');
    const data = await transaction.get(countDoc);

    const currentWords = data.data()?.words || {};
    const currentCount = currentWords[normalizedWord] || 0;

    currentWords[normalizedWord] = currentCount + 1;

    transaction.set(countDoc, {
      words: currentWords,
      totalVotes: FieldValue.increment(1),
      uniqueWords: Object.keys(currentWords).length,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });

  // 6. Get top 50 words
  const topWords = await getTopWords(50);

  // 7. Broadcast update
  io.emit('wordcloud-update', { words: topWords });

  // 8. Set rate limit (5 seconds)
  await setRateLimit(socketId, 5000);
}
```

---

### Word Normalization

```javascript
// src/services/wordcloud-service.js

function normalizeWord(word) {
  return word
    .toLowerCase()                    // Case-insensitive
    .trim()                           // Remove whitespace
    .replace(/[^\w\s-]/g, '')        // Strip special chars (keep alphanumeric, spaces, hyphens)
    .replace(/\s+/g, ' ')            // Collapse multiple spaces
    .substring(0, 50);                // Max length
}
```

---

### Stop Words List

```javascript
// src/utils/stop-words.js

const STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'should', 'could', 'may', 'might', 'must',
  'can', 'of', 'at', 'by', 'for', 'with', 'about', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
  'under', 'again', 'further', 'then', 'once'
];

function isStopWord(word) {
  return STOP_WORDS.includes(word.toLowerCase());
}
```

---

## Frontend Implementation

### Main Application Flow

```javascript
// public/js/client.js

const socket = io();
let currentUser = null;

// 1. User joins
document.getElementById('join-btn').addEventListener('click', () => {
  const userName = document.getElementById('name-input').value;

  if (userName.length < 2 || userName.length > 50) {
    showError('Name must be 2-50 characters');
    return;
  }

  socket.emit('join', { userName });
  currentUser = userName;
});

// 2. Server confirms join
socket.on('join-success', ({ question, currentWordcloud }) => {
  document.getElementById('join-screen').style.display = 'none';
  document.getElementById('vote-screen').style.display = 'block';
  document.getElementById('question').textContent = question;
  renderWordcloud(currentWordcloud);
});

// 3. User submits vote
document.getElementById('vote-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const word = document.getElementById('word-input').value;

  socket.emit('vote', { word });

  // Disable button for 5 seconds
  const btn = document.getElementById('vote-btn');
  btn.disabled = true;
  btn.textContent = 'Submitted!';

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Submit';
  }, 5000);

  document.getElementById('word-input').value = '';
});

// 4. Server broadcasts wordcloud update
socket.on('wordcloud-update', ({ words }) => {
  renderWordcloud(words);
});

// 5. Admin updates question
socket.on('question-updated', ({ question }) => {
  document.getElementById('question').textContent = question;
});

// 6. Admin resets session
socket.on('session-reset', () => {
  renderWordcloud({});
  showMessage('Session reset by presenter');
});
```

---

### Wordcloud Rendering

```javascript
// public/js/wordcloud-renderer.js

function renderWordcloud(wordsData) {
  const canvas = document.getElementById('wordcloud-canvas');

  // Convert { "word": count } to [[word, count], ...]
  const wordList = Object.entries(wordsData)
    .sort((a, b) => b[1] - a[1])  // Sort by count descending
    .slice(0, 50);                 // Top 50 words

  // Clear canvas
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Check if wordcloud2 is available
  if (typeof WordCloud === 'undefined') {
    // Graceful degradation: show word list
    renderWordList(wordList);
    return;
  }

  // Render wordcloud
  WordCloud(canvas, {
    list: wordList,
    gridSize: Math.round(16 * canvas.width / 1024),
    weightFactor: function(size) {
      return Math.pow(size, 1.2) * canvas.width / 1024;
    },
    fontFamily: 'Arial, sans-serif',
    color: function(word, weight) {
      // High-contrast colors tested on projector
      const colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E'];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    rotateRatio: 0.3,
    backgroundColor: '#ffffff',
    minSize: 14  // Minimum font size for readability
  });
}

function renderWordList(wordList) {
  // Fallback: simple word list if Canvas fails
  const container = document.getElementById('wordcloud-container');
  container.innerHTML = '<ul class="word-list">' +
    wordList.map(([word, count]) =>
      `<li><strong>${word}</strong>: ${count}</li>`
    ).join('') +
    '</ul>';
}
```

---

## Environment Configuration

### .env.example

```bash
# Server Configuration
NODE_ENV=development
PORT=8080

# Google Cloud Platform
GCP_PROJECT_ID=your-project-id
FIRESTORE_DATABASE_ID=(default)

# Session Configuration
SESSION_ID=demo-session-1

# Rate Limiting
RATE_LIMIT_SECONDS=5

# Demo Optimizations (production only)
MIN_INSTANCES=0
MAX_INSTANCES=10
```

### Local Development

```bash
# .env (local)
NODE_ENV=development
PORT=8080
GCP_PROJECT_ID=magic-box-dev
```

### Production (Cloud Run)

Set via gcloud command:
```bash
gcloud run services update wordcloud-app \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=magic-box-prod,MIN_INSTANCES=1"
```

---

## Dockerfile

```dockerfile
# Use official Node.js 20 LTS base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY src/ ./src/
COPY public/ ./public/

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start application
CMD ["node", "src/app.js"]
```

---

## Deployment Scripts

### scripts/setup-firestore.sh

```bash
#!/bin/bash
set -e

echo "Creating Firestore database in europe-north1..."

gcloud firestore databases create \
  --location=europe-north1 \
  --type=firestore-native

echo "✅ Firestore database created!"
echo ""
echo "Initializing demo session document..."

# Note: Document will be auto-created on first vote
# or can be pre-populated via admin endpoint

echo "✅ Setup complete!"
```

---

### scripts/deploy.sh

```bash
#!/bin/bash
set -e

PROJECT_ID=${GCP_PROJECT_ID:-"magic-box-prod"}
REGION="europe-north1"
SERVICE_NAME="wordcloud-app"

echo "Deploying to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Build and deploy from source
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID" \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --port 8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📱 Generate QR code: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Visit $SERVICE_URL to test"
echo "2. Set question: curl -X POST $SERVICE_URL/admin/question -H 'Content-Type: application/json' -d '{\"question\":\"What word describes this meetup?\"}'"
echo "3. Generate QR code for audience"
```

---

### scripts/local-dev.sh

```bash
#!/bin/bash
set -e

echo "Starting local development server..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env with your GCP_PROJECT_ID"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start server with nodemon for hot reload
echo "✅ Starting server on http://localhost:8080"
echo "   Press Ctrl+C to stop"
echo ""

npx nodemon src/app.js
```

---

## Testing Strategy

### Manual Testing Checklist

**Pre-Demo Validation:**
- [ ] Health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Socket.io connection establishes
- [ ] User can join with valid name
- [ ] User can submit vote
- [ ] Wordcloud renders with mock data
- [ ] Real-time updates work (2 browser tabs)
- [ ] Firestore stores votes correctly
- [ ] POST /admin/reset clears votes
- [ ] POST /admin/question updates question
- [ ] Rate limiting prevents spam (test rapid clicks)
- [ ] Mobile responsive (test on iPhone)
- [ ] Projector colors readable (test on actual projector)

### Unit Tests (Optional for MVP)

```javascript
// tests/vote-service.test.js

const { normalizeWord, isStopWord } = require('../src/services/wordcloud-service');

describe('Word Normalization', () => {
  test('converts to lowercase', () => {
    expect(normalizeWord('INNOVATIVE')).toBe('innovative');
  });

  test('trims whitespace', () => {
    expect(normalizeWord('  awesome  ')).toBe('awesome');
  });

  test('strips special characters', () => {
    expect(normalizeWord('hello!!!')).toBe('hello');
  });

  test('handles punctuation', () => {
    expect(normalizeWord('great!')).toBe('great');
  });
});

describe('Stop Word Filtering', () => {
  test('identifies stop words', () => {
    expect(isStopWord('the')).toBe(true);
    expect(isStopWord('awesome')).toBe(false);
  });
});
```

Run tests: `npm test`

---

## Performance Targets

### Response Times
- Health check: <100ms
- Vote submission: <200ms (Firestore write)
- Wordcloud update broadcast: <500ms (end-to-end)
- Page load: <2 seconds (on 4G)

### Scalability
- Concurrent users: 50+ simultaneous connections
- Votes per second: 10+ (burst capacity)
- WebSocket connections: Persistent, auto-reconnect

### Resource Limits
- Memory: 512Mi Cloud Run container
- CPU: 1 vCPU
- Firestore: Free tier (50K reads/day, 20K writes/day) - sufficient for demo

---

## Security Considerations

### Known Limitations (Documented Technical Debt)

**No Authentication on Admin Endpoints:**
- Risk: Anyone with URL can reset session or change question
- Mitigation: Obscure URLs, monitor Cloud Run logs
- Future: Add API key or OAuth for admin endpoints

**No Input Sanitization Beyond Basic Validation:**
- Risk: XSS if user submits HTML/JavaScript
- Mitigation: Browser auto-escapes textContent, Firestore stores as string
- Future: Add DOMPurify or similar library

**No Rate Limiting by IP:**
- Risk: User can open multiple tabs to bypass rate limit
- Mitigation: Socket-based rate limiting (good enough for demo)
- Future: Add express-rate-limit middleware

**Firestore Rules Wide Open:**
- Risk: Anyone can read/write Firestore directly
- Mitigation: Acceptable for 30-minute demo, not production
- Future: Add Firestore security rules

---

## Monitoring and Observability

### Cloud Run Logs

```bash
# View real-time logs
gcloud run services logs read wordcloud-app \
  --region europe-north1 \
  --limit 50 \
  --follow

# Filter for errors
gcloud run services logs read wordcloud-app \
  --region europe-north1 \
  --log-filter "severity>=ERROR"
```

### Key Metrics to Monitor
- Request count (health checks, votes, admin calls)
- WebSocket connection count
- Response latency (P50, P95, P99)
- Error rate
- Container CPU/memory usage

### Health Check Endpoint

```bash
# Test health
curl https://wordcloud-app-xxx.run.app/health

# Expected response
{"status":"ok","timestamp":"2025-10-23T10:30:00.000Z"}
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd magic-box

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your GCP_PROJECT_ID

# 4. Create Firestore database
./scripts/setup-firestore.sh

# 5. Start local server
npm run dev
# or
./scripts/local-dev.sh
```

### Development Loop

```bash
# Start with hot reload
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Run tests (optional)
npm test
```

### Deployment Loop

```bash
# 1. Build and test locally
docker build -t wordcloud-app:test .
docker run -p 8080:8080 --env-file .env wordcloud-app:test

# 2. Deploy to Cloud Run
./scripts/deploy.sh

# 3. Test deployed version
curl https://wordcloud-app-xxx.run.app/health

# 4. Set question
curl -X POST https://wordcloud-app-xxx.run.app/admin/question \
  -H 'Content-Type: application/json' \
  -d '{"question":"What word describes this meetup?"}'
```

---

## Speedrun Optimizations (Pre-Demo)

### Pre-cache Dependencies

```bash
# Run before demo
npm install
git add package-lock.json
git commit -m "Lock dependencies for speedrun"

# During demo
npm ci  # Completes in 10-15 seconds instead of 2-3 minutes
```

### Create Boilerplate Templates

```bash
mkdir .templates

# Create app-starter.js with TODO markers
# Create index-starter.html with placeholders

# During demo: Copy templates instead of writing from scratch
cp .templates/app-starter.js src/app.js
```

### Pre-build Docker Base

```bash
# Before demo
docker build -t wordcloud-app:base --target base .

# During demo: Only final layer builds (faster)
```

---

## Troubleshooting Guide

### Issue: WebSocket connection fails

**Symptoms:** Client can't connect, Socket.io falls back to polling
**Diagnosis:** Check browser console for connection errors
**Solutions:**
1. Verify Cloud Run allows WebSocket (should be automatic)
2. Check CORS configuration in app.js
3. Confirm HTTP fallback works (Socket.io handles this)

---

### Issue: Wordcloud doesn't render

**Symptoms:** Blank canvas, no visualization
**Diagnosis:** Check browser console for Canvas errors
**Solutions:**
1. Verify wordcloud2.js loaded: `console.log(typeof WordCloud)`
2. Check canvas dimensions: `console.log(canvas.width, canvas.height)`
3. Fallback to word list (graceful degradation)

---

### Issue: Rate limiting not working

**Symptoms:** User can spam votes
**Diagnosis:** Check server logs for rate limit errors
**Solutions:**
1. Verify socketId is unique per connection
2. Check rate limit storage (in-memory Map or Redis)
3. Confirm 5-second timeout is enforced

---

### Issue: Firestore writes fail

**Symptoms:** Votes don't persist, wordcloud doesn't update
**Diagnosis:** Check Cloud Run logs: `gcloud run services logs read wordcloud-app`
**Solutions:**
1. Verify GCP_PROJECT_ID environment variable set
2. Check Firestore API is enabled
3. Confirm Cloud Run service account has Firestore permissions
4. Test Firestore connection: Add log in firestore.js initialization

---

### Issue: Cold start delay

**Symptoms:** First request takes 5-15 seconds
**Diagnosis:** Cloud Run container starting from zero
**Solutions:**
1. Set min-instances=1 before demo: `gcloud run services update wordcloud-app --min-instances 1`
2. Keep one browser tab open to maintain warm instance
3. Acceptable: Mention during demo as "serverless cold start"

---

## Appendix: Code Snippets

### Firestore Client Initialization

```javascript
// src/config/firestore.js

const { Firestore } = require('@google-cloud/firestore');

// Auto-detects credentials in Cloud Run
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID
});

// Test connection
async function testConnection() {
  try {
    const testDoc = await firestore.collection('_test').doc('connection').get();
    console.log('✅ Firestore connected');
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = firestore;
```

---

### Express + Socket.io Setup

```javascript
// src/app.js (minimal example)

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('vote', async (data) => {
    // Process vote logic here
    io.emit('wordcloud-update', { words: {} });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## Document Status

- ✅ Technology stack finalized
- ✅ Source tree structure defined
- ✅ API contracts specified
- ✅ Data models documented
- ✅ Deployment scripts created
- ✅ Testing strategy defined
- ✅ Security considerations documented
- ✅ Troubleshooting guide added

**Ready for Implementation:** ✅ YES

**Next Steps:**
1. Create GitHub repository
2. Initialize project with Story 1 (setup)
3. Follow epic-stories.md for implementation
4. Execute speedrun optimizations before demo
5. Run three rehearsal passes

---

_This technical specification provides all details needed for repeatable development of the Claude-Code-Sthlm-1 wordcloud application._

# JavaScript Development Workflow Best Practices (GCloud)

## Overview
This specification defines the standardized JavaScript development workflow for GCloud projects using Node.js, npm, and Google Cloud Platform services. This document serves as context for Claude Code and other development tools.

## Technology Stack
- **Runtime**: Node.js 20.x LTS
- **Package Manager**: npm
- **Cloud Platform**: Google Cloud Platform (GCP)
- **Compute**: Cloud Run
- **Database**: Firestore
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: husky (optional)

### Project-Specific Stack (Claude-Code-Sthlm-1)
- **Web Framework**: Express.js 4.x
- **WebSocket**: Socket.io 4.x (WebSocket + HTTP fallback)
- **Frontend**: Vanilla JavaScript + Bootstrap 5
- **Visualization**: wordcloud2.js (bundled locally)
- **Database Client**: @google-cloud/firestore 7.x

## Core Commands

### Initial Setup (one-time)
```bash
# Install dependencies
npm install

# Setup development environment (if hooks exist)
npm run setup-dev

# Run application locally
npm start

# Run in development mode (with auto-reload)
npm run dev
```

### Local Development
```bash
# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```

### Docker Commands
```bash
# Build image
docker build -t wordcloud-app .

# Run container locally
docker run -p 8080:8080 --env-file .env wordcloud-app

# Test with docker-compose
docker-compose up

# Stop containers
docker-compose down
```

## GCloud Commands

### Cloud Run Deployment

```bash
# Deploy from source (automatic build) - Production configuration
gcloud run deploy wordcloud-app \
  --source . \
  --platform managed \
  --region europe-north1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=your-project-id" \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --port 8080

# Deploy from container image
gcloud run deploy wordcloud-app \
  --image gcr.io/PROJECT_ID/wordcloud-app \
  --platform managed \
  --region europe-north1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10

# Update environment variables
gcloud run services update wordcloud-app \
  --set-env-vars "KEY=VALUE,KEY2=VALUE2" \
  --region europe-north1

# Scale configuration for live demos (prevent cold starts)
gcloud run services update wordcloud-app \
  --min-instances 1 \
  --region europe-north1

# View logs
gcloud run services logs read wordcloud-app \
  --region europe-north1 \
  --limit 50

# Get service URL
gcloud run services describe wordcloud-app \
  --region europe-north1 \
  --format 'value(status.url)'

# Delete service
gcloud run services delete wordcloud-app \
  --region europe-north1
```

### Firestore Operations

```bash
# Create Firestore database (one-time setup)
gcloud firestore databases create \
  --region=europe-north1

# Export data (backup)
gcloud firestore export gs://BUCKET_NAME/backup

# Import data (restore)
gcloud firestore import gs://BUCKET_NAME/backup

# List indexes
gcloud firestore indexes composite list

# Create index (if needed for queries)
gcloud firestore indexes composite create \
  --collection-group=votes \
  --field-config field-path=timestamp,order=descending
```

### Project Setup

```bash
# Set active project
gcloud config set project PROJECT_ID

# View current project
gcloud config get-value project

# Enable required APIs (one-time)
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com

# Create service account for deployment
gcloud iam service-accounts create cloud-run-deployer \
  --display-name "Cloud Run Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:cloud-run-deployer@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

## Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/vote.test.js

# Run tests in Docker
docker-compose run app npm test
```

### Test Structure
```javascript
// tests/vote.test.js
const { processVote } = require('../src/vote');

describe('Vote Processing', () => {
  test('should count word frequency', () => {
    const votes = ['hello', 'world', 'hello'];
    const result = processVote(votes);
    expect(result.hello).toBe(2);
  });
});
```

## Adding Dependencies

```bash
# Add production dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Install specific version
npm install package-name@1.2.3

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Development Workflow

1. **Start Development**: Run `tree` or `ls -la` to see current project structure
2. **Install Dependencies**: Run `npm install` if new dependencies are added
3. **Code**: Write code following ESLint rules and JSDoc comments
4. **Test Frequently**: Run `npm test` during development
5. **Quality Check**: Always run quality sequence before committing:
   ```bash
   npm run lint && npm run format && npm test
   ```
6. **Test Locally**: Run `npm run dev` and verify functionality
7. **Test with Docker**: Build and run Docker container to verify deployment readiness
8. **Deploy**: Use gcloud commands to deploy to Cloud Run
9. **Verify**: Check logs and test the deployed service

### Quality Commands
```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting (without changing files)
npm run format:check

# Run all quality checks
npm run lint && npm run format && npm test
```

### package.json Scripts Setup
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "format:check": "prettier --check \"src/**/*.js\""
  }
}
```

## Socket.io Integration (Real-time Features)

### Initialize Socket.io with Express
```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']  // WebSocket with HTTP fallback
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('custom-event', (data) => {
    // Handle event
    io.emit('broadcast-event', { message: 'Update for all clients' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Client-Side Socket.io
```javascript
// public/js/client.js
const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('broadcast-event', (data) => {
  console.log('Received update:', data);
});

socket.emit('custom-event', { message: 'Hello from client' });
```

## Firestore SDK Usage

### Initialize Firestore
```javascript
const { Firestore } = require('@google-cloud/firestore');

// Initialize (auto-detects credentials in Cloud Run)
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID
});
```

### Common Operations
```javascript
// Create/Update document
await firestore.collection('votes').doc(docId).set({
  word: 'awesome',
  count: 1,
  timestamp: new Date()
});

// Read document
const doc = await firestore.collection('votes').doc(docId).get();
const data = doc.data();

// Query collection
const snapshot = await firestore.collection('votes')
  .where('count', '>', 5)
  .orderBy('count', 'desc')
  .limit(10)
  .get();

snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});

// Update field
await firestore.collection('votes').doc(docId).update({
  count: Firestore.FieldValue.increment(1)
});

// Delete document
await firestore.collection('votes').doc(docId).delete();

// Real-time listener
firestore.collection('votes').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added' || change.type === 'modified') {
      console.log('Data changed:', change.doc.data());
    }
  });
});
```

## Environment Variables

### Local Development (.env file)
```bash
NODE_ENV=development
PORT=8080
GCP_PROJECT_ID=your-project-id
```

### Cloud Run (set during deployment)
```bash
gcloud run services update wordcloud-app \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=your-project-id" \
  --region europe-north1
```

### Loading in Application
```javascript
// Load dotenv for local development only
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT || 8080;
const projectId = process.env.GCP_PROJECT_ID;
```

## Docker Setup

### Dockerfile Example
```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY public/ ./public/

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Health check (recommended for Cloud Run)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start application
CMD ["node", "src/app.js"]
```

### .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
tests
.eslintrc.js
.prettierrc
.templates
scripts
```

## Deployment Scripts Pattern

### Recommended Project Structure
```
project-root/
├── src/              # Backend source code
├── public/           # Frontend static files
├── scripts/          # Deployment and utility scripts
│   ├── deploy.sh           # Cloud Run deployment
│   ├── setup-firestore.sh  # Database initialization
│   └── local-dev.sh        # Local development helper
├── .templates/       # Speedrun templates (optional)
├── tests/            # Test files
└── docs/             # Documentation
```

### scripts/deploy.sh Example
```bash
#!/bin/bash
set -e

PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION="europe-north1"
SERVICE_NAME="wordcloud-app"

echo "Deploying to Cloud Run..."

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
  --timeout 300

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
```

### scripts/setup-firestore.sh Example
```bash
#!/bin/bash
set -e

echo "Creating Firestore database..."

gcloud firestore databases create \
  --location=europe-north1 \
  --type=firestore-native

echo "✅ Firestore database created!"
```

### scripts/local-dev.sh Example
```bash
#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  exit 1
fi

echo "✅ Starting server on http://localhost:8080"
npx nodemon src/app.js
```

## Speedrun Optimization (Live Demos)

For live coding demonstrations, use `.templates/` folder for boilerplate:

```bash
# Create templates directory
mkdir .templates

# Add boilerplate files with TODO markers
.templates/
├── app-starter.js      # Express skeleton with // TODO comments
└── index-starter.html  # Bootstrap shell with placeholders

# During live demo: Copy and fill in
cp .templates/app-starter.js src/app.js
```

**Pre-demo optimizations:**
- Pre-cache dependencies: `npm install` → commit `package-lock.json`
- Use `npm ci` during demo (10-15 seconds vs 2-3 minutes)
- Pre-configure Firestore: Run `./scripts/setup-firestore.sh` before stage
- Pre-build Docker base: Cache layers for faster live builds

## Important Notes

- All commands assume you're in the project root directory
- Use `npm ci` in CI/CD and Docker for reproducible builds
- Use `npm install` for local development
- Cloud Run automatically sets `PORT` environment variable (always use `process.env.PORT`)
- Firestore credentials are automatic in Cloud Run (no manual setup needed)
- Always test Docker build locally before deploying
- Use `--allow-unauthenticated` flag for public services
- Use `--no-allow-unauthenticated` for private services
- For live demos: Set `--min-instances 1` to prevent cold starts

### Common Issues

- **Port binding**: Always use `process.env.PORT || 8080` for port configuration
- **Firestore permissions**: Ensure Cloud Run service account has Firestore access
- **Build failures**: Check `package.json` engines field matches Node.js version
- **Memory issues**: Increase Cloud Run memory limit with `--memory 512Mi`
- **Timeout issues**: Increase Cloud Run timeout with `--timeout 300`
- **CORS errors**: Configure CORS middleware for frontend access

### Security Best Practices

```bash
# Don't commit .env files
echo ".env" >> .gitignore

# Grant Cloud Run access to secrets
gcloud run services update wordcloud-app \
  --update-secrets=MY_SECRET=my-secret:latest
```

### IMPORTANT:
# Tell user to use secrets for sensitive data
gcloud secrets create my-secret --data-file=-

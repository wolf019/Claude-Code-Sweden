#!/bin/bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-tom-axberg-ai-dev}"
REGION="europe-north1"
DATABASE_ID="wordcloud-live"

echo "========================================="
echo "  Firestore Setup for Live Wordcloud"
echo "========================================="
echo ""
echo "Project:  $PROJECT_ID"
echo "Region:   $REGION"
echo "Database: $DATABASE_ID"
echo ""

# Check if the named database exists
echo "Checking Firestore database '$DATABASE_ID'..."
FIRESTORE_STATUS=$(gcloud firestore databases list --project $PROJECT_ID --format="value(name)" 2>/dev/null | grep "$DATABASE_ID" || echo "")

if [ -n "$FIRESTORE_STATUS" ]; then
  echo "✅ Database '$DATABASE_ID' already exists"
else
  echo "Creating Firestore database '$DATABASE_ID'..."
  gcloud firestore databases create \
    --database=$DATABASE_ID \
    --project $PROJECT_ID \
    --location $REGION \
    --type=firestore-native
  echo "✅ Database '$DATABASE_ID' created!"
fi

echo ""
echo "========================================="
echo "  Database Structure"
echo "========================================="
echo ""
echo "sessions/                          # Collection of question sessions"
echo "  {sessionId}/                     # Auto-generated session ID"
echo "    question: string               # The question for this session"
echo "    createdAt: timestamp           # When session was created"
echo "    isActive: boolean              # Only one session active at a time"
echo "    wordCounts: {                  # Aggregated word counts"
echo "      \"HELLO\": 5,"
echo "      \"AWESOME\": 3"
echo "    }"
echo "    votes/                         # Subcollection of votes"
echo "      {voteId}/"
echo "        name: string               # Voter's name"
echo "        word: string               # The word they voted"
echo "        visitorId: string          # Socket ID"
echo "        timestamp: timestamp       # When they voted"
echo ""
echo "========================================="
echo "  Firestore Indexes (auto-created)"
echo "========================================="
echo ""
echo "The app will auto-create needed indexes on first query."
echo "If you see index errors, create these manually:"
echo ""
echo "Collection: sessions"
echo "  - isActive (Ascending) + createdAt (Descending)"
echo ""
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""
echo "1. Deploy the app:  ./scripts/deploy.sh"
echo "2. The first POST to /admin/question will create the first session"
echo ""
echo "Optional - Create initial session via curl:"
echo "  curl -X POST https://YOUR_APP_URL/admin/question \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"question\": \"What word comes to mind?\"}'"
echo ""
echo "✅ Firestore setup complete!"

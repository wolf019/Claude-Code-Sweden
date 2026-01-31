#!/bin/bash
set -e

PROJECT_ID="tom-axberg-ai-dev"
REGION="europe-north1"

echo "Setting up Firestore for project: $PROJECT_ID"
echo "Region: $REGION"

# Check if Firestore is already enabled
echo "Checking Firestore status..."
FIRESTORE_STATUS=$(gcloud firestore databases list --project $PROJECT_ID --format="value(name)" 2>/dev/null || echo "")

if [ -n "$FIRESTORE_STATUS" ]; then
  echo "Firestore database already exists for project $PROJECT_ID"
  echo "Database: $FIRESTORE_STATUS"
else
  echo "Creating Firestore database in Native mode..."
  gcloud firestore databases create \
    --project $PROJECT_ID \
    --location $REGION \
    --type firestore-native
  echo "Firestore database created successfully!"
fi

echo ""
echo "Firestore setup complete!"
echo ""
echo "Collections that will be created automatically:"
echo "  - votes: Stores user votes with words"
echo "  - sessions: Stores session data and questions"
echo ""
echo "Next: Run ./scripts/deploy.sh to deploy the application"

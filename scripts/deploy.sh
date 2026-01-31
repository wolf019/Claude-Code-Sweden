#!/bin/bash
set -e

PROJECT_ID="tom-axberg-ai-dev"
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
  --min-instances 2 \
  --max-instances 20 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --port 8080 \
  --concurrency 40

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)')

echo ""
echo "Deployment complete!"
echo ""
echo "Service URL: $SERVICE_URL"
echo ""
echo "Generate QR code: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Visit $SERVICE_URL to test"
echo "2. Set question: curl -X POST $SERVICE_URL/admin/question -H 'Content-Type: application/json' -d '{\"question\":\"What word describes this meetup?\"}'"
echo "3. Generate QR code for audience"

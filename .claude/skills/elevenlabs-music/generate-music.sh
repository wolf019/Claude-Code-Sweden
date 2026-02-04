#!/bin/bash
#
# ElevenLabs Music Generator
# Usage: ./generate-music.sh <output_file> <duration_seconds> "<prompt>"
#
# Example:
#   ./generate-music.sh music.mp3 15 "Upbeat electronic music with warm synths"
#
# Requires: ELEVENLABS_API_KEY in .env file or environment variable

set -e

# Load .env file if it exists (check multiple locations)
for ENV_FILE in ".env" "$HOME/.env" "$(dirname "$0")/../../../.env"; do
    if [ -f "$ENV_FILE" ]; then
        export $(grep -v '^#' "$ENV_FILE" | grep -E '^[A-Z_]+=.' | xargs)
        break
    fi
done

OUTPUT_FILE="${1:?Usage: $0 <output_file> <duration_seconds> \"<prompt>\"}"
DURATION="${2:?Duration in seconds required}"
PROMPT="${3:?Music prompt required}"

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "Error: ELEVENLABS_API_KEY not found in .env or environment"
    exit 1
fi

echo "Generating music..."
echo "  Duration: ${DURATION}s"
echo "  Prompt: ${PROMPT}"
echo "  Output: ${OUTPUT_FILE}"

curl -s -X POST "https://api.elevenlabs.io/v1/music/generate" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"prompt\": \"${PROMPT}\",
        \"duration_seconds\": ${DURATION}
    }" \
    --output "${OUTPUT_FILE}"

if [ -f "${OUTPUT_FILE}" ] && [ -s "${OUTPUT_FILE}" ]; then
    echo "Music generated successfully: ${OUTPUT_FILE}"
else
    echo "Error: Failed to generate music"
    exit 1
fi

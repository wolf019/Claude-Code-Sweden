# Deployment Automation

One-command deployment to Cloud Run.

## Requirements
- `scripts/deploy.sh` deploys to Cloud Run from source
- Settings: min-instances=2, memory=1Gi, concurrency=40
- Output public URL and QR code link
- `scripts/setup-firestore.sh` for database creation
- `scripts/local-dev.sh` for local development

## E2E Test
Run deployment:
- `./scripts/deploy.sh` completes in <3 minutes
- Public URL accessible immediately
- App responds to health check

## Done when
- [ ] Deploy script works end-to-end
- [ ] Public URL output
- [ ] QR code generation link shown

**Full details:** docs/stories/story-010-deployment-script.md

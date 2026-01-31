# Vote Submission Flow

Allow participants to submit words with validation and rate limiting.

## Requirements
- Client validation: 1-50 chars, trim whitespace
- Strip emojis and special characters
- Rate limit: 1 vote per 5 seconds per socket
- Emit 'vote-submitted' confirmation
- Show "Submitted!" + disable button 5s

## E2E Test
Verify in browser:
- Empty submission shows validation error
- Rapid submissions blocked (rate limit)
- Success shows confirmation message

## Done when
- [ ] Form validation works
- [ ] Rate limiting prevents spam
- [ ] User sees feedback on submit

**Full details:** docs/stories/story-006-vote-submission.md

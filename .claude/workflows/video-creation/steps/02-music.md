# Step 3: Generate Music

Uses: `elevenlabs-music` skill

1. Craft prompt from mood:
   - energetic → "upbeat electronic, driving beat"
   - calm → "ambient, soft piano, peaceful"
   - inspiring → "uplifting, warm synths, positive"
   - fun → "playful, bouncy, cheerful"

2. Generate:
   ```bash
   ./.claude/skills/elevenlabs-music/generate-music.sh \
       ./{project}/public/music.mp3 \
       {duration} \
       "{prompt}"
   ```

3. Enable in composition (`ENABLE_MUSIC = true`)

Output: `public/music.mp3` integrated into video.

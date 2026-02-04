---
name: elevenlabs-music
description: Generate AI music using ElevenLabs Music API
metadata:
  tags: music, audio, elevenlabs, ai, generation
---

## When to use

Use this skill when you need to generate background music, soundtracks, or audio tracks for videos, projects, or any content requiring AI-generated music.

## How to use

Use the `generate-music.sh` script to generate music:

```bash
./.claude/skills/elevenlabs-music/generate-music.sh <output_file> <duration_seconds> "<prompt>"
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `output_file` | Path where the MP3 will be saved |
| `duration_seconds` | Length of the track (e.g., 15 for 15 seconds) |
| `prompt` | Description of the desired music |

### Example

```bash
./.claude/skills/elevenlabs-music/generate-music.sh \
    ./public/music.mp3 \
    15 \
    "Upbeat electronic music with warm synths and positive energy, modern and inspiring"
```

## Prompt guidelines

Write detailed prompts describing:

- **Genre**: electronic, orchestral, jazz, ambient, rock
- **Mood**: upbeat, melancholic, energetic, calm, dramatic
- **Tempo**: fast, slow, moderate
- **Instruments**: synths, piano, guitar, drums, strings
- **Use case**: background music, intro, outro, action scene

### Good prompts

```
"Upbeat electronic music with synthesizers and a driving beat, energetic and positive, for a tech demo"

"Calm ambient music with soft piano and gentle strings, peaceful, for meditation"

"Epic orchestral soundtrack with brass and percussion, building tension, for a trailer"
```

### Avoid

- Copyrighted song references
- Specific artist names
- Song titles

## Requirements

- `ELEVENLABS_API_KEY` environment variable must be set
- Paid ElevenLabs subscription required

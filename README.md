# Record Slide Movie

This project demonstrates automated audio generation for Slidev presentations using VOICEVOX and automatic slide transitions. The slideshow is served via `@slidev/cli`.

The main usage flow is:

1. Add talk scripts to each slide using HTML comments:
   ```markdown
   ---
   audio: /audio/01.wav
   ---
   <!-- talk: Your narration text here -->
   # My Slide
   ```
2. Run `pnpm run` to generate audio and launch Slidev. The generation script
   extracts these comments and creates WAV files under `public/audio/`.

See `TODO.md` for detailed specification.

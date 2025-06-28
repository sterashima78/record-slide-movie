# Record Slide Movie

This project demonstrates automated audio generation for Slidev presentations using VOICEVOX and automatic slide transitions. The slideshow is served via `@slidev/cli`.

The main usage flow is:

1. Put per-slide scripts under `audio-src/` as `01.txt`, `02.txt`, ...
2. Add slide front-matter referencing the generated audio files and scripts, e.g.
   ```markdown
   ---
   audio: /audio/01.wav
   script: ./audio-src/01.txt
   ---
   # My Slide
   ```
3. Run `pnpm run` to generate audio and launch Slidev.

See `TODO.md` for detailed specification.

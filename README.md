# Record Slide Movie

This project demonstrates automated audio generation for Slidev presentations using VOICEVOX and automatic slide transitions. The slideshow is served via `@slidev/cli`.

The main usage flow is:

1. Add narration text with HTML comments:
   ```markdown
   ---
   # My Slide
   ---
   <!--script: Your narration text here -->
   ```
2. Run `pnpm run voice` to generate audio and then `pnpm slidev --remote` to open the slideshow.
   The generation script creates files like `public/audio/slide-1.wav`.

See `TODO.md` for detailed specification.

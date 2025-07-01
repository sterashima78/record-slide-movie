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

The `AutoNarrate` component waits 500\u00a0ms after playback ends before
advancing to the next slide. Playback begins as soon as the slide is shown
unless a start delay is configured. You can override these timings globally by
passing `delay` and `startDelay` props in milliseconds:

```vue
<AutoNarrate :delay="1000" :start-delay="200" />
```

You can also specify per‑slide timings by adding `delay` and `startDelay`
values in that slide's frontmatter:

```markdown
---
delay: 750
startDelay: 200
---
# Slide title
```

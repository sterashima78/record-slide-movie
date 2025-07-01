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

The `AutoNarrate` component waits 500&nbsp;ms after playback ends before
advancing to the next slide. You can override this globally by passing a
`delay` prop in milliseconds:

```vue
<AutoNarrate :delay="1000" />
```

You can also specify a per‑slide delay by adding a `delay` value in that
slide's frontmatter:

```markdown
---
delay: 750
---
# Slide title
```

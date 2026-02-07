# Carousel

Modular transitions and visual effects for [Remotion](https://remotion.dev). Drop components into your own project or run the included showcase to preview everything.

## Quick Start

```bash
bun install
bun run studio    # Preview in Remotion Studio
bun run render    # Render to out/video.mp4
```

## Effects

**Transitions** — `fade`, `slide`, `wipe`, and a custom `lightLeak` transition using a real video overlay.

**Photo Motion** — `pan-left`, `pan-right`, `pan-up`, `pan-down`, `zoom-in`, `zoom-out`, or supply a custom `{ effect, panStartX, panEndX, ... }` config. Automatically selects appropriate effects based on portrait/landscape orientation.

**Polaroid Cards** — Animated card presentations (`classic`, `float`, `toss`, `slide-*`) with configurable tilt, inner motion, and spotlight backgrounds. Also supports multi-card group layouts.

**Decorative Frames** — `retro-tv`, `polaroid-tape`, `neon-glow`, `postage-stamp`, `film-strip`, `sticker`.

**Border Overlays** — Full-frame SVG ornaments: `art-nouveau`, `book-plate`, `fairytale-filigree`, `gilded-baroque`, `botanical-wreath`, `geometric-deco`.

**Text Effects** — `white-glow`, `solid-stroke`, `gradient-outline`, `frosted-pill`, `clean-gradient`, `duo-tone`.

**Global Overlays** — Bokeh particles, vignette, film grain, confetti bursts, and emoji showers (`rain`, `firework`, `zigzag` patterns).

## Using in Your Own Project

1. Copy any component folder (`frames/`, `border-overlays/`, `photo-effects/`, `text-effects/`) into your Remotion project.
2. Replace `DEMO_IMAGES` in `Root.tsx` with your own images.
3. Configure effects in `Slideshow.tsx` — text overlays, frame assignments, border overlays, transition cadence, and slide durations are all driven by plain config objects at the top of the file.

## Project Structure

```
src/
  Root.tsx                  Composition entry point
  Slideshow.tsx             Timeline, transitions, effect orchestration
  IntroSlide.tsx            Animated intro title
  OutroSlide.tsx            Animated outro title
  PhotoSlide.tsx            Single-image slide with motion effects
  PolaroidCard.tsx          Polaroid card presentation
  MultiCardSlide.tsx        Multi-card group layout
  LightLeakTransition.tsx   Custom light leak transition
  BokehParticles.tsx        Floating bokeh overlay
  ConfettiBurst.tsx         Timed confetti bursts
  FilmGrainOverlay.tsx      Subtle film grain
  VignetteOverlay.tsx       Edge vignette
  SpotlightBackground.tsx   Gradient spotlight backgrounds
  TextOverlay.tsx           Animated text overlay
  frames/                   Decorative photo frames
  border-overlays/          Full-frame SVG borders
  photo-effects/            Per-photo effect overlays (emoji shower)
  text-effects/             Text style variants
public/
  demo/                     SVG demo assets
  video/light-leak.webm     Light leak transition source
```

## License

[MIT](LICENSE)

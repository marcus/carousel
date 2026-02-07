# Remotion Effects Showcase

Reusable transitions and visual effect components for [Remotion](https://remotion.dev).

This repository is now a generic effect source project. It contains a ready-to-run `EffectsShowcase` composition and modular components you can copy into your own Remotion videos.

## Status

Active. This branch is maintained as a reusable Remotion effects source project.

## Quick start

```bash
bun install
bun run studio
```

Render the demo composition:

```bash
bun run render
```

## What is included

- Transition wiring with `@remotion/transitions` (`fade`, `slide`, `wipe`) plus a custom `lightLeak()` presentation
- Photo motion effects (`pan`, `zoom`, custom motion config)
- Polaroid-style cards and multi-card layouts
- Decorative frame components
- Full-screen border overlays
- Emoji shower photo effects
- Global overlays (`bokeh`, `vignette`, `film grain`, `confetti`)
- Text overlay styles (`white-glow`, `solid-stroke`, `gradient-outline`, `frosted-pill`, `clean-gradient`, `duo-tone`)

## Project layout

```text
src/
  Root.tsx                    # Registers EffectsShowcase composition
  Slideshow.tsx               # Timeline + effect orchestration
  IntroSlide.tsx              # Intro title animation
  OutroSlide.tsx              # Outro title animation
  PhotoSlide.tsx              # Motion treatment for a single image
  LightLeakTransition.tsx     # Custom transition presentation
  frames/                     # Decorative photo frames
  border-overlays/            # Full-frame SVG border overlays
  photo-effects/              # Per-photo effect overlays
  text-effects/               # Text style variants
public/
  demo/                       # Demo SVG assets
  video/light-leak.webm       # Light leak transition source
```

## Customizing for your own project

1. Replace `DEMO_IMAGES` in `src/Root.tsx` with your own image list.
2. Adjust `TEXT_OVERLAYS`, `FRAMED_PHOTO_CONFIGS`, `BORDER_OVERLAY_CONFIGS`, and `EMOJI_SHOWER_CONFIGS` in `src/Slideshow.tsx`.
3. Tune durations and transition cadence in `src/Slideshow.tsx`.
4. Copy any component folder (`frames`, `border-overlays`, `photo-effects`, `text-effects`) into another Remotion repo as needed.

## Scripts

```bash
bun run studio   # Open Remotion Studio
bun run render   # Render EffectsShowcase to out/video.mp4
bun run build    # Alias of render
```

## License

No license file is currently defined in this repository.

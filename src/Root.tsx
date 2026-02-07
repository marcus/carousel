import React from "react";
import { Composition } from "remotion";
import { Slideshow } from "./Slideshow";
import type { SlideshowProps, ImageData } from "./types";
import { VIDEO_CONFIG } from "./types";

const demoImage = (
  src: string,
  width: number,
  height: number
): ImageData => ({
  src,
  width,
  height,
  isPortrait: height > width,
});

const DEMO_IMAGES: ImageData[] = [
  demoImage("demo/cosmic-grid.svg", 1600, 900),
  demoImage("demo/sunrise-bands.svg", 1080, 1440),
  demoImage("demo/ocean-layers.svg", 1600, 900),
  demoImage("demo/paper-cut.svg", 1080, 1440),
  demoImage("demo/retro-sun.svg", 1600, 900),
  demoImage("demo/botanical-burst.svg", 1200, 1200),
  demoImage("demo/midnight-lines.svg", 1600, 900),
  demoImage("demo/chrome-wave.svg", 1080, 1440),
  demoImage("demo/coral-haze.svg", 1600, 900),
  demoImage("demo/graphite-geometry.svg", 1200, 1200),
  demoImage("demo/summer-glass.svg", 1600, 900),
  demoImage("demo/indigo-vortex.svg", 1080, 1440),
  demoImage("demo/teal-motion.svg", 1600, 900),
  demoImage("demo/sand-poster.svg", 1080, 1440),
];

const SHOWCASE_DURATION_SECONDS = 60;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EffectsShowcase"
      component={
        Slideshow as unknown as React.ComponentType<Record<string, unknown>>
      }
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
      fps={VIDEO_CONFIG.fps}
      durationInFrames={Math.ceil(SHOWCASE_DURATION_SECONDS * VIDEO_CONFIG.fps)}
      defaultProps={
        {
          images: DEMO_IMAGES,
          durationInSeconds: SHOWCASE_DURATION_SECONDS,
        } satisfies SlideshowProps
      }
    />
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { IntroSlide } from "./IntroSlide";
import { OutroSlide } from "./OutroSlide";
import { PhotoSlide } from "./PhotoSlide";
import { PolaroidCard } from "./PolaroidCard";
import { MultiCardSlide } from "./MultiCardSlide";
import { lightLeak } from "./LightLeakTransition";
import { FilmGrainOverlay } from "./FilmGrainOverlay";
import { BokehParticles } from "./BokehParticles";
import { VignetteOverlay } from "./VignetteOverlay";
import { ConfettiBurst } from "./ConfettiBurst";
import { RetroTVFrame } from "./frames/RetroTVFrame";
import { PolaroidTapeFrame } from "./frames/PolaroidTapeFrame";
import { NeonGlowFrame } from "./frames/NeonGlowFrame";
import { PostageStampFrame } from "./frames/PostageStampFrame";
import { FilmStripFrame } from "./frames/FilmStripFrame";
import { StickerFrame } from "./frames/StickerFrame";
import { ArtNouveauBorder } from "./border-overlays/ArtNouveauBorder";
import { BookPlateBorder } from "./border-overlays/BookPlateBorder";
import { FairytaleFiligree } from "./border-overlays/FairytaleFiligree";
import { GildedBaroqueBorder } from "./border-overlays/GildedBaroqueBorder";
import { BotanicalWreathBorder } from "./border-overlays/BotanicalWreathBorder";
import { GeometricDecoBorder } from "./border-overlays/GeometricDecoBorder";
import { EmojiShower } from "./photo-effects/EmojiShower";
import type {
  SlideshowProps,
  MotionEffect,
  CustomMotionConfig,
  TextOverlayConfig,
  PolaroidCardConfig,
  MultiCardGroupConfig,
  SpotlightPreset,
  ImageData,
  FrameType,
  BorderOverlayType,
  EmojiShowerConfig,
} from "./types";
import { VIDEO_CONFIG } from "./types";

const TRANSITIONS = [
  () => fade(),
  () => fade(),
  () => fade(),
  () => slide({ direction: "from-left" }),
  () => slide({ direction: "from-right" }),
  () => slide({ direction: "from-bottom" }),
  () => wipe({ direction: "from-left" }),
  () => wipe({ direction: "from-right" }),
];

const LIGHT_LEAK_INTERVAL = 5;

type AnyTransition = TransitionPresentation<Record<string, unknown>>;

const getTransitionForIndex = (
  index: number,
  totalSlides: number
): { presentation: AnyTransition; isLightLeak: boolean } => {
  if (
    index > 1 &&
    index < totalSlides - 1 &&
    index % LIGHT_LEAK_INTERVAL === 0
  ) {
    return {
      presentation: lightLeak() as unknown as AnyTransition,
      isLightLeak: true,
    };
  }
  const hash = (index * 7 + 3) % TRANSITIONS.length;
  return {
    presentation: TRANSITIONS[hash]!() as unknown as AnyTransition,
    isLightLeak: false,
  };
};

const LANDSCAPE_EFFECTS: MotionEffect[] = [
  "pan-left-to-right",
  "pan-right-to-left",
  "zoom-in",
  "zoom-out",
];

const PORTRAIT_EFFECTS: MotionEffect[] = [
  "zoom-in",
  "zoom-out",
  "pan-up",
  "pan-down",
  "pan-left-to-right",
  "pan-right-to-left",
];

const CUSTOM_MOTION_CONFIGS: Record<string, CustomMotionConfig> = {
  "demo/cosmic-grid.svg": {
    effect: "pan-left-to-right",
    panStartX: 0.8,
    panEndX: -0.2,
  },
  "demo/chrome-wave.svg": {
    effect: "pan-down",
    panStartY: -0.6,
    panEndY: 0.4,
  },
  "demo/graphite-geometry.svg": { effect: "none" },
};

const POLAROID_CARD_CONFIGS: Record<string, PolaroidCardConfig> = {
  "demo/sunrise-bands.svg": {
    presentationMode: "polaroid-classic",
    backgroundPreset: "warm-sunset",
    tiltDegrees: -3,
    innerMotion: "slow-zoom",
  },
  "demo/retro-sun.svg": {
    presentationMode: "polaroid-float",
    backgroundPreset: "cool-ocean",
    tiltDegrees: 4,
    innerMotion: "slow-drift",
  },
  "demo/coral-haze.svg": {
    presentationMode: "polaroid-toss",
    backgroundPreset: "rose-gold",
    tiltDegrees: -2,
    innerMotion: "slow-zoom",
  },
  "demo/sand-poster.svg": {
    presentationMode: "polaroid-float",
    backgroundPreset: "midnight-blue",
    tiltDegrees: 3,
    innerMotion: "none",
  },
};

const MULTI_CARD_GROUPS: MultiCardGroupConfig[] = [
  { imageIndices: [2, 3, 4], backgroundPreset: "cotton-candy" },
  { imageIndices: [9, 10], backgroundPreset: "forest-green" },
];

const MULTI_CARD_INDEX_SET = new Set(
  MULTI_CARD_GROUPS.flatMap((group) => group.imageIndices)
);

const MULTI_CARD_FIRST_INDEX = new Map(
  MULTI_CARD_GROUPS.map((group) => [group.imageIndices[0], group])
);

const TEXT_OVERLAYS: TextOverlayConfig[] = [
  {
    imageSrc: "demo/cosmic-grid.svg",
    text: "Fade + Pan",
    colorSchemeIndex: 3,
    textEffect: "white-glow",
  },
  {
    imageSrc: "demo/paper-cut.svg",
    text: "Text Overlay Styles",
    colorSchemeIndex: 1,
    textEffect: "solid-stroke",
  },
  {
    imageSrc: "demo/chrome-wave.svg",
    text: "Polaroid Motion",
    colorSchemeIndex: 5,
    textEffect: "gradient-outline",
  },
  {
    imageSrc: "demo/graphite-geometry.svg",
    text: "Decorative Frames",
    colorSchemeIndex: 4,
    textEffect: "frosted-pill",
  },
  {
    imageSrc: "demo/teal-motion.svg",
    text: "Border Overlays",
    colorSchemeIndex: 0,
    textEffect: "duo-tone",
  },
];

const FRAMED_PHOTO_CONFIGS: Record<string, FrameType> = {
  "demo/ocean-layers.svg": "retro-tv",
  "demo/paper-cut.svg": "polaroid-tape",
  "demo/midnight-lines.svg": "neon-glow",
  "demo/graphite-geometry.svg": "postage-stamp",
  "demo/indigo-vortex.svg": "film-strip",
  "demo/teal-motion.svg": "sticker",
};

const BORDER_OVERLAY_CONFIGS: Record<string, BorderOverlayType> = {
  "demo/cosmic-grid.svg": "art-nouveau",
  "demo/sunrise-bands.svg": "book-plate",
  "demo/botanical-burst.svg": "fairytale-filigree",
  "demo/coral-haze.svg": "gilded-baroque",
  "demo/summer-glass.svg": "botanical-wreath",
  "demo/sand-poster.svg": "geometric-deco",
};

const EMOJI_SHOWER_CONFIGS: Record<string, EmojiShowerConfig> = {
  "demo/retro-sun.svg": {
    emoji: "✨",
    pattern: "rain",
    count: 34,
    durationInSeconds: 2,
    emojiSize: 140,
  },
  "demo/chrome-wave.svg": {
    emoji: "🎬",
    pattern: "firework",
    count: 38,
    durationInSeconds: 1.8,
    burstX: 0.5,
    burstY: 0.45,
    emojiSize: 140,
  },
  "demo/teal-motion.svg": {
    emoji: "🎉",
    pattern: "zigzag",
    count: 30,
    durationInSeconds: 2,
    emojiSize: 150,
  },
};

const getFrameComponent = (frameType: FrameType) => {
  switch (frameType) {
    case "retro-tv":
      return RetroTVFrame;
    case "polaroid-tape":
      return PolaroidTapeFrame;
    case "neon-glow":
      return NeonGlowFrame;
    case "postage-stamp":
      return PostageStampFrame;
    case "film-strip":
      return FilmStripFrame;
    case "sticker":
      return StickerFrame;
  }
};

const getBorderOverlayComponent = (type: BorderOverlayType) => {
  switch (type) {
    case "art-nouveau":
      return ArtNouveauBorder;
    case "book-plate":
      return BookPlateBorder;
    case "fairytale-filigree":
      return FairytaleFiligree;
    case "gilded-baroque":
      return GildedBaroqueBorder;
    case "botanical-wreath":
      return BotanicalWreathBorder;
    case "geometric-deco":
      return GeometricDecoBorder;
  }
};

const getEffectForImage = (
  image: ImageData,
  index: number
): MotionEffect | CustomMotionConfig => {
  if (CUSTOM_MOTION_CONFIGS[image.src]) {
    return CUSTOM_MOTION_CONFIGS[image.src]!;
  }

  const effects = image.isPortrait ? PORTRAIT_EFFECTS : LANDSCAPE_EFFECTS;
  const hash = image.src
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const effectIndex = (hash + index) % effects.length;
  return effects[effectIndex]!;
};

const getPolaroidCardConfig = (src: string): PolaroidCardConfig | undefined =>
  POLAROID_CARD_CONFIGS[src];

const getTextOverlay = (src: string) => {
  const config = TEXT_OVERLAYS.find((overlay) => overlay.imageSrc === src);
  if (!config) return undefined;
  return {
    text: config.text,
    colorSchemeIndex: config.colorSchemeIndex,
    textEffect: config.textEffect,
    startFrame: config.startFrame,
  };
};

const getImageName = (src: string) => {
  const filename = src.split("/").pop() || src;
  return filename.replace(/\.(jpeg|jpg|png|heic|svg)$/i, "");
};

const TRANSITION_DURATION_FRAMES = 20;
const LIGHT_LEAK_DURATION_FRAMES = 18;
const INTRO_DURATION_SECONDS = 4;
const OUTRO_DURATION_SECONDS = 8;

type SlidePlan =
  | { type: "single"; image: ImageData; originalIndex: number }
  | {
      type: "multi";
      images: ImageData[];
      backgroundPreset: SpotlightPreset;
      originalIndex: number;
    };

const buildSlidePlan = (images: ImageData[]): SlidePlan[] => {
  const plan: SlidePlan[] = [];
  let index = 0;

  while (index < images.length) {
    const group = MULTI_CARD_FIRST_INDEX.get(index);

    if (group) {
      const groupImages = group.imageIndices
        .map((imageIndex) => images[imageIndex])
        .filter((image): image is ImageData => Boolean(image));

      if (groupImages.length > 1) {
        plan.push({
          type: "multi",
          images: groupImages,
          backgroundPreset: group.backgroundPreset,
          originalIndex: index,
        });
        index += group.imageIndices.length;
        continue;
      }
    }

    if (MULTI_CARD_INDEX_SET.has(index)) {
      index++;
      continue;
    }

    plan.push({ type: "single", image: images[index]!, originalIndex: index });
    index++;
  }

  return plan;
};

export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  durationInSeconds,
}) => {
  const { fps } = VIDEO_CONFIG;
  const slidePlan = buildSlidePlan(images);
  const numSlides = slidePlan.length;

  if (numSlides === 0) {
    return <AbsoluteFill style={{ backgroundColor: "#000" }} />;
  }

  const totalFrames = Math.ceil(durationInSeconds * fps);
  const introDurationFrames = INTRO_DURATION_SECONDS * fps;
  const outroDurationFrames = OUTRO_DURATION_SECONDS * fps;

  const photosTotalFrames = totalFrames - introDurationFrames - outroDurationFrames;
  const numTransitions = numSlides;
  const slideDuration = Math.max(
    1,
    Math.floor(
      (photosTotalFrames + numTransitions * TRANSITION_DURATION_FRAMES) / numSlides
    )
  );

  const firstBurstFrame =
    introDurationFrames + Math.floor(slideDuration * Math.max(1, Math.floor(numSlides * 0.33)));
  const secondBurstFrame =
    introDurationFrames + Math.floor(slideDuration * Math.max(2, Math.floor(numSlides * 0.66)));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={introDurationFrames} name="Intro">
          <IntroSlide text="Remotion Effects Showcase" />
        </TransitionSeries.Sequence>

        {slidePlan.map((slide, slideIndex) => {
          const transition = getTransitionForIndex(slideIndex, slidePlan.length);
          const transitionDuration = transition.isLightLeak
            ? LIGHT_LEAK_DURATION_FRAMES
            : TRANSITION_DURATION_FRAMES;

          if (slide.type === "multi") {
            return (
              <React.Fragment key={`multi-${slide.originalIndex}`}>
                <TransitionSeries.Transition
                  presentation={transition.presentation}
                  timing={linearTiming({ durationInFrames: transitionDuration })}
                />
                <TransitionSeries.Sequence
                  durationInFrames={slideDuration}
                  name={`multi-${slide.images.map((img) => getImageName(img.src)).join("+")}`}
                >
                  <MultiCardSlide
                    images={slide.images}
                    backgroundPreset={slide.backgroundPreset}
                  />
                </TransitionSeries.Sequence>
              </React.Fragment>
            );
          }

          const { image, originalIndex } = slide;
          const cardConfig = getPolaroidCardConfig(image.src);
          const frameType = FRAMED_PHOTO_CONFIGS[image.src];
          const borderOverlayType = BORDER_OVERLAY_CONFIGS[image.src];
          const emojiShowerConfig = EMOJI_SHOWER_CONFIGS[image.src];

          let slideContent: React.ReactNode;

          if (cardConfig) {
            slideContent = (
              <PolaroidCard
                image={image}
                config={cardConfig}
                textOverlay={getTextOverlay(image.src)}
              />
            );
          } else if (frameType) {
            const FrameComponent = getFrameComponent(frameType);
            slideContent = (
              <FrameComponent
                image={image}
                textOverlay={getTextOverlay(image.src)}
              />
            );
          } else {
            slideContent = (
              <PhotoSlide
                image={image}
                motionEffect={getEffectForImage(image, originalIndex)}
                textOverlay={getTextOverlay(image.src)}
              />
            );
          }

          let borderOverlay: React.ReactNode = null;
          if (borderOverlayType) {
            const BorderComponent = getBorderOverlayComponent(borderOverlayType);
            borderOverlay = <BorderComponent />;
          }

          let emojiShowerOverlay: React.ReactNode = null;
          if (emojiShowerConfig) {
            emojiShowerOverlay = <EmojiShower {...emojiShowerConfig} />;
          }

          return (
            <React.Fragment key={image.src}>
              <TransitionSeries.Transition
                presentation={transition.presentation}
                timing={linearTiming({ durationInFrames: transitionDuration })}
              />
              <TransitionSeries.Sequence
                durationInFrames={slideDuration}
                name={getImageName(image.src)}
              >
                <AbsoluteFill>
                  {slideContent}
                  {borderOverlay}
                  {emojiShowerOverlay}
                </AbsoluteFill>
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={outroDurationFrames} name="Outro">
          <OutroSlide
            primaryText="Transitions & Effects"
            secondaryText="For Remotion"
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <BokehParticles particleCount={20} />
      <VignetteOverlay opacity={0.12} />
      <ConfettiBurst triggers={[firstBurstFrame, secondBurstFrame]} />
      <FilmGrainOverlay opacity={0.04} />
    </AbsoluteFill>
  );
};

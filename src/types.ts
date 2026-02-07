export interface ImageData {
  src: string;
  isPortrait: boolean;
  width: number;
  height: number;
}

export interface SlideshowProps {
  images: ImageData[];
  durationInSeconds: number;
}

export type MotionEffect =
  | "pan-left-to-right"
  | "pan-right-to-left"
  | "pan-up"
  | "pan-down"
  | "zoom-in"
  | "zoom-out"
  | "none";

export interface CustomMotionConfig {
  effect: MotionEffect;
  panStartX?: number; // -1 (left) to 1 (right), 0 is center
  panEndX?: number;
  panStartY?: number; // -1 (top) to 1 (bottom), 0 is center
  panEndY?: number;
}

export interface PhotoSlideProps {
  image: ImageData;
  motionEffect: MotionEffect | CustomMotionConfig;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: TextEffect;
    startFrame?: number;
  };
}

export interface IntroSlideProps {
  text: string;
}

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export type TextEffect =
  | "white-glow"
  | "solid-stroke"
  | "gradient-outline"
  | "frosted-pill"
  | "clean-gradient"
  | "duo-tone";

export interface TextOverlayProps {
  text: string;
  colorSchemeIndex?: number;
  textEffect?: TextEffect;
  fadeInDuration?: number;  // frames
  fadeOutDuration?: number; // frames
  holdDuration?: number;    // frames (defaults to fill remaining time)
  startFrame?: number;      // when to start the overlay within the slide
}

export interface TextOverlayConfig {
  imageSrc: string;         // Which image to show overlay on
  text: string;
  colorSchemeIndex?: number;
  textEffect?: TextEffect;
  startFrame?: number;
}

// Landscape Polaroid card system types

export type PresentationMode =
  | "full-bleed"
  | "polaroid-classic"
  | "polaroid-float"
  | "polaroid-toss"
  | "polaroid-slide-left"
  | "polaroid-slide-right"
  | "polaroid-slide-up";

export type SpotlightPreset =
  | "warm-sunset"
  | "cool-ocean"
  | "dreamy-purple"
  | "golden-hour"
  | "forest-green"
  | "rose-gold"
  | "midnight-blue"
  | "cotton-candy";

export interface PolaroidCardConfig {
  presentationMode: PresentationMode;
  backgroundPreset: SpotlightPreset;
  tiltDegrees: number;
  cardScale?: number;
  innerMotion?: "slow-zoom" | "slow-drift" | "none";
}

// Keep old name as alias for compatibility
export type LandscapeCardConfig = PolaroidCardConfig;

export interface PolaroidCardProps {
  image: ImageData;
  config: PolaroidCardConfig;
  textOverlay?: PhotoSlideProps["textOverlay"];
  showBackground?: boolean;
  scaleFactor?: number;
  positionX?: number;
  positionY?: number;
  entranceDelay?: number;
}

// Keep old name as alias
export type LandscapePhotoCardProps = PolaroidCardProps;

export interface MultiCardSlideProps {
  images: ImageData[];
  backgroundPreset: SpotlightPreset;
  textOverlay?: PhotoSlideProps["textOverlay"];
}

export interface MultiCardGroupConfig {
  imageIndices: number[];
  backgroundPreset: SpotlightPreset;
}

export interface SpotlightBackgroundProps {
  preset: SpotlightPreset;
  seed?: number;
}

// Decorative frame types for photo display
export type FrameType =
  | "retro-tv"
  | "polaroid-tape"
  | "neon-glow"
  | "postage-stamp"
  | "film-strip"
  | "sticker";

export interface FramedPhotoConfig {
  frameType: FrameType;
}

// Full-frame decorative border overlays
export type BorderOverlayType =
  | "art-nouveau"
  | "book-plate"
  | "fairytale-filigree"
  | "gilded-baroque"
  | "botanical-wreath"
  | "geometric-deco";

// Emoji shower overlay effect
export type EmojiShowerPattern = "rain" | "firework" | "zigzag";

export interface EmojiShowerConfig {
  emoji: string;                    // The emoji character(s) to use
  pattern: EmojiShowerPattern;      // Animation pattern
  count?: number;                   // Number of emojis (default: 24)
  durationInSeconds?: number;       // Effect duration (default: 1.5)
  startDelayFrames?: number;        // Frames before effect starts (default: 8)
  emojiSize?: number;               // Base size in px (default: 48)
  burstX?: number;                  // Firework origin X 0-1 (default: 0.5)
  burstY?: number;                  // Firework origin Y 0-1 (default: 0.5)
}

export interface FrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: TextEffect;
    startFrame?: number;
  };
}

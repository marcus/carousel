import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  continueRender,
  delayRender,
} from "remotion";
import { SpotlightBackground } from "./SpotlightBackground";
import type { ImageData, SpotlightPreset, PresentationMode } from "./types";
import { VIDEO_CONFIG } from "./types";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const hashString = (s: string) =>
  s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

// Card dimensions scaled down for multi-card layouts
const BORDER_SIDE = 20;
const BORDER_BOTTOM = 70;

interface CardPlacement {
  image: ImageData;
  photoWidth: number;
  photoHeight: number;
  cardWidth: number;
  cardHeight: number;
  posX: number;
  posY: number;
  tilt: number;
  entranceDelay: number;
  entranceMode: PresentationMode;
  zIndex: number;
}

// Entrance directions to cycle through for visual variety
const ENTRANCE_MODES: PresentationMode[] = [
  "polaroid-slide-left",
  "polaroid-slide-right",
  "polaroid-toss",
  "polaroid-slide-up",
  "polaroid-classic",
];

interface MultiCardSlideProps {
  images: ImageData[];
  backgroundPreset: SpotlightPreset;
}

// Generate placements for N cards with clear separation
const generatePlacements = (
  images: ImageData[],
  seed: number
): CardPlacement[] => {
  const count = images.length;
  const centerX = VIDEO_CONFIG.width / 2;
  const centerY = VIDEO_CONFIG.height * 0.45;

  // Scale cards down based on count so they fit side-by-side
  const scaleFactor = count <= 2 ? 0.62 : count <= 3 ? 0.50 : 0.42;

  // Base photo dimensions
  const baseLandscapeW = 960;
  const baseLandscapeH = 640;
  const basePortraitW = 680;
  const basePortraitH = 907;

  // Pre-defined layout positions for different card counts.
  // Each position is [xOffset, yOffset] relative to center.
  // Cards are spread far enough apart that they only slightly overlap edges.
  const LAYOUTS: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-180, 60], [180, -60]],
    3: [[-220, 120], [0, -80], [220, 100]],
    4: [[-240, -100], [100, -180], [-100, 160], [240, 80]],
    5: [[-260, -120], [120, -200], [260, 0], [-120, 180], [0, 60]],
  };

  const layout = LAYOUTS[Math.min(count, 5)] ?? LAYOUTS[3]!;

  return images.map((image, i) => {
    const s = seed + i * 97;
    const isPortrait = image.isPortrait || image.height > image.width;
    const pw = (isPortrait ? basePortraitW : baseLandscapeW) * scaleFactor;
    const ph = (isPortrait ? basePortraitH : baseLandscapeH) * scaleFactor;
    const cw = pw + BORDER_SIDE * 2 * scaleFactor;
    const ch = ph + (BORDER_SIDE + BORDER_BOTTOM) * scaleFactor;

    // Use pre-defined layout position + small jitter
    const [baseOffsetX, baseOffsetY] = layout[i % layout.length]!;
    const jitterX = (seededRandom(s) - 0.5) * 40;
    const jitterY = (seededRandom(s + 1) - 0.5) * 40;
    const posX = centerX + baseOffsetX + jitterX;
    const posY = centerY + baseOffsetY + jitterY;

    // Tilt: alternate directions, varying magnitude
    const tiltBase = [(-6), 4, (-3), 7, (-5)];
    const tilt = tiltBase[i % tiltBase.length]!;

    // Stagger entrance by 10 frames per card for clearer sequence
    const entranceDelay = i * 10;

    // Cycle through entrance modes
    const entranceMode = ENTRANCE_MODES[i % ENTRANCE_MODES.length]!;

    return {
      image,
      photoWidth: pw,
      photoHeight: ph,
      cardWidth: cw,
      cardHeight: ch,
      posX,
      posY,
      tilt,
      entranceDelay,
      entranceMode,
      zIndex: i + 1,
    };
  });
};

export const MultiCardSlide: React.FC<MultiCardSlideProps> = ({
  images,
  backgroundPreset,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const seed = images.reduce((acc, img) => acc + hashString(img.src), 0);

  // Delay render until all images are loaded
  const [handle] = useState(() => delayRender());
  const [loadedCount, setLoadedCount] = useState(0);
  const [imageDims, setImageDims] = useState<
    Record<string, { width: number; height: number }>
  >({});

  useEffect(() => {
    let mounted = true;
    let loaded = 0;
    const dims: Record<string, { width: number; height: number }> = {};

    images.forEach((imageData) => {
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        dims[imageData.src] = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        loaded++;
        if (loaded === images.length) {
          setImageDims({ ...dims });
          setLoadedCount(loaded);
          continueRender(handle);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        dims[imageData.src] = { width: 1920, height: 1080 };
        loaded++;
        if (loaded === images.length) {
          setImageDims({ ...dims });
          setLoadedCount(loaded);
          continueRender(handle);
        }
      };
      img.src = staticFile(imageData.src);
    });

    return () => {
      mounted = false;
    };
  }, [images, handle]);

  if (loadedCount < images.length) {
    return <AbsoluteFill style={{ backgroundColor: "#000" }} />;
  }

  // Enrich images with actual dimensions for placement calculation
  const enrichedImages = images.map((img) => ({
    ...img,
    width: imageDims[img.src]?.width ?? 1920,
    height: imageDims[img.src]?.height ?? 1080,
    isPortrait: (imageDims[img.src]?.height ?? 1080) > (imageDims[img.src]?.width ?? 1920),
  }));

  const placements = generatePlacements(enrichedImages, seed);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <SpotlightBackground preset={backgroundPreset} seed={seed} />
      {placements.map((placement, i) => {
        const effectiveFrame = Math.max(0, frame - placement.entranceDelay);
        const scaleFactor =
          images.length <= 2 ? 0.62 : images.length <= 3 ? 0.50 : 0.42;
        const borderSideScaled = BORDER_SIDE * scaleFactor;

        // Entrance animation
        let offsetX = 0;
        let offsetY = 0;
        let cardOpacity = 1;
        let rotation = placement.tilt;

        // Exit fade
        const exitOpacity = interpolate(
          frame,
          [durationInFrames - 12, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Smooth entrance animations — 25 frames (~0.83s) with gentle easing
        const SLIDE_FRAMES = 25;
        const FADE_IN_FRAMES = 12;

        if (effectiveFrame <= 0) {
          cardOpacity = 0;
        } else if (placement.entranceMode === "polaroid-slide-left") {
          const p = interpolate(effectiveFrame, [0, SLIDE_FRAMES], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          offsetX = interpolate(p, [0, 1], [-VIDEO_CONFIG.width * 0.7, 0]);
          cardOpacity =
            interpolate(effectiveFrame, [0, FADE_IN_FRAMES], [0, 1], {
              extrapolateRight: "clamp",
            }) * exitOpacity;
        } else if (placement.entranceMode === "polaroid-slide-right") {
          const p = interpolate(effectiveFrame, [0, SLIDE_FRAMES], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          offsetX = interpolate(p, [0, 1], [VIDEO_CONFIG.width * 0.7, 0]);
          cardOpacity =
            interpolate(effectiveFrame, [0, FADE_IN_FRAMES], [0, 1], {
              extrapolateRight: "clamp",
            }) * exitOpacity;
        } else if (placement.entranceMode === "polaroid-toss") {
          const p = interpolate(effectiveFrame, [0, SLIDE_FRAMES], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.bezier(0.25, 1.0, 0.5, 1)),
          });
          offsetX = interpolate(p, [0, 1], [250, 0]);
          offsetY = interpolate(p, [0, 1], [500, 0]);
          rotation = interpolate(p, [0, 1], [15, placement.tilt]);
          cardOpacity =
            interpolate(effectiveFrame, [0, FADE_IN_FRAMES], [0, 1], {
              extrapolateRight: "clamp",
            }) * exitOpacity;
        } else if (placement.entranceMode === "polaroid-slide-up") {
          const p = interpolate(effectiveFrame, [0, SLIDE_FRAMES], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          offsetY = interpolate(p, [0, 1], [VIDEO_CONFIG.height * 0.5, 0]);
          cardOpacity =
            interpolate(effectiveFrame, [0, FADE_IN_FRAMES], [0, 1], {
              extrapolateRight: "clamp",
            }) * exitOpacity;
        } else {
          // polaroid-classic — gentle fade+scale
          const entranceOpacity = interpolate(effectiveFrame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          cardOpacity = entranceOpacity * exitOpacity;
        }

        // Subtle inner zoom
        const innerScale = interpolate(
          effectiveFrame,
          [0, durationInFrames - placement.entranceDelay],
          [1.0, 1.06],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={placement.image.src}
            style={{
              position: "absolute",
              left: placement.posX,
              top: placement.posY,
              width: placement.cardWidth,
              height: placement.cardHeight,
              backgroundColor: "#fff",
              borderRadius: 4 * scaleFactor,
              boxShadow: `0 ${12 * scaleFactor}px ${30 * scaleFactor}px rgba(0,0,0,0.45), 0 ${4 * scaleFactor}px ${12 * scaleFactor}px rgba(0,0,0,0.25)`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
              transformOrigin: "center center",
              opacity: cardOpacity,
              overflow: "hidden",
              zIndex: placement.zIndex,
            }}
          >
            <div
              style={{
                margin: `${borderSideScaled}px ${borderSideScaled}px 0 ${borderSideScaled}px`,
                width: placement.photoWidth,
                height: placement.photoHeight,
                overflow: "hidden",
              }}
            >
              <Img
                src={staticFile(placement.image.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${innerScale})`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

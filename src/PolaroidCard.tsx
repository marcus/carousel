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
import { TextOverlay } from "./TextOverlay";
import type { PolaroidCardProps } from "./types";
import { VIDEO_CONFIG } from "./types";

// Landscape card: wide photo area
const LANDSCAPE_PHOTO_WIDTH = 960;
const LANDSCAPE_PHOTO_HEIGHT = 640;

// Portrait card: tall photo area fitting within viewport
const PORTRAIT_PHOTO_WIDTH = 680;
const PORTRAIT_PHOTO_HEIGHT = 907;

const BORDER_SIDE = 28;
const BORDER_BOTTOM = 90;

const hashString = (s: string) =>
  s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

interface CardLayout {
  photoWidth: number;
  photoHeight: number;
  cardWidth: number;
  cardHeight: number;
}

const getCardLayout = (isPortrait: boolean, scaleFactor = 1): CardLayout => {
  const pw = isPortrait ? PORTRAIT_PHOTO_WIDTH : LANDSCAPE_PHOTO_WIDTH;
  const ph = isPortrait ? PORTRAIT_PHOTO_HEIGHT : LANDSCAPE_PHOTO_HEIGHT;
  return {
    photoWidth: pw * scaleFactor,
    photoHeight: ph * scaleFactor,
    cardWidth: (pw + BORDER_SIDE * 2) * scaleFactor,
    cardHeight: (ph + BORDER_SIDE + BORDER_BOTTOM) * scaleFactor,
  };
};

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  image,
  config,
  textOverlay,
  showBackground = true,
  scaleFactor = 1,
  positionX,
  positionY,
  entranceDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender());
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      continueRender(handle);
    };
    img.onerror = () => {
      setDimensions({ width: 1920, height: 1080 });
      continueRender(handle);
    };
    img.src = staticFile(image.src);
  }, [image.src, handle]);

  if (!dimensions) {
    return showBackground ? (
      <AbsoluteFill style={{ backgroundColor: "#000" }} />
    ) : null;
  }

  const isPortrait = dimensions.height > dimensions.width;
  const layout = getCardLayout(isPortrait, scaleFactor);
  const seed = hashString(image.src);
  const cardScaleConfig = config.cardScale ?? 1;
  const { presentationMode, tiltDegrees, innerMotion = "slow-zoom" } = config;

  // Delayed frame for staggered entrances in multi-card mode
  const effectiveFrame = Math.max(0, frame - entranceDelay);
  const effectiveDuration = durationInFrames - entranceDelay;

  // Inner photo motion
  let innerScale = 1;
  let innerTranslateX = 0;
  if (innerMotion === "slow-zoom") {
    innerScale = interpolate(
      effectiveFrame,
      [0, effectiveDuration],
      [1.0, 1.08],
      { extrapolateRight: "clamp" }
    );
  } else if (innerMotion === "slow-drift") {
    innerTranslateX = interpolate(
      effectiveFrame,
      [0, effectiveDuration],
      [-10, 10],
      { extrapolateRight: "clamp" }
    );
  }

  // Exit fade (last 12 frames of total duration, not effective)
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Variant-specific animation
  let cardOpacity = 1;
  let cardScale = cardScaleConfig;
  let rotation = tiltDegrees;
  let offsetX = 0;
  let offsetY = 0;

  // Smooth entrance animations — longer durations, gentler easing
  const ENTRANCE_FRAMES = 22;
  const FADE_FRAMES = 14;

  // Before entrance delay, card is invisible
  if (effectiveFrame <= 0 && entranceDelay > 0) {
    cardOpacity = 0;
  } else if (presentationMode === "polaroid-classic") {
    const entranceOpacity = interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    const entranceScale = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0.92, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    cardOpacity = entranceOpacity * exitOpacity;
    cardScale = cardScaleConfig * entranceScale;
  } else if (presentationMode === "polaroid-float") {
    const entranceOpacity = interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    const entranceScale = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0.92, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    cardOpacity = entranceOpacity * exitOpacity;
    cardScale = cardScaleConfig * entranceScale;
    const swayAngle = Math.sin(effectiveFrame * 0.03) * 2;
    const swayY = Math.sin(effectiveFrame * 0.02) * 8;
    rotation = tiltDegrees + swayAngle;
    offsetY += swayY;
  } else if (presentationMode === "polaroid-toss") {
    const tossProgress = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.bezier(0.25, 1.0, 0.5, 1)),
    });
    const tossX = interpolate(tossProgress, [0, 1], [300, 0]);
    const tossY = interpolate(tossProgress, [0, 1], [600, 0]);
    const tossRotation = interpolate(tossProgress, [0, 1], [15, tiltDegrees]);
    const tossOpacity = interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
    });
    offsetX += tossX;
    offsetY += tossY;
    rotation = tossRotation;
    cardOpacity = tossOpacity * exitOpacity;
  } else if (presentationMode === "polaroid-slide-left") {
    const slideProgress = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    offsetX += interpolate(slideProgress, [0, 1], [-VIDEO_CONFIG.width, 0]);
    cardOpacity =
      interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
        extrapolateRight: "clamp",
      }) * exitOpacity;
  } else if (presentationMode === "polaroid-slide-right") {
    const slideProgress = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    offsetX += interpolate(slideProgress, [0, 1], [VIDEO_CONFIG.width, 0]);
    cardOpacity =
      interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
        extrapolateRight: "clamp",
      }) * exitOpacity;
  } else if (presentationMode === "polaroid-slide-up") {
    const slideProgress = interpolate(effectiveFrame, [0, ENTRANCE_FRAMES], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    offsetY += interpolate(slideProgress, [0, 1], [VIDEO_CONFIG.height, 0]);
    cardOpacity =
      interpolate(effectiveFrame, [0, FADE_FRAMES], [0, 1], {
        extrapolateRight: "clamp",
      }) * exitOpacity;
  } else {
    cardOpacity = exitOpacity;
  }

  const centerX = positionX ?? VIDEO_CONFIG.width / 2;
  const centerY = positionY ?? VIDEO_CONFIG.height * 0.45;

  const borderSideScaled = BORDER_SIDE * scaleFactor;
  const borderBottomScaled = BORDER_BOTTOM * scaleFactor;

  const cardContent = (
    <div
      style={{
        position: "absolute",
        left: centerX,
        top: centerY,
        width: layout.cardWidth,
        height: layout.cardHeight,
        backgroundColor: "#fff",
        borderRadius: 4 * scaleFactor,
        boxShadow: `0 ${15 * scaleFactor}px ${40 * scaleFactor}px rgba(0,0,0,0.4), 0 ${5 * scaleFactor}px ${15 * scaleFactor}px rgba(0,0,0,0.2)`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${cardScale}) translate(${offsetX}px, ${offsetY}px)`,
        transformOrigin: "center center",
        opacity: cardOpacity,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          margin: `${borderSideScaled}px ${borderSideScaled}px 0 ${borderSideScaled}px`,
          width: layout.photoWidth,
          height: layout.photoHeight,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${innerScale}) translateX(${innerTranslateX}px)`,
            transformOrigin: "center center",
          }}
        />
      </div>
    </div>
  );

  if (!showBackground) {
    return cardContent;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <SpotlightBackground preset={config.backgroundPreset} seed={seed} />
      {cardContent}
      {textOverlay && (
        <TextOverlay
          text={textOverlay.text}
          colorSchemeIndex={textOverlay.colorSchemeIndex}
          textEffect={textOverlay.textEffect}
          startFrame={textOverlay.startFrame}
        />
      )}
    </AbsoluteFill>
  );
};

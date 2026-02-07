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
import { TextOverlay } from "../TextOverlay";
import type { ImageData } from "../types";
import { VIDEO_CONFIG } from "../types";

interface PolaroidTapeFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

const BORDER_SIDE = 28;
const BORDER_BOTTOM = 90;

const LANDSCAPE_PHOTO_WIDTH = 920;
const LANDSCAPE_PHOTO_HEIGHT = 613;
const PORTRAIT_PHOTO_WIDTH = 700;
const PORTRAIT_PHOTO_HEIGHT = 933;

const CORK_BACKGROUND: React.CSSProperties = {
  background: `
    radial-gradient(ellipse at 20% 30%, #c4a265 0%, transparent 50%),
    radial-gradient(ellipse at 75% 15%, #d4b87a 0%, transparent 45%),
    radial-gradient(ellipse at 50% 70%, #b8956a 0%, transparent 55%),
    radial-gradient(ellipse at 10% 85%, #d4b87a 0%, transparent 40%),
    radial-gradient(ellipse at 90% 60%, #c4a265 0%, transparent 50%),
    radial-gradient(ellipse at 40% 10%, #b8956a 0%, transparent 35%),
    radial-gradient(ellipse at 65% 90%, #c4a265 0%, transparent 45%),
    radial-gradient(ellipse at 30% 50%, #d4b87a 0%, transparent 40%),
    radial-gradient(circle at 85% 25%, #b8956a 0%, transparent 30%),
    radial-gradient(circle at 15% 60%, #c4a265 0%, transparent 25%),
    linear-gradient(135deg, #c19a5b 0%, #b8956a 25%, #c4a265 50%, #d4b87a 75%, #c19a5b 100%)
  `,
};

export const PolaroidTapeFrame: React.FC<PolaroidTapeFrameProps> = ({
  image,
  textOverlay,
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
    return <AbsoluteFill style={{ backgroundColor: "#000" }} />;
  }

  const isPortrait = dimensions.height > dimensions.width;
  const photoWidth = isPortrait ? PORTRAIT_PHOTO_WIDTH : LANDSCAPE_PHOTO_WIDTH;
  const photoHeight = isPortrait ? PORTRAIT_PHOTO_HEIGHT : LANDSCAPE_PHOTO_HEIGHT;
  const cardWidth = photoWidth + BORDER_SIDE * 2;
  const cardHeight = photoHeight + BORDER_SIDE + BORDER_BOTTOM;

  // Entrance animation: fade + scale over first 20 frames
  const entranceOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const entranceScale = interpolate(frame, [0, 20], [0.9, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Gentle sway: rotation oscillates +/-1.5 degrees
  const swayRotation = Math.sin(frame * 0.02) * 1.5;

  // Base tilt for casual pinned feel
  const baseTilt = 2.5;
  const totalRotation = baseTilt + swayRotation;

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cardOpacity = entranceOpacity * exitOpacity;
  const cardScale = entranceScale;

  return (
    <AbsoluteFill style={CORK_BACKGROUND}>
      {/* Polaroid card */}
      <div
        style={{
          position: "absolute",
          left: VIDEO_CONFIG.width / 2,
          top: VIDEO_CONFIG.height * 0.45,
          width: cardWidth,
          height: cardHeight,
          backgroundColor: "#fff",
          borderRadius: 4,
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          transform: `translate(-50%, -50%) rotate(${totalRotation}deg) scale(${cardScale})`,
          transformOrigin: "center center",
          opacity: cardOpacity,
          overflow: "visible",
        }}
      >
        {/* Photo area */}
        <div
          style={{
            margin: `${BORDER_SIDE}px ${BORDER_SIDE}px 0 ${BORDER_SIDE}px`,
            width: photoWidth,
            height: photoHeight,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(image.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Push pin at top center */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #e8e8e8 0%, #b0b0b0 40%, #787878 80%, #555 100%)",
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.6)",
            zIndex: 10,
          }}
        />

        {/* Washi tape - top right corner */}
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -30,
            width: 180,
            height: 40,
            transform: "rotate(-35deg)",
            background: `repeating-linear-gradient(
              45deg,
              rgba(255, 150, 200, 0.7) 0px,
              rgba(255, 150, 200, 0.7) 8px,
              rgba(255, 180, 220, 0.5) 8px,
              rgba(255, 180, 220, 0.5) 16px
            )`,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.1)",
            clipPath:
              "polygon(2% 0%, 98% 2%, 100% 45%, 97% 100%, 3% 98%, 0% 50%)",
            zIndex: 5,
          }}
        />

        {/* Washi tape - bottom left corner (mint green) */}
        <div
          style={{
            position: "absolute",
            bottom: -5,
            left: -25,
            width: 140,
            height: 34,
            transform: "rotate(30deg)",
            background: `repeating-linear-gradient(
              -45deg,
              rgba(130, 220, 190, 0.7) 0px,
              rgba(130, 220, 190, 0.7) 6px,
              rgba(160, 235, 210, 0.5) 6px,
              rgba(160, 235, 210, 0.5) 12px
            )`,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.1)",
            clipPath:
              "polygon(1% 3%, 99% 0%, 100% 52%, 98% 100%, 2% 97%, 0% 48%)",
            zIndex: 5,
          }}
        />
      </div>

      {/* Text overlay */}
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

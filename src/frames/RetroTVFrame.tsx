import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  continueRender,
  delayRender,
} from "remotion";
import { TextOverlay } from "../TextOverlay";
import type { ImageData } from "../types";
import { VIDEO_CONFIG } from "../types";

interface RetroTVFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

// Screen dimensions based on orientation
const LANDSCAPE_SCREEN = { width: 950, height: 710 };
const PORTRAIT_SCREEN = { width: 750, height: 1000 };

const BEZEL_THICKNESS = 45;
const KNOB_SIZE = 30;
const SCREEN_RADIUS = 20;

export const RetroTVFrame: React.FC<RetroTVFrameProps> = ({
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
    return <AbsoluteFill style={{ backgroundColor: "#3a2a1a" }} />;
  }

  const isPortrait = dimensions.height > dimensions.width;
  const screen = isPortrait ? PORTRAIT_SCREEN : LANDSCAPE_SCREEN;

  // Extra width on right side for knobs
  const knobAreaWidth = 60;
  const tvWidth = screen.width + BEZEL_THICKNESS * 2 + knobAreaWidth;
  const tvHeight = screen.height + BEZEL_THICKNESS * 2;

  // LED blink: sine oscillation between 0.4 and 1.0
  const ledOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.4, 1.0],
  );

  // Screen flicker: subtle opacity oscillation
  const screenFlicker = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.97, 1.0],
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #4a3828 0%, #3a2a1a 50%, #2a1a0a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* TV Unit */}
      <div
        style={{
          position: "relative",
          width: tvWidth,
          height: tvHeight,
          // Bezel gradient: warm gray/beige
          background:
            "linear-gradient(145deg, #b8a88a 0%, #a89878 30%, #8a7a6a 100%)",
          borderRadius: 18,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Inner bezel shadow / recess */}
        <div
          style={{
            position: "absolute",
            left: BEZEL_THICKNESS - 4,
            top: BEZEL_THICKNESS - 4,
            width: screen.width + 8,
            height: screen.height + 8,
            borderRadius: SCREEN_RADIUS + 4,
            background: "#1a1a1a",
            boxShadow:
              "inset 0 2px 8px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,0.5)",
          }}
        />

        {/* Screen area */}
        <div
          style={{
            position: "absolute",
            left: BEZEL_THICKNESS,
            top: BEZEL_THICKNESS,
            width: screen.width,
            height: screen.height,
            borderRadius: SCREEN_RADIUS,
            overflow: "hidden",
            opacity: screenFlicker,
          }}
        >
          {/* Photo */}
          <Img
            src={staticFile(image.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* CRT green/blue tint */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 255, 100, 0.03)",
              pointerEvents: "none",
            }}
          />

          {/* Scan lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)",
              pointerEvents: "none",
            }}
          />

          {/* Screen glare: diagonal highlight top-left */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 30%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Power LED */}
        <div
          style={{
            position: "absolute",
            right: knobAreaWidth / 2 - 4,
            bottom: BEZEL_THICKNESS / 2 - 4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#ff3333",
            opacity: ledOpacity,
            boxShadow:
              "0 0 6px 2px rgba(255, 51, 51, 0.5), 0 0 12px 4px rgba(255, 51, 51, 0.2)",
          }}
        />

        {/* Knob 1 (top) */}
        <div
          style={{
            position: "absolute",
            right: knobAreaWidth / 2 - KNOB_SIZE / 2,
            top: BEZEL_THICKNESS + screen.height * 0.25 - KNOB_SIZE / 2,
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #a09080 0%, #706050 60%, #504030 100%)",
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        >
          {/* Knob indicator line */}
          <div
            style={{
              position: "absolute",
              top: 4,
              left: "50%",
              width: 2,
              height: KNOB_SIZE / 2 - 4,
              backgroundColor: "rgba(0,0,0,0.3)",
              transform: "translateX(-50%)",
              borderRadius: 1,
            }}
          />
        </div>

        {/* Knob 2 (bottom) */}
        <div
          style={{
            position: "absolute",
            right: knobAreaWidth / 2 - KNOB_SIZE / 2,
            top: BEZEL_THICKNESS + screen.height * 0.65 - KNOB_SIZE / 2,
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #a09080 0%, #706050 60%, #504030 100%)",
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        >
          {/* Knob indicator line */}
          <div
            style={{
              position: "absolute",
              top: 4,
              left: "50%",
              width: 2,
              height: KNOB_SIZE / 2 - 4,
              backgroundColor: "rgba(0,0,0,0.3)",
              transform: "translateX(-50%)",
              borderRadius: 1,
            }}
          />
        </div>
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

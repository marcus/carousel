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

interface FilmStripFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

const SPROCKET_AREA_SIZE = 50;
const SPROCKET_GAP = 8;
const SPROCKET_HOLE_WIDTH = 28;
const SPROCKET_HOLE_HEIGHT = 18;
const SPROCKET_HOLE_RADIUS = 4;
const LANDSCAPE_SPROCKET_COUNT = 20;
const PORTRAIT_SPROCKET_COUNT = 30;
const BG_COLOR = "#1a1a1a";
const FILM_BASE_COLOR = "#111";

export const FilmStripFrame: React.FC<FilmStripFrameProps> = ({
  image,
  textOverlay,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const [handle] = useState(() => delayRender());
  const [imgDims, setImgDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgDims({ width: img.width, height: img.height });
      continueRender(handle);
    };
    img.onerror = () => {
      setImgDims({ width: image.width, height: image.height });
      continueRender(handle);
    };
    img.src = image.src.startsWith("http")
      ? image.src
      : staticFile(image.src);
  }, [image.src, handle, image.width, image.height]);

  const isPortrait = imgDims ? imgDims.height > imgDims.width : image.isPortrait;
  // Portrait: vertical strip, sprockets on left+right
  // Landscape: horizontal strip, sprockets on top+bottom
  const stripWidth = 1000;
  const stripHeight = isPortrait ? 1500 : 780;

  const photoAreaWidth = isPortrait
    ? stripWidth - SPROCKET_AREA_SIZE * 2 - SPROCKET_GAP * 2
    : stripWidth;
  const photoAreaHeight = isPortrait
    ? stripHeight
    : stripHeight - SPROCKET_AREA_SIZE * 2 - SPROCKET_GAP * 2;

  // Slide in from right
  const slideX = interpolate(frame, [0, 20], [400, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  // Subtle gate weave jitter
  const jitterY = Math.sin(frame * 1.7) * 1;

  // Grain position shift
  const grainOffsetX = (frame * 7) % 200;
  const grainOffsetY = (frame * 11) % 200;

  // Horizontal sprocket row (for landscape: top/bottom)
  const renderSprocketRow = () => {
    const count = LANDSCAPE_SPROCKET_COUNT;
    const holes = [];
    const totalGap =
      (stripWidth - count * SPROCKET_HOLE_WIDTH) / (count + 1);
    for (let i = 0; i < count; i++) {
      const x = totalGap + i * (SPROCKET_HOLE_WIDTH + totalGap);
      holes.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: (SPROCKET_AREA_SIZE - SPROCKET_HOLE_HEIGHT) / 2,
            width: SPROCKET_HOLE_WIDTH,
            height: SPROCKET_HOLE_HEIGHT,
            borderRadius: SPROCKET_HOLE_RADIUS,
            backgroundColor: BG_COLOR,
          }}
        />
      );
    }
    return (
      <div
        style={{
          position: "relative",
          width: stripWidth,
          height: SPROCKET_AREA_SIZE,
        }}
      >
        {holes}
      </div>
    );
  };

  // Vertical sprocket column (for portrait: left/right)
  const renderSprocketColumn = () => {
    const count = PORTRAIT_SPROCKET_COUNT;
    const holes = [];
    const totalGap =
      (stripHeight - count * SPROCKET_HOLE_WIDTH) / (count + 1);
    for (let i = 0; i < count; i++) {
      // Rotate hole dimensions: width↔height swapped for vertical layout
      const y = totalGap + i * (SPROCKET_HOLE_WIDTH + totalGap);
      holes.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: (SPROCKET_AREA_SIZE - SPROCKET_HOLE_HEIGHT) / 2,
            top: y,
            width: SPROCKET_HOLE_HEIGHT,
            height: SPROCKET_HOLE_WIDTH,
            borderRadius: SPROCKET_HOLE_RADIUS,
            backgroundColor: BG_COLOR,
          }}
        />
      );
    }
    return (
      <div
        style={{
          position: "relative",
          width: SPROCKET_AREA_SIZE,
          height: stripHeight,
          flexShrink: 0,
        }}
      >
        {holes}
      </div>
    );
  };

  const imgSrc = image.src.startsWith("http")
    ? image.src
    : staticFile(image.src);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: stripWidth,
          height: stripHeight,
          backgroundColor: FILM_BASE_COLOR,
          borderRadius: 2,
          display: "flex",
          flexDirection: isPortrait ? "row" : "column",
          alignItems: "center",
          position: "relative",
          transform: `translateX(${slideX}px) translateY(${jitterY}px)`,
        }}
      >
        {/* Top sprocket row (landscape) / Left sprocket column (portrait) */}
        {isPortrait ? renderSprocketColumn() : renderSprocketRow()}

        {/* Frame number label */}
        <div
          style={{
            position: "absolute",
            top: isPortrait ? 12 : SPROCKET_AREA_SIZE + 2,
            left: isPortrait ? SPROCKET_AREA_SIZE + 2 : 12,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 10,
            color: "#ff8c00",
            opacity: 0.6,
            letterSpacing: 1,
            zIndex: 2,
          }}
        >
          24A
        </div>

        {/* Gap between sprockets and photo */}
        {isPortrait ? (
          <div style={{ width: SPROCKET_GAP, height: "100%" }} />
        ) : (
          <div style={{ height: SPROCKET_GAP, width: "100%" }} />
        )}

        {/* Photo exposure area */}
        <div
          style={{
            width: photoAreaWidth,
            height: photoAreaHeight,
            position: "relative",
            border: "1px solid #fff",
            boxSizing: "border-box",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Img
            src={imgSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Film grain overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage: `
                repeating-radial-gradient(circle at 17% 23%, #fff 0px, transparent 1px),
                repeating-radial-gradient(circle at 53% 67%, #fff 0px, transparent 1px),
                repeating-radial-gradient(circle at 81% 12%, #fff 0px, transparent 1px),
                repeating-radial-gradient(circle at 37% 89%, #fff 0px, transparent 1px),
                repeating-radial-gradient(circle at 64% 41%, #000 0px, transparent 1px),
                repeating-radial-gradient(circle at 9% 55%, #000 0px, transparent 1px)
              `,
              backgroundSize: "4px 4px, 5px 5px, 3px 3px, 6px 6px, 4px 4px, 5px 5px",
              backgroundPosition: `${grainOffsetX}px ${grainOffsetY}px`,
              pointerEvents: "none",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Gap between photo and sprockets */}
        {isPortrait ? (
          <div style={{ width: SPROCKET_GAP, height: "100%" }} />
        ) : (
          <div style={{ height: SPROCKET_GAP, width: "100%" }} />
        )}

        {/* Bottom sprocket row (landscape) / Right sprocket column (portrait) */}
        {isPortrait ? renderSprocketColumn() : renderSprocketRow()}

        {/* Kodak film stock label */}
        <div
          style={{
            position: "absolute",
            bottom: isPortrait ? 12 : (SPROCKET_AREA_SIZE - 10) / 2,
            right: isPortrait ? SPROCKET_AREA_SIZE + 2 : 16,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 9,
            color: "#ff8c00",
            opacity: 0.6,
            letterSpacing: 2,
            zIndex: 2,
          }}
        >
          KODAK 400TX
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

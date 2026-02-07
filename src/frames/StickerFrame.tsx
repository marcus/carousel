import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
  continueRender,
  delayRender,
} from "remotion";
import { TextOverlay } from "../TextOverlay";
import type { ImageData } from "../types";
import { VIDEO_CONFIG } from "../types";

interface StickerFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

const hashString = (s: string) =>
  s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

const BLOB_CLIP_PATH = `polygon(
  2% 8%, 8% 2%, 18% 4%, 30% 1%, 42% 3%, 55% 0%, 68% 2%, 78% 1%, 88% 3%, 95% 8%,
  98% 20%, 100% 35%, 99% 50%, 100% 65%, 98% 80%, 96% 92%,
  90% 97%, 78% 99%, 65% 98%, 50% 100%, 35% 99%, 22% 97%, 10% 98%, 3% 93%,
  0% 80%, 1% 65%, 0% 50%, 1% 35%, 0% 20%
)`;

// Slightly inset version of the blob for the inner photo
const BLOB_CLIP_PATH_INNER = `polygon(
  4% 10%, 10% 4%, 19% 6%, 31% 3%, 43% 5%, 55% 2%, 68% 4%, 78% 3%, 87% 5%, 93% 10%,
  96% 22%, 98% 36%, 97% 50%, 98% 64%, 96% 78%, 94% 90%,
  88% 95%, 77% 97%, 65% 96%, 50% 98%, 35% 97%, 23% 95%, 12% 96%, 5% 91%,
  2% 78%, 3% 64%, 2% 50%, 3% 36%, 2% 22%
)`;

const GRADIENTS = [
  { from: "#ffd6e0", to: "#e8d5f5" }, // pink to lavender
  { from: "#d5f5e3", to: "#d5e8f5" }, // mint to sky blue
  { from: "#ffd9b3", to: "#fff5cc" }, // peach to yellow
];

const DOT_COLORS = [
  "#ffb3c6", "#b3e0ff", "#c6ffb3", "#ffe0b3", "#d9b3ff",
  "#b3fff0", "#ffb3e6", "#fff3b3",
];

const BORDER_SIZE = 25;

export const StickerFrame: React.FC<StickerFrameProps> = ({
  image,
  textOverlay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender());
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      continueRender(handle);
    };
    img.onerror = () => {
      setImgDims({ w: image.width, h: image.height });
      continueRender(handle);
    };
    img.src = staticFile(image.src);
  }, [image.src, handle, image.width, image.height]);

  const hash = hashString(image.src);
  const gradientIndex = hash % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex] ?? GRADIENTS[0]!;
  const baseRotation = ((hash % 11) - 5); // -5 to 5 degrees

  // Photo area dimensions (detect from actual loaded dimensions)
  const isPortrait = imgDims ? imgDims.h > imgDims.w : image.isPortrait;
  const photoWidth = isPortrait ? 750 : 940;
  const photoHeight = isPortrait ? 1000 : 627;

  // Outer container (white border) dimensions
  const outerWidth = photoWidth + BORDER_SIZE * 2;
  const outerHeight = photoHeight + BORDER_SIZE * 2;

  // Animation: bouncy scale entrance over 20 frames
  const scaleSpring = spring({
    frame,
    fps,
    config: {
      damping: 8,
      stiffness: 120,
      mass: 0.6,
    },
    durationInFrames: 20,
  });

  const entranceScale = interpolate(scaleSpring, [0, 1], [0, 1]);

  // Rotation wobble: sine oscillation +/- 2 degrees
  const wobble = Math.sin(frame * 0.04) * 2;
  const totalRotation = baseRotation + wobble;

  // Decorative dots configuration
  const dots = [
    { x: 60, y: 200, size: 18, colorIdx: 0, delay: 10 },
    { x: 980, y: 350, size: 16, colorIdx: 1, delay: 15 },
    { x: 100, y: 1650, size: 20, colorIdx: 2, delay: 20 },
    { x: 950, y: 1550, size: 14, colorIdx: 3, delay: 25 },
    { x: 520, y: 150, size: 22, colorIdx: 4, delay: 30 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Decorative dots */}
      {dots.map((dot, i) => {
        const dotOpacity = interpolate(
          frame,
          [dot.delay, dot.delay + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              backgroundColor: DOT_COLORS[(dot.colorIdx + hash) % DOT_COLORS.length],
              opacity: dotOpacity,
            }}
          />
        );
      })}

      {/* Sticker container */}
      <div
        style={{
          transform: `scale(${entranceScale}) rotate(${totalRotation}deg)`,
          filter: `drop-shadow(4px 4px 0px rgba(0,0,0,0.1)) drop-shadow(8px 8px 20px rgba(0,0,0,0.15))`,
        }}
      >
        {/* White border blob */}
        <div
          style={{
            width: outerWidth,
            height: outerHeight,
            backgroundColor: "white",
            clipPath: BLOB_CLIP_PATH,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Photo inside blob */}
          <div
            style={{
              width: photoWidth,
              height: photoHeight,
              clipPath: BLOB_CLIP_PATH_INNER,
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

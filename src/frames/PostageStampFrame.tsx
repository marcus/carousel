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

interface PostageStampFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

export const PostageStampFrame: React.FC<PostageStampFrameProps> = ({
  image,
  textOverlay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [handle] = useState(() => delayRender());
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
    isPortrait: boolean;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height,
        isPortrait: img.height > img.width,
      });
      continueRender(handle);
    };
    img.onerror = () => {
      setImageDimensions({
        width: image.width,
        height: image.height,
        isPortrait: image.isPortrait,
      });
      continueRender(handle);
    };
    img.src = staticFile(image.src);
  }, [handle, image.src, image.width, image.height, image.isPortrait]);

  const isPortrait = imageDimensions?.isPortrait ?? image.isPortrait;

  // Stamp dimensions
  const stampWidth = isPortrait ? 800 : 980;
  const stampHeight = isPortrait ? 1100 : 700;

  // Entrance animation (25 frames)
  const translateY = interpolate(frame, [0, 25], [-200, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.bounce),
  });

  const rotation = interpolate(frame, [0, 25], [5, 1.5], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.bounce),
  });

  // Subtle breathing scale
  const breathingScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.8),
    [-1, 1],
    [0.99, 1.01]
  );

  // Perforation config
  const perfRadius = 6;
  const perfSpacing = 20;
  const bgColor = "#f5f0e8";

  // Build perforation radial-gradient backgrounds
  const perforationBg = [
    // Top edge
    `radial-gradient(circle, ${bgColor} ${perfRadius}px, transparent ${perfRadius}px)`,
    // Bottom edge
    `radial-gradient(circle, ${bgColor} ${perfRadius}px, transparent ${perfRadius}px)`,
    // Left edge
    `radial-gradient(circle, ${bgColor} ${perfRadius}px, transparent ${perfRadius}px)`,
    // Right edge
    `radial-gradient(circle, ${bgColor} ${perfRadius}px, transparent ${perfRadius}px)`,
  ].join(", ");

  const perforationBgSize = [
    `${perfSpacing}px ${perfSpacing}px`,
    `${perfSpacing}px ${perfSpacing}px`,
    `${perfSpacing}px ${perfSpacing}px`,
    `${perfSpacing}px ${perfSpacing}px`,
  ].join(", ");

  const perforationBgPosition = [
    `${perfSpacing / 2}px -${perfRadius}px`,
    `${perfSpacing / 2}px calc(100% + ${perfRadius}px)`,
    `-${perfRadius}px ${perfSpacing / 2}px`,
    `calc(100% + ${perfRadius}px) ${perfSpacing / 2}px`,
  ].join(", ");

  const perforationBgRepeat = [
    "repeat-x",
    "repeat-x",
    "repeat-y",
    "repeat-y",
  ].join(", ");

  // Photo area inset from stamp edges
  const photoInset = 40;
  const photoWidth = stampWidth - photoInset * 2;
  const photoHeight = stampHeight - photoInset * 2 - 30; // Extra space for bottom text area

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, #f7f2ea 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, #efe8db 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, #f2ece2 0%, transparent 70%),
          ${bgColor}
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Stamp container */}
      <div
        style={{
          width: stampWidth,
          height: stampHeight,
          backgroundColor: "#fafaf5",
          transform: `translateY(${translateY}px) rotate(${rotation}deg) scale(${breathingScale})`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          position: "relative",
          background: perforationBg,
          backgroundSize: perforationBgSize,
          backgroundPosition: perforationBgPosition,
          backgroundRepeat: perforationBgRepeat,
        }}
      >
        {/* Solid white inner fill (behind perforations) */}
        <div
          style={{
            position: "absolute",
            top: perfRadius,
            left: perfRadius,
            right: perfRadius,
            bottom: perfRadius,
            backgroundColor: "#fafaf5",
          }}
        />

        {/* Thin decorative line border inset 15px from edge */}
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 15,
            right: 15,
            bottom: 15,
            border: "1px solid #d4c8b0",
            pointerEvents: "none",
          }}
        />

        {/* Corner flourishes - L-shaped lines */}
        {/* Top-left */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            width: 20,
            height: 20,
            borderTop: "2px solid #8a6a4a",
            borderLeft: "2px solid #8a6a4a",
            pointerEvents: "none",
          }}
        />
        {/* Top-right */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            width: 20,
            height: 20,
            borderTop: "2px solid #8a6a4a",
            borderRight: "2px solid #8a6a4a",
            pointerEvents: "none",
          }}
        />
        {/* Bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 22,
            width: 20,
            height: 20,
            borderBottom: "2px solid #8a6a4a",
            borderLeft: "2px solid #8a6a4a",
            pointerEvents: "none",
          }}
        />
        {/* Bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 22,
            right: 22,
            width: 20,
            height: 20,
            borderBottom: "2px solid #8a6a4a",
            borderRight: "2px solid #8a6a4a",
            pointerEvents: "none",
          }}
        />

        {/* Stamp value text */}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 30,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 16,
            color: "#8a6a4a",
            zIndex: 2,
            letterSpacing: 1,
          }}
        >
          {"\u2665"} 2025
        </div>

        {/* Photo area */}
        <div
          style={{
            position: "absolute",
            top: photoInset,
            left: photoInset,
            width: photoWidth,
            height: photoHeight,
            border: "2px solid #d4c8b0",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <Img
            src={staticFile(image.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.85) contrast(1.05)",
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

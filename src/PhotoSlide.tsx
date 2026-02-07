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
import type { PhotoSlideProps } from "./types";
import { VIDEO_CONFIG } from "./types";
import { TextOverlay } from "./TextOverlay";

export const PhotoSlide: React.FC<PhotoSlideProps> = ({
  image,
  motionEffect,
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

  const aspectRatio = dimensions.width / dimensions.height;
  const viewportAspect = VIDEO_CONFIG.width / VIDEO_CONFIG.height;

  // Calculate scale to cover the viewport
  let scaledWidth: number;
  let scaledHeight: number;

  if (aspectRatio > viewportAspect) {
    // Image is wider than viewport - fit height
    const scale = VIDEO_CONFIG.height / dimensions.height;
    scaledWidth = dimensions.width * scale;
    scaledHeight = VIDEO_CONFIG.height;
  } else {
    // Image is taller/narrower - fit width
    const scale = VIDEO_CONFIG.width / dimensions.width;
    scaledWidth = VIDEO_CONFIG.width;
    scaledHeight = dimensions.height * scale;
  }

  // Calculate available pan ranges
  const maxPanX = Math.max(0, (scaledWidth - VIDEO_CONFIG.width) / 2);
  const maxPanY = Math.max(0, (scaledHeight - VIDEO_CONFIG.height) / 2);

  // Parse motion effect (can be string or config object)
  const isCustom = typeof motionEffect === "object";
  const effect = isCustom ? motionEffect.effect : motionEffect;
  const customConfig = isCustom ? motionEffect : undefined;

  // Apply motion effect
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  switch (effect) {
    case "pan-left-to-right": {
      const panRange = maxPanX * 0.5;
      const startX = customConfig?.panStartX !== undefined
        ? customConfig.panStartX * maxPanX
        : -panRange;
      const endX = customConfig?.panEndX !== undefined
        ? customConfig.panEndX * maxPanX
        : panRange;
      translateX = interpolate(frame, [0, durationInFrames], [startX, endX], {
        extrapolateRight: "clamp",
      });
      // Also handle Y if specified in custom config
      if (customConfig?.panStartY !== undefined || customConfig?.panEndY !== undefined) {
        const startY = (customConfig?.panStartY ?? 0) * maxPanY;
        const endY = (customConfig?.panEndY ?? 0) * maxPanY;
        translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
          extrapolateRight: "clamp",
        });
      }
      break;
    }
    case "pan-right-to-left": {
      const panRange = maxPanX * 0.5;
      const startX = customConfig?.panStartX !== undefined
        ? customConfig.panStartX * maxPanX
        : panRange;
      const endX = customConfig?.panEndX !== undefined
        ? customConfig.panEndX * maxPanX
        : -panRange;
      translateX = interpolate(frame, [0, durationInFrames], [startX, endX], {
        extrapolateRight: "clamp",
      });
      // Also handle Y if specified in custom config
      if (customConfig?.panStartY !== undefined || customConfig?.panEndY !== undefined) {
        const startY = (customConfig?.panStartY ?? 0) * maxPanY;
        const endY = (customConfig?.panEndY ?? 0) * maxPanY;
        translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
          extrapolateRight: "clamp",
        });
      }
      break;
    }
    case "pan-up": {
      const panRange = maxPanY * 0.4;
      const startY = customConfig?.panStartY !== undefined
        ? customConfig.panStartY * maxPanY
        : panRange;
      const endY = customConfig?.panEndY !== undefined
        ? customConfig.panEndY * maxPanY
        : -panRange;
      translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
        extrapolateRight: "clamp",
      });
      break;
    }
    case "pan-down": {
      const panRange = maxPanY * 0.4;
      const startY = customConfig?.panStartY !== undefined
        ? customConfig.panStartY * maxPanY
        : -panRange;
      const endY = customConfig?.panEndY !== undefined
        ? customConfig.panEndY * maxPanY
        : panRange;
      translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
        extrapolateRight: "clamp",
      });
      break;
    }
    case "zoom-in": {
      scale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
        extrapolateRight: "clamp",
      });
      break;
    }
    case "zoom-out": {
      scale = interpolate(frame, [0, durationInFrames], [1.15, 1], {
        extrapolateRight: "clamp",
      });
      break;
    }
    case "none": {
      // No motion - static image
      break;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(image.src)}
        style={{
          position: "absolute",
          width: scaledWidth,
          height: scaledHeight,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
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

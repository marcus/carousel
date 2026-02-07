import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  Easing,
  interpolate,
} from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type LightLeakProps = Record<string, never>;

const LightLeakPresentation: React.FC<
  TransitionPresentationComponentProps<LightLeakProps>
> = ({ children, presentationProgress, presentationDirection }) => {
  const { width, height } = useVideoConfig();

  // Show entering content after ~36% progress
  const thresh = 0.3625;
  const visibilityProgress = presentationProgress >= thresh ? 1 : 0;

  // Fade in/out the content
  const opacity =
    presentationDirection === "entering"
      ? visibilityProgress
      : interpolate(presentationProgress, [0, thresh], [1, 0], {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        });

  const leakOpacity =
    presentationDirection === "entering"
      ? interpolate(presentationProgress, [0, 0.2, 0.9, 1], [0, 0.75, 0.35, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const sweepX = interpolate(presentationProgress, [0, 1], [-0.2, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flareScale = interpolate(presentationProgress, [0, 1], [0.8, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
      {presentationDirection === "entering" && (
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: leakOpacity }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 20% 35%, rgba(255, 150, 60, 0.9), transparent 42%)",
              transform: `translateX(${(sweepX - 0.5) * width * 0.6}px) scale(${flareScale})`,
              filter: "blur(18px)",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 68% 62%, rgba(255, 95, 170, 0.65), transparent 48%)",
              transform: `translateX(${(0.5 - sweepX) * width * 0.4}px) scale(${1.1 - (flareScale - 1) * 0.5})`,
              filter: "blur(24px)",
            }}
          />
          <AbsoluteFill
            style={{
              width: width * 0.55,
              height,
              left: width * (sweepX - 0.25),
              background:
                "linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 225, 180, 0.5), rgba(255, 255, 255, 0))",
              filter: "blur(14px)",
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const lightLeak = (): TransitionPresentation<LightLeakProps> => {
  return { component: LightLeakPresentation, props: {} };
};

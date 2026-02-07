import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// Seeded random for deterministic rendering
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// ─── Heart Shape SVG Path ───
const HeartShape: React.FC<{
  size: number;
  color: string;
  opacity: number;
  style?: React.CSSProperties;
}> = ({ size, color, opacity, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ position: "absolute", ...style }}
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
      opacity={opacity}
    />
  </svg>
);

// ─── Sparkle Star ───
const Sparkle: React.FC<{
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  style?: React.CSSProperties;
}> = ({ size, color, opacity, rotation, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      transform: `rotate(${rotation}deg)`,
      ...style,
    }}
  >
    <path
      d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z"
      fill={color}
      opacity={opacity}
    />
  </svg>
);

// ─── Floating Hearts Layer ───
const FloatingHearts: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i * 37 + 7;
        const x = seededRandom(seed) * 1080;
        const baseSize = 20 + seededRandom(seed + 1) * 50;
        const speed = 0.3 + seededRandom(seed + 2) * 0.7;
        const delay = seededRandom(seed + 3) * fps * 3;
        const drift = (seededRandom(seed + 4) - 0.5) * 200;
        const startY = 1920 + baseSize + seededRandom(seed + 5) * 400;

        const progress = Math.max(0, (frame - delay) / (fps * 8));
        const y = startY - progress * (2400 * speed);
        const xOffset = Math.sin(progress * 4 + i) * drift;
        const heartOpacity = interpolate(
          progress,
          [0, 0.05, 0.7, 1],
          [0, 0.6, 0.5, 0],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );

        const rotation = Math.sin(progress * 3 + i * 0.5) * 20;
        const scale = 0.8 + Math.sin(progress * 2 + i) * 0.2;

        const colors = [
          "#ff6b9d", "#ff4081", "#e91e63", "#f48fb1",
          "#ff80ab", "#ff1744", "#d50000", "#ff5252",
          "#ffd700", "#ffab91",
        ];
        const color = colors[i % colors.length] ?? "#ff6b9d";

        return (
          <HeartShape
            key={`heart-${i}`}
            size={baseSize * scale}
            color={color}
            opacity={heartOpacity}
            style={{
              left: x + xOffset,
              top: y,
              transform: `rotate(${rotation}deg) scale(${scale})`,
              filter: `blur(${baseSize > 50 ? 2 : 0}px)`,
            }}
          />
        );
      })}
    </>
  );
};

// ─── Sparkle Field ───
const SparkleField: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i * 53 + 13;
        const x = seededRandom(seed) * 1080;
        const y = seededRandom(seed + 1) * 1920;
        const size = 8 + seededRandom(seed + 2) * 24;
        const phase = seededRandom(seed + 3) * Math.PI * 2;
        const speed = 1.5 + seededRandom(seed + 4) * 2;
        const delay = seededRandom(seed + 5) * fps * 2;

        const twinkle = Math.sin(frame * speed * 0.1 + phase);
        const sparkleOpacity = interpolate(
          frame,
          [delay, delay + fps * 0.5, delay + fps * 6],
          [0, 0.8, 0.3],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        ) * Math.max(0, twinkle);

        const rotation = frame * (1 + seededRandom(seed + 6) * 2);
        const scaleBreath = 0.6 + Math.sin(frame * 0.08 + phase) * 0.4;

        const colors = ["#ffffff", "#ffd700", "#fffacd", "#fff8dc", "#ffecd2"];
        const color = colors[i % colors.length] ?? "#ffffff";

        return (
          <Sparkle
            key={`sparkle-${i}`}
            size={size * scaleBreath}
            color={color}
            opacity={sparkleOpacity}
            rotation={rotation}
            style={{ left: x, top: y }}
          />
        );
      })}
    </>
  );
};

// ─── Animated Light Rays ───
const LightRays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const raysOpacity = interpolate(
    frame,
    [fps * 1, fps * 3, fps * 7, fps * 8],
    [0, 0.15, 0.12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const rotation = frame * 0.15;

  return (
    <AbsoluteFill
      style={{
        opacity: raysOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) + rotation;
        const pulse = 0.7 + Math.sin(frame * 0.05 + i * 0.5) * 0.3;
        return (
          <div
            key={`ray-${i}`}
            style={{
              position: "absolute",
              width: 4,
              height: 1200,
              background: `linear-gradient(to top, transparent 0%, rgba(255, 215, 0, ${0.4 * pulse}) 30%, rgba(255, 180, 220, ${0.3 * pulse}) 60%, transparent 100%)`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "center bottom",
              top: "50%",
              left: "50%",
              marginLeft: -2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Orbiting Hearts Ring ───
const OrbitingHearts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ringOpacity = interpolate(
    frame,
    [fps * 2.5, fps * 4, fps * 7, fps * 8],
    [0, 0.7, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const orbitCount = 8;
  const centerX = 540;
  const centerY = 960;
  const radiusX = 380;
  const radiusY = 160;

  return (
    <AbsoluteFill style={{ opacity: ringOpacity }}>
      {Array.from({ length: orbitCount }).map((_, i) => {
        const baseAngle = (i / orbitCount) * Math.PI * 2;
        const angle = baseAngle + frame * 0.02;
        const x = centerX + Math.cos(angle) * radiusX - 15;
        const y = centerY + 200 + Math.sin(angle) * radiusY - 15;
        const depthScale = 0.6 + (Math.sin(angle) + 1) * 0.2;
        const depthOpacity = 0.4 + (Math.sin(angle) + 1) * 0.3;

        const colors = ["#ff6b9d", "#ffd700", "#ff4081", "#ffab91", "#f48fb1", "#ff80ab", "#e91e63", "#ff1744"];
        const color = colors[i % colors.length] ?? "#ff6b9d";

        return (
          <HeartShape
            key={`orbit-${i}`}
            size={30 * depthScale}
            color={color}
            opacity={depthOpacity}
            style={{
              left: x,
              top: y,
              transform: `scale(${depthScale})`,
              filter: `blur(${depthScale < 0.8 ? 1 : 0}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Pulsing Glow Background ───
const GlowBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(
    frame,
    [0, fps * 1.5],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // Slowly shifting gradient hue
  const hueShift = Math.sin(frame * 0.01) * 15;
  const pulse1 = 0.3 + Math.sin(frame * 0.03) * 0.1;
  const pulse2 = 0.25 + Math.sin(frame * 0.025 + 1) * 0.1;
  const pulse3 = 0.2 + Math.sin(frame * 0.02 + 2) * 0.08;

  return (
    <AbsoluteFill style={{ opacity: bgOpacity }}>
      {/* Base deep gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg,
            hsl(${330 + hueShift}, 40%, 8%) 0%,
            hsl(${280 + hueShift}, 35%, 12%) 30%,
            hsl(${320 + hueShift}, 45%, 10%) 60%,
            hsl(${350 + hueShift}, 30%, 6%) 100%)`,
        }}
      />

      {/* Spotlight orbs */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255, 105, 180, ${pulse1}) 0%, transparent 70%)`,
          left: 140 + Math.sin(frame * 0.015) * 60,
          top: 300 + Math.cos(frame * 0.012) * 80,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255, 215, 0, ${pulse2}) 0%, transparent 70%)`,
          left: 200 + Math.cos(frame * 0.018) * 50,
          top: 900 + Math.sin(frame * 0.014) * 70,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255, 100, 150, ${pulse3}) 0%, transparent 70%)`,
          left: 400 + Math.sin(frame * 0.02) * 40,
          top: 1400 + Math.cos(frame * 0.016) * 60,
          filter: "blur(90px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Heart Burst (confetti-like) ───
const HeartBurst: React.FC<{ triggerFrame: number }> = ({ triggerFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > fps * 3) return null;

  const burstCount = 40;
  const centerX = 540;
  const centerY = 850;

  return (
    <>
      {Array.from({ length: burstCount }).map((_, i) => {
        const seed = i * 71 + 29;
        const angle = seededRandom(seed) * Math.PI * 2;
        const velocity = 200 + seededRandom(seed + 1) * 600;
        const size = 15 + seededRandom(seed + 2) * 35;
        const gravity = 150 + seededRandom(seed + 3) * 100;
        const spin = (seededRandom(seed + 4) - 0.5) * 720;

        const t = elapsed / fps;
        const x = centerX + Math.cos(angle) * velocity * t * 0.8;
        const y = centerY + Math.sin(angle) * velocity * t * 0.6 + 0.5 * gravity * t * t;
        const rotation = spin * t;

        const burstOpacity = interpolate(
          elapsed,
          [0, fps * 0.2, fps * 2, fps * 3],
          [0, 1, 0.6, 0],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );

        const colors = [
          "#ff6b9d", "#ff4081", "#e91e63", "#ffd700",
          "#ff80ab", "#f48fb1", "#ff1744", "#ffab91",
          "#ff5252", "#ff867c",
        ];
        const color = colors[i % colors.length] ?? "#ff6b9d";

        return (
          <HeartShape
            key={`burst-${i}`}
            size={size}
            color={color}
            opacity={burstOpacity}
            style={{
              left: x,
              top: y,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// ─── Per-Letter Animated Text ───
const AnimatedText: React.FC<{
  text: string;
  fontSize: number;
  color: string;
  delayFrames: number;
  glowColor: string;
  yPosition: number;
  fontFamily?: string;
  letterSpacing?: number;
}> = ({
  text,
  fontSize,
  color,
  delayFrames,
  glowColor,
  yPosition,
  fontFamily = "Georgia, serif",
  letterSpacing = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const letters = text.split("");

  // Glow pulse
  const glowIntensity = interpolate(
    Math.max(0, frame - delayFrames - fps * 0.8),
    [0, fps * 1.5, fps * 3],
    [0, 40, 25],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Shimmer sweep across letters
  const shimmerPos = interpolate(
    Math.max(0, frame - delayFrames - fps),
    [0, fps * 2],
    [-0.3, 1.3],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: letterSpacing,
      }}
    >
      {letters.map((letter, i) => {
        const letterDelay = delayFrames + i * 3;

        // Spring entrance per letter
        const entrance = spring({
          frame: Math.max(0, frame - letterDelay),
          fps,
          config: { damping: 8, stiffness: 120, mass: 0.8 },
        });

        const letterY = interpolate(entrance, [0, 1], [80, 0]);
        const letterScale = interpolate(entrance, [0, 1], [0.3, 1]);
        const letterRotation = interpolate(entrance, [0, 1], [-15, 0]);
        const letterOpacity = interpolate(entrance, [0, 1], [0, 1]);

        // Shimmer highlight per letter
        const letterPos = i / letters.length;
        const shimmerDist = Math.abs(shimmerPos - letterPos);
        const shimmerBright = shimmerDist < 0.15
          ? interpolate(shimmerDist, [0, 0.15], [1.4, 1], { extrapolateRight: "clamp" })
          : 1;

        // Breathing scale
        const breathe = 1 + Math.sin(frame * 0.04 + i * 0.3) * 0.02;

        return (
          <span
            key={`${letter}-${i}`}
            style={{
              display: "inline-block",
              fontSize,
              fontFamily,
              fontWeight: "bold",
              color,
              opacity: letterOpacity,
              transform: `translateY(${letterY}px) scale(${letterScale * breathe * shimmerBright}) rotate(${letterRotation}deg)`,
              textShadow: `
                0 0 ${glowIntensity * 0.5}px ${glowColor},
                0 0 ${glowIntensity}px ${glowColor},
                0 0 ${glowIntensity * 2}px ${glowColor},
                0 4px 15px rgba(0,0,0,0.3)
              `,
              filter: shimmerBright > 1.1 ? `brightness(${shimmerBright})` : undefined,
              minWidth: letter === " " ? fontSize * 0.3 : undefined,
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};

// ─── Animated Heart Emoji (large, centered) ───
const PulsingHeart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heartEntrance = spring({
    frame: Math.max(0, frame - fps * 3.5),
    fps,
    config: { damping: 6, stiffness: 80, mass: 1.2 },
  });

  const heartScale = interpolate(heartEntrance, [0, 1], [0, 1]);
  const heartBeat = 1 + Math.sin(frame * 0.12) * 0.06;
  const heartOpacity = interpolate(
    frame,
    [fps * 3.5, fps * 4.5, fps * 7, fps * 8],
    [0, 0.9, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const glowPulse = 15 + Math.sin(frame * 0.1) * 10;

  return (
    <div
      style={{
        position: "absolute",
        top: 1180,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: heartOpacity,
        transform: `scale(${heartScale * heartBeat})`,
        filter: `drop-shadow(0 0 ${glowPulse}px rgba(255, 100, 150, 0.6)) drop-shadow(0 0 ${glowPulse * 2}px rgba(255, 50, 100, 0.3))`,
      }}
    >
      <svg width={120} height={120} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="50%" stopColor="#ff4081" />
            <stop offset="100%" stopColor="#e91e63" />
          </linearGradient>
        </defs>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#heartGrad)"
        />
      </svg>
    </div>
  );
};

// ─── Ripple Effect (expanding rings) ───
const RippleRings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ringCount = 5;
  const centerX = 540;
  const centerY = 960;

  return (
    <>
      {Array.from({ length: ringCount }).map((_, i) => {
        const ringDelay = fps * 2 + i * fps * 0.6;
        const elapsed = Math.max(0, frame - ringDelay);
        const progress = elapsed / (fps * 3);

        if (progress < 0 || progress > 1) return null;

        const radius = interpolate(progress, [0, 1], [50, 600], {
          extrapolateRight: "clamp",
        });
        const ringOpacity = interpolate(progress, [0, 0.1, 0.6, 1], [0, 0.3, 0.15, 0], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`ring-${i}`}
            style={{
              position: "absolute",
              left: centerX - radius,
              top: centerY - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `2px solid rgba(255, 180, 220, ${ringOpacity})`,
              boxShadow: `0 0 20px rgba(255, 150, 200, ${ringOpacity * 0.5}), inset 0 0 20px rgba(255, 150, 200, ${ringOpacity * 0.3})`,
            }}
          />
        );
      })}
    </>
  );
};

interface OutroSlideProps {
  primaryText?: string;
  secondaryText?: string;
}

// ─── Main Outro Component ───
export const OutroSlide: React.FC<OutroSlideProps> = ({
  primaryText = "Transitions & Effects",
  secondaryText = "For Remotion",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade in / out
  const globalOpacity = interpolate(
    frame,
    [0, fps * 1, durationInFrames - fps * 1.5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      {/* Deep gradient background with animated spotlights */}
      <GlowBackground />

      {/* Expanding ripple rings */}
      <RippleRings />

      {/* Light rays radiating from center */}
      <LightRays />

      {/* Floating accent shapes behind text */}
      <FloatingHearts count={35} />

      {/* Sparkle field */}
      <SparkleField count={40} />

      {/* Orbiting accent ring */}
      <OrbitingHearts />

      {/* Primary text with spring entrance per letter */}
      <AnimatedText
        text={primaryText}
        fontSize={100}
        color="#ffffff"
        delayFrames={Math.round(fps * 0.5)}
        glowColor="rgba(255, 180, 220, 0.8)"
        yPosition={720}
        letterSpacing={6}
      />

      {/* Secondary text with dramatic glow */}
      <AnimatedText
        text={secondaryText}
        fontSize={140}
        color="#ffd700"
        delayFrames={Math.round(fps * 2)}
        glowColor="rgba(255, 215, 0, 0.7)"
        yPosition={870}
        letterSpacing={8}
      />

      {/* Pulsing heart between text lines */}
      <PulsingHeart />

      {/* Heart burst triggered after text appears */}
      <HeartBurst triggerFrame={Math.round(fps * 3.8)} />

      {/* Second smaller burst */}
      <HeartBurst triggerFrame={Math.round(fps * 5.5)} />
    </AbsoluteFill>
  );
};

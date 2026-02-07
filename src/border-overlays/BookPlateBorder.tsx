import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

const MAIN_COLOR = "#D4C5A0";
const ACCENT_COLOR = "#B8A67E";
const SHADOW_COLOR = "rgba(0,0,0,0.2)";

const OUTER_OFFSET = 40;
const INNER_OFFSET = 70;
const WIDTH = 1080;
const HEIGHT = 1920;

const CornerOrnament: React.FC<{
  cx: number;
  cy: number;
  rotation: number;
  scale: number;
  opacity: number;
}> = ({ cx, cy, rotation, scale, opacity }) => {
  return (
    <g
      transform={`translate(${cx}, ${cy}) rotate(${rotation}) scale(${scale})`}
      opacity={opacity}
    >
      {/* Outer rosette petals */}
      <path
        d="M0,-28 C6,-18 10,-10 0,-4 C-10,-10 -6,-18 0,-28Z"
        fill={ACCENT_COLOR}
      />
      <path
        d="M0,28 C6,18 10,10 0,4 C-10,10 -6,18 0,28Z"
        fill={ACCENT_COLOR}
      />
      <path
        d="M-28,0 C-18,6 -10,10 -4,0 C-10,-10 -18,-6 -28,0Z"
        fill={ACCENT_COLOR}
      />
      <path
        d="M28,0 C18,6 10,10 4,0 C10,-10 18,-6 28,0Z"
        fill={ACCENT_COLOR}
      />
      {/* Diagonal petals */}
      <path
        d="M-20,-20 C-12,-14 -8,-8 -2,-2 C-8,-8 -14,-12 -20,-20Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={1}
      />
      <path
        d="M20,-20 C12,-14 8,-8 2,-2 C8,-8 14,-12 20,-20Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={1}
      />
      <path
        d="M-20,20 C-12,14 -8,8 -2,2 C-8,8 -14,12 -20,20Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={1}
      />
      <path
        d="M20,20 C12,14 8,8 2,2 C8,8 14,12 20,20Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={1}
      />
      {/* Fleur-de-lis inspired spikes */}
      <path
        d="M0,-22 C3,-16 5,-10 0,-6 C-5,-10 -3,-16 0,-22Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={0.5}
      />
      <path
        d="M0,22 C3,16 5,10 0,6 C-5,10 -3,16 0,22Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={0.5}
      />
      <path
        d="M-22,0 C-16,3 -10,5 -6,0 C-10,-5 -16,-3 -22,0Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={0.5}
      />
      <path
        d="M22,0 C16,3 10,5 6,0 C10,-5 16,-3 22,0Z"
        fill={MAIN_COLOR}
        stroke={ACCENT_COLOR}
        strokeWidth={0.5}
      />
      {/* Inner cross pattern */}
      <line x1="0" y1="-12" x2="0" y2="12" stroke={ACCENT_COLOR} strokeWidth={1.5} />
      <line x1="-12" y1="0" x2="12" y2="0" stroke={ACCENT_COLOR} strokeWidth={1.5} />
      <line x1="-8" y1="-8" x2="8" y2="8" stroke={ACCENT_COLOR} strokeWidth={0.8} />
      <line x1="8" y1="-8" x2="-8" y2="8" stroke={ACCENT_COLOR} strokeWidth={0.8} />
      {/* Center circle */}
      <circle r={4} fill={ACCENT_COLOR} />
      <circle r={2.5} fill={MAIN_COLOR} />
      <circle r={1} fill={ACCENT_COLOR} />
      {/* Outer ring */}
      <circle r={16} fill="none" stroke={ACCENT_COLOR} strokeWidth={1} />
      <circle r={20} fill="none" stroke={MAIN_COLOR} strokeWidth={0.5} />
    </g>
  );
};

const MidpointDiamond: React.FC<{
  cx: number;
  cy: number;
  opacity: number;
}> = ({ cx, cy, opacity }) => {
  return (
    <g opacity={opacity}>
      <polygon
        points={`${cx},${cy - 8} ${cx + 5},${cy} ${cx},${cy + 8} ${cx - 5},${cy}`}
        fill={ACCENT_COLOR}
        stroke={MAIN_COLOR}
        strokeWidth={0.5}
      />
      <circle cx={cx} cy={cy} r={2} fill={MAIN_COLOR} />
    </g>
  );
};

export const BookPlateBorder: React.FC<BorderOverlayProps> = ({ color }) => {
  const frame = useCurrentFrame();

  const lineColor = color || MAIN_COLOR;

  // Double-rule lines fade in (frames 0-12)
  const linesOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Corner ornaments scale (frames 8-25) with overshoot
  const cornerScale = interpolate(frame, [8, 18, 22, 25], [0, 1.12, 0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cornerFadeIn = interpolate(frame, [8, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Midpoint accents (frames 15-25)
  const midpointOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Idle pulse on corners (sine wave after entrance)
  const pulse =
    frame > 25
      ? 0.85 + 0.15 * (0.5 + 0.5 * Math.sin((frame - 25) * 0.08))
      : 1;

  const cornerOpacity = cornerFadeIn * pulse;

  // Corner positions (at intersection of double rules)
  const outerX1 = OUTER_OFFSET;
  const outerY1 = OUTER_OFFSET;
  const outerX2 = WIDTH - OUTER_OFFSET;
  const outerY2 = HEIGHT - OUTER_OFFSET;
  const innerX1 = INNER_OFFSET;
  const innerY1 = INNER_OFFSET;
  const innerX2 = WIDTH - INNER_OFFSET;
  const innerY2 = HEIGHT - INNER_OFFSET;

  // Corner ornament centers sit between inner and outer rules
  const cornerMid = (OUTER_OFFSET + INNER_OFFSET) / 2;

  // Edge midpoints on the inner rule
  const midTop = { x: WIDTH / 2, y: innerY1 };
  const midBottom = { x: WIDTH / 2, y: innerY2 };
  const midLeft = { x: innerX1, y: HEIGHT / 2 };
  const midRight = { x: innerX2, y: HEIGHT / 2 };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Shadow layer for depth */}
        <g opacity={linesOpacity}>
          {/* Outer rule shadow */}
          <rect
            x={outerX1 + 1}
            y={outerY1 + 1}
            width={outerX2 - outerX1}
            height={outerY2 - outerY1}
            fill="none"
            stroke={SHADOW_COLOR}
            strokeWidth={2}
          />
          {/* Inner rule shadow */}
          <rect
            x={innerX1 + 1}
            y={innerY1 + 1}
            width={innerX2 - innerX1}
            height={innerY2 - innerY1}
            fill="none"
            stroke={SHADOW_COLOR}
            strokeWidth={1.5}
          />
        </g>

        {/* Double-rule frame */}
        <g opacity={linesOpacity}>
          {/* Outer rule */}
          <rect
            x={outerX1}
            y={outerY1}
            width={outerX2 - outerX1}
            height={outerY2 - outerY1}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
          />
          {/* Inner rule */}
          <rect
            x={innerX1}
            y={innerY1}
            width={innerX2 - innerX1}
            height={innerY2 - innerY1}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.5}
          />
        </g>

        {/* Corner ornaments */}
        {/* Top-left */}
        <CornerOrnament
          cx={cornerMid}
          cy={cornerMid}
          rotation={0}
          scale={cornerScale}
          opacity={cornerOpacity}
        />
        {/* Top-right */}
        <CornerOrnament
          cx={WIDTH - cornerMid}
          cy={cornerMid}
          rotation={90}
          scale={cornerScale}
          opacity={cornerOpacity}
        />
        {/* Bottom-right */}
        <CornerOrnament
          cx={WIDTH - cornerMid}
          cy={HEIGHT - cornerMid}
          rotation={180}
          scale={cornerScale}
          opacity={cornerOpacity}
        />
        {/* Bottom-left */}
        <CornerOrnament
          cx={cornerMid}
          cy={HEIGHT - cornerMid}
          rotation={270}
          scale={cornerScale}
          opacity={cornerOpacity}
        />

        {/* Edge midpoint accents */}
        <MidpointDiamond cx={midTop.x} cy={midTop.y} opacity={midpointOpacity} />
        <MidpointDiamond cx={midBottom.x} cy={midBottom.y} opacity={midpointOpacity} />
        <MidpointDiamond cx={midLeft.x} cy={midLeft.y} opacity={midpointOpacity} />
        <MidpointDiamond cx={midRight.x} cy={midRight.y} opacity={midpointOpacity} />
      </svg>
    </AbsoluteFill>
  );
};

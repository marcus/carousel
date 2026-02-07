import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

export const FairytaleFiligree: React.FC<BorderOverlayProps> = ({
  color = "#E8E0D0",
}) => {
  const frame = useCurrentFrame();

  // Draw-in animation progress for corners (frames 0-30)
  const cornerDraw = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Draw-in for edge filigree (frames 10-35)
  const edgeDraw = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer sweep position (frames 30+), diagonal sweep across border
  const shimmerPos = interpolate(frame, [30, 90], [-0.3, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Opacity fade-in for the whole border
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightColor = "#FFFFFF";
  const shadowColor = "#C0B8A8";

  // Helper: compute strokeDashoffset for draw-in animation
  const drawStyle = (
    pathLength: number,
    progress: number,
    strokeWidth = 2.5
  ): React.CSSProperties => ({
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - progress),
  });

  const drawStyleHighlight = (
    pathLength: number,
    progress: number,
    strokeWidth = 1
  ): React.CSSProperties => ({
    fill: "none",
    stroke: highlightColor,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity: 0.6,
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - progress),
  });

  const drawStyleShadow = (
    pathLength: number,
    progress: number,
    strokeWidth = 1.5
  ): React.CSSProperties => ({
    fill: "none",
    stroke: shadowColor,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity: 0.5,
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - progress),
  });

  // --- Corner Scrollwork Paths (top-left origin, ~150x150px area) ---
  // Main large spiral
  const cornerSpiral1 =
    "M 10,10 C 10,60 30,100 60,120 C 90,140 130,130 140,100 C 150,70 130,30 100,20 C 70,10 40,30 35,55";
  const cornerSpiral1Len = 380;

  // Secondary inner spiral
  const cornerSpiral2 =
    "M 15,25 C 20,55 35,80 55,95 C 75,110 100,105 110,85 C 120,65 105,40 85,35 C 65,30 45,45 42,60";
  const cornerSpiral2Len = 260;

  // Tendril curving down-left with leaf tip
  const cornerTendril1 =
    "M 60,120 C 45,135 25,145 15,140 C 8,137 5,128 12,122 C 18,116 28,120 30,128";
  const cornerTendril1Len = 160;

  // Tendril curving right with heart-shaped tip
  const cornerTendril2 =
    "M 140,100 C 148,115 150,135 142,145 C 136,152 125,150 122,142 C 119,134 126,126 134,128 C 142,130 144,138 140,145";
  const cornerTendril2Len = 170;

  // Small inner accent curl
  const cornerAccent1 =
    "M 35,55 C 38,65 48,72 58,68 C 68,64 70,52 62,46 C 54,40 44,46 43,54";
  const cornerAccent1Len = 120;

  // Tiny leaf at spiral center
  const cornerLeaf1 =
    "M 43,54 C 40,48 36,42 42,38 C 48,34 52,40 48,46";
  const cornerLeaf1Len = 60;

  // Decorative dot-curl near corner edge
  const cornerCurl1 =
    "M 5,5 C 2,15 8,28 18,22 C 28,16 20,4 10,8";
  const cornerCurl1Len = 80;

  // --- Edge Filigree Paths (top edge, horizontal, connecting corners) ---
  // S-curve repeating pattern along top edge
  const edgeTopMain =
    "M 150,30 C 180,10 220,50 260,30 C 300,10 340,50 380,30 C 420,10 460,50 500,35 C 540,20 560,20 580,35 C 620,50 660,10 700,30 C 740,50 780,10 820,30 C 860,50 900,10 930,30";
  const edgeTopMainLen = 900;

  // Lighter accent S-curve slightly offset
  const edgeTopAccent =
    "M 160,45 C 190,25 225,60 265,42 C 305,24 340,60 380,42 C 420,24 455,55 500,45 C 545,35 555,35 580,45 C 625,55 660,24 700,42 C 740,60 775,24 815,42 C 855,60 890,25 920,45";
  const edgeTopAccentLen = 870;

  // Small C-scrolls near corners (left side of top edge)
  const edgeTopScrollL =
    "M 145,50 C 155,65 170,70 180,60 C 190,50 182,35 170,38 C 158,41 155,52 160,58";
  const edgeTopScrollLLen = 110;

  // Small C-scrolls near corners (right side of top edge)
  const edgeTopScrollR =
    "M 935,50 C 925,65 910,70 900,60 C 890,50 898,35 910,38 C 922,41 925,52 920,58";
  const edgeTopScrollRLen = 110;

  // --- Left Edge Filigree (vertical, connecting top-left to bottom-left) ---
  const edgeLeftMain =
    "M 30,170 C 10,210 50,260 30,310 C 10,360 50,410 30,460 C 10,510 50,560 35,620 C 20,680 20,720 35,780 C 50,840 10,890 30,940 C 50,990 10,1040 30,1090 C 10,1140 50,1190 30,1240 C 10,1290 50,1340 30,1390 C 50,1440 10,1490 30,1540 C 10,1590 50,1640 30,1690 C 50,1740 10,1760 30,1750";
  const edgeLeftMainLen = 1800;

  const edgeLeftAccent =
    "M 45,180 C 25,220 58,265 42,315 C 26,365 58,415 42,465 C 26,515 55,560 45,620 C 35,680 35,720 45,780 C 55,840 26,895 42,945 C 58,995 26,1045 42,1095 C 26,1145 58,1195 42,1245 C 26,1295 58,1345 42,1395 C 58,1445 26,1495 42,1545 C 26,1595 58,1645 42,1695 C 58,1745 26,1760 42,1750";
  const edgeLeftAccentLen = 1780;

  // Small scroll near top of left edge
  const edgeLeftScrollT =
    "M 50,165 C 65,175 70,190 60,200 C 50,210 35,202 38,190 C 41,178 52,175 58,180";
  const edgeLeftScrollTLen = 110;

  // --- Render a single corner (top-left) as a group ---
  const renderCornerTopLeft = () => (
    <g>
      {/* Shadow layer */}
      <path d={cornerSpiral1} style={drawStyleShadow(cornerSpiral1Len, cornerDraw, 3.5)} transform="translate(2, 2)" />
      <path d={cornerSpiral2} style={drawStyleShadow(cornerSpiral2Len, cornerDraw, 2.5)} transform="translate(2, 2)" />

      {/* Main strokes */}
      <path d={cornerSpiral1} style={drawStyle(cornerSpiral1Len, cornerDraw, 2.5)} />
      <path d={cornerSpiral2} style={drawStyle(cornerSpiral2Len, cornerDraw, 2)} />
      <path d={cornerTendril1} style={drawStyle(cornerTendril1Len, cornerDraw, 2)} />
      <path d={cornerTendril2} style={drawStyle(cornerTendril2Len, cornerDraw, 2)} />
      <path d={cornerAccent1} style={drawStyle(cornerAccent1Len, cornerDraw, 1.5)} />
      <path d={cornerLeaf1} style={drawStyle(cornerLeaf1Len, cornerDraw, 2)} />
      <path d={cornerCurl1} style={drawStyle(cornerCurl1Len, cornerDraw, 1.5)} />

      {/* Highlight layer */}
      <path d={cornerSpiral1} style={drawStyleHighlight(cornerSpiral1Len, cornerDraw, 1)} transform="translate(-1, -1)" />
      <path d={cornerSpiral2} style={drawStyleHighlight(cornerSpiral2Len, cornerDraw, 0.8)} transform="translate(-1, -1)" />
      <path d={cornerAccent1} style={drawStyleHighlight(cornerAccent1Len, cornerDraw, 0.6)} transform="translate(-1, -1)" />
    </g>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50, opacity }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          {/* Shimmer gradient mask that sweeps diagonally */}
          <linearGradient
            id="shimmerGrad"
            x1={`${shimmerPos * 100}%`}
            y1="0%"
            x2={`${shimmerPos * 100 + 20}%`}
            y2="100%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0.8" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <mask id="shimmerMask">
            <rect width="1080" height="1920" fill="url(#shimmerGrad)" />
          </mask>
        </defs>

        {/* ===== TOP-LEFT CORNER ===== */}
        <g transform="translate(10, 10)">
          {renderCornerTopLeft()}
        </g>

        {/* ===== TOP-RIGHT CORNER (horizontal mirror) ===== */}
        <g transform="translate(1080, 0) scale(-1, 1)">
          <g transform="translate(10, 10)">
            {renderCornerTopLeft()}
          </g>
        </g>

        {/* ===== BOTTOM-LEFT CORNER (vertical mirror) ===== */}
        <g transform="translate(0, 1920) scale(1, -1)">
          <g transform="translate(10, 10)">
            {renderCornerTopLeft()}
          </g>
        </g>

        {/* ===== BOTTOM-RIGHT CORNER (both mirrors) ===== */}
        <g transform="translate(1080, 1920) scale(-1, -1)">
          <g transform="translate(10, 10)">
            {renderCornerTopLeft()}
          </g>
        </g>

        {/* ===== TOP EDGE FILIGREE ===== */}
        <g>
          {/* Shadow */}
          <path d={edgeTopMain} style={drawStyleShadow(edgeTopMainLen, edgeDraw, 2.5)} transform="translate(2, 2)" />
          {/* Main */}
          <path d={edgeTopMain} style={drawStyle(edgeTopMainLen, edgeDraw, 2)} />
          <path d={edgeTopAccent} style={drawStyle(edgeTopAccentLen, edgeDraw, 1)} />
          {/* Small scrolls near corners */}
          <path d={edgeTopScrollL} style={drawStyle(edgeTopScrollLLen, edgeDraw, 1.5)} />
          <path d={edgeTopScrollR} style={drawStyle(edgeTopScrollRLen, edgeDraw, 1.5)} />
          {/* Highlight */}
          <path d={edgeTopMain} style={drawStyleHighlight(edgeTopMainLen, edgeDraw, 0.8)} transform="translate(-1, -1)" />
        </g>

        {/* ===== BOTTOM EDGE FILIGREE (vertical mirror of top) ===== */}
        <g transform="translate(0, 1920) scale(1, -1)">
          <path d={edgeTopMain} style={drawStyleShadow(edgeTopMainLen, edgeDraw, 2.5)} transform="translate(2, 2)" />
          <path d={edgeTopMain} style={drawStyle(edgeTopMainLen, edgeDraw, 2)} />
          <path d={edgeTopAccent} style={drawStyle(edgeTopAccentLen, edgeDraw, 1)} />
          <path d={edgeTopScrollL} style={drawStyle(edgeTopScrollLLen, edgeDraw, 1.5)} />
          <path d={edgeTopScrollR} style={drawStyle(edgeTopScrollRLen, edgeDraw, 1.5)} />
          <path d={edgeTopMain} style={drawStyleHighlight(edgeTopMainLen, edgeDraw, 0.8)} transform="translate(-1, -1)" />
        </g>

        {/* ===== LEFT EDGE FILIGREE ===== */}
        <g>
          <path d={edgeLeftMain} style={drawStyleShadow(edgeLeftMainLen, edgeDraw, 2.5)} transform="translate(2, 2)" />
          <path d={edgeLeftMain} style={drawStyle(edgeLeftMainLen, edgeDraw, 2)} />
          <path d={edgeLeftAccent} style={drawStyle(edgeLeftAccentLen, edgeDraw, 1)} />
          <path d={edgeLeftScrollT} style={drawStyle(edgeLeftScrollTLen, edgeDraw, 1.5)} />
          <path d={edgeLeftMain} style={drawStyleHighlight(edgeLeftMainLen, edgeDraw, 0.8)} transform="translate(-1, -1)" />
        </g>

        {/* ===== RIGHT EDGE FILIGREE (horizontal mirror of left) ===== */}
        <g transform="translate(1080, 0) scale(-1, 1)">
          <path d={edgeLeftMain} style={drawStyleShadow(edgeLeftMainLen, edgeDraw, 2.5)} transform="translate(2, 2)" />
          <path d={edgeLeftMain} style={drawStyle(edgeLeftMainLen, edgeDraw, 2)} />
          <path d={edgeLeftAccent} style={drawStyle(edgeLeftAccentLen, edgeDraw, 1)} />
          <path d={edgeLeftScrollT} style={drawStyle(edgeLeftScrollTLen, edgeDraw, 1.5)} />
          <path d={edgeLeftMain} style={drawStyleHighlight(edgeLeftMainLen, edgeDraw, 0.8)} transform="translate(-1, -1)" />
        </g>

        {/* ===== SHIMMER OVERLAY LAYER ===== */}
        {frame > 25 && (
          <g mask="url(#shimmerMask)" opacity={interpolate(frame, [25, 35], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            {/* Re-render all main strokes in bright white for the shimmer sweep */}
            {/* Top-left corner */}
            <g transform="translate(10, 10)">
              <path d={cornerSpiral1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }} />
              <path d={cornerSpiral2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
              <path d={cornerTendril1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
              <path d={cornerTendril2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
              <path d={cornerAccent1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
            </g>
            {/* Top-right corner */}
            <g transform="translate(1080, 0) scale(-1, 1)">
              <g transform="translate(10, 10)">
                <path d={cornerSpiral1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerSpiral2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerAccent1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
              </g>
            </g>
            {/* Bottom-left corner */}
            <g transform="translate(0, 1920) scale(1, -1)">
              <g transform="translate(10, 10)">
                <path d={cornerSpiral1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerSpiral2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerAccent1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
              </g>
            </g>
            {/* Bottom-right corner */}
            <g transform="translate(1080, 1920) scale(-1, -1)">
              <g transform="translate(10, 10)">
                <path d={cornerSpiral1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerSpiral2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerTendril2} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                <path d={cornerAccent1} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
              </g>
            </g>
            {/* Top edge shimmer */}
            <path d={edgeTopMain} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
            {/* Bottom edge shimmer */}
            <g transform="translate(0, 1920) scale(1, -1)">
              <path d={edgeTopMain} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
            </g>
            {/* Left edge shimmer */}
            <path d={edgeLeftMain} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
            {/* Right edge shimmer */}
            <g transform="translate(1080, 0) scale(-1, 1)">
              <path d={edgeLeftMain} style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

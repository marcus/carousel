import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

const W = 1080;
const H = 1920;
const MARGIN = 70;
const INNER = MARGIN + 30;
const LINE_GAP = 8;
const ENTRANCE_DURATION = 20;

const MAIN_COLOR = "#E0DCD4";
const HIGHLIGHT_COLOR = "rgba(255,255,255,0.7)";
const SHADOW_COLOR = "#B0ACA4";

// Generate sunburst rays from a corner
function cornerSunburst(
  cx: number,
  cy: number,
  startAngle: number,
  rayLength: number,
  frame: number,
  cornerIndex: number,
) {
  const rayCount = 10;
  const angleSpan = Math.PI / 2;
  const rays: React.ReactNode[] = [];

  const fanProgress = interpolate(frame, [0, ENTRANCE_DURATION], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Idle pulse per corner (phase offset)
  const idlePhase = cornerIndex * Math.PI * 0.5;
  const idleOpacity =
    frame > ENTRANCE_DURATION
      ? 0.8 + 0.2 * Math.sin((frame - ENTRANCE_DURATION) * 0.08 + idlePhase)
      : 1;

  for (let i = 0; i < rayCount; i++) {
    const t = i / (rayCount - 1);
    const angle = startAngle + t * angleSpan * fanProgress;
    const x2 = cx + Math.cos(angle) * rayLength;
    const y2 = cy + Math.sin(angle) * rayLength;
    const thick = i % 2 === 0;

    rays.push(
      <line
        key={`sunburst-${cornerIndex}-main-${i}`}
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke={MAIN_COLOR}
        strokeWidth={thick ? 3 : 1}
        strokeLinecap="square"
        opacity={idleOpacity * fanProgress}
      />,
    );
    // Highlight ray (offset slightly)
    if (thick) {
      rays.push(
        <line
          key={`sunburst-${cornerIndex}-hl-${i}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle) * (rayLength * 0.85)}
          y2={cy + Math.sin(angle) * (rayLength * 0.85)}
          stroke={HIGHLIGHT_COLOR}
          strokeWidth={1}
          strokeLinecap="square"
          opacity={idleOpacity * fanProgress * 0.6}
        />,
      );
    }
  }

  return <g key={`sunburst-group-${cornerIndex}`}>{rays}</g>;
}

// Build a stepped path along an edge
// direction: 'h' horizontal, 'v' vertical
// start/end: coordinates along the main axis
// crossBase: base cross-axis coordinate
// stepInward: +/- direction for stepping inward
function steppedEdgePath(
  direction: "h" | "v",
  start: number,
  end: number,
  crossBase: number,
  stepInward: number,
  offset: number,
): string {
  const stepDepth = 10;
  const segmentCount = 5;
  const totalLen = end - start;
  const segLen = totalLen / segmentCount;
  const cross = crossBase + offset;

  const points: [number, number][] = [];

  for (let i = 0; i < segmentCount; i++) {
    const segStart = start + i * segLen;
    const segMid1 = segStart + segLen * 0.3;
    const segMid2 = segStart + segLen * 0.7;
    const segEnd = segStart + segLen;

    if (direction === "h") {
      points.push([segStart, cross]);
      points.push([segMid1, cross]);
      points.push([segMid1, cross + stepInward * stepDepth]);
      points.push([segMid2, cross + stepInward * stepDepth]);
      points.push([segMid2, cross]);
      points.push([segEnd, cross]);
    } else {
      points.push([cross, segStart]);
      points.push([cross, segMid1]);
      points.push([cross + stepInward * stepDepth, segMid1]);
      points.push([cross + stepInward * stepDepth, segMid2]);
      points.push([cross, segMid2]);
      points.push([cross, segEnd]);
    }
  }

  return (
    "M " + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")
  );
}

// Chevron accent at edge midpoint
function chevronAccent(
  cx: number,
  cy: number,
  direction: "up" | "down" | "left" | "right",
): React.ReactNode[] {
  const chevrons: React.ReactNode[] = [];
  const sizes = [12, 8, 4];
  const colors = [SHADOW_COLOR, MAIN_COLOR, HIGHLIGHT_COLOR];

  for (let i = 0; i < 3; i++) {
    const s = sizes[i] ?? 8;
    const spread = s * 1.5;
    let d: string;

    switch (direction) {
      case "down":
        d = `M ${cx - spread} ${cy - s} L ${cx} ${cy + s} L ${cx + spread} ${cy - s}`;
        break;
      case "up":
        d = `M ${cx - spread} ${cy + s} L ${cx} ${cy - s} L ${cx + spread} ${cy + s}`;
        break;
      case "right":
        d = `M ${cx - s} ${cy - spread} L ${cx + s} ${cy} L ${cx - s} ${cy + spread}`;
        break;
      case "left":
        d = `M ${cx + s} ${cy - spread} L ${cx - s} ${cy} L ${cx + s} ${cy + spread}`;
        break;
    }

    chevrons.push(
      <path
        key={`chevron-${direction}-${i}`}
        d={d}
        fill="none"
        stroke={colors[i] ?? MAIN_COLOR}
        strokeWidth={i === 1 ? 2 : 1}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />,
    );
  }

  return chevrons;
}

// Compute total path length estimate for dash animation
function estimatePathLength(d: string): number {
  const coords = d.match(/[\d.]+/g);
  if (!coords || coords.length < 4) return 0;
  let len = 0;
  for (let i = 2; i + 1 < coords.length; i += 2) {
    const currX = parseFloat(coords[i] ?? "0");
    const prevX = parseFloat(coords[i - 2] ?? "0");
    const currY = parseFloat(coords[i + 1] ?? "0");
    const prevY = parseFloat(coords[i - 1] ?? "0");
    const dx = currX - prevX;
    const dy = currY - prevY;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

export const GeometricDecoBorder: React.FC<BorderOverlayProps> = ({
  color,
}) => {
  const frame = useCurrentFrame();
  const mainColor = color || MAIN_COLOR;

  const drawProgress = interpolate(frame, [0, ENTRANCE_DURATION], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Corner fan radius
  const fanRadius = 80;

  // Corner sunburst positions: [cx, cy, startAngle, cornerIndex]
  const corners: [number, number, number, number][] = [
    [MARGIN, MARGIN, 0, 0], // top-left: rays go right and down
    [W - MARGIN, MARGIN, Math.PI / 2, 1], // top-right: rays go down and left
    [W - MARGIN, H - MARGIN, Math.PI, 2], // bottom-right: rays go left and up
    [MARGIN, H - MARGIN, (3 * Math.PI) / 2, 3], // bottom-left: rays go up and right
  ];

  // Stepped edge paths (outer and inner parallel lines)
  const edgeConfigs: {
    dir: "h" | "v";
    start: number;
    end: number;
    cross: number;
    inward: number;
  }[] = [
    // Top edge
    {
      dir: "h",
      start: MARGIN + fanRadius * 0.7,
      end: W - MARGIN - fanRadius * 0.7,
      cross: MARGIN,
      inward: 1,
    },
    // Bottom edge
    {
      dir: "h",
      start: MARGIN + fanRadius * 0.7,
      end: W - MARGIN - fanRadius * 0.7,
      cross: H - MARGIN,
      inward: -1,
    },
    // Left edge
    {
      dir: "v",
      start: MARGIN + fanRadius * 0.7,
      end: H - MARGIN - fanRadius * 0.7,
      cross: MARGIN,
      inward: 1,
    },
    // Right edge
    {
      dir: "v",
      start: MARGIN + fanRadius * 0.7,
      end: H - MARGIN - fanRadius * 0.7,
      cross: W - MARGIN,
      inward: -1,
    },
  ];

  const edgePaths: React.ReactNode[] = [];

  edgeConfigs.forEach((cfg, edgeIdx) => {
    // Two parallel lines per edge
    [0, LINE_GAP].forEach((offset, lineIdx) => {
      const adjustedOffset = cfg.inward > 0 ? offset : -offset;
      const d = steppedEdgePath(
        cfg.dir,
        cfg.start,
        cfg.end,
        cfg.cross,
        cfg.inward,
        adjustedOffset,
      );
      const totalLen = estimatePathLength(d);
      const dashOffset = totalLen * (1 - drawProgress);
      const strokeColor = lineIdx === 0 ? mainColor : SHADOW_COLOR;

      edgePaths.push(
        <path
          key={`edge-${edgeIdx}-line-${lineIdx}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={lineIdx === 0 ? 2 : 1.5}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray={totalLen}
          strokeDashoffset={dashOffset}
        />,
      );
    });

    // Highlight line (thinner, between the two parallel lines)
    const hlOffset = cfg.inward > 0 ? LINE_GAP / 2 : -LINE_GAP / 2;
    const hlD = steppedEdgePath(
      cfg.dir,
      cfg.start,
      cfg.end,
      cfg.cross,
      cfg.inward,
      hlOffset,
    );
    const hlLen = estimatePathLength(hlD);
    const hlDashOffset = hlLen * (1 - drawProgress);

    edgePaths.push(
      <path
        key={`edge-${edgeIdx}-highlight`}
        d={hlD}
        fill="none"
        stroke={HIGHLIGHT_COLOR}
        strokeWidth={0.5}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray={hlLen}
        strokeDashoffset={hlDashOffset}
      />,
    );
  });

  // Chevron accents at midpoints
  const chevronOpacity = interpolate(frame, [10, ENTRANCE_DURATION], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const chevronElements = (
    <g opacity={chevronOpacity}>
      {/* Top midpoint */}
      {chevronAccent(W / 2, MARGIN + 15, "down")}
      {/* Bottom midpoint */}
      {chevronAccent(W / 2, H - MARGIN - 15, "up")}
      {/* Left midpoint */}
      {chevronAccent(MARGIN + 15, H / 2, "right")}
      {/* Right midpoint */}
      {chevronAccent(W - MARGIN - 15, H / 2, "left")}
    </g>
  );

  // Small decorative inner corner brackets
  const bracketSize = 25;
  const bracketInset = INNER;
  const cornerBrackets = (
    <g opacity={drawProgress} stroke={MAIN_COLOR} strokeWidth={1.5} strokeLinecap="square" fill="none">
      {/* Top-left */}
      <polyline points={`${bracketInset + bracketSize},${bracketInset} ${bracketInset},${bracketInset} ${bracketInset},${bracketInset + bracketSize}`} />
      {/* Top-right */}
      <polyline points={`${W - bracketInset - bracketSize},${bracketInset} ${W - bracketInset},${bracketInset} ${W - bracketInset},${bracketInset + bracketSize}`} />
      {/* Bottom-right */}
      <polyline points={`${W - bracketInset - bracketSize},${H - bracketInset} ${W - bracketInset},${H - bracketInset} ${W - bracketInset},${H - bracketInset - bracketSize}`} />
      {/* Bottom-left */}
      <polyline points={`${bracketInset + bracketSize},${H - bracketInset} ${bracketInset},${H - bracketInset} ${bracketInset},${H - bracketInset - bracketSize}`} />
    </g>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Corner sunbursts */}
        {corners.map(([cx, cy, startAngle, idx]) =>
          cornerSunburst(cx, cy, startAngle, fanRadius, frame, idx),
        )}

        {/* Stepped edge lines (parallel pairs + highlight) */}
        {edgePaths}

        {/* Chevron accents at edge midpoints */}
        {chevronElements}

        {/* Inner corner brackets */}
        {cornerBrackets}
      </svg>
    </AbsoluteFill>
  );
};

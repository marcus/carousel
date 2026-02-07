import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

// Soft greens for leaves
const LEAF_COLORS = ["#7CAA7E", "#9BC49E", "#5E8A60"];
// Muted pinks/peach for flowers
const FLOWER_COLORS = ["#E8A0A0", "#F0C0B0", "#D4788A"];
// Golden accents for berries
const BERRY_COLOR = "#D4B870";

// Deterministic pseudo-random from seed
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// --- Element data generators ---

interface LeafData {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
  color: string;
  opacity: number;
}

interface FlowerData {
  cx: number;
  cy: number;
  petalLength: number;
  petalWidth: number;
  color: string;
  centerColor: string;
  rotation: number;
  opacity: number;
}

interface BerryData {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

interface SprigData {
  x: number;
  y: number;
  angle: number;
  leaves: LeafData[];
  berries: BerryData[];
}

// Generate a single leaf
const makeLeaf = (
  cx: number,
  cy: number,
  seed: number,
  sizeMin = 12,
  sizeMax = 28
): LeafData => {
  const s = seeded(seed);
  const rx = sizeMin + s * (sizeMax - sizeMin);
  const ry = rx * (0.35 + seeded(seed + 1) * 0.2);
  return {
    cx,
    cy,
    rx,
    ry,
    angle: seeded(seed + 2) * 360,
    color:
      LEAF_COLORS[Math.floor(seeded(seed + 3) * LEAF_COLORS.length)] ??
      LEAF_COLORS[0]!,
    opacity: 0.7 + seeded(seed + 4) * 0.15,
  };
};

// Generate a flower (returns data, rendered separately)
const makeFlower = (
  cx: number,
  cy: number,
  seed: number,
  size = 14
): FlowerData => ({
  cx,
  cy,
  petalLength: size,
  petalWidth: size * 0.4,
  color:
    FLOWER_COLORS[Math.floor(seeded(seed) * FLOWER_COLORS.length)] ??
    FLOWER_COLORS[0]!,
  centerColor: "#F5E6B8",
  rotation: seeded(seed + 1) * 72,
  opacity: 0.75 + seeded(seed + 2) * 0.1,
});

// Generate a berry
const makeBerry = (cx: number, cy: number, seed: number): BerryData => ({
  cx,
  cy,
  r: 3 + seeded(seed) * 3,
  opacity: 0.75 + seeded(seed + 1) * 0.1,
});

// --- Corner bouquet data ---
// Each corner has a cluster of leaves, flowers, and berries offset from the corner point.

interface CornerBouquet {
  leaves: LeafData[];
  flowers: FlowerData[];
  berries: BerryData[];
}

const buildCornerBouquet = (
  ox: number,
  oy: number,
  angleBias: number,
  seed: number
): CornerBouquet => {
  const leaves: LeafData[] = [];
  const flowers: FlowerData[] = [];
  const berries: BerryData[] = [];

  // 7 leaves scattered around origin
  for (let i = 0; i < 7; i++) {
    const a = angleBias + (seeded(seed + i * 7) - 0.5) * 120;
    const dist = 20 + seeded(seed + i * 7 + 1) * 40;
    const rad = (a * Math.PI) / 180;
    leaves.push(
      makeLeaf(
        ox + Math.cos(rad) * dist,
        oy + Math.sin(rad) * dist,
        seed + i * 10,
        18,
        42
      )
    );
  }

  // 3 flowers
  for (let i = 0; i < 3; i++) {
    const a = angleBias + (seeded(seed + 80 + i * 5) - 0.5) * 90;
    const dist = 15 + seeded(seed + 81 + i * 5) * 30;
    const rad = (a * Math.PI) / 180;
    flowers.push(
      makeFlower(
        ox + Math.cos(rad) * dist,
        oy + Math.sin(rad) * dist,
        seed + 100 + i * 10,
        10 + seeded(seed + 82 + i * 5) * 8
      )
    );
  }

  // 2 berries
  for (let i = 0; i < 2; i++) {
    const a = angleBias + (seeded(seed + 200 + i * 3) - 0.5) * 100;
    const dist = 25 + seeded(seed + 201 + i * 3) * 35;
    const rad = (a * Math.PI) / 180;
    berries.push(
      makeBerry(
        ox + Math.cos(rad) * dist,
        oy + Math.sin(rad) * dist,
        seed + 210 + i * 10
      )
    );
  }

  return { leaves, flowers, berries };
};

// --- Edge sprig data ---
const buildEdgeSprig = (
  x: number,
  y: number,
  angle: number,
  seed: number
): SprigData => {
  const leaves: LeafData[] = [];
  const berries: BerryData[] = [];
  const count = 2 + Math.floor(seeded(seed) * 2); // 2-3 leaves
  for (let i = 0; i < count; i++) {
    const a = angle + (seeded(seed + i * 5 + 1) - 0.5) * 60;
    const dist = 8 + seeded(seed + i * 5 + 2) * 18;
    const rad = (a * Math.PI) / 180;
    leaves.push(
      makeLeaf(
        x + Math.cos(rad) * dist,
        y + Math.sin(rad) * dist,
        seed + i * 10 + 50,
        10,
        22
      )
    );
  }
  // Occasionally a berry
  if (seeded(seed + 40) > 0.4) {
    const a = angle + (seeded(seed + 41) - 0.5) * 40;
    const dist = 12 + seeded(seed + 42) * 14;
    const rad = (a * Math.PI) / 180;
    berries.push(
      makeBerry(x + Math.cos(rad) * dist, y + Math.sin(rad) * dist, seed + 45)
    );
  }
  return { x, y, angle, leaves, berries };
};

// --- Build all static data once ---

// Corners: top-left, top-right, bottom-right, bottom-left
const CORNER_CONFIGS: {
  ox: number;
  oy: number;
  angleBias: number;
  seed: number;
}[] = [
  { ox: 85, oy: 85, angleBias: 135, seed: 1000 },
  { ox: 995, oy: 85, angleBias: 225, seed: 2000 },
  { ox: 995, oy: 1835, angleBias: 315, seed: 3000 },
  { ox: 85, oy: 1835, angleBias: 45, seed: 4000 },
];

const CORNER_BOUQUETS: CornerBouquet[] = CORNER_CONFIGS.map((c) =>
  buildCornerBouquet(c.ox, c.oy, c.angleBias, c.seed)
);

// Edge sprigs along each edge
const EDGE_SPRIGS: SprigData[] = [];

// Top edge
for (let i = 0; i < 5; i++) {
  const t = 0.15 + (i / 4) * 0.7;
  EDGE_SPRIGS.push(
    buildEdgeSprig(1080 * t, 40 + seeded(5000 + i) * 30, 180, 5000 + i * 100)
  );
}
// Bottom edge
for (let i = 0; i < 5; i++) {
  const t = 0.15 + (i / 4) * 0.7;
  EDGE_SPRIGS.push(
    buildEdgeSprig(
      1080 * t,
      1880 + seeded(6000 + i) * 30,
      0,
      6000 + i * 100
    )
  );
}
// Left edge
for (let i = 0; i < 8; i++) {
  const t = 0.08 + (i / 7) * 0.84;
  EDGE_SPRIGS.push(
    buildEdgeSprig(
      30 + seeded(7000 + i) * 30,
      1920 * t,
      90,
      7000 + i * 100
    )
  );
}
// Right edge
for (let i = 0; i < 8; i++) {
  const t = 0.08 + (i / 7) * 0.84;
  EDGE_SPRIGS.push(
    buildEdgeSprig(
      1020 + seeded(8000 + i) * 30,
      1920 * t,
      270,
      8000 + i * 100
    )
  );
}

// --- SVG rendering helpers ---

const RenderLeaf: React.FC<{
  leaf: LeafData;
  animOpacity: number;
  animScale: number;
}> = ({ leaf, animOpacity, animScale }) => (
  <ellipse
    cx={leaf.cx}
    cy={leaf.cy}
    rx={leaf.rx * animScale}
    ry={leaf.ry * animScale}
    fill={leaf.color}
    opacity={leaf.opacity * animOpacity}
    transform={`rotate(${leaf.angle}, ${leaf.cx}, ${leaf.cy})`}
  />
);

const RenderFlower: React.FC<{
  flower: FlowerData;
  animOpacity: number;
  animScale: number;
}> = ({ flower, animOpacity, animScale }) => {
  const petals = [];
  for (let p = 0; p < 5; p++) {
    const angle = flower.rotation + p * 72;
    const rad = (angle * Math.PI) / 180;
    const px = flower.cx + Math.cos(rad) * flower.petalLength * 0.5 * animScale;
    const py = flower.cy + Math.sin(rad) * flower.petalLength * 0.5 * animScale;
    petals.push(
      <ellipse
        key={p}
        cx={px}
        cy={py}
        rx={flower.petalWidth * animScale}
        ry={flower.petalLength * 0.5 * animScale}
        fill={flower.color}
        opacity={flower.opacity * animOpacity}
        transform={`rotate(${angle}, ${px}, ${py})`}
      />
    );
  }
  return (
    <g>
      {petals}
      <circle
        cx={flower.cx}
        cy={flower.cy}
        r={3.5 * animScale}
        fill={flower.centerColor}
        opacity={0.85 * animOpacity}
      />
    </g>
  );
};

const RenderBerry: React.FC<{
  berry: BerryData;
  animOpacity: number;
  animScale: number;
}> = ({ berry, animOpacity, animScale }) => (
  <circle
    cx={berry.cx}
    cy={berry.cy}
    r={berry.r * animScale}
    fill={BERRY_COLOR}
    opacity={berry.opacity * animOpacity}
  />
);

// --- Main component ---

export const BotanicalWreathBorder: React.FC<BorderOverlayProps> = () => {
  const frame = useCurrentFrame();

  // Idle sway: subtle rotation oscillation
  const swayAngle = Math.sin(frame * 0.03) * 0.3;

  // Helper to compute entrance animation for an element given its stagger index
  // Corner elements: entrance frames 0-20, edge elements: 10-30
  const cornerAnim = (index: number) => {
    const delay = index * 0.8;
    const opacity = interpolate(frame, [0 + delay, 18 + delay], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const scale = interpolate(frame, [0 + delay, 18 + delay], [0.6, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { opacity, scale };
  };

  const edgeAnim = (index: number) => {
    const delay = 10 + index * 0.6;
    const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const scale = interpolate(frame, [delay, delay + 18], [0.5, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { opacity, scale };
  };

  // Flatten element index counter for stagger
  let cornerIdx = 0;
  let edgeIdx = 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <g transform={`rotate(${swayAngle}, 540, 960)`}>
          {/* Corner bouquets */}
          {CORNER_BOUQUETS.map((bouquet, ci) => {
            return (
              <g key={`corner-${ci}`}>
                {bouquet.leaves.map((leaf, li) => {
                  const idx = cornerIdx++;
                  const anim = cornerAnim(idx);
                  return (
                    <RenderLeaf
                      key={`cl-${ci}-${li}`}
                      leaf={leaf}
                      animOpacity={anim.opacity}
                      animScale={anim.scale}
                    />
                  );
                })}
                {bouquet.flowers.map((flower, fi) => {
                  const idx = cornerIdx++;
                  const anim = cornerAnim(idx);
                  return (
                    <RenderFlower
                      key={`cf-${ci}-${fi}`}
                      flower={flower}
                      animOpacity={anim.opacity}
                      animScale={anim.scale}
                    />
                  );
                })}
                {bouquet.berries.map((berry, bi) => {
                  const idx = cornerIdx++;
                  const anim = cornerAnim(idx);
                  return (
                    <RenderBerry
                      key={`cb-${ci}-${bi}`}
                      berry={berry}
                      animOpacity={anim.opacity}
                      animScale={anim.scale}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Edge sprigs */}
          {EDGE_SPRIGS.map((sprig, si) => (
            <g key={`sprig-${si}`}>
              {sprig.leaves.map((leaf, li) => {
                const idx = edgeIdx++;
                const anim = edgeAnim(idx);
                return (
                  <RenderLeaf
                    key={`sl-${si}-${li}`}
                    leaf={leaf}
                    animOpacity={anim.opacity}
                    animScale={anim.scale}
                  />
                );
              })}
              {sprig.berries.map((berry, bi) => {
                const idx = edgeIdx++;
                const anim = edgeAnim(idx);
                return (
                  <RenderBerry
                    key={`sb-${si}-${bi}`}
                    berry={berry}
                    animOpacity={anim.opacity}
                    animScale={anim.scale}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

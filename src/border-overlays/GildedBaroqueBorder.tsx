import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

export const GildedBaroqueBorder: React.FC<BorderOverlayProps> = ({
  color,
}) => {
  const frame = useCurrentFrame();

  // --- Entrance animation ---
  const cornerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const cornerScale = interpolate(frame, [0, 15], [1.02, 1], {
    extrapolateRight: "clamp",
  });
  const cornerBlur = interpolate(frame, [0, 15], [4, 0], {
    extrapolateRight: "clamp",
  });

  const edgeOpacity = interpolate(frame, [8, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const edgeScale = interpolate(frame, [8, 25], [1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const edgeBlur = interpolate(frame, [8, 25], [4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Shimmer animation (idle, loops every ~120 frames) ---
  const shimmerOffset = interpolate(frame % 180, [0, 180], [-0.5, 1.5]);

  // Override gold with custom color if provided
  const primaryGold = color || "#D4A843";
  const highlightGold = "#F0D878";
  const shadowGold = "#8B6914";
  const deepShadow = "#5C4510";

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      {/* Corner pieces layer */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: cornerOpacity,
          transform: `scale(${cornerScale})`,
          transformOrigin: "center center",
          filter: `blur(${cornerBlur}px)`,
        }}
      >
        <defs>
          {/* Primary gold gradient (diagonal) */}
          <linearGradient
            id="baroque-gold-main"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={highlightGold} />
            <stop offset="35%" stopColor={primaryGold} />
            <stop offset="70%" stopColor={shadowGold} />
            <stop offset="100%" stopColor={deepShadow} />
          </linearGradient>

          {/* Highlight gradient (for top surfaces) */}
          <linearGradient
            id="baroque-gold-highlight"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={highlightGold} />
            <stop offset="40%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={shadowGold} />
          </linearGradient>

          {/* Shadow gradient (for recessed areas) */}
          <linearGradient
            id="baroque-gold-shadow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={shadowGold} />
            <stop offset="50%" stopColor={deepShadow} />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Radial glow for shell motifs */}
          <radialGradient id="baroque-shell-glow" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={highlightGold} />
            <stop offset="50%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={shadowGold} />
          </radialGradient>

          {/* Animated shimmer gradient */}
          <linearGradient
            id="baroque-shimmer"
            x1={`${shimmerOffset * 100}%`}
            y1="0%"
            x2={`${(shimmerOffset + 0.3) * 100}%`}
            y2="100%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(255,235,170,0.0)" />
            <stop offset="50%" stopColor="rgba(255,235,170,0.35)" />
            <stop offset="60%" stopColor="rgba(255,235,170,0.0)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Inner bevel highlight */}
          <linearGradient
            id="baroque-bevel-light"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={highlightGold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={primaryGold} stopOpacity="0.3" />
          </linearGradient>

          {/* ===== CORNER CARTOUCHE (top-left, ~180x180) ===== */}
          <g id="corner-cartouche">
            {/* Deep shadow base layer */}
            <path
              d="M0,0 L180,0 L180,20 C160,20 140,25 120,40 C100,55 85,75 75,95
                 C65,115 55,140 40,155 C25,170 20,175 0,180 L0,0 Z"
              fill={deepShadow}
              opacity="0.6"
            />

            {/* Main acanthus scroll 1 - large outer sweep */}
            <path
              d="M0,0 L170,0 C165,8 155,18 140,30
                 C120,46 100,58 82,72
                 C64,86 50,105 40,125
                 C30,145 22,158 12,168
                 L0,175 Z"
              fill="url(#baroque-gold-main)"
              stroke={shadowGold}
              strokeWidth="1.5"
            />

            {/* Acanthus leaf 1 - top sweep */}
            <path
              d="M15,0 C15,15 20,28 30,38
                 C40,48 55,52 70,50
                 C85,48 95,40 100,30
                 C105,20 108,10 110,0
                 L80,0 C78,8 72,16 64,20
                 C56,24 46,22 38,16
                 C30,10 24,4 20,0 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={shadowGold}
              strokeWidth="0.8"
            />

            {/* Acanthus leaf 2 - curving down right */}
            <path
              d="M120,0 C118,12 112,25 102,38
                 C92,51 80,60 68,68
                 C56,76 48,82 44,92
                 C40,102 42,108 48,112
                 C54,116 62,114 70,108
                 C78,102 86,92 92,80
                 C98,68 104,54 110,42
                 C116,30 125,16 135,6
                 L155,0 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={primaryGold}
              strokeWidth="1"
            />

            {/* Volute spiral - tight curl at corner */}
            <path
              d="M8,8 C12,12 18,20 22,32
                 C26,44 24,56 18,64
                 C12,72 8,74 6,70
                 C4,66 6,58 12,52
                 C18,46 22,42 22,36
                 C22,30 18,24 14,18
                 C10,12 8,10 8,8 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={highlightGold}
              strokeWidth="0.5"
            />

            {/* Shell/Fan motif at apex */}
            <path
              d="M0,0 C8,8 18,22 24,38
                 C18,32 10,28 4,30
                 C-2,32 0,38 6,42
                 C12,46 22,44 28,36
                 C34,28 32,18 26,12
                 C20,6 12,2 0,0 Z"
              fill="url(#baroque-shell-glow)"
              stroke={highlightGold}
              strokeWidth="0.6"
            />

            {/* Shell fan ribs */}
            <path
              d="M2,2 L20,35 M4,1 L26,30 M8,0 L30,24 M14,0 L32,18 M22,0 L34,14"
              fill="none"
              stroke={highlightGold}
              strokeWidth="0.5"
              opacity="0.6"
            />

            {/* Acanthus leaf 3 - left side curl */}
            <path
              d="M0,25 C6,30 14,40 18,55
                 C22,70 20,85 14,96
                 C8,107 4,112 2,108
                 C0,104 4,94 10,84
                 C16,74 18,64 16,54
                 C14,44 8,36 0,30 Z"
              fill="url(#baroque-gold-main)"
              stroke={shadowGold}
              strokeWidth="0.8"
            />

            {/* Acanthus leaf 4 - secondary scroll */}
            <path
              d="M55,0 C52,10 48,22 42,32
                 C36,42 28,48 22,50
                 C16,52 14,48 18,42
                 C22,36 30,30 36,22
                 C42,14 48,6 52,0 Z"
              fill="url(#baroque-bevel-light)"
              stroke={primaryGold}
              strokeWidth="0.6"
            />

            {/* Inner detail leaf curls */}
            <path
              d="M0,60 C8,62 16,70 20,82
                 C24,94 20,106 14,114
                 C8,122 4,124 2,118
                 C0,112 4,102 10,94
                 C16,86 16,78 12,72
                 C8,66 4,62 0,60 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={shadowGold}
              strokeWidth="0.6"
              opacity="0.8"
            />

            {/* Highlight accent on top surface */}
            <path
              d="M0,0 L150,0 C140,6 125,16 110,28
                 C95,40 82,50 72,58
                 C62,66 50,78 42,90
                 L38,84 C46,72 56,62 68,52
                 C80,42 94,32 108,22
                 C122,12 135,4 140,0 L0,0 Z"
              fill={highlightGold}
              opacity="0.25"
            />

            {/* Bottom leaf tendril */}
            <path
              d="M0,120 C6,118 14,120 20,128
                 C26,136 28,148 24,158
                 C20,168 14,172 8,170
                 C2,168 0,160 4,152
                 C8,144 12,138 12,132
                 C12,126 8,122 0,120 Z"
              fill="url(#baroque-gold-main)"
              stroke={shadowGold}
              strokeWidth="0.6"
            />

            {/* Decorative bead along inner edge */}
            <circle cx="60" cy="62" r="3" fill={highlightGold} opacity="0.5" />
            <circle cx="48" cy="78" r="2.5" fill={highlightGold} opacity="0.4" />
            <circle cx="38" cy="96" r="2" fill={highlightGold} opacity="0.35" />
            <circle cx="30" cy="112" r="2" fill={highlightGold} opacity="0.3" />
          </g>

          {/* ===== EDGE MOLDING UNIT (vertical, ~60px wide, ~200px tall) ===== */}
          <g id="edge-molding-vertical">
            {/* Scroll body */}
            <path
              d="M0,0 C15,-5 30,5 35,20
                 C40,35 35,55 25,70
                 C15,85 8,95 5,110
                 C2,125 5,140 15,150
                 C25,160 35,165 40,175
                 C45,185 40,195 30,200
                 C20,200 10,195 5,185
                 C0,175 0,165 5,155
                 C10,145 18,140 22,130
                 C26,120 24,108 18,98
                 C12,88 5,80 2,68
                 C-1,56 0,42 5,30
                 C10,18 8,8 0,0 Z"
              fill="url(#baroque-gold-main)"
              stroke={shadowGold}
              strokeWidth="1"
            />
            {/* Leaf accent */}
            <path
              d="M10,30 C16,25 24,28 28,38
                 C32,48 28,60 22,68
                 C16,76 12,72 14,64
                 C16,56 20,48 20,40
                 C20,32 16,28 10,30 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={highlightGold}
              strokeWidth="0.5"
            />
            {/* Small volute */}
            <path
              d="M15,140 C20,136 26,138 28,145
                 C30,152 26,158 20,160
                 C14,162 12,156 14,150
                 C16,144 18,140 15,140 Z"
              fill="url(#baroque-shell-glow)"
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            {/* Highlight */}
            <path
              d="M8,10 C14,5 22,12 26,25
                 C22,15 16,10 10,12
                 C6,14 6,18 8,10 Z"
              fill={highlightGold}
              opacity="0.4"
            />
          </g>

          {/* ===== EDGE MOLDING UNIT (horizontal, ~200px wide, ~60px tall) ===== */}
          <g id="edge-molding-horizontal">
            <path
              d="M0,0 C-5,15 5,30 20,35
                 C35,40 55,35 70,25
                 C85,15 95,8 110,5
                 C125,2 140,5 150,15
                 C160,25 165,35 175,40
                 C185,45 195,40 200,30
                 C200,20 195,10 185,5
                 C175,0 165,0 155,5
                 C145,10 140,18 130,22
                 C120,26 108,24 98,18
                 C88,12 80,5 68,2
                 C56,-1 42,0 30,5
                 C18,10 8,8 0,0 Z"
              fill="url(#baroque-gold-main)"
              stroke={shadowGold}
              strokeWidth="1"
            />
            {/* Leaf accent */}
            <path
              d="M30,10 C25,16 28,24 38,28
                 C48,32 60,28 68,22
                 C76,16 72,12 64,14
                 C56,16 48,20 40,20
                 C32,20 28,16 30,10 Z"
              fill="url(#baroque-gold-highlight)"
              stroke={highlightGold}
              strokeWidth="0.5"
            />
            {/* Small volute */}
            <path
              d="M140,15 C136,20 138,26 145,28
                 C152,30 158,26 160,20
                 C162,14 156,12 150,14
                 C144,16 140,18 140,15 Z"
              fill="url(#baroque-shell-glow)"
              stroke={primaryGold}
              strokeWidth="0.5"
            />
          </g>
        </defs>

        {/* ============================================= */}
        {/* CORNER CARTOUCHES                             */}
        {/* ============================================= */}

        {/* Top-Left Corner */}
        <g transform="translate(0, 0)">
          <use href="#corner-cartouche" />
        </g>

        {/* Top-Right Corner (mirrored horizontally) */}
        <g transform="scale(-1, 1) translate(-1080, 0)">
          <use href="#corner-cartouche" />
        </g>

        {/* Bottom-Left Corner (mirrored vertically) */}
        <g transform="scale(1, -1) translate(0, -1920)">
          <use href="#corner-cartouche" />
        </g>

        {/* Bottom-Right Corner (mirrored both) */}
        <g transform="scale(-1, -1) translate(-1080, -1920)">
          <use href="#corner-cartouche" />
        </g>

        {/* ============================================= */}
        {/* EDGE MOLDINGS - TOP EDGE                      */}
        {/* ============================================= */}
        <g transform="translate(280, 4)">
          <use href="#edge-molding-horizontal" />
        </g>
        <g transform="translate(520, 4)">
          <use href="#edge-molding-horizontal" />
        </g>

        {/* ============================================= */}
        {/* EDGE MOLDINGS - BOTTOM EDGE                   */}
        {/* ============================================= */}
        <g transform="scale(1, -1) translate(0, -1920)">
          <g transform="translate(280, 4)">
            <use href="#edge-molding-horizontal" />
          </g>
          <g transform="translate(520, 4)">
            <use href="#edge-molding-horizontal" />
          </g>
        </g>

        {/* ============================================= */}
        {/* EDGE MOLDINGS - LEFT EDGE                     */}
        {/* ============================================= */}
        <g transform="translate(4, 280)">
          <use href="#edge-molding-vertical" />
        </g>
        <g transform="translate(4, 580)">
          <use href="#edge-molding-vertical" />
        </g>
        <g transform="translate(4, 880)">
          <use href="#edge-molding-vertical" />
        </g>
        <g transform="translate(4, 1180)">
          <use href="#edge-molding-vertical" />
        </g>

        {/* ============================================= */}
        {/* EDGE MOLDINGS - RIGHT EDGE                    */}
        {/* ============================================= */}
        <g transform="scale(-1, 1) translate(-1080, 0)">
          <g transform="translate(4, 280)">
            <use href="#edge-molding-vertical" />
          </g>
          <g transform="translate(4, 580)">
            <use href="#edge-molding-vertical" />
          </g>
          <g transform="translate(4, 880)">
            <use href="#edge-molding-vertical" />
          </g>
          <g transform="translate(4, 1180)">
            <use href="#edge-molding-vertical" />
          </g>
        </g>

        {/* ============================================= */}
        {/* OUTER FRAME BORDER LINES                      */}
        {/* ============================================= */}

        {/* Outer border - thick */}
        <rect
          x="2"
          y="2"
          width="1076"
          height="1916"
          rx="4"
          ry="4"
          fill="none"
          stroke="url(#baroque-gold-main)"
          strokeWidth="4"
        />

        {/* Inner accent line */}
        <rect
          x="10"
          y="10"
          width="1060"
          height="1900"
          rx="3"
          ry="3"
          fill="none"
          stroke={primaryGold}
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Bead molding dots along inner frame */}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle
            key={`bead-top-${i}`}
            cx={60 + i * 40}
            cy="18"
            r="2.5"
            fill={highlightGold}
            opacity="0.4"
          />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle
            key={`bead-bottom-${i}`}
            cx={60 + i * 40}
            cy="1902"
            r="2.5"
            fill={highlightGold}
            opacity="0.4"
          />
        ))}
        {Array.from({ length: 44 }).map((_, i) => (
          <circle
            key={`bead-left-${i}`}
            cx="18"
            cy={60 + i * 42}
            r="2.5"
            fill={highlightGold}
            opacity="0.4"
          />
        ))}
        {Array.from({ length: 44 }).map((_, i) => (
          <circle
            key={`bead-right-${i}`}
            cx="1062"
            cy={60 + i * 42}
            r="2.5"
            fill={highlightGold}
            opacity="0.4"
          />
        ))}
      </svg>

      {/* Edge molding layer (separate for staggered entrance) */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: edgeOpacity,
          transform: `scale(${edgeScale})`,
          transformOrigin: "center center",
          filter: `blur(${edgeBlur}px)`,
        }}
      >
        {/* Additional decorative elements between corners and edge molding */}

        {/* Top-left connector flourish */}
        <path
          d="M180,12 C200,8 220,10 235,16 C250,22 260,14 270,8"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M12,180 C8,200 10,220 16,235 C22,250 14,260 8,270"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Top-right connector flourish */}
        <path
          d="M900,12 C880,8 860,10 845,16 C830,22 820,14 810,8"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M1068,180 C1072,200 1070,220 1064,235 C1058,250 1066,260 1072,270"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Bottom-left connector flourish */}
        <path
          d="M180,1908 C200,1912 220,1910 235,1904 C250,1898 260,1906 270,1912"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M12,1740 C8,1720 10,1700 16,1685 C22,1670 14,1660 8,1650"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Bottom-right connector flourish */}
        <path
          d="M900,1908 C880,1912 860,1910 845,1904 C830,1898 820,1906 810,1912"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />
        <path
          d="M1068,1740 C1072,1720 1070,1700 1064,1685 C1058,1670 1066,1660 1072,1650"
          fill="none"
          stroke={primaryGold}
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Center-edge rosettes (small accent between molding repeats) */}
        {/* Left edge */}
        <circle cx="22" cy="490" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="22" cy="790" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="22" cy="1090" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="22" cy="1390" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />

        {/* Right edge */}
        <circle cx="1058" cy="490" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="1058" cy="790" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="1058" cy="1090" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="1058" cy="1390" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />

        {/* Top edge */}
        <circle cx="490" cy="22" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="730" cy="22" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />

        {/* Bottom edge */}
        <circle cx="490" cy="1898" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
        <circle cx="730" cy="1898" r="6" fill="url(#baroque-shell-glow)" stroke={shadowGold} strokeWidth="0.8" />
      </svg>

      {/* Shimmer overlay layer */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: Math.min(cornerOpacity, edgeOpacity),
          mixBlendMode: "screen",
        }}
      >
        <defs>
          <linearGradient
            id="shimmer-sweep"
            x1={`${shimmerOffset * 100}%`}
            y1="0%"
            x2={`${(shimmerOffset + 0.25) * 100}%`}
            y2={`${(shimmerOffset + 0.4) * 100}%`}
          >
            <stop offset="0%" stopColor="rgba(255,235,170,0)" />
            <stop offset="45%" stopColor="rgba(255,235,170,0)" />
            <stop offset="50%" stopColor="rgba(255,235,170,0.4)" />
            <stop offset="55%" stopColor="rgba(255,235,170,0)" />
            <stop offset="100%" stopColor="rgba(255,235,170,0)" />
          </linearGradient>

          {/* Mask so shimmer only shows on border areas */}
          <mask id="border-mask">
            <rect width="1080" height="1920" fill="white" />
            <rect
              x="45"
              y="45"
              width="990"
              height="1830"
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>

        <rect
          width="1080"
          height="1920"
          fill="url(#shimmer-sweep)"
          mask="url(#border-mask)"
        />
      </svg>
    </AbsoluteFill>
  );
};

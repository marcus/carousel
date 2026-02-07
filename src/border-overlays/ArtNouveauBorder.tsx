import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BorderOverlayProps {
  color?: string;
}

export const ArtNouveauBorder: React.FC<BorderOverlayProps> = ({ color }) => {
  const frame = useCurrentFrame();

  // Draw-in animation: lines appear over first 20 frames
  const drawProgress = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Shimmer effect after entrance (sine-based oscillation)
  const shimmerPhase = Math.sin((frame - 20) * 0.08) * 0.5 + 0.5;
  const shimmerOpacity = frame > 20 ? interpolate(shimmerPhase, [0, 1], [0.0, 0.35]) : 0;

  // Overall fade-in
  const borderOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const mainGold = color || "#C9A84C";
  const lightGold = "#E8D48B";
  const shadowGold = "#A07828";

  // Helper: animated stroke props via dasharray/dashoffset
  const animatedStroke = (pathLength: number, delay = 0) => {
    const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
    return {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength * (1 - progress),
    };
  };

  // Path lengths (approximate for animation)
  const CORNER_LEN = 800;
  const EDGE_LEN = 1200;
  const TENDRIL_LEN = 400;
  const ACCENT_LEN = 250;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50, opacity: borderOpacity }}>
      {/* Gradient definitions & main border SVG */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          {/* Main gold gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={mainGold} />
            <stop offset="50%" stopColor={lightGold} />
            <stop offset="100%" stopColor={mainGold} />
          </linearGradient>
          {/* Shadow gradient */}
          <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={shadowGold} />
            <stop offset="100%" stopColor={mainGold} />
          </linearGradient>
          {/* Shimmer gradient (animated via opacity) */}
          <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="50%" stopColor="#FFF8C4" />
            <stop offset="100%" stopColor="#FFFDE0" />
          </linearGradient>
          {/* Vertical gold gradient for side edges */}
          <linearGradient id="goldGradV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={mainGold} />
            <stop offset="50%" stopColor={lightGold} />
            <stop offset="100%" stopColor={mainGold} />
          </linearGradient>
        </defs>

        {/* ===================== */}
        {/* TOP-LEFT CORNER      */}
        {/* ===================== */}
        {/* Main flourish: large spiral vine curving from top edge down and from left edge right */}
        <path
          d="
            M 40,160
            C 40,120 50,80 80,55
            Q 120,25 180,30
            C 220,32 240,60 230,90
            Q 218,125 180,120
            C 155,116 150,90 165,72
            Q 178,55 200,65
            M 80,55
            Q 60,45 55,30
            M 160,40
            C 140,15 110,10 90,20
            Q 70,30 65,55
            C 58,80 70,100 95,100
            Q 115,100 120,80
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...animatedStroke(CORNER_LEN, 0)}
        />
        {/* Secondary tendrils: smaller decorative curls */}
        <path
          d="
            M 30,200
            C 32,170 45,145 70,130
            Q 95,118 105,140
            C 112,158 95,168 80,158
            Q 68,148 75,135
            M 70,130
            C 50,115 38,95 42,70
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 3)}
        />
        {/* Leaf accent */}
        <path
          d="
            M 120,50
            Q 135,35 155,38
            C 165,40 168,52 158,58
            Q 145,66 130,55
            Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 2)}
        />
        {/* Extra spiral detail */}
        <path
          d="
            M 55,180
            C 60,165 75,155 90,160
            Q 105,165 100,180
            C 95,195 78,192 78,178
            M 42,110
            C 48,95 62,88 76,95
            Q 85,100 80,112
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 4)}
        />

        {/* ===================== */}
        {/* TOP-RIGHT CORNER     */}
        {/* ===================== */}
        <path
          d="
            M 1040,160
            C 1040,120 1030,80 1000,55
            Q 960,25 900,30
            C 860,32 840,60 850,90
            Q 862,125 900,120
            C 925,116 930,90 915,72
            Q 902,55 880,65
            M 1000,55
            Q 1020,45 1025,30
            M 920,40
            C 940,15 970,10 990,20
            Q 1010,30 1015,55
            C 1022,80 1010,100 985,100
            Q 965,100 960,80
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...animatedStroke(CORNER_LEN, 0)}
        />
        <path
          d="
            M 1050,200
            C 1048,170 1035,145 1010,130
            Q 985,118 975,140
            C 968,158 985,168 1000,158
            Q 1012,148 1005,135
            M 1010,130
            C 1030,115 1042,95 1038,70
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 3)}
        />
        <path
          d="
            M 960,50
            Q 945,35 925,38
            C 915,40 912,52 922,58
            Q 935,66 950,55
            Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 2)}
        />
        <path
          d="
            M 1025,180
            C 1020,165 1005,155 990,160
            Q 975,165 980,180
            C 985,195 1002,192 1002,178
            M 1038,110
            C 1032,95 1018,88 1004,95
            Q 995,100 1000,112
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 4)}
        />

        {/* ===================== */}
        {/* BOTTOM-LEFT CORNER   */}
        {/* ===================== */}
        <path
          d="
            M 40,1760
            C 40,1800 50,1840 80,1865
            Q 120,1895 180,1890
            C 220,1888 240,1860 230,1830
            Q 218,1795 180,1800
            C 155,1804 150,1830 165,1848
            Q 178,1865 200,1855
            M 80,1865
            Q 60,1875 55,1890
            M 160,1880
            C 140,1905 110,1910 90,1900
            Q 70,1890 65,1865
            C 58,1840 70,1820 95,1820
            Q 115,1820 120,1840
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...animatedStroke(CORNER_LEN, 0)}
        />
        <path
          d="
            M 30,1720
            C 32,1750 45,1775 70,1790
            Q 95,1802 105,1780
            C 112,1762 95,1752 80,1762
            Q 68,1772 75,1785
            M 70,1790
            C 50,1805 38,1825 42,1850
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 3)}
        />
        <path
          d="
            M 120,1870
            Q 135,1885 155,1882
            C 165,1880 168,1868 158,1862
            Q 145,1854 130,1865
            Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 2)}
        />
        <path
          d="
            M 55,1740
            C 60,1755 75,1765 90,1760
            Q 105,1755 100,1740
            C 95,1725 78,1728 78,1742
            M 42,1810
            C 48,1825 62,1832 76,1825
            Q 85,1820 80,1808
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 4)}
        />

        {/* ===================== */}
        {/* BOTTOM-RIGHT CORNER  */}
        {/* ===================== */}
        <path
          d="
            M 1040,1760
            C 1040,1800 1030,1840 1000,1865
            Q 960,1895 900,1890
            C 860,1888 840,1860 850,1830
            Q 862,1795 900,1800
            C 925,1804 930,1830 915,1848
            Q 902,1865 880,1855
            M 1000,1865
            Q 1020,1875 1025,1890
            M 920,1880
            C 940,1905 970,1910 990,1900
            Q 1010,1890 1015,1865
            C 1022,1840 1010,1820 985,1820
            Q 965,1820 960,1840
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...animatedStroke(CORNER_LEN, 0)}
        />
        <path
          d="
            M 1050,1720
            C 1048,1750 1035,1775 1010,1790
            Q 985,1802 975,1780
            C 968,1762 985,1752 1000,1762
            Q 1012,1772 1005,1785
            M 1010,1790
            C 1030,1805 1042,1825 1038,1850
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 3)}
        />
        <path
          d="
            M 960,1870
            Q 945,1885 925,1882
            C 915,1880 912,1868 922,1862
            Q 935,1854 950,1865
            Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 2)}
        />
        <path
          d="
            M 1025,1740
            C 1020,1755 1005,1765 990,1760
            Q 975,1755 980,1740
            C 985,1725 1002,1728 1002,1742
            M 1038,1810
            C 1032,1825 1018,1832 1004,1825
            Q 995,1820 1000,1808
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(TENDRIL_LEN, 4)}
        />

        {/* ===================== */}
        {/* TOP EDGE CONNECTOR   */}
        {/* ===================== */}
        <path
          d="
            M 200,35
            C 280,28 360,22 440,18
            Q 540,12 540,25
            Q 540,12 640,18
            C 720,22 800,28 880,35
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 5)}
        />
        {/* Top edge decorative arches */}
        <path
          d="
            M 260,40
            Q 290,20 320,38
            M 380,32
            Q 410,14 440,30
            M 500,25
            Q 540,8 580,25
            M 640,30
            Q 670,14 700,32
            M 760,38
            Q 790,20 820,40
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 7)}
        />
        {/* Top edge small leaf motifs */}
        <path
          d="
            M 340,28 Q 350,18 360,28 Q 350,35 340,28 Z
            M 530,16 Q 540,6 550,16 Q 540,23 530,16 Z
            M 720,28 Q 730,18 740,28 Q 730,35 720,28 Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 8)}
        />

        {/* ===================== */}
        {/* BOTTOM EDGE CONNECTOR */}
        {/* ===================== */}
        <path
          d="
            M 200,1885
            C 280,1892 360,1898 440,1902
            Q 540,1908 540,1895
            Q 540,1908 640,1902
            C 720,1898 800,1892 880,1885
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={3}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 5)}
        />
        <path
          d="
            M 260,1880
            Q 290,1900 320,1882
            M 380,1888
            Q 410,1906 440,1890
            M 500,1895
            Q 540,1912 580,1895
            M 640,1890
            Q 670,1906 700,1888
            M 760,1882
            Q 790,1900 820,1880
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 7)}
        />
        <path
          d="
            M 340,1892 Q 350,1902 360,1892 Q 350,1885 340,1892 Z
            M 530,1904 Q 540,1914 550,1904 Q 540,1897 530,1904 Z
            M 720,1892 Q 730,1902 740,1892 Q 730,1885 720,1892 Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 8)}
        />

        {/* ===================== */}
        {/* LEFT EDGE CONNECTOR  */}
        {/* ===================== */}
        <path
          d="
            M 35,220
            C 28,360 22,500 20,640
            Q 16,780 25,960
            Q 16,1140 20,1280
            C 22,1420 28,1560 35,1700
          "
          fill="none"
          stroke="url(#goldGradV)"
          strokeWidth={3}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 5)}
        />
        {/* Left edge flowing curves */}
        <path
          d="
            M 38,300
            Q 18,340 36,380
            M 32,480
            Q 12,520 30,560
            M 28,660
            Q 8,720 26,780
            M 28,880
            Q 8,940 26,1000
            M 30,1100
            Q 12,1140 32,1180
            M 36,1300
            Q 18,1340 38,1380
            M 38,1480
            Q 18,1520 36,1560
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 7)}
        />
        {/* Left edge leaf accents */}
        <path
          d="
            M 28,440 Q 18,450 28,460 Q 35,450 28,440 Z
            M 22,720 Q 12,730 22,740 Q 29,730 22,720 Z
            M 22,960 Q 12,970 22,980 Q 29,970 22,960 Z
            M 28,1240 Q 18,1250 28,1260 Q 35,1250 28,1240 Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 8)}
        />

        {/* ===================== */}
        {/* RIGHT EDGE CONNECTOR */}
        {/* ===================== */}
        <path
          d="
            M 1045,220
            C 1052,360 1058,500 1060,640
            Q 1064,780 1055,960
            Q 1064,1140 1060,1280
            C 1058,1420 1052,1560 1045,1700
          "
          fill="none"
          stroke="url(#goldGradV)"
          strokeWidth={3}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 5)}
        />
        <path
          d="
            M 1042,300
            Q 1062,340 1044,380
            M 1048,480
            Q 1068,520 1050,560
            M 1052,660
            Q 1072,720 1054,780
            M 1052,880
            Q 1072,940 1054,1000
            M 1050,1100
            Q 1068,1140 1048,1180
            M 1044,1300
            Q 1062,1340 1042,1380
            M 1042,1480
            Q 1062,1520 1044,1560
          "
          fill="none"
          stroke="url(#shadowGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(EDGE_LEN, 7)}
        />
        <path
          d="
            M 1052,440 Q 1062,450 1052,460 Q 1045,450 1052,440 Z
            M 1058,720 Q 1068,730 1058,740 Q 1051,730 1058,720 Z
            M 1058,960 Q 1068,970 1058,980 Q 1051,970 1058,960 Z
            M 1052,1240 Q 1062,1250 1052,1260 Q 1045,1250 1052,1240 Z
          "
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          {...animatedStroke(ACCENT_LEN, 8)}
        />

        {/* ============================= */}
        {/* SHIMMER HIGHLIGHT LAYER       */}
        {/* ============================= */}
        {/* Duplicate key paths with shimmer gradient at modulated opacity */}
        <g opacity={shimmerOpacity}>
          {/* Corner highlights */}
          <path
            d="
              M 40,160 C 40,120 50,80 80,55 Q 120,25 180,30 C 220,32 240,60 230,90
              M 1040,160 C 1040,120 1030,80 1000,55 Q 960,25 900,30 C 860,32 840,60 850,90
              M 40,1760 C 40,1800 50,1840 80,1865 Q 120,1895 180,1890 C 220,1888 240,1860 230,1830
              M 1040,1760 C 1040,1800 1030,1840 1000,1865 Q 960,1895 900,1890 C 860,1888 840,1860 850,1830
            "
            fill="none"
            stroke="url(#shimmerGrad)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Edge highlights */}
          <path
            d="
              M 200,35 C 380,22 540,15 540,25 C 540,15 700,22 880,35
              M 200,1885 C 380,1898 540,1905 540,1895 C 540,1905 700,1898 880,1885
              M 35,220 Q 20,580 25,960 Q 20,1340 35,1700
              M 1045,220 Q 1060,580 1055,960 Q 1060,1340 1045,1700
            "
            fill="none"
            stroke="url(#shimmerGrad)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

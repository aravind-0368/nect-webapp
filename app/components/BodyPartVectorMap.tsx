"use client";

import React from "react";

type BodyPartKey = "head" | "shoulders" | "chest" | "arms" | "back" | "core" | "legs" | "";

interface BodyPartVectorMapProps {
  selectedPart: string | null;
  onSelectPart?: (part: string) => void;
  hoveredPart?: string | null;
  onHoverPart?: (part: string | null) => void;
  interactive?: boolean;
  size?: "large" | "medium" | "small";
  className?: string;
  pulseActive?: boolean;
  completedParts?: string[];
  headGlowColor?: string;
}

export function BodyPartVectorMap({
  selectedPart,
  onSelectPart,
  hoveredPart,
  onHoverPart,
  interactive = false,
  size = "large",
  className = "",
  pulseActive = false,
  completedParts = [],
  headGlowColor,
}: BodyPartVectorMapProps) {

  const getGroupKey = (part: string | null | undefined): BodyPartKey => {
    if (!part) return "";
    const p = part.toLowerCase();
    if (p === "chest" || p === "pectorals") return "chest";
    if (p === "arms" || p === "biceps" || p === "triceps" || p === "forearms") return "arms";
    if (p === "legs" || p === "mobility" || p === "quads" || p === "calves" || p === "thighs") return "legs";
    if (p === "back" || p === "posterior" || p === "lats") return "back";
    if (p === "shoulders" || p === "shoulder" || p === "delts") return "shoulders";
    if (p === "core" || p === "abs" || p === "obliques") return "core";
    if (p === "head" || p === "brain" || p === "neck") return "head";
    return "";
  };

  const activeKey = getGroupKey(selectedPart);
  const hoverKey = getGroupKey(hoveredPart);

  const isPartCompleted = (partKey: BodyPartKey): boolean => {
    return completedParts.some((p) => getGroupKey(p) === partKey);
  };

  const getPartColor = (partKey: BodyPartKey) => {
    const isActive = activeKey === partKey;
    const isHovered = hoverKey === partKey;
    const isCompleted = isPartCompleted(partKey);

    if (partKey === "head" && headGlowColor) {
      return headGlowColor;
    }

    if (isActive || isHovered) {
      if (partKey === "head") return "#a855f7";
      if (partKey === "shoulders") return "#ec4899";
      if (partKey === "chest") return "#22d3ee";
      if (partKey === "arms") return "#fb923c";
      if (partKey === "back") return "#6366f1";
      if (partKey === "core") return "#f43f5e";
      if (partKey === "legs") return "#34d399";
    }

    if (isCompleted) {
      if (partKey === "head") return "#c084fc";
      if (partKey === "shoulders") return "#f472b6";
      if (partKey === "chest") return "#67e8f9";
      if (partKey === "arms") return "#fdba74";
      if (partKey === "back") return "#818cf8";
      if (partKey === "core") return "#fda4af";
      if (partKey === "legs") return "#6ee7b7";
    }

    return "#1e293b"; // Smooth slate-800 base coat
  };

  const getPartStroke = (partKey: BodyPartKey) => {
    const isActive = activeKey === partKey;
    const isHovered = hoverKey === partKey;
    const isCompleted = isPartCompleted(partKey);

    if (partKey === "head" && headGlowColor) {
      return "#c084fc";
    }

    if (isActive || isHovered || isCompleted) {
      if (partKey === "head") return "#c084fc";
      if (partKey === "shoulders") return "#f472b6";
      if (partKey === "chest") return "#67e8f9";
      if (partKey === "arms") return "#fdba74";
      if (partKey === "back") return "#818cf8";
      if (partKey === "core") return "#fda4af";
      if (partKey === "legs") return "#6ee7b7";
    }
    return "#334155"; // Crisper slate-700 lines for anatomy lines
  };

  const getPartOpacity = (partKey: BodyPartKey) => {
    const isActive = activeKey === partKey;
    const isHovered = hoverKey === partKey;
    const isCompleted = isPartCompleted(partKey);
    const isHeadGlow = partKey === "head" && !!headGlowColor;

    return isActive || isHovered || isHeadGlow ? 0.90 : isCompleted ? 0.75 : 0.50;
  };

  const getPartFilter = (partKey: BodyPartKey) => {
    const isActive = activeKey === partKey;
    const isHovered = hoverKey === partKey;
    const isCompleted = isPartCompleted(partKey);
    const isHeadGlow = partKey === "head" && !!headGlowColor;

    return isActive || isHovered || isCompleted || isHeadGlow
      ? "drop-shadow(0 0 6px var(--g-glow))"
      : "none";
  };

  const handleClick = (partName: string) => {
    if (interactive && onSelectPart) onSelectPart(partName);
  };

  const handleMouseEnter = (partKey: string) => {
    if (interactive && onHoverPart) onHoverPart(partKey);
  };

  const handleMouseLeave = () => {
    if (interactive && onHoverPart) onHoverPart(null);
  };

  const dims = {
    large: { w: 180, h: 300 },
    medium: { w: 120, h: 200 },
    small: { w: 45, h: 75 },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: dims.w, height: dims.h }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 200"
        className={`${interactive ? "cursor-pointer" : ""} ${pulseActive ? "animate-pulse" : ""}`}
      >
        {/* Dynamic Glowing Layer Definitions */}
        <g style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>

          {/* 1. HEAD & NECK */}
          <g
            onClick={() => handleClick("Head")}
            onMouseEnter={() => handleMouseEnter("head")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("head") } as React.CSSProperties}
          >
            {/* Smooth jawline and curved cranium skull path */}
            <path
              d="M 60,8 C 66,8 70,12 70,18 C 70,24 65,29 60,32 C 55,29 50,24 50,18 C 50,12 54,8 60,8 Z"
              fill={getPartColor("head")}
              stroke={getPartStroke("head")}
              strokeWidth={activeKey === "head" || hoverKey === "head" ? "1.5" : "1"}
              opacity={getPartOpacity("head")}
              filter={getPartFilter("head")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Trapezius/Neck connection support */}
            <path
              d="M 57,31 L 63,31 L 65,37 L 55,37 Z"
              fill={getPartColor("head")}
              stroke={getPartStroke("head")}
              strokeWidth="1"
              opacity={getPartOpacity("head")}
            />
          </g>

          {/* 2. SHOULDERS (DELTOIDS) */}
          <g
            onClick={() => handleClick("Shoulders")}
            onMouseEnter={() => handleMouseEnter("shoulders")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("shoulders") } as React.CSSProperties}
          >
            {/* Left Shoulder Bulb */}
            <path
              d="M 53,38 C 46,38 38,41 36,48 C 35,53 39,59 44,57 C 47,56 50,51 53,46 Z"
              fill={getPartColor("shoulders")}
              stroke={getPartStroke("shoulders")}
              strokeWidth={activeKey === "shoulders" || hoverKey === "shoulders" ? "1.5" : "1"}
              opacity={getPartOpacity("shoulders")}
              filter={getPartFilter("shoulders")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Shoulder Bulb */}
            <path
              d="M 67,38 C 74,38 82,41 84,48 C 85,53 81,59 76,57 C 73,56 70,51 67,46 Z"
              fill={getPartColor("shoulders")}
              stroke={getPartStroke("shoulders")}
              strokeWidth={activeKey === "shoulders" || hoverKey === "shoulders" ? "1.5" : "1"}
              opacity={getPartOpacity("shoulders")}
              filter={getPartFilter("shoulders")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

          {/* 3. CHEST (PECTORALS) */}
          <g
            onClick={() => handleClick("Chest")}
            onMouseEnter={() => handleMouseEnter("chest")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("chest") } as React.CSSProperties}
          >
            {/* Left Pec with sweeping muscular curves */}
            <path
              d="M 60,40 C 56,40 52,41 49,44 C 46,47 45,55 48,59 C 52,60 57,59 60,56 Z"
              fill={getPartColor("chest")}
              stroke={getPartStroke("chest")}
              strokeWidth={activeKey === "chest" || hoverKey === "chest" ? 1.5 : 1}
              opacity={getPartOpacity("chest")}
              filter={getPartFilter("chest")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Pec with sweeping muscular curves */}
            <path
              d="M 60,40 C 64,40 68,41 71,44 C 74,47 75,55 72,59 C 68,60 63,59 60,56 Z"
              fill={getPartColor("chest")}
              stroke={getPartStroke("chest")}
              strokeWidth={activeKey === "chest" || hoverKey === "chest" ? 1.5 : 1}
              opacity={getPartOpacity("chest")}
              filter={getPartFilter("chest")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

          {/* 4. ARMS (BICEPS, TRICEPS, FOREARMS) */}
          <g
            onClick={() => handleClick("Arms")}
            onMouseEnter={() => handleMouseEnter("arms")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("arms") } as React.CSSProperties}
          >
            {/* Left Upper Arm */}
            <path
              d="M 35,46 C 30,55 27,65 25,75 L 31,75 C 34,65 37,55 40,46 Z"
              fill={getPartColor("arms")}
              stroke={getPartStroke("arms")}
              strokeWidth={activeKey === "arms" || hoverKey === "arms" ? 1.5 : 1}
              opacity={getPartOpacity("arms")}
              filter={getPartFilter("arms")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Left Forearm */}
            <path
              d="M 25,77 C 22,87 19,97 16,107 L 21,107 C 24,97 27,87 30,77 Z"
              fill={getPartColor("arms")}
              stroke={getPartStroke("arms")}
              strokeWidth={activeKey === "arms" || hoverKey === "arms" ? 1.5 : 1}
              opacity={getPartOpacity("arms")}
              filter={getPartFilter("arms")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Upper Arm */}
            <path
              d="M 85,46 C 90,55 93,65 95,75 L 89,75 C 86,65 83,55 80,46 Z"
              fill={getPartColor("arms")}
              stroke={getPartStroke("arms")}
              strokeWidth={activeKey === "arms" || hoverKey === "arms" ? 1.5 : 1}
              opacity={getPartOpacity("arms")}
              filter={getPartFilter("arms")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Forearm */}
            <path
              d="M 95,77 C 98,87 101,97 104,107 L 99,107 C 96,97 93,87 90,77 Z"
              fill={getPartColor("arms")}
              stroke={getPartStroke("arms")}
              strokeWidth={activeKey === "arms" || hoverKey === "arms" ? 1.5 : 1}
              opacity={getPartOpacity("arms")}
              filter={getPartFilter("arms")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

          {/* 5. BACK (LATS & TRAPEZIUS) */}
          <g
            onClick={() => handleClick("Back")}
            onMouseEnter={() => handleMouseEnter("back")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("back") } as React.CSSProperties}
          >
            {/* Left Lat */}
            <path
              d="M 44,60 C 42,70 42,80 44,88 L 48,84 C 47,78 47,70 48,60 Z"
              fill={getPartColor("back")}
              stroke={getPartStroke("back")}
              strokeWidth={activeKey === "back" || hoverKey === "back" ? 1.5 : 1}
              opacity={getPartOpacity("back")}
              filter={getPartFilter("back")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Lat */}
            <path
              d="M 76,60 C 78,70 78,80 76,88 L 72,84 C 73,78 73,70 72,60 Z"
              fill={getPartColor("back")}
              stroke={getPartStroke("back")}
              strokeWidth={activeKey === "back" || hoverKey === "back" ? 1.5 : 1}
              opacity={getPartOpacity("back")}
              filter={getPartFilter("back")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Left Trap */}
            <path
              d="M 54,34 L 46,38 L 50,42 Z"
              fill={getPartColor("back")}
              stroke={getPartStroke("back")}
              strokeWidth={activeKey === "back" || hoverKey === "back" ? 1.5 : 1}
              opacity={getPartOpacity("back")}
              filter={getPartFilter("back")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Trap */}
            <path
              d="M 66,34 L 74,38 L 70,42 Z"
              fill={getPartColor("back")}
              stroke={getPartStroke("back")}
              strokeWidth={activeKey === "back" || hoverKey === "back" ? 1.5 : 1}
              opacity={getPartOpacity("back")}
              filter={getPartFilter("back")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

          {/* 6. CORE (ABS & OBLIQUES) */}
          <g
            onClick={() => handleClick("Core")}
            onMouseEnter={() => handleMouseEnter("core")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("core") } as React.CSSProperties}
          >
            {/* Upper Abs Left */}
            <path
              d="M 50,60 L 59,60 L 59,70 L 50,70 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Upper Abs Right */}
            <path
              d="M 61,60 L 70,60 L 70,70 L 61,70 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Mid Abs Left */}
            <path
              d="M 50,72 L 59,72 L 59,82 L 50,82 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Mid Abs Right */}
            <path
              d="M 61,72 L 70,72 L 70,82 L 61,82 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Lower Abs Left */}
            <path
              d="M 50,84 L 59,84 L 59,94 L 50,94 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Lower Abs Right */}
            <path
              d="M 61,84 L 70,84 L 70,94 L 61,94 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Left Oblique */}
            <path
              d="M 48,60 L 44,70 L 44,90 L 48,94 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Oblique */}
            <path
              d="M 72,60 L 76,70 L 76,90 L 72,94 Z"
              fill={getPartColor("core")}
              stroke={getPartStroke("core")}
              strokeWidth={activeKey === "core" || hoverKey === "core" ? 1.5 : 1}
              opacity={getPartOpacity("core")}
              filter={getPartFilter("core")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

          {/* 7. LEGS (THIGHS & CALVES) */}
          <g
            onClick={() => handleClick("Legs")}
            onMouseEnter={() => handleMouseEnter("legs")}
            onMouseLeave={handleMouseLeave}
            style={{ "--g-glow": getPartColor("legs") } as React.CSSProperties}
          >
            {/* Left Thigh */}
            <path
              d="M 36,98 C 34,115 36,132 40,148 L 48,148 C 47,132 46,115 48,98 Z"
              fill={getPartColor("legs")}
              stroke={getPartStroke("legs")}
              strokeWidth={activeKey === "legs" || hoverKey === "legs" ? 1.5 : 1}
              opacity={getPartOpacity("legs")}
              filter={getPartFilter("legs")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Thigh */}
            <path
              d="M 84,98 C 86,115 84,132 80,148 L 72,148 C 73,132 74,115 72,98 Z"
              fill={getPartColor("legs")}
              stroke={getPartStroke("legs")}
              strokeWidth={activeKey === "legs" || hoverKey === "legs" ? 1.5 : 1}
              opacity={getPartOpacity("legs")}
              filter={getPartFilter("legs")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Left Calf */}
            <path
              d="M 40,150 C 39,165 41,180 43,195 L 48,195 C 47,180 47,165 48,150 Z"
              fill={getPartColor("legs")}
              stroke={getPartStroke("legs")}
              strokeWidth={activeKey === "legs" || hoverKey === "legs" ? 1.5 : 1}
              opacity={getPartOpacity("legs")}
              filter={getPartFilter("legs")}
              style={{ transition: "all 0.3s" }}
            />
            {/* Right Calf */}
            <path
              d="M 80,150 C 81,165 79,180 77,195 L 72,195 C 73,180 73,165 72,150 Z"
              fill={getPartColor("legs")}
              stroke={getPartStroke("legs")}
              strokeWidth={activeKey === "legs" || hoverKey === "legs" ? 1.5 : 1}
              opacity={getPartOpacity("legs")}
              filter={getPartFilter("legs")}
              style={{ transition: "all 0.3s" }}
            />
          </g>

        </g>
      </svg>
    </div>
  );
}
"use client";

import { useId } from "react";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  gradient?: [string, string];
  ariaLabel?: string;
}

const PADDING = { top: 12, right: 12, bottom: 22, left: 12 };
const VIEW_W = 300;

export default function BarChart({
  data,
  height = 160,
  gradient = ["#22d3ee", "#3b82f6"],
  ariaLabel = "Bar chart",
}: BarChartProps) {
  const gradId = useId().replace(/:/g, "");
  const innerW = VIEW_W - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-[var(--text-dim)]"
        style={{ height }}
        aria-label={ariaLabel}
      >
        No data yet
      </div>
    );
  }

  const gap = 6;
  const barW = data.length > 0 ? (innerW - gap * (data.length - 1)) / data.length : 0;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={`${gradId}-bar`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>

        <g transform={`translate(${PADDING.left} ${PADDING.top})`}>
          {data.map((d, i) => {
            const h = maxV > 0 ? (d.value / maxV) * innerH : 0;
            const x = i * (barW + gap);
            const y = innerH - h;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 2)}
                  rx="4"
                  fill={`url(#${gradId}-bar)`}
                />
              </g>
            );
          })}
        </g>

        {/* X labels */}
        <g fill="#475569" fontSize="10" fontFamily="ui-sans-serif, system-ui" textAnchor="middle">
          {data.map((d, i) => {
            const x = PADDING.left + i * (barW + gap) + barW / 2;
            return (
              <text key={i} x={x} y={height - 6}>
                {d.label}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

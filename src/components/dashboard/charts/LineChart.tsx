"use client";

import { useId } from "react";

export interface LineSeries {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
  fill?: boolean;
}

interface LineChartProps {
  series: LineSeries[];
  xLabels: string[];
  height?: number;
  ariaLabel: string;
}

const PADDING = { top: 16, right: 24, bottom: 24, left: 24 };
const VIEW_W = 600;

function buildPath(values: number[], width: number, height: number, maxY: number) {
  if (values.length === 0) return "";
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const scaleY = (v: number) => (maxY > 0 ? height - (v / maxY) * height : height);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = scaleY(v);
      if (i === 0) return `M${x},${y}`;
      const prevX = (i - 1) * stepX;
      const cp1x = prevX + stepX / 2;
      const cp1y = scaleY(values[i - 1]);
      const cp2x = prevX + stepX / 2;
      const cp2y = y;
      return `C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
    })
    .join(" ");
}

export default function LineChart({ series, xLabels, height = 220, ariaLabel }: LineChartProps) {
  const gradId = useId().replace(/:/g, "");
  const innerW = VIEW_W - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.data);
  const maxY = Math.max(1, ...allValues);
  const hasData = allValues.some((v) => v > 0);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

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
          {series.map((s, i) => (
            <linearGradient key={i} id={`${gradId}-fill-${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Gridlines */}
        <g stroke="rgba(59,130,246,0.08)" strokeWidth="1">
          {gridLines.map((t) => {
            const y = PADDING.top + innerH * t;
            return <line key={t} x1={PADDING.left} y1={y} x2={VIEW_W - PADDING.right} y2={y} />;
          })}
        </g>

        {/* Series */}
        {series.map((s, i) => {
          const path = buildPath(s.data, innerW, innerH, maxY);
          const translate = `translate(${PADDING.left} ${PADDING.top})`;
          return (
            <g key={i} transform={translate}>
              {s.fill && (
                <path
                  d={`${path} L${innerW},${innerH} L0,${innerH} Z`}
                  fill={`url(#${gradId}-fill-${i})`}
                />
              )}
              <path
                d={path}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeDasharray={s.dashed ? "6 4" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* End-point dot */}
              {s.data.length > 0 && (() => {
                const lastIdx = s.data.length - 1;
                const stepX = s.data.length > 1 ? innerW / (s.data.length - 1) : innerW;
                const x = lastIdx * stepX;
                const y = maxY > 0 ? innerH - (s.data[lastIdx] / maxY) * innerH : innerH;
                return <circle cx={x} cy={y} r="4" fill={s.color} stroke="#0d1526" strokeWidth="2" />;
              })()}
            </g>
          );
        })}

        {/* X labels — edge labels anchor start/end so they don't clip */}
        <g fill="#475569" fontSize="10" fontFamily="ui-sans-serif, system-ui">
          {xLabels.map((label, i) => {
            const stepX = xLabels.length > 1 ? innerW / (xLabels.length - 1) : innerW / 2;
            const x = PADDING.left + i * stepX;
            const anchor = i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle";
            return (
              <text key={i} x={x} y={height - 6} textAnchor={anchor}>
                {label}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

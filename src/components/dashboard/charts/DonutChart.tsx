"use client";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue?: string;
  centerLabel?: string;
  size?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 140,
  showLegend = true,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 15.9;
  const strokeWidth = 3.5;

  let cumulative = 0;

  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className="flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="w-full h-full" role="img" aria-label="Distribution chart">
          {/* Background ring */}
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#152036" strokeWidth={strokeWidth} />

          {total > 0 &&
            segments.map((s, i) => {
              const percent = (s.value / total) * 100;
              const dashOffset = -cumulative;
              const element = (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${percent}, 100`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 18 18)"
                  strokeLinecap="round"
                />
              );
              cumulative += percent;
              return element;
            })}

          {(centerValue || centerLabel) && (
            <g>
              {centerValue && (
                <text
                  x="18"
                  y={centerLabel ? "17.5" : "20"}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="6"
                  fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {centerValue}
                </text>
              )}
              {centerLabel && (
                <text
                  x="18"
                  y="22.5"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="2.5"
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {centerLabel}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>

      {showLegend && (
        <div className="flex-1 min-w-0 space-y-2 text-xs">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[var(--text-muted)] truncate">{s.label}</span>
              </div>
              <span className="text-white font-medium flex-shrink-0">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

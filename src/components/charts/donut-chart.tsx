"use client";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

/** โดนัทชาร์ตแบบ SVG ล้วน — เข้าธีมมืดของแอป */
export default function DonutChart({
  segments,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          segments.map((seg, i) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const circle = (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            );
            offset += dash;
            return circle;
          })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-white text-xl font-bold tabular-nums">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

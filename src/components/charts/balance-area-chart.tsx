"use client";

import { useState } from "react";
import type { CumulativePoint } from "@/lib/analytics";

type BalanceAreaChartProps = {
  data: CumulativePoint[];
  height?: number;
};

/** กราฟพื้นที่ยอดคงเหลือสะสมตลอดเดือน */
export default function BalanceAreaChart({ data, height = 200 }: BalanceAreaChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 100;

  if (data.length === 0) return null;

  const values = data.map((d) => d.balance);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const pad = 6;

  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.balance)}`).join(" ");
  const areaPath = `${linePath} L ${W} ${height} L 0 ${height} Z`;
  const zeroY = y(0);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* เส้นศูนย์ */}
        <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />

        <path d={areaPath} fill="url(#balanceFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-700"
        />

        {hover !== null && (
          <circle cx={x(hover)} cy={y(data[hover].balance)} r="1.4" fill="#fff" stroke="#a78bfa" strokeWidth="0.6" />
        )}

        {/* hit areas */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={x(i) - W / data.length / 2}
            y={0}
            width={W / data.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="absolute -top-2 -translate-y-full -translate-x-1/2 bg-white text-black rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none whitespace-nowrap z-10"
          style={{ left: `${(hover / (data.length - 1)) * 100}%` }}
        >
          <div className="font-semibold">วันที่ {data[hover].day}</div>
          <div className={data[hover].balance >= 0 ? "text-emerald-600" : "text-red-500"}>
            {data[hover].balance >= 0 ? "+" : ""}
            {data[hover].balance.toLocaleString()} บาท
          </div>
        </div>
      )}
    </div>
  );
}

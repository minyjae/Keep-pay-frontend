"use client";

import { useState } from "react";
import type { DayBucket } from "@/lib/analytics";

type DailyBarChartProps = {
  data: DayBucket[];
  height?: number;
};

/** กราฟแท่งรายวัน รายรับ(เขียว) / รายจ่าย(แดง) พร้อม tooltip */
export default function DailyBarChart({ data, height = 200 }: DailyBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  const barGroupW = 100 / data.length;

  return (
    <div className="relative w-full" style={{ height }}>
      {/* เส้น grid แนวนอน */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-white/5 w-full" />
        ))}
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {data.map((d, i) => {
          const x = i * barGroupW;
          const incomeH = (d.income / max) * (height - 8);
          const expenseH = (d.expense / max) * (height - 8);
          const bw = barGroupW * 0.32;
          const active = hover === i;
          return (
            <g key={i} opacity={hover === null || active ? 1 : 0.35} className="transition-opacity">
              {/* hit area */}
              <rect
                x={x}
                y={0}
                width={barGroupW}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={x + barGroupW / 2 - bw - 0.5}
                y={height - incomeH}
                width={bw}
                height={incomeH}
                rx={0.6}
                fill="#34d399"
                className="transition-all duration-500"
              />
              <rect
                x={x + barGroupW / 2 + 0.5}
                y={height - expenseH}
                width={bw}
                height={expenseH}
                rx={0.6}
                fill="#f87171"
                className="transition-all duration-500"
              />
            </g>
          );
        })}
      </svg>

      {/* tooltip */}
      {hover !== null && (data[hover].income > 0 || data[hover].expense > 0) && (
        <div
          className="absolute -top-2 -translate-y-full -translate-x-1/2 bg-white text-black rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none whitespace-nowrap z-10"
          style={{ left: `${(hover + 0.5) * barGroupW}%` }}
        >
          <div className="font-semibold mb-1">วันที่ {data[hover].day}</div>
          <div className="text-emerald-600">+{data[hover].income.toLocaleString()}</div>
          <div className="text-red-500">-{data[hover].expense.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

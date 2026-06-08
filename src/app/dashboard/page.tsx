"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Navbar from "@/components/navbar/navbar";
import DonutChart from "@/components/charts/donut-chart";
import DailyBarChart from "@/components/charts/daily-bar-chart";
import BalanceAreaChart from "@/components/charts/balance-area-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getListUser } from "@/lib/api/list";
import { clearAuthToken } from "@/lib/axios";
import { buildAnalytics, pctChange, type Analytics } from "@/lib/analytics";

const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const fmt = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 0 });

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/30 text-xs">— เดือนก่อนไม่มีข้อมูล</span>;
  const up = value >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}% <span className="text-white/30">vs เดือนก่อน</span>
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [current, setCurrent] = useState<Analytics | null>(null);
  const [prev, setPrev] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    Promise.all([
      getListUser({ year, month }),
      getListUser({ year: prevYear, month: prevMonth }),
    ])
      .then(([cur, pre]) => {
        if (!alive) return;
        setCurrent(buildAnalytics(cur, year, month));
        setPrev(buildAnalytics(pre, prevYear, prevMonth));
      })
      .catch((err) => {
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearAuthToken();
          router.push("/");
          return;
        }
        setError("ไม่สามารถโหลดข้อมูลได้");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [year, month, router]);

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const donutSegments = useMemo(() => {
    if (!current) return [];
    return [
      { label: "รายรับ", value: current.income, color: "#34d399" },
      { label: "รายจ่าย", value: current.expense, color: "#f87171" },
    ];
  }, [current]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        buttons={[
          { label: "รายการ", path: "/main", variant: "outline" },
          { label: "Logout", path: "/", variant: "outline", onClick: clearAuthToken },
        ]}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              ภาพรวม<span className="gradient-text">การเงิน</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">
              สรุปและวิเคราะห์รายรับ-รายจ่ายของเดือน {monthNames[month - 1]} {year}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="h-9 text-sm bg-white/5 border-white/20 text-white rounded-lg w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="h-9 text-sm bg-white/5 border-white/20 text-white rounded-lg w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-white/40 text-sm animate-pulse">กำลังวิเคราะห์ข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950 border border-red-800 rounded-xl px-6 py-4 text-red-400 text-sm">
            {error}
          </div>
        ) : current ? (
          <div className="flex flex-col gap-5">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-emerald-400/70 text-xs uppercase tracking-widest">รายรับ</p>
                <p className="text-emerald-400 text-2xl font-bold mt-1 tabular-nums">{fmt(current.income)}</p>
                <div className="mt-2"><Delta value={prev ? pctChange(current.income, prev.income) : null} /></div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-red-400/70 text-xs uppercase tracking-widest">รายจ่าย</p>
                <p className="text-red-400 text-2xl font-bold mt-1 tabular-nums">{fmt(current.expense)}</p>
                <div className="mt-2"><Delta value={prev ? pctChange(current.expense, prev.expense) : null} /></div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-widest">คงเหลือ</p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${current.balance >= 0 ? "text-white" : "text-red-400"}`}>
                  {current.balance >= 0 ? "+" : ""}{fmt(current.balance)}
                </p>
                <div className="mt-2"><Delta value={prev ? pctChange(current.balance, prev.balance) : null} /></div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-white/10 rounded-2xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-widest">อัตราการเก็บเงิน</p>
                <p className="text-white text-2xl font-bold mt-1 tabular-nums">
                  {(current.savingsRate * 100).toFixed(0)}%
                </p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, current.savingsRate * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Daily trend */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-semibold">รายรับ-รายจ่ายรายวัน</h2>
                  <p className="text-white/40 text-xs mt-0.5">ชี้ที่แท่งเพื่อดูรายละเอียด</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-white/60"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />รายรับ</span>
                  <span className="flex items-center gap-1.5 text-white/60"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" />รายจ่าย</span>
                </div>
              </div>
              <DailyBarChart data={current.daily} />
            </div>

            {/* Balance trend + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-1">ยอดคงเหลือสะสม</h2>
                <p className="text-white/40 text-xs mb-5">การเปลี่ยนแปลงของเงินคงเหลือตลอดเดือน</p>
                <BalanceAreaChart data={current.cumulative} />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                <h2 className="text-white font-semibold mb-5">สัดส่วนรายรับ-รายจ่าย</h2>
                <div className="relative flex-1 flex items-center justify-center">
                  <DonutChart
                    segments={donutSegments}
                    centerValue={fmt(current.income + current.expense)}
                    centerLabel="รวม (บาท)"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  {donutSegments.map((s) => {
                    const total = current.income + current.expense;
                    const pct = total > 0 ? (s.value / total) * 100 : 0;
                    return (
                      <div key={s.label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-white/70">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                          {s.label}
                        </span>
                        <span className="text-white tabular-nums">
                          {fmt(s.value)} <span className="text-white/30 text-xs">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats + Top expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-white font-semibold">สถิติ</h2>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest">จำนวนรายการ</p>
                  <p className="text-white text-xl font-bold mt-0.5 tabular-nums">{current.txCount}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest">ใช้จ่ายเฉลี่ย/วัน</p>
                  <p className="text-white text-xl font-bold mt-0.5 tabular-nums">{fmt(current.avgDailyExpense)} <span className="text-white/30 text-sm">บาท</span></p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest">รายจ่ายสูงสุด</p>
                  {current.biggestExpense ? (
                    <p className="text-white text-base font-semibold mt-0.5 truncate">
                      {current.biggestExpense.name}{" "}
                      <span className="text-red-400 tabular-nums">{fmt(current.biggestExpense.price)} บาท</span>
                    </p>
                  ) : (
                    <p className="text-white/30 text-sm mt-0.5">—</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">รายจ่ายสูงสุด 5 อันดับ</h2>
                {current.topExpenses.length === 0 ? (
                  <p className="text-white/30 text-sm py-8 text-center">ยังไม่มีรายจ่ายในเดือนนี้</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {current.topExpenses.map((item, i) => {
                      const maxPrice = current.topExpenses[0].price ?? 1;
                      const pct = ((item.price ?? 0) / maxPrice) * 100;
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <span className="text-white/30 text-sm tabular-nums w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-sm truncate">{item.name}</span>
                              <span className="text-red-400 text-sm font-semibold tabular-nums shrink-0 ml-2">
                                {fmt(item.price)}
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-red-400/60 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

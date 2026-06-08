import type { ListResponse } from "./types/list";

export const isIncome = (item: ListResponse): boolean =>
  (item.type?.name ?? "").toLowerCase() === "income";

export type DayBucket = { day: number; income: number; expense: number };
export type CumulativePoint = { day: number; balance: number };

export type Analytics = {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number; // สัดส่วนเงินเก็บต่อรายรับ (0-1)
  txCount: number;
  avgDailyExpense: number;
  biggestExpense: ListResponse | null;
  daily: DayBucket[];
  cumulative: CumulativePoint[];
  topExpenses: ListResponse[];
};

const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();

/** สร้างชุดข้อมูลสำหรับ dashboard จาก list ทั้งเดือน */
export function buildAnalytics(
  lists: ListResponse[],
  year: number,
  month: number
): Analytics {
  const totalDays = daysInMonth(year, month);

  let income = 0;
  let expense = 0;
  let biggestExpense: ListResponse | null = null;

  const daily: DayBucket[] = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    income: 0,
    expense: 0,
  }));

  for (const item of lists) {
    const price = item.price ?? 0;
    const d = new Date(item.date);
    const dayIdx = d.getDate() - 1;
    const bucket = daily[dayIdx];

    if (isIncome(item)) {
      income += price;
      if (bucket) bucket.income += price;
    } else {
      expense += price;
      if (bucket) bucket.expense += price;
      if (!biggestExpense || price > (biggestExpense.price ?? 0)) {
        biggestExpense = item;
      }
    }
  }

  // ยอดคงเหลือสะสมรายวัน
  let running = 0;
  const cumulative: CumulativePoint[] = daily.map((b) => {
    running += b.income - b.expense;
    return { day: b.day, balance: running };
  });

  const activeExpenseDays = daily.filter((b) => b.expense > 0).length;

  const topExpenses = lists
    .filter((i) => !isIncome(i))
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, 5);

  return {
    income,
    expense,
    balance: income - expense,
    savingsRate: income > 0 ? (income - expense) / income : 0,
    txCount: lists.length,
    avgDailyExpense: activeExpenseDays > 0 ? expense / activeExpenseDays : 0,
    biggestExpense,
    daily,
    cumulative,
    topExpenses,
  };
}

/** เปอร์เซ็นต์การเปลี่ยนแปลงเทียบเดือนก่อน — null = เดือนก่อนเป็น 0 (เทียบไม่ได้) */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser } from "@/lib/api/user";
import { createList, getListUser, updateList, deleteList, getSummary } from "@/lib/api/list";
import { getTypes } from "@/lib/api/type";
import { clearAuthToken } from "@/lib/axios";
import type { UserResponse } from "@/lib/types/user";
import { ListResponse, ListSummary } from "@/lib/types/list";
import type { TypeResponse } from "@/lib/types/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/navbar/navbar";
import ConfirmModal from "@/components/ui/confirm-modal";

export default function MainPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [lists, setLists] = useState<ListResponse[] | null>(null);
  const [summary, setSummary] = useState<ListSummary>({ income: 0, expend: 0, balance: 0 });
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [types, setTypes] = useState<TypeResponse[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editTime, setEditTime] = useState<string>("");
  const [editTypeId, setEditTypeId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ตัวกรองวันที่ (0 = ทั้งหมด)
  const now = new Date();
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number>(now.getMonth() + 1);
  const [filterDay, setFilterDay] = useState<number>(0);

  // pagination (mobile) + responsive
  const [page, setPage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [data, typeList] = await Promise.all([getUser(), getTypes()]);
        setUser(data);
        setTypes(typeList);
        if (typeList.length > 0) setTypeId(typeList[0].id);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearAuthToken();
          router.push("/");
          return;
        }
        setUserError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchInitial();
  }, [router]);

  // โหลด list + summary ใหม่ทุกครั้งที่ตัวกรองวันที่เปลี่ยน
  useEffect(() => {
    const filter = { year: filterYear, month: filterMonth, day: filterDay || undefined };
    getListUser(filter)
      .then((list) => {
        setLists(list);
        setPage(0);
      })
      .catch((err) => {
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearAuthToken();
          router.push("/");
        }
      });
    getSummary(filter).then(setSummary).catch(() => {});
  }, [filterYear, filterMonth, filterDay, router]);

  const reloadLists = (): void => {
    const filter = { year: filterYear, month: filterMonth, day: filterDay || undefined };
    getListUser(filter).then(setLists).catch(() => {});
    getSummary(filter).then(setSummary).catch(() => {});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    const priceAsNumber = Number(price);
    if (isNaN(priceAsNumber)) {
      setError("กรุณาใส่จำนวนเงินที่ถูกต้อง");
      return;
    }
    if (!typeId) {
      setError("กรุณาเลือกประเภทรายการ");
      return;
    }

    try {
      const currentTime = time || `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
      const today = new Date().toISOString().split("T")[0];
      const date = new Date(`${today}T${currentTime}:00`).toISOString();

      await createList({ name, price: priceAsNumber, date, type_id: typeId });
      reloadLists();
      setName("");
      setPrice("");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        clearAuthToken();
        router.push("/");
        return;
      }
      setError("ไม่สามารถบันทึกรายการได้");
    }
  };

  const handleClear = (): void => {
    setName("");
    setPrice("");
    setTime(`${String(new Date().getHours()).padStart(2, "0")}:00`);
    setTypeId(types[0]?.id ?? "");
    setError(null);
  };

  const handleEdit = (item: ListResponse): void => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditTypeId(item.type?.id ?? "");
    const d = new Date(item.date);
    setEditTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };

  const handleUpdate = async (id: string): Promise<void> => {
    const priceAsNumber = Number(editPrice);
    if (isNaN(priceAsNumber)) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const date = new Date(`${today}T${editTime}:00`).toISOString();
      await updateList({ id, name: editName, price: priceAsNumber, date });
      reloadLists();
      setEditingId(null);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        clearAuthToken();
        router.push("/");
      }
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteList(id);
      reloadLists();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        clearAuthToken();
        router.push("/");
      }
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">กำลังโหลด...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-950 border border-red-800 rounded-xl px-6 py-4 text-red-400 text-sm">
          {userError}
        </div>
      </div>
    );
  }

  // ตัวเลือกของ dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // pagination: mobile แสดงสูงสุด 10/หน้า, desktop แสดงทั้งหมด (เลื่อน scroll)
  const allLists = lists ?? [];
  const pageSize = 10;
  const totalPages = isMobile ? Math.ceil(allLists.length / pageSize) : 1;
  const visibleLists = isMobile
    ? allLists.slice(page * pageSize, page * pageSize + pageSize)
    : allLists;

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        buttons={[
          {
            label: "Logout",
            path: "/",
            variant: "outline",
            onClick: clearAuthToken,
          },
        ]}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Add form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-white/5">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">
              สวัสดี,{" "}
              <span className="gradient-text">{user?.display_name}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              บันทึกรายรับ-รายจ่ายของคุณได้เลย
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                ชื่อรายการ
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="เช่น ซื้อมังงะ Chainsaw Man"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                จำนวนเงิน (บาท)
              </label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPrice(e.target.value)
                }
                placeholder="0"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                เวลา
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                ประเภท
              </label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger className="h-11 rounded-lg bg-gray-50 border-gray-200">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 h-11 rounded-lg bg-black text-white hover:bg-gray-800 font-semibold transition-all"
              >
                บันทึก
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleClear}
                className="h-11 rounded-lg px-5"
              >
                ล้าง
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Summary + List */}
        <div className="flex flex-col gap-2">
          {/* ตัวกรองวันที่ */}
          <div className="flex gap-2">
            <Select value={String(filterDay)} onValueChange={(v) => setFilterDay(Number(v))}>
              <SelectTrigger className="h-9 text-sm bg-white/5 border-white/20 text-white rounded-lg flex-1">
                <SelectValue placeholder="วัน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">ทั้งเดือน</SelectItem>
                {dayOptions.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(filterMonth)} onValueChange={(v) => setFilterMonth(Number(v))}>
              <SelectTrigger className="h-9 text-sm bg-white/5 border-white/20 text-white rounded-lg flex-1">
                <SelectValue placeholder="เดือน" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(filterYear)} onValueChange={(v) => setFilterYear(Number(v))}>
              <SelectTrigger className="h-9 text-sm bg-white/5 border-white/20 text-white rounded-lg flex-1">
                <SelectValue placeholder="ปี" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">รายการทั้งหมด</p>
              <p className="text-white text-3xl font-bold mt-1">{lists?.length ?? 0}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400/70 text-xs uppercase tracking-widest">Income</p>
              <p className="text-emerald-400 text-2xl font-bold mt-1">
                +{summary.income.toLocaleString()}
                <span className="text-emerald-400/50 text-xs font-normal ml-1">บาท</span>
              </p>
            </div>
            <div>
              <p className="text-red-400/70 text-xs uppercase tracking-widest">Expend</p>
              <p className="text-red-400 text-2xl font-bold mt-1">
                -{summary.expend.toLocaleString()}
                <span className="text-red-400/50 text-xs font-normal ml-1">บาท</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest">คงเหลือ</p>
              <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? "text-white" : "text-red-400"}`}>
                {summary.balance >= 0 ? "+" : ""}{summary.balance.toLocaleString()}
                <span className="text-white/40 text-xs font-normal ml-1">บาท</span>
              </p>
            </div>
          </div>

          {/* List items */}
          <div className="custom-scrollbar flex flex-col gap-2 lg:max-h-[306px] lg:overflow-y-auto lg:pr-1">
            {allLists.length === 0 ? (
              <div className="border border-white/10 rounded-2xl px-6 py-12 text-center text-white/30 text-sm">
                ยังไม่มีรายการในช่วงเวลานี้
              </div>
            ) : (
              visibleLists.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  {/* แถวบน: ลำดับ + ชื่อ + ราคา */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-white/20 text-xs tabular-nums shrink-0">
                        {(isMobile ? page * pageSize : 0) + index + 1}
                      </span>
                      {editingId === item.id ? (
                        <Input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm bg-white/10 border-white/20 text-white rounded-lg flex-1"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm truncate">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="h-8 text-sm bg-white/10 border-white/20 text-white rounded-lg w-24 text-right"
                      />
                    ) : (
                      <span className="text-white font-bold text-base tabular-nums shrink-0">
                        {(item.price ?? 0).toLocaleString()}
                        <span className="text-white/40 text-xs font-normal ml-1">บาท</span>
                      </span>
                    )}
                  </div>

                  {/* แถวล่าง: วันที่ + type + ปุ่ม */}
                  <div className="flex items-center justify-between">
                    {editingId === item.id ? (
                      <div className="flex gap-2 flex-1 mr-2">
                        <Input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="h-7 text-xs bg-white/10 border-white/20 text-white rounded-lg flex-1"
                        />
                        <Select value={editTypeId} onValueChange={setEditTypeId}>
                          <SelectTrigger className="h-7! min-h-0 text-xs bg-white/10 border-white/20 text-white rounded-lg flex-1 py-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {types.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 text-xs">
                          {new Date(item.date).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${item.type?.name === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {item.type?.name ?? "-"}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-3 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                            onClick={() => setEditingId(null)}
                          >
                            ยกเลิก
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-7 px-3 rounded-lg bg-white text-black hover:bg-white/90"
                            onClick={() => handleUpdate(item.id)}
                          >
                            บันทึก
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-3 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                            onClick={() => handleEdit(item)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-3 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeletingId(item.id)}
                          >
                            ลบ
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination (mobile) */}
          {totalPages > 1 && (
            <div className="flex lg:hidden items-center justify-center gap-4 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-9 w-9 rounded-lg border border-white/20 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                ‹
              </button>
              <span className="text-white/60 text-sm tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-9 w-9 rounded-lg border border-white/20 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deletingId !== null}
        title="ยืนยันการลบรายการ"
        description={`"${lists?.find((i) => i.id === deletingId)?.name}" จะถูกลบและไม่สามารถกู้คืนได้`}
        confirmLabel="ลบ"
        onConfirm={async () => {
          if (deletingId) await handleDelete(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

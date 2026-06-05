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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [data, list, typeList, summaryData] = await Promise.all([getUser(), getListUser(), getTypes(), getSummary()]);
        setUser(data);
        setLists(list);
        setTypes(typeList);
        setSummary(summaryData);
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
    fetchUser();
  }, [router]);

  const refreshSummary = (): void => {
    getSummary().then(setSummary).catch(() => {});
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

      console.log("[create] payload:", { name, price: priceAsNumber, date, type_id: typeId });

      const newList = await createList({ name, price: priceAsNumber, date, type_id: typeId });
      setLists((prev) => [...(prev ?? []), newList]);
      refreshSummary();
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
      const updated = await updateList({ id, name: editName, price: priceAsNumber, date });
      setLists((prev) => prev?.map((item) => (item.id === id ? updated : item)) ?? null);
      refreshSummary();
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
      setLists((prev) => prev?.filter((item) => item.id !== id) ?? null);
      refreshSummary();
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
        <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
            {!lists || lists.length === 0 ? (
              <div className="border border-white/10 rounded-2xl px-6 py-12 text-center text-white/30 text-sm">
                ยังไม่มีรายการ — เริ่มบันทึกรายการแรกได้เลย
              </div>
            ) : (
              lists.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  {/* แถวบน: ลำดับ + ชื่อ + ราคา */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-white/20 text-xs tabular-nums shrink-0">
                        {index + 1}
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

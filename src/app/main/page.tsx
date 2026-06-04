"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser } from "@/lib/api/user";
import { createList, getListUser } from "@/lib/api/list";
import { clearAuthToken } from "@/lib/axios";
import type { UserResponse } from "@/lib/types/user";
import { ListResponse } from "@/lib/types/list";
import Navbar from "@/components/navbar/navbar";

export default function MainPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [lists, setLists] = useState<ListResponse[] | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [data, list] = await Promise.all([getUser(), getListUser()]);
        console.log('list', list)
        setUser(data);
        setLists(list);
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    const priceAsNumber = Number(price);
    if (isNaN(priceAsNumber)) {
      setError("กรุณาใส่จำนวนเงินที่ถูกต้อง");
      return;
    }

    try {
      const newList = await createList({ name, price: priceAsNumber });
      setLists((prev) => [...(prev ?? []), newList]);
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
    setError(null);
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

  const total = lists?.reduce((sum, item) => sum + (item.price ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        buttons={[{ label: "Logout", path: "/", variant: "outline", onClick: clearAuthToken }]}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                placeholder="0"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
                required
              />
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">รายการทั้งหมด</p>
              <p className="text-white text-3xl font-bold mt-1">{lists?.length ?? 0}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest">ยอดรวม</p>
              <p className="text-white text-3xl font-bold mt-1">
                {total.toLocaleString()}{" "}
                <span className="text-white/40 text-base font-normal">บาท</span>
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
                  className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex justify-between items-center hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/20 text-xs w-5 text-right tabular-nums">
                      {index + 1}
                    </span>
                    <span className="text-white text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm tabular-nums">
                    {(item.price ?? 0).toLocaleString()} บาท
                  </span>
                  <span className="text-white/40 text-xs">
                    {new Date(item.created_at).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

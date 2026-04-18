"use client"

import { useEffect, useState, FormEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getUser } from "@/lib/api/user"
import { createList, getListUser } from "@/lib/api/list"
import { clearAuthToken } from "@/lib/axios"
import type { UserResponse } from "@/lib/types/user"
import { ListResponse } from "@/lib/types/list"

export default function FieldDemo() {
  const router = useRouter()

  // ---- user state ----
  const [user, setUser] = useState<UserResponse | null>(null)
  const [lists, setLists] = useState<ListResponse[] | null>(null)
  const [loadingUser, setLoadingUser] = useState<boolean>(true)
  const [userError, setUserError] = useState<string | null>(null)

  // ---- form state ----
  const [name, setName] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [data, list] = await Promise.all([getUser(), getListUser()])
        setUser(data)
        setLists(list)
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearAuthToken()
          router.push("/login")
          return
        }
        setUserError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้")
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    const priceAsNumber = Number(price)
    if (isNaN(priceAsNumber)) {
      setError("กรุณาใส่จำนวนเงินที่ถูกต้อง")
      return
    }

    try {
      const newList = await createList({ name, price: priceAsNumber })
      setLists((prev) => [...(prev ?? []), newList])
      setName("")
      setPrice("")
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        clearAuthToken()
        router.push("/login")
        return
      }
      setError("ไม่สามารถบันทึกรายการได้")
    }
  }

  const handleClear = (): void => {
    setName("")
    setPrice("")
    setError(null)
  }

  if (loadingUser) {
    return <div className="flex items-center justify-center p-12">กำลังโหลด...</div>
  }

  if (userError) {
    return <div className="flex items-center justify-center p-12 text-red-600">{userError}</div>
  }

  return (
    <div className="grid grid-cols-2 item-start">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto p-12"
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>สวัสดี {user?.display_name}</FieldLegend>
            <FieldDescription>
              เก็บข้อมูลรายรับ-รายจ่ายในแต่ละวัน และสรุปเป็น dashboard ภาพรวม
            </FieldDescription>

            <FieldGroup>
              {/* Title field */}
              <Field>
                <FieldLabel htmlFor="name">ชื่อรายการ</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="ตัวอย่าง: ซื้อมังงะ Chainsaw Man"
                  required
                />
              </Field>

              {/* Price field */}
              <Field>
                <FieldLabel htmlFor="price">จำนวนเงิน</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPrice(e.target.value)
                  }
                  placeholder="90"
                  required
                />
                <FieldDescription>
                  ใส่จำนวนเงินที่ได้รับ หรือใช้จ่าย (หน่วย: บาท)
                </FieldDescription>
              </Field>

              {/* Error message */}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <Field orientation="horizontal" className="space-x-2">
            <Button type="submit">ตกลง</Button>
            <Button variant="outline" type="button" onClick={handleClear}>
              ล้างข้อมูล
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="p-12">
        <h2 className="text-lg font-semibold mb-4">
          รายการทั้งหมดของ {user?.display_name}
        </h2>

        {!lists || lists.length === 0 ? (
          <p className="text-sm text-gray-500">ยังไม่มีรายการ</p>
        ) : (
          <ul className="space-y-2">
            {lists.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border rounded-lg px-4 py-3"
              >
                <span>{item.name}</span>
                <span className="font-medium">{(item.price ?? 0).toLocaleString()} บาท</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

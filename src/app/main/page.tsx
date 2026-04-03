"use client"

import { useState, FormEvent, ChangeEvent } from "react"
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

interface FormData {
  title: string
  price: number
}

export default function FieldDemo() {
  const [title, setTitle] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    const priceAsNumber = Number(price)
    if (isNaN(priceAsNumber)) {
      setError("กรุณาใส่จำนวนเงินที่ถูกต้อง")
      return
    }

    const data: FormData = { title, price: priceAsNumber }
    console.log("Submitting data:", data)

    // ตัวอย่าง: reset form หลัง submit
    setTitle("")
    setPrice("")
  }

  const handleClear = (): void => {
    setTitle("")
    setPrice("")
    setError(null)
  }

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto p-12"
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>รายรับ รายจ่าย</FieldLegend>
            <FieldDescription>
              เก็บข้อมูลรายรับ-รายจ่ายในแต่ละวัน และสรุปเป็น dashboard ภาพรวม
            </FieldDescription>

            <FieldGroup>
              {/* Title field */}
              <Field>
                <FieldLabel htmlFor="title">ชื่อรายการ</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
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
    </div>
  )
}

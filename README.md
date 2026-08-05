# Keep Pay Frontend

โปรเจกต์นี้เป็นเว็บแอปหน้าจอสำหรับระบบจัดการการเงิน/บัญชีผู้ใช้ พัฒนาด้วย **Next.js 16**, **React 19**, และ **Tailwind CSS 4**.

## คุณสมบัติหลัก

- หน้า `login`, `register`, และ `dashboard`
- ระบบหน้าจอหลักใน `app/main/page.tsx`
- UI components แบบโมดูลใน `src/app/components/ui`
- แผนภูมิและกราฟใน `src/app/components/charts`
- เชื่อมต่อ API ด้วย `axios`
- ฟอร์มและ validation ด้วย `react-hook-form` และ `zod`

## โครงสร้างสำคัญของโปรเจกต์

- `app/` - โฟลเดอร์หลักของ Next.js App Router
  - `globals.css` - สไตล์ระดับแอป
  - `layout.tsx` - เลย์เอาท์หลัก
  - `dashboard/page.tsx` - หน้าแดชบอร์ด
  - `login/page.tsx` - หน้าล็อกอิน
  - `register/page.tsx` - หน้ารีจิสเตอร์
  - `main/page.tsx` - หน้าเนื้อหาหลัก
- `src/app/components/` - คอมโพเนนต์ UI และ chart
- `src/app/lib/` - ไลบรารีช่วยเหลือ, API client, validations
- `src/app/types/` - ประเภทข้อมูล TypeScript

## ติดตั้งและรันโปรเจกต์

ใช้คำสั่งต่อไปนี้จากโฟลเดอร์รากของโปรเจกต์:

```bash
npm install
npm run dev
```

เปิดเว็บที่:

```text
http://localhost:3000
```

## คำสั่งสำคัญ

- `npm run dev` - รันเซิร์ฟเวอร์พัฒนา
- `npm run build` - สร้างไฟล์สำหรับ production
- `npm run start` - รันแอปในโหมด production

## ส่วนประกอบที่ใช้

- `next` - Next.js
- `react` / `react-dom` - React
- `axios` - HTTP client
- `react-hook-form` - จัดการฟอร์ม
- `zod` - ตรวจสอบ schema
- `@radix-ui/react-*` - คอมโพเนนต์ UI ที่นำมาใช้
- `tailwindcss` และ `@tailwindcss/postcss` - สไตล์
- `gsap` / `lenis` - แอนิเมชันและการเลื่อน

## หมายเหตุ

- ตรวจสอบ `src/app/lib/api` สำหรับการเรียกใช้งาน backend API
- หากต้องการเพิ่มหน้าหรือ component ใหม่ ให้สร้างไฟล์ภายใต้ `src/app/components` หรือ `app/` ตามลำดับ
- โปรเจกต์นี้ตั้งค่าให้ใช้ **App Router** ของ Next.js

---

หากต้องการให้ปรับ README เป็นภาษาอังกฤษ หรือเติมส่วนการติดตั้งเพิ่มเติม เช่น `pnpm`/`yarn` บอกได้เลยครับ
import * as z from "zod";

// 1. สร้าง Object พื้นฐานก่อน
export const registerSchema = z.object({
  displayname: z.string().min(1, { message: "กรุณากรอกชื่อแสดงผล" }),
  // username: z.string().min(3, { message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" }),
  email: z.email({message: "กรุณากรอกอีเมลให้ถูกต้อง"}),
  
  // รหัสผ่านตามเงื่อนไขเดิมที่คุณตั้งไว้
  password: z.string()
    .regex(/(?:.*\d){2}/, { message: "ต้องมีตัวเลข (0-9) อย่างน้อย 9 ตัว" })
    .regex(/[A-Z]/, { message: "ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" })
    .regex(/[a-z]/, { message: "ต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว" })
    .regex(/[^a-zA-Z0-9]/, { message: "ต้องมีอักขระพิเศษ อย่างน้อย 1 ตัว" }),
    
  // 2. เพิ่ม confirmPassword เข้ามาเป็น string ธรรมดาก่อน
  confirmPassword: z.string().min(1, { message: "กรุณายืนยันรหัสผ่าน" }),
})
// 🌟 3. ใช้ .refine() ต่อท้าย object เพื่อเปรียบเทียบค่า 2 ฟิลด์
.refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง",
  path: ["confirmPassword"], // 👈 สำคัญมาก: บอก Zod ว่าให้โยน Error นี้ไปแสดงที่ช่อง confirmPassword
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "กรุณากรอกอีเมลให้ถูกต้อง" }),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
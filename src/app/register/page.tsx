"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { registerUser } from "@/lib/api/auth";

export default function Register() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const handleRegister = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        displayname: data.displayname,
      });
      router.push("/login");
    } catch (err) {
      if (err instanceof AxiosError) {
        const code = err.response?.data?.code;
        if (code === "EMAIL_TAKEN") {
          setServerError("อีเมลนี้ถูกใช้งานแล้ว");
          return;
        }
      }
      setServerError("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black p-20">
      <div className="grid grid-cols-[2fr_3fr] primary w-full h-full rounded-xl">
        
        {/* ฝั่งขวา (ฟอร์มสมัครสมาชิก) */}
        <div className="bg-white px-10 pb-10 pt-6 rounded-xl shadow-xl shadow-black/20 place-self-center w-full max-w-[400px]">
          <form
            onSubmit={handleSubmit(handleRegister)} // 🌟 ต้องเอา handleSubmit มาครอบฟังก์ชันของเรา
            className="flex flex-col gap-4 text-black"
          >
            <h1 className="font-semibold drop-shadow-lg text-2xl sm:text-4xl uppercase">
              Welcome to{" "}
              <span className="gradient-text">Keep-pay</span>{" "}
              <br />
              pls Register
            </h1>

            {/* --- Display Name --- */}
            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                display name
              </h2>
              <Input
                {...register("displayname")} // 🌟 register จะจัดการ name, onChange, onBlur ให้หมดเลย
                type="text"
                className="rounded-xl border-gray-300"
              />
              {/* 🌟 เพิ่มการแสดง Error จาก Zod */}
              {errors.displayname && (
                <p className="text-red-500 text-xs mt-1">{errors.displayname.message}</p>
              )}
            </div>

            {/* --- Email --- */}
            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                email
              </h2>
              <Input
                {...register("email")}
                type="email"
                className="rounded-xl border-gray-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* --- Password --- */}
            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                password
              </h2>
              <Input
                {...register("password")}
                type="password"
                className="rounded-xl border-gray-300"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* --- Confirm Password --- */}
            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                confirm password
              </h2>
              <Input
                {...register("confirmPassword")} // 🌟 ลืมใส่ register ตรงนี้ในโค้ดเก่า
                type="password"
                className="rounded-xl border-gray-300"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-xs">{serverError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-xl bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </div>

        {/* ฝั่งซ้าย (รูปภาพ) */}
        <div className="text-white text-center w-full h-full p-10">
          <img
            src="/04-save-data.jpg"
            alt="Register Cover"
            className="w-full h-full object-cover object-right rounded-xl shadow-xl shadow-white/20"
          />
        </div>

      </div>
    </div>
  );
}
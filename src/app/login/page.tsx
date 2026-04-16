"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { loginUser } from "@/lib/api/auth";

export default function Login() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleLogin = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await loginUser(data);
      router.push("/main");
    } catch (err) {
      setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black p-20">
      <div className="grid grid-cols-[3fr_2fr] primary w-full h-full rounded-xl">

        {/* ฝั่งซ้าย */}
        <div className="text-white text-center w-full h-full p-10">
          <img
            src="/04-save-data.jpg"
            alt="Login Cover"
            className="w-full h-full object-cover object-right rounded-xl shadow-xl shadow-white/20"
          />
        </div>

        {/* ฝั่งขวา (ฟอร์มล็อกอิน) */}
        <div className="bg-white px-10 pb-10 pt-6 rounded-xl shadow-xl shadow-black/20 place-self-center w-full max-w-[400px]">
          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-4 text-black"
          >
            <h1 className="font-semibold drop-shadow-lg text-2xl sm:text-4xl uppercase">
              Welcome to{" "}
              <span className="gradient-text">Keep-pay</span>{" "}
              <br />
              pls login
            </h1>

            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                email
              </h2>
              <Input
                {...register("email")}
                type="text"
                className="rounded-xl border-gray-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

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

            {serverError && (
              <p className="text-red-500 text-xs">{serverError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-xl bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <span className="text-sm font-medium text-gray-700">
            If you don't have account pls click link{" "}
            <Link href="/register" className="underline text-blue-500">here</Link>{" "}
            to register
          </span>
        </div>
      </div>
    </div>
  );
}

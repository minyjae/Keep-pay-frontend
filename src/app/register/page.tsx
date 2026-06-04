"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { registerUser } from "@/lib/api/auth";
import { getAuthToken, clearAuthToken } from "@/lib/axios";
import { getUser } from "@/lib/api/user";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuthToken()) return;
    getUser()
      .then(() => router.replace("/main"))
      .catch(() => clearAuthToken());
  }, [router]);
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
    <div className="h-screen w-full flex items-center justify-center bg-black p-8 lg:p-20">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] w-full h-full max-h-[750px] rounded-2xl overflow-hidden shadow-2xl shadow-white/10">

        {/* Left - Register form */}
        <div className="bg-white flex flex-col justify-center px-10 py-12">
          <div className="mb-7">
            <h1 className="font-bold text-3xl text-black tracking-tight leading-snug">
              Join{" "}
              <span className="gradient-text">Keep-pay</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Create your account and start managing smarter
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleRegister)}
            className="flex flex-col gap-4 text-black"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Display Name
              </label>
              <Input
                {...register("displayname")}
                type="text"
                placeholder="Your name"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
              />
              {errors.displayname && (
                <p className="text-red-500 text-xs">{errors.displayname.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Confirm Password
              </label>
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="rounded-lg border-gray-200 bg-gray-50 focus:bg-white h-11 transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-11 rounded-lg bg-black text-white hover:bg-gray-800 font-semibold tracking-wide transition-all"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right - Cover image */}
        <div className="hidden lg:block relative">
          <img
            src="/04-save-data.jpg"
            alt="Register Cover"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-linear-to-l from-black/30 to-transparent" />
        </div>

      </div>
    </div>
  );
}

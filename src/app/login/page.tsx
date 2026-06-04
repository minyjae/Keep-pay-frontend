"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { loginUser } from "@/lib/api/auth";
import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/axios";
import { getUser } from "@/lib/api/user";

export default function Login() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAuthToken()) return;
    getUser()
      .then(() => router.replace("/main"))
      .catch(() => clearAuthToken());
  }, [router]);
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
      const { token } = await loginUser(data);
      setAuthToken(token);
      router.push("/main");
    } catch (err) {
      setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black p-8 lg:p-20">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] w-full h-full max-h-[680px] rounded-2xl overflow-hidden shadow-2xl shadow-white/10">

        {/* Left - Cover image */}
        <div className="hidden lg:block relative">
          <img
            src="/04-save-data.jpg"
            alt="Login Cover"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />
        </div>

        {/* Right - Login form */}
        <div className="bg-white flex flex-col justify-center px-10 py-12">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-black tracking-tight leading-snug">
              Welcome back to{" "}
              <span className="gradient-text">Keep-pay</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Sign in to continue managing your finances
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-5 text-black"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Email
              </label>
              <Input
                {...register("email")}
                type="text"
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
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-black hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    // 1. เพิ่ม flex เข้าไป เพื่อให้ items-center และ justify-center ทำงานได้
    <div className="h-screen w-full flex items-center justify-center bg-black p-20">
      
      {/* 2. เปลี่ยน bg-primary เป็น primary (ตามชื่อคลาสใน CSS ของคุณ) 
          และเพิ่ม w-full h-full เพื่อให้พื้นหลัง Gradient ยืดเต็มจอ 
      */}
      <div className="grid grid-cols-[3fr_2fr] primary w-full h-full rounded-xl">
        
        {/* ฝั่งซ้าย */}
        <div className="text-white text-center w-full h-full p-10">
          <img
            src="/04-save-data.jpg"
            alt=""
            className="w-full h-full object-cover object-right rounded-xl shadow-xl shadow-white/20"
          />
        </div>

        {/* ฝั่งขวา (ฟอร์มล็อกอิน) */}
        <div className="bg-white px-10 pb-10 pt-6 rounded-xl shadow-xl shadow-black/20 place-self-center w-full max-w-[400px]">
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 text-black"
          >
            <h1 className="font-semibold drop-shadow-lg text-2xl sm:text-4xl uppercase">
              Welcome to{" "}
              {/* ลบ text-blue-800 ออก เพราะคุณมี .gradient-text จัดการสีให้แล้ว */}
              <span className="gradient-text">Keep-pay</span>{" "}
              <br />
              pls login
            </h1>

            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                username
              </h2>
              <Input
                name="username"
                type="text"
                required
                className="rounded-xl border-gray-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <h2 className="text-sm font-medium mb-1 text-gray-700">
                password
              </h2>
              <Input
                name="password"
                type="password"
                required
                className="rounded-xl border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="mt-4 w-full rounded-xl bg-black text-white hover:bg-gray-800"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
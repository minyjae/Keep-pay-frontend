"use client";

import Navbar from "@/components/navbar/navbar";
// 1. นำเข้า useLayoutEffect มาด้วย
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// 2. สร้าง Hook พิเศษเพื่อป้องกัน Next.js แจ้งเตือน Error ฝั่ง Server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const horizontalCards = [
  { num: "What KeepPay Can do ?", color: "from-blue-900/40 to-cyan-900/30" },
  { num: "01", title: "Record income and expenses", img:"/01-accouting.jpg" ,desc: "You can note what spend or pay today.", color: "from-violet-900/40 to-purple-900/30" },
  { num: "02", title: "Summary data", desc: "Summary in a week and month overview.", img: "/02-summary.png",color: "from-emerald-900/40 to-teal-900/30" },
  { num: "03", title: "Record with picture", desc: "You can take a photo on receipt to record.", img: "/03-photo-of-receipt.jpg", color: "from-rose-900/40 to-pink-900/30" },
];

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Intro() {
  const pinSectionRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  // ปิดการจำตำแหน่ง Scroll ของ Browser (ใช้ Isomorphic เพื่อให้ทำก่อนวาดจอ)
  useIsomorphicLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // GSAP Animation (เปลี่ยนมาใช้ useIsomorphicLayoutEffect แทน useEffect)
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!pinSectionRef.current) return;

      // 3. ท่าไม้ตาย: สั่ง Set ค่าเริ่มต้นให้ซ่อนสนิททันทีก่อนที่ Timeline จะคำนวณ
      gsap.set(".pin-header, .pin-subtext, .pin-line", { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: "top top",
          end: "+=1200",
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
        },
      });

      // จัดการให้มือและข้อความแรกร่วงหายไป พร้อมกับซ่อนปุ่ม Scroll down
      tl.to(".left-hand", { x: -200, autoAlpha: 0, duration: 1 }, 0)
        .to(".right-hand", { x: 200, autoAlpha: 0, duration: 1 }, 0)
        .to(".text-intro", { scale: 0.8, autoAlpha: 0, duration: 1 }, 0)
        .to(".scroll-indicator", { autoAlpha: 0, duration: 0.5 }, 0); 

      // ขั้นตอนแอนิเมชัน: ให้ Header ค่อยๆ ปรากฏขึ้นมา
      tl.fromTo(
        ".pin-header",
        { scale: 0.8, autoAlpha: 0, filter: "blur(10px)" },
        {
          scale: 1,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "none",
        }
      )
      .fromTo(
        ".pin-subtext",
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: "none" },
        "-=0.7" 
      )
      .fromTo(
        ".pin-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: "none" },
        "-=0.5"
      );

      if (horizontalRef.current && horizontalTrackRef.current) {
        const totalWidth = horizontalTrackRef.current.scrollWidth - window.innerWidth;
        gsap.to(horizontalTrackRef.current, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: { trigger: horizontalRef.current, start: "top top", end: () => `+=${totalWidth}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Lenis Smooth Scroll (ส่วนนี้ใช้ useEffect ปกติได้เพราะไม่เกี่ยวกับ Layout)
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      orientation: "vertical",
      wheelMultiplier: 1.2,
    });

    lenis.scrollTo(0, { immediate: true });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="relative bg-black min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="scroll-indicator fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center text-white/50 pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.2em] mb-3">Scroll Down</span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-white/80 to-transparent animate-pulse" />
      </div>

      <section
        ref={pinSectionRef}
        className="relative flex h-screen w-full flex-col items-center justify-center bg-black overflow-hidden"
      >
        <div className="hand-container absolute inset-0 z-20 flex flex-row justify-between items-center pointer-events-none">
          <img
            src="/left_hand-removebg-preview.png"
            className="left-hand h-[200%] object-contain"
            alt=""
          />
          <img
            src="/right_hand-removebg-preview.png"
            className="right-hand h-[200%] object-contain"
            alt=""
          />
        </div>

        <div className="text-intro absolute inset-0 z-20 flex justify-center items-center pointer-events-none">
          <h1 className="text-2xl sm:text-4xl font-semibold text-white drop-shadow-lg text-center">
            Do you know ?, <br/> how much <br/>money do you spend <br/>in a day ?
          </h1>
        </div>

        {/* ข้อความชุดที่ 2 ที่เราต้องการให้ซ่อนไว้ก่อน (ใส่ opacity-0 invisible ไว้ใน HTML เลย) */}
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center z-10 pointer-events-none">
          <h2 className="pin-header opacity-0 invisible text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Welcome to <span className="gradient-text">Keep-Pay</span> Website
          </h2>
          <div className="pin-line opacity-0 invisible mt-8 h-[1px] w-32 bg-white origin-left" />
          <p className="pin-subtext opacity-0 invisible mt-6 max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed">
            A website list of income and expense to manage your life.
          </p>
        </div>
      </section>

<section ref={horizontalRef} className="relative h-screen overflow-hidden border-b border-white/[0.06]">
        <div ref={horizontalTrackRef} className="flex h-full items-center gap-8 px-[10vw]" style={{ width: "fit-content" }}>
          {horizontalCards.map((card, i) => (
            <div key={i} className={`flex-shrink-0 w-[80vw] sm:w-[45vw] h-[70vh] rounded-3xl border border-white/[0.08] bg-gradient-to-br ${card.color} backdrop-blur-xl p-12 flex flex-col justify-between`}>
              <span className="text-7xl font-bold text-white">{card.num}</span>
              <div>
                {card.img && (
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    className="w-full h-48 object-cover rounded-xl mb-4" 
                  />
                )}
                
                <h3 className="text-3xl sm:text-4xl font-bold text-white">{card.title}</h3>
                <p className="mt-3 text-slate-300 text-lg max-w-md">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* พื้นที่สำหรับให้ไถลหน้าจอลงไปได้ */}
      <div className="h-[150vh] bg-black" />
    </div>
  );
}
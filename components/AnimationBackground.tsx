"use client";

import { LottieAnimation } from "@/components/lottieAnimation";

export function AnimationBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl bg-[#0d0f1d]">
      {/* Left half */}
      <div className="absolute left-0 top-0 h-full md:w-[336px] w-[152px] overflow-hidden [clip-path:inset(0)]">
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#0c0f1d] from-30% to-[#0c0f1d00] to-80%"
          style={{ zIndex: 2 }}
        />
        <LottieAnimation
          src="/animations/grid_loop.lottie"
          autoplay
          loop
          layout={{ fit: "cover", align: [0, 0] }}
          renderConfig={{ autoResize: true }}
        />
      </div>

      {/* Right half */}
      <div className="absolute right-0 top-0 h-full md:w-[336px] w-[152px] overflow-hidden [clip-path:inset(0)]">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0c0f1d] from-30% to-[#0c0f1d00] to-80%"
          style={{ zIndex: 2 }}
        />
        <LottieAnimation
          src="/animations/grid_loop.lottie"
          style={{ transform: "rotate(180deg)" }}
          autoplay
          loop
          layout={{ fit: "cover", align: [0.01, 0] }}
          renderConfig={{ autoResize: true }}
        />
      </div>
    </div>
  );
}



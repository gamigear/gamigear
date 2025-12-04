"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("구독해 주셔서 감사합니다!");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 bg-black text-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 text-center">
        <Mail size={40} className="mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3">NEWSLETTER</h2>
        <p className="text-gray-400 mb-8 text-sm">
          새로운 소식과 특별한 혜택을 가장 먼저 받아보세요
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-white/50"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            구독
          </button>
        </form>
      </div>
    </section>
  );
}

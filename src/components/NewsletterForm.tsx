"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface NewsletterFormProps {
  variant?: "inline" | "card";
  className?: string;
}

export default function NewsletterForm({ variant = "inline", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "website" }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Đăng ký thành công! Cảm ơn bạn.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.code === "ALREADY_SUBSCRIBED" 
          ? "Email này đã được đăng ký." 
          : "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setStatus("error");
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    }

    setTimeout(() => {
      if (status !== "success") setStatus("idle");
    }, 3000);
  };

  if (variant === "card") {
    return (
      <div className={`bg-gray-100 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold">Đăng ký nhận tin</h3>
            <p className="text-sm text-gray-500">Nhận thông tin khuyến mãi mới nhất</p>
          </div>
        </div>
        
        {status === "success" ? (
          <div className="flex items-center gap-2 text-green-600 py-3">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Đăng ký"
              )}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-500">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={className}>
      {status === "success" ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          <span className="text-sm">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500 mt-1">{message}</p>
      )}
    </div>
  );
}

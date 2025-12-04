"use client";

import { useState, useEffect } from "react";
import { Mail, X, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        setTimeout(() => setIsOpen(false), 2000);
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

  return (
    <>
      {/* Fixed Button - Right side, vertically centered */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-700 text-white px-2 py-4 rounded-l-lg shadow-lg transition-all hover:pr-3 group"
        aria-label="Đăng ký nhận tin"
      >
        <div className="flex flex-col items-center gap-2">
          <Mail size={20} />
          <span className="text-xs font-medium writing-vertical">Newsletter</span>
        </div>
      </button>

      {/* Popup Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          {/* Popup Content */}
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Đăng ký nhận tin</h2>
                  <p className="text-blue-100 text-sm mt-1">Nhận thông tin khuyến mãi mới nhất</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {status === "success" ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <p className="text-green-600 font-medium text-lg">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email của bạn
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký ngay"
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-sm text-red-500 text-center">{message}</p>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    Chúng tôi cam kết bảo mật thông tin của bạn
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </>
  );
}

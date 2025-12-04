"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initial page load
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Route change - show loader briefly
    setLoading(true);
    setFadeOut(false);
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 300);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className={`page-loader ${fadeOut ? "fade-out" : ""}`}>
      <div className="loader-content">
        <div className="loader-logo">
          <span className="logo-text">GAMIGEAR</span>
        </div>
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loader-text">Đang tải...</p>
      </div>

      <style jsx>{`
        .page-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #052566 0%, #3764be 100%);
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }

        .page-loader.fade-out {
          opacity: 0;
          visibility: hidden;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .loader-logo {
          animation: pulse 2s ease-in-out infinite;
        }

        .logo-text {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 2px;
        }

        .loader-spinner {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          border-top-color: #fff;
          animation-delay: 0s;
        }

        .spinner-ring:nth-child(2) {
          border-right-color: #fbbf24;
          animation-delay: 0.15s;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
        }

        .spinner-ring:nth-child(3) {
          border-bottom-color: #60a5fa;
          animation-delay: 0.3s;
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
        }

        .loader-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

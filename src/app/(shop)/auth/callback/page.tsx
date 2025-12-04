"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      if (status === "loading") return;

      // Get redirect URL from sessionStorage
      const redirectUrl = sessionStorage.getItem("auth_redirect") || "/";
      sessionStorage.removeItem("auth_redirect");

      if (status === "authenticated" && session?.user) {
        try {
          // Call our custom callback to set our auth cookie
          const response = await fetch("/api/auth/oauth/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              provider: (session as any).provider || "oauth",
              providerId: (session as any).providerId,
            }),
          });

          if (response.ok) {
            await refreshUser();
            router.push(redirectUrl);
          } else {
            setError("Login failed. Please try again.");
            setTimeout(() => router.push("/login"), 2000);
          }
        } catch (error) {
          console.error("Callback error:", error);
          setError("Login failed. Please try again.");
          setTimeout(() => router.push("/login"), 2000);
        }
      } else if (status === "unauthenticated") {
        router.push("/login");
      }
    };

    handleCallback();
  }, [session, status, router, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">Redirecting to login page...</p>
        </div>
      ) : (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Processing login...</p>
        </>
      )}
    </div>
  );
}

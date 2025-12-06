"use client";

import { useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  prompt_parent_id?: string;
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface GoogleOneTapProps {
  clientId?: string;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
  context?: "signin" | "signup" | "use";
}

export default function GoogleOneTap({
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  autoSelect = true,
  cancelOnTapOutside = true,
  context = "signin",
}: GoogleOneTapProps) {
  const { data: session, status } = useSession();

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      // Gửi credential token đến NextAuth
      await signIn("google-one-tap", {
        credential: response.credential,
        redirect: false,
      });
      
      // Reload để cập nhật session
      window.location.reload();
    } catch (error) {
      console.error("Google One Tap sign in error:", error);
    }
  }, []);

  useEffect(() => {
    // Không hiển thị nếu đã đăng nhập hoặc đang loading
    if (status === "loading" || session) {
      return;
    }

    // Không hiển thị nếu không có client ID
    if (!clientId) {
      console.warn("Google One Tap: Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: autoSelect,
          cancel_on_tap_outside: cancelOnTapOutside,
          context: context,
          itp_support: true,
        });

        // Hiển thị One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.google) {
        window.google.accounts.id.cancel();
      }
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [session, status, clientId, autoSelect, cancelOnTapOutside, context, handleCredentialResponse]);

  // Component không render gì - Google tự hiển thị popup
  return null;
}

"use client";

import { useEffect, useState } from "react";

export default function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string>("");

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings?.favicon) {
          setFaviconUrl(data.settings.favicon);
        }
      } catch (error) {
        console.error("Failed to fetch favicon:", error);
      }
    };
    fetchFavicon();
  }, []);

  useEffect(() => {
    if (!faviconUrl) return;

    // Update favicon in document head
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    // Also update shortcut icon
    let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    if (!shortcutLink) {
      shortcutLink = document.createElement("link");
      shortcutLink.rel = "shortcut icon";
      document.head.appendChild(shortcutLink);
    }
    shortcutLink.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}

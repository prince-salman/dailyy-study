"use client";
import { useEffect } from "react";

export default function DynamicHead() {
  useEffect(() => {
    const customLogo = localStorage.getItem("adminLogo");
    if (customLogo) {
      // 1. Update Favicon (Browser Tab Icon)
      let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = customLogo;

      // 2. Update Apple Touch Icon (iOS Homescreen)
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = customLogo;

      // 3. Update PWA Manifest (Android APK/Homescreen)
      const manifest = {
        name: "Daily Study",
        short_name: "Daily Study",
        description: "Platform Les Online Terlengkap",
        start_url: "/",
        display: "standalone",
        background_color: "#09090b",
        theme_color: "#09090b",
        icons: [
          {
            src: customLogo,
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: customLogo,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      };
      
      const manifestString = JSON.stringify(manifest);
      const manifestUrl = "data:application/manifest+json;charset=utf-8," + encodeURIComponent(manifestString);
      
      let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;
    }
  }, []);

  return null;
}

"use client";
import React, { useEffect } from "react";

export default function PushNotification() {
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        setTimeout(() => {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Daily Study", {
                body: "Terima kasih! Kamu akan menerima pengingat jadwal belajar dan Tryout.",
                icon: "/icon-192x192.png"
              });
            }
          });
        }, 5000);
      }
    }
  }, []);

  return null;
}

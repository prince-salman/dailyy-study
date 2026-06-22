"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        const userEmail = localStorage.getItem("userEmail");
        const currentSession = localStorage.getItem("current_session_id");
        
        if (userEmail && currentSession) {
          const users = JSON.parse(localStorage.getItem("app_users") || "[]");
          const me = users.find((u: any) => u.email === userEmail);
          
          if (me && me.sessionId && me.sessionId !== currentSession) {
            
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("current_session_id");
            alert("Sesi Anda berakhir karena akun ini baru saja digunakan untuk masuk di perangkat lain (Multi-Device Lock).");
            router.push("/profile");
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}

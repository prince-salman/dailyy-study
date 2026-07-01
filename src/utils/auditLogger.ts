import { supabase } from "@/lib/supabase";

export const addAuditLog = async (action: string) => {
  if (typeof window === "undefined") return;
  const userName = localStorage.getItem("userName") || "Unknown";
  const userRole = localStorage.getItem("userRole") || "guest";

  await supabase.from("audit_logs").insert({
    user_name: userName,
    user_role: userRole,
    action,
  });
};

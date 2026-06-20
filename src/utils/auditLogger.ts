export const addAuditLog = (action: string) => {
  if (typeof window === "undefined") return;
  const logs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
  const userName = localStorage.getItem("userName") || "Unknown";
  const userRole = localStorage.getItem("userRole") || "guest";
  
  const newLog = {
    id: Date.now().toString(),
    time: new Date().toLocaleString("id-ID"),
    user: userName,
    role: userRole,
    action
  };
  
  logs.unshift(newLog);
  if (logs.length > 100) logs.pop();
  
  localStorage.setItem("audit_logs", JSON.stringify(logs));
};

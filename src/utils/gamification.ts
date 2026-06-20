export const calculateLevel = (xp: number) => {
  if (xp < 500) return { level: 1, title: "Pemula", nextLvlXp: 500, progress: (xp / 500) * 100 };
  if (xp < 1500) return { level: 2, title: "Pelajar", nextLvlXp: 1500, progress: ((xp - 500) / 1000) * 100 };
  if (xp < 3000) return { level: 3, title: "Sarjana", nextLvlXp: 3000, progress: ((xp - 1500) / 1500) * 100 };
  if (xp < 5000) return { level: 4, title: "Master", nextLvlXp: 5000, progress: ((xp - 3000) / 2000) * 100 };
  return { level: 5, title: "Grandmaster", nextLvlXp: xp, progress: 100 };
};

export const addXP = (amount: number, reason: string) => {
  if (typeof window === "undefined") return;
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const users = JSON.parse(localStorage.getItem("app_users") || "[]");
  const userIndex = users.findIndex((u: any) => u.email === userEmail);
  
  if (userIndex !== -1) {
    const user = users[userIndex];
    if (user.role !== "student") return;
    
    const currentXp = user.xp || 0;
    user.xp = currentXp + amount;
    
    const xpHistory = user.xpHistory || [];
    xpHistory.unshift({ amount, reason, date: new Date().toISOString() });
    if (xpHistory.length > 50) xpHistory.pop();
    user.xpHistory = xpHistory;

    users[userIndex] = user;
    localStorage.setItem("app_users", JSON.stringify(users));
  }
};

export const processDailyStreak = (userEmail: string) => {
  const users = JSON.parse(localStorage.getItem("app_users") || "[]");
  const userIndex = users.findIndex((u: any) => u.email === userEmail);
  
  if (userIndex !== -1) {
    const user = users[userIndex];
    if (user.role !== "student") return user;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const lastLogin = user.lastLoginDate || "";
    
    if (!lastLogin) {
      user.streak = 1;
      user.lastLoginDate = todayStr;
    } else if (lastLogin !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if (lastLogin === yesterdayStr) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1;
      }
      user.lastLoginDate = todayStr;
      
      user.xp = (user.xp || 0) + 10; 
      
      const xpHistory = user.xpHistory || [];
      xpHistory.unshift({ amount: 10, reason: "Login Harian (Streak " + user.streak + ")", date: new Date().toISOString() });
      if (xpHistory.length > 50) xpHistory.pop();
      user.xpHistory = xpHistory;
    }
    
    users[userIndex] = user;
    localStorage.setItem("app_users", JSON.stringify(users));
    return user;
  }
  return null;
};

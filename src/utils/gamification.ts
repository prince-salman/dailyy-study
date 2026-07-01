import { supabase } from "@/lib/supabase";

export const calculateLevel = (xp: number) => {
  if (xp < 500) return { level: 1, title: "Pemula", nextLvlXp: 500, progress: (xp / 500) * 100 };
  if (xp < 1500) return { level: 2, title: "Pelajar", nextLvlXp: 1500, progress: ((xp - 500) / 1000) * 100 };
  if (xp < 3000) return { level: 3, title: "Sarjana", nextLvlXp: 3000, progress: ((xp - 1500) / 1500) * 100 };
  if (xp < 5000) return { level: 4, title: "Master", nextLvlXp: 5000, progress: ((xp - 3000) / 2000) * 100 };
  return { level: 5, title: "Grandmaster", nextLvlXp: xp, progress: 100 };
};

export const addXP = async (amount: number, reason: string) => {
  if (typeof window === "undefined") return;
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const { data: user } = await supabase
    .from("users")
    .select("xp, xp_history, roles")
    .eq("email", userEmail)
    .single();

  if (!user) return;
  if (!user.roles?.includes("student")) return;

  const newXp = (user.xp || 0) + amount;
  const xpHistory = Array.isArray(user.xp_history) ? user.xp_history : [];
  xpHistory.unshift({ amount, reason, date: new Date().toISOString() });
  if (xpHistory.length > 50) xpHistory.pop();

  await supabase
    .from("users")
    .update({ xp: newXp, xp_history: xpHistory })
    .eq("email", userEmail);
};

export const processDailyStreak = async (userEmail: string) => {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", userEmail)
    .single();

  if (!user) return null;
  if (!user.roles?.includes("student")) return user;

  const todayStr = new Date().toISOString().split("T")[0];
  const lastLogin = user.last_login_date || "";

  let newStreak = user.streak || 0;
  let newXp = user.xp || 0;
  const xpHistory = Array.isArray(user.xp_history) ? user.xp_history : [];

  if (!lastLogin) {
    newStreak = 1;
  } else if (lastLogin !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastLogin === yesterdayStr) {
      newStreak = newStreak + 1;
    } else {
      newStreak = 1;
    }
    newXp = newXp + 10;
    xpHistory.unshift({ amount: 10, reason: `Login Harian (Streak ${newStreak})`, date: new Date().toISOString() });
    if (xpHistory.length > 50) xpHistory.pop();
  }

  await supabase
    .from("users")
    .update({ streak: newStreak, xp: newXp, xp_history: xpHistory, last_login_date: todayStr })
    .eq("email", userEmail);

  return { ...user, streak: newStreak, xp: newXp };
};

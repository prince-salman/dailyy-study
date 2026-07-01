"use client";
import React, { useState, useEffect, Suspense } from "react";
import { processDailyStreak, calculateLevel } from "@/utils/gamification";
import Button from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const INIT_USERS = [
  { id: "1", name: "Nabilla Maulana Putri", email: "nabilla@dailystudy.id", password: "password123", roles: ["sekretaris"], subjects: [] },
  { id: "2", name: "Muhammad Wildan Yusufy", email: "wildan@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Sosiologi"] },
  { id: "3", name: "Ibrahim Khalelurrahman", email: "ibrahim@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Matematika Tingkat Lanjut", "Matematika Wajib", "Biologi"] },
  { id: "4", name: "Listiyana Utami", email: "listiyana@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Biologi", "Matematika Tingkat Lanjut"] },
  { id: "5", name: "Anindyta Priatna", email: "anindyta@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Bahasa Indonesia"] },
  { id: "6", name: "I Gede Rama Adijaya", email: "rama@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Ekonomi", "Sosiologi"] },
  { id: "7", name: "Mufliha Khalida", email: "mufliha@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Bahasa Inggris"] },
  { id: "8", name: "Muhammad Raja Nirwana", email: "raja@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Fisika"] },
  { id: "10", name: "Asya Putri Hermawan", email: "asya@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Fundamental Matematika"] },
  { id: "11", name: "Elsa Lovitasari", email: "elsa@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["PPKN", "Matematika Wajib"] },
  { id: "12", name: "Nayla Harisky Puteri", email: "nayla@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Matematika Tingkat Lanjut", "Matematika Wajib"] },
  { id: "13", name: "Syifa Anjani", email: "syifa@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Fisika"] },
  { id: "14", name: "Faiz Ramadhan", email: "faiz@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Fundamental Matematika"] },
  { id: "15", name: "Rangga Alditiyo Retadani", email: "rangga@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Geografi"] },
  { id: "16", name: "Muhammad Syam Alfathin", email: "syam@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Kimia"] },
  { id: "17", name: "Jessica Mauren Sinaga", email: "jessica@dailystudy.id", password: "password123", roles: ["teacher", "bendahara"], subjects: ["Geografi"] },
  { id: "18", name: "Muhamad Salman", email: "salman@dailystudy.id", password: "salman123", roles: ["teacher", "admin"], subjects: ["Matematika Wajib"] },
  { id: "19", name: "Farhan Lubis", email: "farhan@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Biologi"] },
  { id: "20", name: "Hanif Muhammad Ridhwan", email: "hanif@dailystudy.id", password: "password123", roles: ["teacher"], subjects: ["Sejarah"] },
  { id: "98", name: "Admin Utama", email: "admin@dailystudy.id", password: "Jual1909", roles: ["admin"], subjects: [] },
];

async function seedInitUsers() {
  for (const u of INIT_USERS) {
    await supabase.from("users").upsert(
      { ...u, xp: 0, streak: 0, last_login_date: "", xp_history: [] },
      { onConflict: "email", ignoreDuplicates: true }
    );
  }
}

function ProfileContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const [xpData, setXpData] = useState({ xp: 0, streak: 0, level: 1, title: "Pemula" });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    seedInitUsers();

    if (localStorage.getItem("isLoggedIn") === "true") {
      setLoggedIn(true);
      const role = localStorage.getItem("userRole") || "student";
      setUserRole(role);
      setAvailableRoles(JSON.parse(localStorage.getItem("availableRoles") || "[]"));
      setUserSubjects(JSON.parse(localStorage.getItem("userSubjects") || "[]"));
      setUserName(localStorage.getItem("userName") || "");

      const userEmail = localStorage.getItem("userEmail") || "";

      supabase
        .from("transactions")
        .select("*")
        .eq("user_email", userEmail)
        .order("date", { ascending: false })
        .then(({ data }) => {
          if (data) setTransactions(data);
        });

      supabase
        .from("users")
        .select("xp, streak, xp_history, roles")
        .eq("email", userEmail)
        .single()
        .then(({ data }) => {
          if (data && data.roles?.includes("student")) {
            setXpHistory(Array.isArray(data.xp_history) ? data.xp_history : []);
            setXpData({ xp: data.xp || 0, streak: data.streak || 0, ...calculateLevel(data.xp || 0) });
          }
        });
    }
  }, []);

  const handleAuth = async () => {
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Email dan Password tidak boleh kosong.");
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (!user) {
        setErrorMsg("Email atau Password salah!");
        setLoading(false);
        return;
      }

      const primaryRole = user.roles?.[0] || "student";
      const allRoles = user.roles || [primaryRole];
      const subjects = user.subjects || [];

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", primaryRole);
      localStorage.setItem("availableRoles", JSON.stringify(allRoles));
      localStorage.setItem("userSubjects", JSON.stringify(subjects));
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      setLoggedIn(true);
      setUserRole(primaryRole);
      setAvailableRoles(allRoles);
      setUserSubjects(subjects);
      setUserName(user.name);

      if (primaryRole === "student") {
        await processDailyStreak(user.email);
      }

      setLoading(false);

      if (primaryRole !== "student") {
        router.push(primaryRole === "teacher" ? "/tutor" : "/admin");
        return;
      }
    } else {
      if (!name) {
        setErrorMsg("Nama tidak boleh kosong.");
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        setErrorMsg("Email sudah terdaftar!");
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        roles: ["student"],
        subjects: [],
        xp: 0,
        streak: 1,
        last_login_date: new Date().toISOString().split("T")[0],
        xp_history: [],
      };

      const { error } = await supabase.from("users").insert(newUser);
      if (error) {
        setErrorMsg("Gagal mendaftar. Coba lagi.");
        setLoading(false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "student");
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("availableRoles", JSON.stringify(["student"]));
      localStorage.setItem("userSubjects", JSON.stringify([]));

      setLoggedIn(true);
      setUserRole("student");
      setUserName(name);
      setLoading(false);
    }

    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl) {
      router.push(decodeURIComponent(redirectUrl));
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("availableRoles");
    localStorage.removeItem("userSubjects");
    setLoggedIn(false);
    setUserRole("student");
    setEmail("");
    setPassword("");
    setSuccessMsg("");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) return;
    const currentEmail = localStorage.getItem("userEmail");
    const { error } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("email", currentEmail);

    if (!error) {
      setSuccessMsg("Password berhasil diubah!");
      setIsChangingPassword(false);
      setNewPassword("");
    }
  };

  const message = searchParams.get("message");

  if (loggedIn) {
    return (
      <div className="pb-8 px-6 pt-10 flex flex-col justify-center min-h-[70vh]">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/30 relative">
             <i className={`fas ${userRole === "admin" ? "fa-user-shield" : userRole === "bendahara" ? "fa-wallet" : userRole === "sekretaris" ? "fa-user-tie" : userRole === "teacher" ? "fa-chalkboard-teacher" : "fa-user"} text-4xl`}></i>
             {userRole === "admin" && (
               <div className="absolute -bottom-2 bg-[#fbbf24] text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full border-2 border-bg-app">ADMIN</div>
             )}
             {userRole === "bendahara" && (
               <div className="absolute -bottom-2 bg-emerald-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full border-2 border-bg-app">BENDAHARA</div>
             )}
             {userRole === "sekretaris" && (
               <div className="absolute -bottom-2 bg-blue-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full border-2 border-bg-app">SEKRETARIS</div>
             )}
             {userRole === "teacher" && (
               <div className="absolute -bottom-2 bg-purple-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full border-2 border-bg-app">TUTOR</div>
             )}
          </div>
          <h2 className="text-2xl font-extrabold text-text-main mb-2 tracking-tight">
            Halo, {userRole === "admin" ? "Admin" : userRole === "bendahara" ? "Bendahara" : userRole === "sekretaris" || userRole === "teacher" ? userName : "Siswa"}!
          </h2>
          <p className="text-sm font-semibold text-text-sec">Akun kamu sudah aktif.</p>

          {userRole !== "student" && (
             <div className="flex justify-center gap-2 mt-4 flex-wrap">
               {availableRoles.includes("teacher") && (
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                   <i className="fas fa-chalkboard-teacher text-xl mb-1"></i>
                   <span className="text-[0.55rem] font-bold leading-tight">Tutor Teladan</span>
                 </div>
               )}
               {availableRoles.includes("admin") && (
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                   <i className="fas fa-user-shield text-xl mb-1"></i>
                   <span className="text-[0.55rem] font-bold leading-tight">Admin Elite</span>
                 </div>
               )}
               {(availableRoles.includes("sekretaris") || availableRoles.includes("bendahara")) && (
                 <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                   <i className="fas fa-gem text-xl mb-1"></i>
                   <span className="text-[0.55rem] font-bold leading-tight">Staff Inti</span>
                 </div>
               )}
             </div>
          )}
        </div>

        {userRole === "student" && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="font-extrabold text-white mb-4 relative z-10 text-lg flex justify-between items-center">
              <span>Pencapaian Gamifikasi</span>
              <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-lg">Lv {xpData.level}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 flex flex-col items-center justify-center text-center">
                <i className="fas fa-fire text-2xl text-rose-500 mb-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"></i>
                <p className="text-white font-bold text-lg leading-tight">{xpData.streak} <span className="text-[0.6rem] font-normal text-slate-400 block">Hari Beruntun</span></p>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 flex flex-col items-center justify-center text-center">
                <i className="fas fa-star text-2xl text-amber-400 mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"></i>
                <p className="text-white font-bold text-lg leading-tight">{xpData.xp} <span className="text-[0.6rem] font-normal text-slate-400 block">Total XP</span></p>
              </div>
            </div>

            <div className="relative z-10 mb-5">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-award text-indigo-400"></i> Lencana Kehormatan (Badges)
              </h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                  <i className="fas fa-seedling text-xl mb-1"></i>
                  <span className="text-[0.55rem] font-bold leading-tight">Pemula Tangguh</span>
                </div>
                {xpData.streak >= 3 ? (
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-in zoom-in">
                    <i className="fas fa-fire-alt text-xl mb-1"></i>
                    <span className="text-[0.55rem] font-bold leading-tight">Konsisten 3 Hari</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-slate-500 bg-slate-800/50 border-slate-700 opacity-50 grayscale">
                    <i className="fas fa-lock text-xl mb-1"></i>
                    <span className="text-[0.55rem] font-bold leading-tight">Konsisten 3 Hari</span>
                  </div>
                )}
                {xpData.level >= 5 ? (
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)] animate-in zoom-in">
                    <i className="fas fa-crown text-xl mb-1"></i>
                    <span className="text-[0.55rem] font-bold leading-tight">Siswa Elite</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-slate-500 bg-slate-800/50 border-slate-700 opacity-50 grayscale">
                    <i className="fas fa-lock text-xl mb-1"></i>
                    <span className="text-[0.55rem] font-bold leading-tight">Siswa Elite</span>
                  </div>
                )}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[72px] text-center text-slate-500 bg-slate-800/50 border-slate-700 opacity-50 grayscale">
                  <i className="fas fa-lock text-xl mb-1"></i>
                  <span className="text-[0.55rem] font-bold leading-tight">Tryout Master</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Riwayat XP Terbaru</h4>
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-3 max-h-40 overflow-y-auto no-scrollbar">
                {xpHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center">Belum ada aktivitas.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {xpHistory.slice(0, 10).map((h, i) => (
                      <li key={i} className="flex justify-between items-start text-xs border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-slate-300 font-semibold">{h.reason}</p>
                          <p className="text-[0.6rem] text-slate-500">{new Date(h.date).toLocaleString("id-ID")}</p>
                        </div>
                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">+{h.amount}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-custom text-center">
          <h3 className="font-extrabold text-text-main mb-4">Pengaturan Akun</h3>

          {(userRole === "admin" || userRole === "bendahara" || userRole === "sekretaris" || userRole === "teacher") && (
            <Link href={userRole === "teacher" ? "/tutor" : "/admin"}>
              <Button className="w-full mb-3 bg-slate-800 text-white border-slate-800 hover:bg-slate-700">
                <i className={`fas ${userRole === "bendahara" ? "fa-file-invoice-dollar" : userRole === "sekretaris" ? "fa-clipboard-list" : userRole === "teacher" ? "fa-video" : "fa-cogs"} mr-2`}></i> Masuk Panel {userRole === "bendahara" ? "Bendahara" : userRole === "sekretaris" ? "Sekretaris" : userRole === "teacher" ? "Tutor" : "Admin"}
              </Button>
            </Link>
          )}

          {availableRoles.length > 1 && (
            <div className="bg-bg-body p-4 rounded-xl border border-border mb-4 text-left">
              <label className="font-extrabold text-text-main text-xs block mb-2">Ganti Mode (Switch Role)</label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      localStorage.setItem("userRole", r);
                      setUserRole(r);
                      router.push(r === "teacher" ? "/tutor" : r === "student" ? "/" : "/admin");
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${userRole === r ? "bg-primary text-white border-primary" : "bg-bg-card text-text-sec border-border hover:border-primary"}`}
                  >
                    <i className={`fas ${r === "admin" ? "fa-user-shield" : r === "bendahara" ? "fa-wallet" : r === "sekretaris" ? "fa-user-tie" : r === "teacher" ? "fa-chalkboard-teacher" : "fa-user"} mr-1`}></i>
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isChangingPassword ? (
            <div className="bg-bg-body p-4 rounded-xl border border-border mb-4 text-left animate-in fade-in zoom-in-95 duration-200">
              <label className="font-extrabold text-text-main text-xs block mb-2">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full p-3 border-2 border-border bg-bg-card rounded-xl text-text-main font-semibold text-sm transition-all duration-300 focus:border-primary outline-none mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} className="flex-1 py-2 text-sm">Simpan</Button>
                <Button onClick={() => setIsChangingPassword(false)} variant="outline" className="flex-1 py-2 text-sm">Batal</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsChangingPassword(true)} className="w-full mb-3 bg-bg-body text-text-main border-border hover:border-primary hover:text-primary transition-colors">
              <i className="fas fa-key mr-2"></i> Ganti Password
            </Button>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center animate-in fade-in">
              {successMsg}
            </div>
          )}

          <Button variant="outline" onClick={handleLogout} className="w-full text-rose-500 border-rose-500 hover:bg-rose-500 hover:text-white transition-colors mb-6">
            <i className="fas fa-sign-out-alt mr-2"></i> Keluar (Logout)
          </Button>

          {userRole === "student" && (
            <div className="text-left mt-6">
              <h3 className="font-extrabold text-text-main mb-4 border-t border-border pt-6"><i className="fas fa-history mr-2 text-primary"></i> Riwayat Langganan</h3>
              <div className="flex flex-col gap-3">
                {transactions.length === 0 ? (
                  <div className="bg-bg-body p-4 rounded-xl border border-dashed border-border text-center text-sm font-bold text-text-sec">
                    Belum ada riwayat langganan.
                  </div>
                ) : (
                  transactions.map((tx, idx) => {
                    let statusLabel = <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[0.65rem] font-bold">Pending</span>;
                    let expired = false;

                    if (tx.status === "approved" && tx.approved_at) {
                      let days = 30;
                      if (tx.package?.includes("2 Minggu")) days = 14;
                      const expiry = new Date(tx.approved_at).getTime() + (days * 24 * 60 * 60 * 1000);
                      if (Date.now() > expiry) {
                        expired = true;
                        statusLabel = <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-[0.65rem] font-bold">Kedaluwarsa</span>;
                      } else {
                        statusLabel = <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[0.65rem] font-bold">Aktif</span>;
                      }
                    }

                    return (
                      <div key={tx.id ?? idx} className={`p-3 rounded-xl border ${expired ? "bg-bg-body border-border opacity-70" : "bg-primary/5 border-primary/20"}`}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-extrabold text-[0.8rem] text-text-main">{tx.package} {tx.subject ? `- ${tx.subject}` : ""}</div>
                          {statusLabel}
                        </div>
                        <div className="text-primary font-bold text-[0.85rem] mb-1">Rp {tx.price?.toLocaleString("id-ID")}</div>
                        <div className="text-[0.65rem] text-text-sec">
                          {tx.approved_at ? `Diaktifkan: ${new Date(tx.approved_at).toLocaleDateString("id-ID")}` : `Dipesan: ${new Date(tx.date).toLocaleDateString("id-ID")}`}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 px-6 pt-10 flex flex-col justify-center min-h-[70vh]">
      {message === "login_required" && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <i className="fas fa-exclamation-circle mt-0.5 text-lg"></i>
          <div>
            <h4 className="font-bold text-sm">Akses Terkunci</h4>
            <p className="text-xs font-semibold opacity-90 mt-0.5">Silakan masuk atau daftar akun terlebih dahulu untuk mengakses materi pembelajaran tersebut.</p>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-text-main mb-2 tracking-tight">
          {isLogin ? "Masuk Akun" : "Daftar Akun"}
        </h2>
        <p className="text-sm font-semibold text-text-sec">Silakan login untuk mengakses materi pembelajaran.</p>
      </div>

      <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-custom">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="font-extrabold text-text-main text-sm">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full p-4 border-2 border-border bg-bg-card rounded-2xl text-text-main font-semibold text-[0.95rem] transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_var(--color-primary-soft)] outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-extrabold text-text-main text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full p-4 border-2 border-border bg-bg-card rounded-2xl text-text-main font-semibold text-[0.95rem] transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_var(--color-primary-soft)] outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-extrabold text-text-main text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full p-4 border-2 border-border bg-bg-card rounded-2xl text-text-main font-semibold text-[0.95rem] transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_var(--color-primary-soft)] outline-none"
            />
          </div>

          <Button className="mt-4" onClick={handleAuth} disabled={loading}>
            {loading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : null}
            {isLogin ? "Masuk" : "Daftar"}
          </Button>
        </div>

        <div className="text-center mt-6 text-sm font-semibold text-text-sec">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-extrabold hover:underline"
          >
            {isLogin ? "Daftar di sini" : "Masuk di sini"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-text-sec">Memuat...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

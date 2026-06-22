"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const mainTabs = ["/", "/live", "/laporan", "/profile"];
  if (!mainTabs.includes(pathname || "")) return null;

  const navItems = [
    { name: "Home", icon: "fa-home", path: "/" },
    { name: "Live", icon: "fa-broadcast-tower", path: "/live" },
    { name: "Laporan", icon: "fa-chart-pie", path: "/laporan" },
    { name: "Profil", icon: "fa-user", path: "/profile" },
  ];

  return (
    <div className="shrink-0 h-[80px] bg-bg-glass backdrop-blur-xl border-t border-border flex overflow-x-auto no-scrollbar justify-start sm:justify-center items-center z-50 pb-4 md:pb-0 md:h-[65px] md:gap-20 px-2 space-x-2 sm:space-x-8">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer min-w-[75px] md:min-w-[80px] relative pt-2.5 transition-all duration-300 ${
              isActive ? "text-primary" : "text-text-sec"
            }`}
          >
            {isActive && (
              <div className="absolute top-0 w-10 h-1 bg-primary rounded-b-sm shadow-[0_4px_10px_rgba(99,102,241,0.3)]"></div>
            )}
            <i
              className={`fas ${item.icon} text-2xl transition-transform duration-300 ${
                isActive ? "-translate-y-1 scale-110 drop-shadow-lg text-primary" : ""
              }`}
            ></i>
            <span className="text-[0.75rem] font-extrabold">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

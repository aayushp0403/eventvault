import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Upload, Sparkles, Bell, LogOut, Aperture } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { to: "/events",       icon: CalendarDays,    label: "Events"    },
  { to: "/upload",       icon: Upload,          label: "Upload"    },
  { to: "/ai-search",    icon: Sparkles,        label: "AI Search" },
  { to: "/notifications",icon: Bell,            label: "Alerts"    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-obsidian-900 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center glow-volt">
          <Aperture size={20} className="text-obsidian-950" strokeWidth={2.5} />
        </div>
        <span className="font-display font-700 text-xl tracking-tight text-white">
          Event<span className="text-volt">Vault</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? "bg-volt text-obsidian-950 font-bold glow-volt"
                : "text-white/50 hover:text-white hover:bg-white/5"}`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-5 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-obsidian-700 border border-white/10 flex items-center justify-center text-volt font-display font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-white/40 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-ember hover:bg-ember/10 text-xs transition-all"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
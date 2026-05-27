import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import api from "../../lib/api";

export default function Topbar() {
  const [unread, setUnread] = useState(0);
  const [query,  setQuery]  = useState("");
  const navigate            = useNavigate();

  useEffect(() => {
    api.get("/api/v1/notifications")
      .then(({ data }) => setUnread(data.filter(n => n.is_read === "false").length))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/ai-search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-6 border-b border-white/5 bg-obsidian-900/60 backdrop-blur-sm">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search events, tags, people…"
            className="w-full bg-obsidian-800 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-volt/40 transition-colors"
          />
        </div>
      </form>

      {/* Notification bell */}
      <button
        onClick={() => navigate("/notifications")}
        className="relative w-10 h-10 rounded-xl bg-obsidian-800 border border-white/8 flex items-center justify-center hover:border-volt/30 transition-all"
      >
        <Bell size={17} className="text-white/60" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ember text-white text-[10px] font-bold flex items-center justify-center animate-pulse-volt">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </header>
  );
}
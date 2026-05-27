import { useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, Tag, CheckCheck } from "lucide-react";
import api from "../lib/api";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const ICONS = {
  like:    <Heart size={14} className="text-ember" />,
  comment: <MessageCircle size={14} className="text-ice" />,
  tag:     <Tag size={14} className="text-volt" />,
  default: <Bell size={14} className="text-white/40" />,
};

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoad]    = useState(true);

  const load = () => {
    setLoad(true);
    api.get("/api/v1/notifications").then(r => setNotifs(r.data)).finally(() => setLoad(false));
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await api.patch("/api/v1/notifications/read-all");
    toast.success("All marked as read");
    load();
  };

  const markOne = async (id) => {
    await api.patch(`/api/v1/notifications/${id}/read`);
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: "true" } : x));
  };

  const unread = notifs.filter(n => n.is_read === "false").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Notifications</h1>
          <p className="text-white/40 text-sm mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-volt hover:border-volt/30 text-sm transition-all">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : notifs.length === 0 ? (
        <div className="card-glass rounded-2xl p-16 text-center">
          <Bell size={40} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/30">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <div key={n.id}
              onClick={() => n.is_read === "false" && markOne(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all animate-fade-up ${
                n.is_read === "false"
                  ? "bg-obsidian-800/80 border-volt/15 hover:border-volt/30"
                  : "bg-obsidian-900/40 border-white/5 hover:border-white/10"
              }`}
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.is_read === "false" ? "bg-volt/10" : "bg-white/5"
              }`}>
                {ICONS[n.notif_type] || ICONS.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.is_read === "false" ? "text-white font-medium" : "text-white/50"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-white/30 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {n.is_read === "false" && (
                <div className="w-2 h-2 rounded-full bg-volt mt-2 shrink-0 animate-pulse-volt" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
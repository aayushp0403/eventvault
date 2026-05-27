import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ImageIcon, Heart, Upload, ArrowRight } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import MediaCard from "../components/ui/MediaCard";
import MediaLightbox from "../components/ui/MediaLightbox";
import Spinner from "../components/ui/Spinner";

export default function Dashboard() {
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [events,  setEvents]      = useState([]);
  const [recent,  setRecent]      = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/v1/events"),
      api.get("/api/v1/events").then(r =>
        r.data.length > 0
          ? api.get(`/api/v1/media/event/${r.data[0].id}`)
          : { data: [] }
      ),
    ]).then(([evRes, mediaRes]) => {
      setEvents(evRes.data);
      setRecent(mediaRes.data.slice(0, 12));
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Events",  value: events.length,           icon: CalendarDays, color: "text-volt"  },
    { label: "Photos",        value: recent.length,           icon: ImageIcon,    color: "text-ice"   },
    { label: "Total Likes",   value: recent.reduce((a, m) => a + (m.like_count || 0), 0), icon: Heart, color: "text-ember" },
    { label: "Uploads",       value: recent.filter(m => m.uploader_id === user?.id).length, icon: Upload, color: "text-volt" },
  ];

  const lbIdx  = selected ? recent.findIndex(m => m.id === selected.id) : -1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Hey, <span className="text-volt">{user?.full_name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-white/40 mt-1 text-sm">Here's what's happening in your vault.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i}
            className="card-glass rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-medium">{s.label}</p>
                <p className={`font-display text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`p-2 rounded-xl bg-white/5 ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-white">Recent Events</h2>
          <button onClick={() => navigate("/events")}
            className="flex items-center gap-1 text-volt text-sm hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : events.length === 0 ? (
          <div className="card-glass rounded-2xl p-10 text-center text-white/30 text-sm">
            No events yet. <button onClick={() => navigate("/events")} className="text-volt underline">Create one</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((ev, i) => (
              <div key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className="card-glass rounded-2xl p-5 cursor-pointer hover:border-volt/30 border border-white/6 transition-all hover:-translate-y-0.5 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white truncate">{ev.title}</p>
                    <p className="text-white/40 text-xs mt-1 capitalize">{ev.category}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wide ml-3 shrink-0 ${
                    ev.is_public ? "bg-volt/15 text-volt" : "bg-ember/15 text-ember"
                  }`}>
                    {ev.is_public ? "Public" : "Private"}
                  </span>
                </div>
                {ev.description && (
                  <p className="text-white/40 text-xs mt-2 line-clamp-2">{ev.description}</p>
                )}
                <p className="text-white/25 text-xs mt-3">
                  {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "Date TBD"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent media */}
      {recent.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-4">Recent Uploads</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {recent.map(m => (
              <MediaCard key={m.id} media={m} onClick={setSelected} />
            ))}
          </div>
        </div>
      )}

      <MediaLightbox
        media={selected}
        onClose={() => setSelected(null)}
        onPrev={lbIdx > 0 ? () => setSelected(recent[lbIdx - 1]) : null}
        onNext={lbIdx < recent.length - 1 ? () => setSelected(recent[lbIdx + 1]) : null}
      />
    </div>
  );
}
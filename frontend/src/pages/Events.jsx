import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, CalendarDays, MapPin } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

const CATS = ["photoshoot","workshop","trip","competition","cultural","party","other"];

export default function Events() {
  const { user }               = useAuth();
  const navigate               = useNavigate();
  const [events,  setEvents]   = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search,  setSearch]   = useState("");
  const [catFilter, setCat]    = useState("");
  const [showModal, setModal]  = useState(false);
  const [saving, setSaving]    = useState(false);
  const [form, setForm]        = useState({
    title: "", description: "", category: "other",
    location: "", event_date: "", is_public: true,
  });

  const canCreate = ["admin","photographer"].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get("/api/v1/events", { params: { search: search || undefined, category: catFilter || undefined } })
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, catFilter]);

  const createEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, event_date: form.event_date || null };
      await api.post("/api/v1/events", payload);
      toast.success("Event created!");
      setModal(false);
      setForm({ title:"",description:"",category:"other",location:"",event_date:"",is_public:true });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally { setSaving(false); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Events</h1>
          <p className="text-white/40 text-sm mt-1">{events.length} events in your vault</p>
        </div>
        {canCreate && (
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-volt text-obsidian-950 font-bold text-sm glow-volt hover:bg-volt-dark transition-all">
            <Plus size={16} /> New Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="bg-obsidian-800 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-volt/40 w-56 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCat("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${!catFilter ? "bg-volt text-obsidian-950 border-volt" : "border-white/10 text-white/50 hover:border-white/20"}`}>
            All
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c === catFilter ? "" : c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all capitalize ${catFilter === c ? "bg-volt text-obsidian-950 border-volt" : "border-white/10 text-white/50 hover:border-white/20"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : events.length === 0 ? (
        <div className="card-glass rounded-2xl p-16 text-center">
          <CalendarDays size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((ev, i) => (
            <div key={ev.id}
              onClick={() => navigate(`/events/${ev.id}`)}
              className="card-glass rounded-2xl p-6 cursor-pointer hover:border-volt/30 border border-white/6 transition-all hover:-translate-y-1 animate-fade-up group"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest ${
                  ev.is_public ? "bg-volt/15 text-volt" : "bg-ember/15 text-ember"
                }`}>
                  {ev.is_public ? "Public" : "Private"}
                </span>
                <span className="text-[10px] text-white/30 capitalize bg-white/5 px-2 py-1 rounded-lg">{ev.category}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-volt transition-colors">{ev.title}</h3>
              {ev.description && <p className="text-white/40 text-sm mt-2 line-clamp-2">{ev.description}</p>}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/6">
                {ev.event_date && (
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <CalendarDays size={12} /> {new Date(ev.event_date).toLocaleDateString()}
                  </span>
                )}
                {ev.location && (
                  <span className="flex items-center gap-1.5 text-xs text-white/40 truncate">
                    <MapPin size={12} /> {ev.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showModal} onClose={() => setModal(false)} title="Create Event">
        <form onSubmit={createEvent} className="space-y-4">
          {[
            { label: "Title",    key: "title",    type: "text",     placeholder: "Summer Photoshoot 2025", required: true },
            { label: "Location", key: "location", type: "text",     placeholder: "Campus Auditorium" },
            { label: "Date",     key: "event_date",type: "datetime-local" },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest">{label}</label>
              <input type={type} value={form[key]} onChange={f(key)} required={required} placeholder={placeholder}
                className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/40 transition-all" />
            </div>
          ))}

          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest">Description</label>
            <textarea value={form.description} onChange={f("description")} rows={3} placeholder="What's this event about?"
              className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/40 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest">Category</label>
            <select value={form.category} onChange={f("category")}
              className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-volt/40 transition-all capitalize">
              {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_public ? "bg-volt" : "bg-white/15"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_public ? "left-6" : "left-1"}`} />
            </button>
            <span className="text-sm text-white/60">{form.is_public ? "Public event" : "Private event"}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-volt text-obsidian-950 font-bold text-sm glow-volt hover:bg-volt-dark transition-all disabled:opacity-60">
              {saving ? "Creating…" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
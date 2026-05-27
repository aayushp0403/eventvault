import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Images, Tag, Grid3X3 } from "lucide-react";
import api from "../lib/api";
import MediaCard from "../components/ui/MediaCard";
import MediaLightbox from "../components/ui/MediaLightbox";
import Spinner from "../components/ui/Spinner";

export default function EventDetail() {
  const { id }                   = useParams();
  const [event,   setEvent]      = useState(null);
  const [media,   setMedia]      = useState([]);
  const [loading, setLoading]    = useState(true);
  const [tagFilter, setTag]      = useState("");
  const [selected,  setSelected] = useState(null);
  const [page, setPage]          = useState(1);
  const PER_PAGE = 24;

  const allTags = [...new Set(media.flatMap(m => m.ai_tags || []))];

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/events/${id}`),
      api.get(`/api/v1/media/event/${id}`),
    ]).then(([ev, med]) => {
      setEvent(ev.data);
      setMedia(med.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const filtered = tagFilter ? media.filter(m => m.ai_tags?.includes(tagFilter)) : media;
  const paginated = filtered.slice(0, page * PER_PAGE);
  const lbIdx = selected ? filtered.findIndex(m => m.id === selected.id) : -1;

  if (loading) return <div className="flex justify-center py-32"><Spinner size={36} /></div>;
  if (!event)  return <div className="text-white/40 text-center py-20">Event not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Event header */}
      <div className="card-glass rounded-2xl p-7">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest ${event.is_public ? "bg-volt/15 text-volt" : "bg-ember/15 text-ember"}`}>
                {event.is_public ? "Public" : "Private"}
              </span>
              <span className="text-[10px] text-white/30 capitalize bg-white/5 px-2 py-1 rounded-lg">{event.category}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">{event.title}</h1>
            {event.description && <p className="text-white/50 mt-2 max-w-2xl text-sm">{event.description}</p>}
            <div className="flex items-center gap-5 mt-4">
              {event.event_date && <span className="text-xs text-white/40">{new Date(event.event_date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</span>}
              {event.location   && <span className="text-xs text-white/40">📍 {event.location}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-volt">{media.length}</p>
              <p className="text-xs text-white/40">Photos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-ice">{allTags.length}</p>
              <p className="text-xs text-white/40">Tags</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTag("")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!tagFilter ? "bg-volt text-obsidian-950 border-volt" : "border-white/10 text-white/40 hover:border-white/25"}`}>
            <Grid3X3 size={11} /> All
          </button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTag(t === tagFilter ? "" : t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${tagFilter === t ? "bg-volt text-obsidian-950 border-volt" : "border-white/10 text-white/40 hover:border-white/25"}`}>
              <Tag size={11} /> {t}
            </button>
          ))}
        </div>
      )}

      {/* Media grid */}
      {media.length === 0 ? (
        <div className="card-glass rounded-2xl p-16 text-center">
          <Images size={40} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No media uploaded yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {paginated.map((m, i) => (
              <div key={m.id} className="animate-fade-up" style={{ animationDelay: `${(i % PER_PAGE) * 30}ms`, animationFillMode: "both" }}>
                <MediaCard media={m} onClick={setSelected} />
              </div>
            ))}
          </div>

          {paginated.length < filtered.length && (
            <div className="flex justify-center pt-4">
              <button onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 rounded-xl border border-volt/30 text-volt text-sm font-bold hover:bg-volt/10 transition-all">
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <MediaLightbox
        media={selected}
        onClose={() => setSelected(null)}
        onPrev={lbIdx > 0 ? () => setSelected(filtered[lbIdx - 1]) : null}
        onNext={lbIdx < filtered.length - 1 ? () => setSelected(filtered[lbIdx + 1]) : null}
      />
    </div>
  );
}
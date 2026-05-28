import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Search, User, CloudUpload } from "lucide-react";
import api from "../lib/api";
import MediaCard from "../components/ui/MediaCard";
import MediaLightbox from "../components/ui/MediaLightbox";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";

export default function AISearch() {
  const [params]             = useSearchParams();
  const [tag,    setTag]     = useState(params.get("q") || "");
  const [event,  setEvent]   = useState("");
  const [user,   setUser]    = useState("");
  const [results, setRes]    = useState([]);
  const [loading, setLoad]   = useState(false);
  const [selected, setSel]   = useState(null);
  const [selfie, setSelfie]  = useState(null);
  const [myPhotos, setMyPh]  = useState([]);
  const [faceLoad, setFL]    = useState(false);

  const search = async () => {
    setLoad(true);
    try {
      const { data } = await api.get("/api/v1/ai/search", {
        params: { tag: tag || undefined, event_name: event || undefined, uploader: user || undefined },
      });
      setRes(data);
    } catch { toast.error("Search failed"); }
    finally { setLoad(false); }
  };

  useEffect(() => { if (params.get("q")) search(); }, []);

  const uploadSelfie = async () => {
    if (!selfie) return;
    const fd = new FormData();
    fd.append("file", selfie);
    try {
      await api.post("/api/v1/ai/selfie", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Selfie saved!");
    } catch { toast.error("Failed to save selfie"); }
  };

  const findMyPhotos = async () => {
    setFL(true);
    try {
      const { data } = await api.get("/api/v1/ai/my-photos");
      setMyPh(data.photos);
      toast.success(`Found ${data.matched} matching photos`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload a selfie first");
    } finally { setFL(false); }
  };

const BASE = "";
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-volt" size={28} /> AI Search
        </h1>
        <p className="text-white/40 text-sm mt-1">Search by tags, events, uploaders — or find yourself</p>
      </div>

      {/* Search panel */}
      <div className="card-glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-white">Smart Tag Search</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Tag", val: tag, set: setTag, ph: "mountains, crowd, sports…", icon: <Sparkles size={14} /> },
            { label: "Event Name", val: event, set: setEvent, ph: "Summer Fest…" },
            { label: "Uploader Username", val: user, set: setUser, ph: "alexj…" },
          ].map(({ label, val, set, ph, icon }) => (
            <div key={label}>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest">{label}</label>
              <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                onKeyDown={e => e.key === "Enter" && search()}
                className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/40 transition-all" />
            </div>
          ))}
        </div>
        <button onClick={search} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-volt text-obsidian-950 font-bold text-sm glow-volt hover:bg-volt-dark transition-all disabled:opacity-60">
          {loading ? <Spinner size={16} /> : <Search size={16} />}
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-sm text-white/50 mb-4">{results.length} result(s)</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map(m => (
              <div key={m.id} className="relative group rounded-xl overflow-hidden bg-obsidian-800 border border-white/6 aspect-square cursor-pointer hover:border-volt/30 transition-all"
                onClick={() => setSel(m)}>
                {m.thumbnail_path && (
                  <img src={`${BASE}/${m.thumbnail_path.replace(/\\/g,"/")}`} className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-obsidian-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-wrap gap-1">
                    {(m.ai_tags || []).slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-volt/20 text-volt">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facial recognition */}
      <div className="card-glass rounded-2xl p-6 space-y-5 border border-ice/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ice/15 flex items-center justify-center">
            <User size={18} className="text-ice" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white">Find Me in Photos</h2>
            <p className="text-white/40 text-xs">Upload a selfie to discover your photos across all events</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest">Your Selfie</label>
            <input type="file" accept="image/*" onChange={e => setSelfie(e.target.files[0])}
              className="block text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-obsidian-700 file:text-white/70 file:text-xs file:font-bold hover:file:bg-obsidian-600 transition-all" />
          </div>
          <button onClick={uploadSelfie} disabled={!selfie}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian-700 border border-white/10 text-white text-sm font-bold hover:border-ice/40 transition-all disabled:opacity-50">
            <CloudUpload size={15} /> Save Selfie
          </button>
          <button onClick={findMyPhotos} disabled={faceLoad}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ice/15 border border-ice/30 text-ice text-sm font-bold hover:bg-ice/25 transition-all disabled:opacity-50">
            {faceLoad ? <Spinner size={15} /> : <User size={15} />}
            {faceLoad ? "Scanning…" : "Find My Photos"}
          </button>
        </div>

        {myPhotos.length > 0 && (
          <div>
            <p className="text-sm text-ice mb-3 font-medium">{myPhotos.length} photo(s) matched</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
              {myPhotos.map(p => (
                <div key={p.id} className="rounded-xl overflow-hidden aspect-square bg-obsidian-800 border border-ice/20">
                  {p.thumbnail_path && (
                    <img src={`${BASE}/${p.thumbnail_path.replace(/\\/g,"/")}`} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <MediaLightbox media={selected} onClose={() => setSel(null)} />}
    </div>
  );
}
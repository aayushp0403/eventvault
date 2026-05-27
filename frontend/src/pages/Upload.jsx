import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X, CheckCircle2, Loader2, ImageIcon } from "lucide-react";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function Upload() {
  const [events,  setEvents]  = useState([]);
  const [files,   setFiles]   = useState([]);
  const [form,    setForm]    = useState({ event_id: "", album_id: "", caption: "", is_public: true });
  const [uploading, setUpl]   = useState(false);
  const [done,    setDone]    = useState([]);

  useEffect(() => { api.get("/api/v1/events").then(r => setEvents(r.data)); }, []);

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted.map(f => ({ file: f, preview: URL.createObjectURL(f), status: "pending" }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [], "video/*": [] }, multiple: true,
  });

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const upload = async () => {
    if (!form.event_id) { toast.error("Select an event first"); return; }
    if (files.length === 0) { toast.error("Add files first"); return; }
    setUpl(true);
    const fd = new FormData();
    fd.append("event_id",  form.event_id);
    if (form.album_id) fd.append("album_id", form.album_id);
    if (form.caption)  fd.append("caption",  form.caption);
    fd.append("is_public", form.is_public);
    files.forEach(({ file }) => fd.append("files", file));

    try {
      const { data } = await api.post("/api/v1/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Uploaded ${data.uploaded} file(s) with AI tags!`);
      setDone(data.files);
      setFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally { setUpl(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Upload Media</h1>
        <p className="text-white/40 text-sm mt-1">Drag and drop your photos and videos</p>
      </div>

      {/* Event selector */}
      <div className="card-glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-white">Target Event</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest">Event *</label>
            <select value={form.event_id} onChange={e => setForm(p => ({ ...p, event_id: e.target.value }))}
              className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-volt/40 transition-all">
              <option value="">Select event…</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest">Caption</label>
            <input value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
              placeholder="Optional caption…"
              className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/40 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_public ? "bg-volt" : "bg-white/15"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_public ? "left-6" : "left-1"}`} />
          </button>
          <span className="text-sm text-white/60">{form.is_public ? "Public media" : "Private media"}</span>
        </div>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()}
        className={`card-glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
          isDragActive ? "border-volt bg-volt/5" : "border-white/10 hover:border-volt/40"
        }`}>
        <input {...getInputProps()} />
        <CloudUpload size={40} className={`mx-auto mb-4 transition-colors ${isDragActive ? "text-volt" : "text-white/20"}`} />
        <p className="font-display font-bold text-white text-lg mb-1">
          {isDragActive ? "Drop files here" : "Drag & drop files"}
        </p>
        <p className="text-white/40 text-sm">or click to browse — photos and videos supported</p>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">{files.length} file(s) ready</p>
            <button onClick={() => setFiles([])} className="text-xs text-white/40 hover:text-ember transition-colors">Clear all</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {files.map((f, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-obsidian-800">
                {f.file.type.startsWith("image/") ? (
                  <img src={f.preview} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <ImageIcon size={24} />
                  </div>
                )}
                <button onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-obsidian-950/80 flex items-center justify-center text-white/60 hover:text-ember opacity-0 group-hover:opacity-100 transition-all">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <button onClick={upload} disabled={uploading || files.length === 0}
        className="w-full py-4 rounded-xl bg-volt text-obsidian-950 font-display font-bold text-lg glow-volt hover:bg-volt-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
        {uploading ? <><Loader2 size={20} className="animate-spin" /> Uploading & tagging…</> : <><CloudUpload size={20} /> Upload {files.length > 0 ? `${files.length} file(s)` : "Files"}</>}
      </button>

      {/* Done */}
      {done.length > 0 && (
        <div className="card-glass rounded-2xl p-6 border border-volt/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-volt" />
            <p className="font-bold text-white">Upload complete</p>
          </div>
          <div className="space-y-2">
            {done.map(f => (
              <div key={f.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-white/70 truncate max-w-xs">{f.filename}</span>
                <div className="flex flex-wrap gap-1 ml-3">
                  {(f.ai_tags || []).slice(0, 4).map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-volt/15 text-volt border border-volt/20">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
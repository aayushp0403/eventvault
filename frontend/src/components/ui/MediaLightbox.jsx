import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, MessageCircle, Send } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

const BASE = "http://localhost:8000";

export default function MediaLightbox({ media, onClose, onPrev, onNext }) {
  const [comments, setComments] = useState([]);
  const [body, setBody]         = useState("");

  useEffect(() => {
    if (!media) return;
    api.get(`/api/v1/media/${media.id}/comments`).then(r => setComments(r.data)).catch(() => {});
  }, [media?.id]);

  if (!media) return null;

  const src = media.file_path
    ? `${BASE}/${media.file_path.replace(/\\/g, "/")}`
    : null;

  const submitComment = async () => {
    if (!body.trim()) return;
    try {
      const { data } = await api.post(`/api/v1/media/${media.id}/comment`, { body });
      setComments(c => [...c, data]);
      setBody("");
    } catch { toast.error("Failed to post comment"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/95 backdrop-blur-md">
      <button onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
        <X size={18} />
      </button>

      {onPrev && (
        <button onClick={onPrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
          <ChevronLeft size={20} />
        </button>
      )}
      {onNext && (
        <button onClick={onNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
          <ChevronRight size={20} />
        </button>
      )}

      <div className="flex gap-0 w-full max-w-6xl max-h-[90vh] mx-10 rounded-2xl overflow-hidden card-glass">
        {/* Image */}
        <div className="flex-1 bg-obsidian-950 flex items-center justify-center min-h-[400px]">
          {src && <img src={src} alt={media.original_name} className="max-w-full max-h-[90vh] object-contain" />}
        </div>

        {/* Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-l border-white/6">
          <div className="p-5 border-b border-white/6">
            <p className="text-sm font-medium text-white truncate">{media.original_name}</p>
            <p className="text-xs text-white/40 mt-1">{new Date(media.created_at).toLocaleDateString()}</p>
            {media.ai_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {media.ai_tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-volt/15 text-volt border border-volt/20">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 && (
              <p className="text-white/25 text-xs text-center mt-4">No comments yet</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="text-sm">
                <span className="text-volt font-medium text-xs">{c.user_id.slice(0, 8)}</span>
                <p className="text-white/70 text-xs mt-0.5">{c.body}</p>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="p-4 border-t border-white/6 flex gap-2">
            <input
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 bg-obsidian-800 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-volt/40"
            />
            <button onClick={submitComment}
              className="w-8 h-8 rounded-lg bg-volt/20 hover:bg-volt text-volt hover:text-obsidian-950 flex items-center justify-center transition-all">
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
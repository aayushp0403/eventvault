import { useState } from "react";
import { Heart, MessageCircle, Download, Tag } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

const BASE = "";
export default function MediaCard({ media, onClick }) {
  const [likes, setLikes]   = useState(media.like_count || 0);
  const [liked, setLiked]   = useState(false);

  const thumbSrc = media.thumbnail_path
    ? `${BASE}/${media.thumbnail_path.replace(/\\/g, "/")}`
    : media.file_path
      ? `${BASE}/${media.file_path.replace(/\\/g, "/")}`
      : null;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/api/v1/media/${media.id}/like`);
      setLikes(data.count);
      setLiked(data.liked);
    } catch { toast.error("Failed to like"); }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `${BASE}/api/v1/media/${media.id}/download`;
    link.download = media.original_name || "photo";
    const token = localStorage.getItem("ev_token");
    try {
      const res = await fetch(link.href, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded with watermark");
    } catch { toast.error("Download failed"); }
  };

  return (
    <div
      onClick={() => onClick?.(media)}
      className="group relative rounded-xl overflow-hidden bg-obsidian-800 border border-white/6 cursor-pointer hover:border-volt/30 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="aspect-square overflow-hidden bg-obsidian-700">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={media.original_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">No preview</div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: liked ? "#ff5c1a" : "rgba(255,255,255,0.7)" }}>
              <Heart size={14} fill={liked ? "#ff5c1a" : "none"} />
              {likes}
            </button>
            <span className="flex items-center gap-1 text-xs text-white/50">
              <MessageCircle size={13} /> {media.comment_count || 0}
            </span>
          </div>
          <button onClick={handleDownload}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-volt hover:text-obsidian-950 flex items-center justify-center transition-all">
            <Download size={12} />
          </button>
        </div>

        {/* Tags */}
        {media.ai_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {media.ai_tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-volt/15 text-volt border border-volt/20 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
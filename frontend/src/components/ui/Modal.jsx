import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-glass rounded-2xl w-full max-w-lg p-7 animate-fade-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
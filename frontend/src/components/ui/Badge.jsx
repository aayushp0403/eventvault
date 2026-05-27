export default function Badge({ children, color = "volt" }) {
  const map = {
    volt:  "bg-volt/15 text-volt border-volt/30",
    ember: "bg-ember/15 text-ember border-ember/30",
    ice:   "bg-ice/15 text-ice border-ice/30",
    gray:  "bg-white/8 text-white/50 border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-widest ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}
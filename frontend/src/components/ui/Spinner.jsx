export default function Spinner({ size = 20 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white/10 border-t-volt animate-spin"
    />
  );
}
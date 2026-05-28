import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Aperture, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const [show,  setShow]    = useState(false);
  const [loading, setLoad]  = useState(false);
  const [form,  setForm]    = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back 👋");
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-volt/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-ember/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-11 h-11 rounded-2xl bg-volt flex items-center justify-center glow-volt">
            <Aperture size={22} className="text-obsidian-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Event<span className="text-volt">Vault</span>
          </span>
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-white/40 text-sm mb-8">Access your media vault</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/50 focus:ring-1 focus:ring-volt/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/50 focus:ring-1 focus:ring-volt/20 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Inline error state on the button itself as backup */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-volt text-obsidian-950 font-display font-bold py-3 rounded-xl hover:bg-volt-dark transition-all glow-volt disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{" "}
            <Link to="/register" className="text-volt hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
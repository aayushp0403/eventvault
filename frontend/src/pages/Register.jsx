import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Aperture } from "lucide-react";

const ROLES = [
  { value: "viewer",       label: "Viewer",       desc: "Browse public content" },
  { value: "club_member",  label: "Club Member",  desc: "Access private events"  },
  { value: "photographer", label: "Photographer", desc: "Upload & manage media"  },
  { value: "admin",        label: "Admin",        desc: "Full platform access"   },
];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [loading, setLoad] = useState(false);
  const [form, setForm]    = useState({
    email: "", username: "", full_name: "", password: "", role: "viewer",
  });

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoad(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">{label}</label>
      <input
        type={type} required value={form[name]} onChange={f(name)}
        placeholder={placeholder}
        className="w-full bg-obsidian-800 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-volt/50 focus:ring-1 focus:ring-volt/20 transition-all"
      />
    </div>
  );

  return (
    <div className="grain min-h-screen bg-obsidian-950 flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-volt/4 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-ice/4 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-11 h-11 rounded-2xl bg-volt flex items-center justify-center glow-volt">
            <Aperture size={22} className="text-obsidian-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl text-white">Event<span className="text-volt">Vault</span></span>
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-white/40 text-sm mb-8">Join the platform</p>

          <form onSubmit={submit} className="space-y-4">
            <InputField label="Full Name"  name="full_name" placeholder="Alex Johnson" />
            <InputField label="Username"   name="username"  placeholder="alexj" />
            <InputField label="Email"      name="email"     type="email"    placeholder="you@example.com" />
            <InputField label="Password"   name="password"  type="password" placeholder="••••••••" />

            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value} type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === r.value
                        ? "border-volt/60 bg-volt/10"
                        : "border-white/8 bg-obsidian-800 hover:border-white/20"
                    }`}
                  >
                    <p className={`text-xs font-bold ${form.role === r.value ? "text-volt" : "text-white"}`}>{r.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-volt text-obsidian-950 font-display font-bold py-3 rounded-xl hover:bg-volt-dark glow-volt transition-all disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-volt hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
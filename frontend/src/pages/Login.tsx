import { useState } from "react";
import { useAuth } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { Droplets, Eye, EyeOff, Lock, User } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(username.trim(), password);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white shadow-xl mb-4">
            <Droplets size={30} />
          </div>
          <h1 className="font-bold text-2xl text-foreground">DairyDrop</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <input
                  type="text" required autoComplete="username"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground pl-11 pr-4 py-3 rounded-2xl outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-muted-foreground" />
                </div>
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-secondary/50 border border-border focus:border-primary text-foreground pl-11 pr-12 py-3 rounded-2xl outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Contact your admin if you don't have an account.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import seal from "../assets/logo_here.svg";

export default function Login() {
  const [username, setUsername] = useState(
    () => localStorage.getItem("rememberedUsername") || "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("rememberMe") === "true",
  );
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "userRole",
          res.data.user?.role || res.data.role || "Viewer",
        );
        localStorage.setItem("username", res.data.user?.username || username);

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem(
            "rememberedUsername",
            res.data.user?.username || username,
          );
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedUsername");
        }

        navigate("/dashboard");
      }
    } catch (err) {
      setIsLoading(false); // 2. Turn off the loading state layer on error so they can edit fields
      setError(
        err.response?.data?.message || "Authentication transaction faulted.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm md:grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-blue-950 via-blue-700 to-blue-600 p-6 sm:p-8 md:p-10 text-white">
          <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
            <img src={seal} alt="Seal" className="h-full w-full object-cover" />
          </div>

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/90">
            LGU NAME
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.06em] sm:text-4xl md:text-5xl">
            Backtracking System
          </h1>
          <p className="mt-4 max-w-md text-sm text-blue-50/85 sm:text-base">
            A system that tracks enacted legislation, audits, and traces the
            complete history of local legislation from its current state back to
            its original introduction.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-10">
          <div className="mb-8">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Welcome back
            </p>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900">
              Sign in
            </h2>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                >
                  Forgot?
                </button> */}
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-start">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 accent-blue-600"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-blue-500/30 text-xs tracking-wide uppercase disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying Cipher..." : "Login"}
            </button>
          </form>
          {/* ⏳ NON-CLICKABLE GLASS OVERLAY TIMEOUT BLOCK */}
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto cursor-wait animate-in fade-in duration-100">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-700 tracking-wide mt-3 uppercase animate-pulse">
                Logging in...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

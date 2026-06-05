"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { login, saveAuth } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
const redirectFromEmail = searchParams.get("redirect");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login(form);
      saveAuth(data.accessToken, data.user);

      const redirectPath = localStorage.getItem("redirect_after_login");

if (redirectFromEmail) {
  router.push(redirectFromEmail);
} else {
  router.push("/");
}
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";

if (
  message.toLowerCase().includes("invalid email or password") ||
  message.toLowerCase().includes("unauthorized")
) {
  setError("Email or password is incorrect. Please try again.");
} else {
  setError(message);
}
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-sm text-slate-400">
              Continue to your scan dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            type="email"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>

        {error && (
  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
    <p className="font-semibold text-red-300">Login failed</p>
    <p className="mt-1">{error}</p>
  </div>
)}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <p className="mt-5 text-center text-sm text-slate-400">
          New to CodeGuard AI?{" "}
          <a href="/signup" className="text-emerald-400">
            Create account
          </a>
        </p>
      </form>
    </main>
  );
}
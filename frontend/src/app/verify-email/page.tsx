"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { resendVerification, saveAuth, verifyEmail } from "@/src/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
const code = codeDigits.join("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_verification_email");
    if (pendingEmail) setEmail(pendingEmail);
  }, []);

  function handleCodeChange(index: number, value: string) {
  const digit = value.replace(/\D/g, "").slice(-1);

  const nextDigits = [...codeDigits];
  nextDigits[index] = digit;
  setCodeDigits(nextDigits);

  if (digit && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
}

function handleCodeKeyDown(
  index: number,
  e: React.KeyboardEvent<HTMLInputElement>
) {
  if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
}

function handleCodePaste(e: React.ClipboardEvent<HTMLInputElement>) {
  e.preventDefault();

  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (!pasted) return;

  const nextDigits = ["", "", "", "", "", ""];

  pasted.split("").forEach((digit, index) => {
    nextDigits[index] = digit;
  });

  setCodeDigits(nextDigits);

  const nextIndex = Math.min(pasted.length, 5);
  inputRefs.current[nextIndex]?.focus();
}

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await verifyEmail({ email, code });
      saveAuth(data.accessToken, data.user);
      localStorage.removeItem("pending_verification_email");

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);
      setError("");
      setMessage("");

      const data = await resendVerification(email);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3">
            <MailCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Verify email</h1>
            <p className="text-sm text-slate-400">
              Enter the 6-digit code sent to your email.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <div className="flex justify-center gap-2">
  {codeDigits.map((digit, index) => (
    <input
      key={index}
      ref={(element) => {
        inputRefs.current[index] = element;
      }}
      value={digit}
      onChange={(e) => handleCodeChange(index, e.target.value)}
      onKeyDown={(e) => handleCodeKeyDown(index, e)}
      onPaste={handleCodePaste}
      inputMode="numeric"
      maxLength={1}
      className="h-14 w-12 rounded-xl border border-slate-700 bg-slate-950 text-center text-2xl font-bold text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
    />
  ))}
</div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
disabled={loading || code.length !== 6}
          className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify email"
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="mt-3 w-full rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </form>
    </main>
  );
}
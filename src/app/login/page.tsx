"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { signIn } from "next-auth/react";

const defaultDemoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@engineering.internal";
const defaultDemoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "ChangeMe123!";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(defaultDemoEmail);
  const [password, setPassword] = useState(defaultDemoPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password. Please try the demo account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden bg-[#eff6ff] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb] shadow-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              Internal Platform
            </p>
            <h1 className="mt-4 text-4xl font-bold text-[#0f172a]">
              Engineering Productivity Dashboard
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#475569]">
              Track deployment health, engineering activity, tickets, and environment status from one secure workspace.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-[#dbeafe] bg-white/70 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dcfce7]">
                <ShieldCheck className="h-5 w-5 text-[#15803d]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Secure access</p>
                <p className="text-xs text-[#64748b]">Protected by authenticated sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fef3c7]">
                <LockKeyhole className="h-5 w-5 text-[#b45309]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Demo account</p>
                <p className="text-xs text-[#64748b]">{defaultDemoEmail} / {defaultDemoPassword}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb] shadow-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                Engineering
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#0f172a]">
                Sign in
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0f172a]">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#0f172a]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 pr-11 text-sm text-[#0f172a] shadow-sm placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 flex items-center text-[#64748b]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-[#475569]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-[#cbd5e1] text-[#2563eb]"
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8]">
                  Need help?
                </a>
              </div>

              {error && (
                <div className="rounded-xl border border-[#ffe4e6] bg-[#fff1f2] px-3 py-2 text-sm text-[#b91c1c]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#dbeafe] bg-[#f8fbff] p-4 text-sm text-[#475569]">
              <p className="font-semibold text-[#0f172a]">Demo account</p>
              <p className="mt-1">
                Email: <span className="font-medium">{defaultDemoEmail}</span>
              </p>
              <p>
                Password: <span className="font-medium">{defaultDemoPassword}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

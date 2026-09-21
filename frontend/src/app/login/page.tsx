"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"credentials" | "2fa">("credentials");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const deviceToken = localStorage.getItem("deviceToken");

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, deviceToken }),
      });

      if (data.twoFactorRequired) {
        setStep("2fa");
        return;
      }

      localStorage.setItem("accessToken", data.token);
      window.dispatchEvent(new Event("auth-changed"));

      router.push("/wardrobe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/verify-2fa", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      localStorage.setItem("accessToken", data.token);

      // Remember this device so future logins on it can skip 2FA
      // until the trust window expires.
      if (data.deviceToken) {
        localStorage.setItem("deviceToken", data.deviceToken);
      }

      window.dispatchEvent(new Event("auth-changed"));

      router.push("/wardrobe");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResending(true);

    try {
      await apiFetch("/api/auth/resend-2fa", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#17171C]">
            {step === "credentials" ? "Welcome back" : "Enter your code"}
          </h1>

          <p className="mt-2 text-sm text-[#6B6B73]">
            {step === "credentials"
              ? "Log in to access your wardrobe."
              : `We sent a 6-digit code to ${email}.`}
          </p>
        </div>

        <div className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#4B4B52]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#17171C] outline-none placeholder:text-[#A69C8C] focus:border-[#9B7EA8]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#4B4B52]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#6B6B73] hover:text-[#9B7EA8]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#22252E] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#15171D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-[#4B4B52]"
                >
                  6-digit code
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-center text-lg tracking-[0.3em] text-[#17171C] outline-none placeholder:text-[#A69C8C] focus:border-[#9B7EA8]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#22252E] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#15171D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full text-center text-sm text-[#6B6B73] hover:text-[#9B7EA8] disabled:opacity-60"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setCode("");
                  setError("");
                }}
                className="w-full text-center text-xs text-[#A69C8C] hover:text-[#4B4B52]"
              >
                ← Back to login
              </button>
            </form>
          )}

          {step === "credentials" && (
            <p className="mt-6 text-center text-sm text-[#6B6B73]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#7E6389] hover:underline"
              >
                Register
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
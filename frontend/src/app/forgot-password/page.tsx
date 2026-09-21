"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#17171C]">
            Reset your password
          </h1>

          <p className="mt-2 text-sm text-[#6B6B73]">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6">
          {submitted ? (
            <div className="text-center">
              <p className="text-sm text-[#4B4B52]">
                If an account exists for that email, a reset link is on its
                way. Check your inbox.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-[#7E6389] hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#22252E] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#15171D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm text-[#6B6B73]">
                <Link
                  href="/login"
                  className="font-medium text-[#7E6389] hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
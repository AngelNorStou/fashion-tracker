"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      setStatus("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#2B2620]">
            Choose a new password
          </h1>
        </div>

        <div className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6">
          {status === "success" ? (
            <div className="text-center">
              <p className="text-sm text-[#5C5344]">
                Your password has been reset. You can now log in with your
                new password.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-block rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25]"
              >
                Go to login
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
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-[#5C5344]"
                >
                  New password
                </label>

                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#C1592F] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
          <div className="mx-auto max-w-md rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6 text-center">
            <p className="text-sm text-[#8A8172]">Loading...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
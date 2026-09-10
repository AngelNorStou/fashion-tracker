"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import PasswordInput from "@/components/PasswordInput";

type User = {
  id: number;
  username: string;
  email: string;
  twoFactorEnabled: boolean;
  pendingEmail: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Change email form
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");

  async function loadUser() {
    try {
      setLoading(true);
      const data = await apiFetch("/api/users/me");
      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your account."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleToggle() {
    if (!user) return;

    setToggling(true);
    setError("");

    try {
      const data = await apiFetch("/api/users/me/2fa", {
        method: "PATCH",
        body: JSON.stringify({ enabled: !user.twoFactorEnabled }),
      });

      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update 2FA setting."
      );
    } finally {
      setToggling(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordSaving(true);

    try {
      await apiFetch("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Unable to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEmailError("");
    setEmailSaving(true);

    try {
      const data = await apiFetch("/api/users/me/email-change", {
        method: "POST",
        body: JSON.stringify({
          newEmail,
          currentPassword: emailChangePassword,
        }),
      });

      setUser(data);
      setNewEmail("");
      setEmailChangePassword("");
    } catch (err) {
      setEmailError(
        err instanceof Error ? err.message : "Unable to request email change."
      );
    } finally {
      setEmailSaving(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-3xl font-semibold text-[#2B2620]">Account</h1>

          {loading && (
            <p className="text-sm text-[#8A8172]">Loading...</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {!loading && user && (
            <>
              {/* Email */}
              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
                <h2 className="text-base font-semibold text-[#2B2620]">
                  Email address
                </h2>

                <p className="mt-1 text-sm text-[#8A8172]">
                  Current: <span className="font-medium">{user.email}</span>
                </p>

                {user.pendingEmail && (
                  <div className="mt-3 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3">
                    <p className="text-sm text-[#9A4A25]">
                      A confirmation link was sent to{" "}
                      <span className="font-medium">{user.pendingEmail}</span>.
                      Click it to finish updating your email.
                    </p>
                  </div>
                )}

                <form
                  onSubmit={handleEmailSubmit}
                  className="mt-4 space-y-3 border-t border-[#EEE7DC] pt-4"
                >
                  {emailError && (
                    <div className="rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
                      {emailError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
                      New email
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C1592F]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
                      Current password
                    </label>
                    <PasswordInput
                      id="email-change-password"
                      value={emailChangePassword}
                      onChange={setEmailChangePassword}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailSaving}
                    className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emailSaving ? "Sending..." : "Change email"}
                  </button>
                </form>
              </div>

              {/* Password */}
              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
                <h2 className="text-base font-semibold text-[#2B2620]">
                  Password
                </h2>

                <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
                  {passwordError && (
                    <div className="rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="rounded-lg border border-[#C9D9B8] bg-[#EDF3E2] px-4 py-3 text-sm text-[#4A6B25]">
                      Password updated successfully.
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
                      Current password
                    </label>
                    <PasswordInput
                      id="current-password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
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
                    disabled={passwordSaving}
                    className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordSaving ? "Saving..." : "Change password"}
                  </button>
                </form>
              </div>

              {/* 2FA */}
              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
                <h2 className="text-base font-semibold text-[#2B2620]">
                  Security
                </h2>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2B2620]">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-sm text-[#8A8172]">
                      {user.twoFactorEnabled
                        ? "Enabled — a code will be emailed to you at login."
                        : "Disabled — you'll log in with just your password."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={toggling}
                    className={`relative h-7 w-12 flex-shrink-0 rounded-full transition disabled:opacity-60 ${
                      user.twoFactorEnabled ? "bg-[#C1592F]" : "bg-[#D8CFC1]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        user.twoFactorEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
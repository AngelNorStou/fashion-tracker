"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";



export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      // Registration succeeded.
      // Send the user to login rather than automatically logging them in.
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
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
            Create your account
          </h1>

          <p className="mt-2 text-sm text-[#8A8172]">
            Start building your digital wardrobe.
          </p>
        </div>

        <div className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6">

          {error && (
            <div className="mb-5 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#5C5344]"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#5C5344]"
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
                className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#5C5344]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#C1592F] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-[#8A8172]">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-medium text-[#C1592F] hover:underline"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );

}
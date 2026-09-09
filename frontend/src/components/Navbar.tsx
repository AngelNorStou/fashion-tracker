"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  id?: number;
  email?: string;
  username?: string;
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/users/me");

      setUser(data);
    } catch (error) {
      // Expected when the stored token has expired or is otherwise
      // no longer valid — fall back to logged-out state quietly.
      console.warn("Session expired or invalid, logging out locally.");

      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();

    // This lets the Navbar know when login/logout happens.
    function handleAuthChange() {
      loadUser();
    }

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("accessToken");

      setUser(null);

      router.push("/");

      window.dispatchEvent(new Event("auth-changed"));
    }
  }

  return (
    <nav className="border-b border-[#E3DACB] bg-[#FFFDF9]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold text-[#2B2620]"
        >
          Fashion Tracker
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-sm text-[#5C5344] hover:text-[#C1592F]"
          >
            Home
          </Link>

          <Link
            href="/wardrobe"
            className="text-sm text-[#5C5344] hover:text-[#C1592F]"
          >
            Wardrobe
          </Link>

          <Link
            href="/outfits"
            className="text-sm text-[#5C5344] hover:text-[#C1592F]"
          >
            Outfits
          </Link>

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="text-sm text-[#5C5344] hover:text-[#C1592F]"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-[#C1592F] px-4 py-2 text-sm font-medium text-white hover:bg-[#9A4A25]"
              >
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-4">

              <Link
                href="/account"
                className="text-sm text-[#5C5344] hover:text-[#C1592F]"
              >
                {user.username ?? user.email ?? "Profile"}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-[#D8CFC1] px-4 py-2 text-sm font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
              >
                Log out
              </button>

            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
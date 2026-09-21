"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  id?: number;
  email?: string;
  username?: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

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

  function navLinkClass(href: string) {
    const isActive = pathname === href;

    return `text-[15px] transition ${
      isActive
        ? "text-[#17171C] underline underline-offset-[10px] decoration-2"
        : "text-[#4B4B52] hover:text-[#9B7EA8]"
    }`;
  }

  return (
    <nav className="bg-[#F7F3EC]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-[2rem] font-medium tracking-[-0.04em]"
        >
          <span className="text-[#17171C]">Fashion</span>
          <span className="text-[#9B7EA8]">Tracker</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>

          <Link href="/wardrobe" className={navLinkClass("/wardrobe")}>
            Wardrobe
          </Link>

          <Link href="/outfits" className={navLinkClass("/outfits")}>
            Outfits
          </Link>

          <Link href="/generations" className={navLinkClass("/generations")}>
            AI Generations
          </Link>
        </div>

        {/* Right side: auth */}
        <div className="flex items-center gap-4">
          {!loading && !user && (
            <>


              <Link
                href="/login"
                className="text-[15px] text-[#4B4B52] transition hover:text-[#9B7EA8]"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-full bg-[#22252E] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#15171D]"
              >
                Register
                <span aria-hidden>→</span>
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="text-[15px] text-[#4B4B52] transition hover:text-[#9B7EA8]"
              >
                {user.username ?? user.email ?? "Profile"}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-[#D8CFC1] px-5 py-2.5 text-[15px] font-medium text-[#4B4B52] transition hover:border-[#9B7EA8] hover:text-[#9B7EA8]"
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
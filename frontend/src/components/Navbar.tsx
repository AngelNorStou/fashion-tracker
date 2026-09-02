"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfile(false);
  };

  return (
    <header className="border-b border-[#E3DACB] bg-[#FFFDF9]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold text-[#2B2620]"
        >
          Fashion Tracker
        </Link>

        {/* Main navigation */}
        <nav className="flex items-center gap-7 text-sm">
          <Link
            href="/"
            className="text-[#5C5344] transition hover:text-[#C1592F]"
          >
            Home
          </Link>

          <Link
            href="/wardrobe"
            className="text-[#5C5344] transition hover:text-[#C1592F]"
          >
            Wardrobe
          </Link>

          <Link
            href="/outfits"
            className="text-[#5C5344] transition hover:text-[#C1592F]"
          >
            Outfits
          </Link>

          {/* Authentication */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[#5C5344] transition hover:text-[#C1592F]"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-[#C1592F] px-4 py-2 font-medium text-[#FFF7EE] transition hover:bg-[#9A4A25]"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2 text-sm font-medium text-[#2B2620]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3E2D5] text-[#9A4A25]">
                  A
                </span>

                <span>Profile</span>
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-2 shadow-lg">

                  <div className="border-b border-[#E3DACB] px-3 py-2">
                    <p className="text-sm font-medium text-[#2B2620]">
                      User
                    </p>

                    <p className="text-xs text-[#8A8172]">
                      user@example.com
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="mt-1 block rounded-lg px-3 py-2 text-sm text-[#5C5344] hover:bg-[#F1EADC]"
                  >
                    My profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#9A4A25] hover:bg-[#F3E2D5]"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
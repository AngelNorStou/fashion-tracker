"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ClothingItem, Outfit, imageUrlFor } from "@/lib/outfitZones";
import Image from "next/image";

type User = {
  id?: number;
  email?: string;
  username?: string;
};

function RecentOutfitCard({
  outfit,
  clothingItems,
}: {
  outfit: Outfit;
  clothingItems: ClothingItem[];
}) {
  function getClothingItem(id: number) {
    return clothingItems.find((item) => item.id === id);
  }

  return (
    <Link
      href={`/outfits/${outfit.id}`}
      className="overflow-hidden rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] transition hover:border-[#C9BFAF]"
    >
      <div className="grid grid-cols-2 gap-1 bg-[#F3EDE4] p-1">
        {[...outfit.items]
          .sort((a, b) => a.layerOrder - b.layerOrder)
          .slice(0, 4)
          .map((outfitItem) => {
            const item = getClothingItem(outfitItem.clothingItemId);

            if (!item) {
              return (
                <div
                  key={outfitItem.clothingItemId}
                  className="flex aspect-square items-center justify-center bg-[#EEE8DE]"
                >
                  <span className="text-xs text-[#A69C8C]">No item</span>
                </div>
              );
            }

            const imageUrl = imageUrlFor(item);

            return (
              <div
                key={item.id}
                className="aspect-square overflow-hidden bg-[#EEE8DE]"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center">
                    <span className="text-xs text-[#A69C8C]">
                      {item.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="p-4">
        <p className="truncate text-sm font-medium text-[#17171C]">
          {outfit.name}
        </p>

        <p className="mt-0.5 text-xs text-[#6B6B73]">
          {outfit.items.length}{" "}
          {outfit.items.length === 1 ? "item" : "items"}
        </p>
      </div>
    </Link>
  );
}

function CollageLabel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute z-20 rounded-md ${className}`}
      style={{ padding: "1.7cqw 2.6cqw", ...style }}
    >
      <p
        className="whitespace-nowrap font-medium uppercase leading-[1.7] text-[#3B3B3B]"
        style={{ fontSize: "max(7px, 1.3cqw)", letterSpacing: "0.28em" }}
      >
        {children}
      </p>
      <span
        className="block h-px bg-[#3B3B3B]/50"
        style={{ marginTop: "0.9cqw", width: "2.4cqw" }}
      />
    </div>
  );
}

function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">
      {/* Clip paths for the curved collage images */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="collage-top" clipPathUnits="objectBoundingBox">
            <path d="M0.03,0 H0.97 Q1,0 1,0.03 V0.79 H0.954 C0.625,0.79 0.387,0.995 0.03,0.995 Q0,0.995 0,0.96 V0.03 Q0,0 0.03,0 Z" />
          </clipPath>
          <clipPath id="collage-bottom" clipPathUnits="objectBoundingBox">
            <path d="M0,0.23 Q0,0.185 0.03,0.185 C0.25,0.185 0.40,0.005 0.62,0.005 H0.985 Q1,0.005 1,0.03 V0.97 Q1,1 0.97,1 H0.03 Q0,1 0,0.97 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {/* Left: headline */}
          <div className="relative z-10">
            <h1
              className="font-serif font-normal leading-[0.92] tracking-[-0.045em] text-[#17171C]"
              style={{ fontSize: "clamp(3.75rem, 8vw, 6.75rem)" }}
            >
              Organize.
              <br />
              Style.
              <br />
              <span className="italic text-[#9B7EA8]">Own It.</span>
            </h1>

            <p className="mt-8 max-w-sm text-lg leading-relaxed text-[#4B4B52]">
              Keep track of your wardrobe, organize your clothing, and create
              outfits from your collection — layer by layer, zone by zone.
            </p>

            <Link
              href="/register"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#22252E] px-8 py-4 text-base font-medium text-white transition hover:bg-[#15171D]"
            >
              Get started
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Right: collage */}
          <div className="@container relative aspect-[1.05/1] w-full">
            {/* Large image */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: "0%",
                top: "0.5%",
                width: "45.6%",
                height: "93.3%",
                borderRadius: "34% 8px 8px 43% / 17.5% 8px 8px 22%",
              }}
            >
              <Image
                src="/pexels-ron-lach-8386654.jpg"
                alt="Organized wardrobe with clothes arranged by color"
                fill
                sizes="(min-width: 1024px) 26vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            <CollageLabel
              className="bg-[#E6C5C9]"
              style={{ left: "0%", bottom: "8.2%" }}
            >
              Organize
              <br />
              your wardrobe
            </CollageLabel>

            {/* Top-right image */}
            <div
              className="absolute"
              style={{
                left: "47.6%",
                top: "2.4%",
                width: "33.3%",
                height: "50.3%",
                clipPath: "url(#collage-top)",
              }}
            >
              <Image
                src="/pexels-ron-lach-8396299.jpg"
                alt="Two people trying on outfits together"
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-cover"
              />
            </div>

            <CollageLabel
              className="bg-[#E8CE8E]"
              style={{ right: "1%", top: "27.7%" }}
            >
              Create
              <br />
              outfits
              <br />
              visually
            </CollageLabel>

            {/* Handwritten note */}
            <div
              className="pointer-events-none absolute font-script text-[#9B7EA8]"
              style={{
                left: "83.5%",
                top: "1%",
                fontSize: "max(13px, 3.6cqw)",
                lineHeight: 1.15,
                transform: "rotate(-8deg)",
                transformOrigin: "left top",
              }}
            >
              <span className="block">Same</span>
              <span className="block">Clothes</span>
              <span className="block whitespace-nowrap">New Stories</span>
              <svg
                viewBox="0 0 100 12"
                className="mt-[0.6cqw] w-[85%]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M0 10 Q50 6 100 1"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Bottom-right image */}
            <div
              className="absolute"
              style={{
                left: "47.4%",
                top: "42.9%",
                width: "52.6%",
                height: "56.8%",
                clipPath: "url(#collage-bottom)",
              }}
            >
              <Image
                src="/pexels-anastasia-shuraeva-5705490.jpg"
                alt="Walk-in closet organized by category"
                fill
                sizes="(min-width: 1024px) 28vw, 55vw"
                className="object-cover object-[50%_35%]"
              />
            </div>

            <CollageLabel
              className="bg-[#A9BBA3]"
              style={{ left: "47.1%", top: "70.7%" }}
            >
              Plan
              <br />
              by layer
            </CollageLabel>
          </div>
        </div>
      </div>

    </main>
  );
}
function DashboardPage({ user }: { user: User }) {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [clothingData, outfitData] = await Promise.all([
          apiFetch("/api/clothing"),
          apiFetch("/api/outfits"),
        ]);

        setClothingItems(clothingData);
        setOutfits(outfitData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const recentOutfits = [...outfits]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[#7E6389]">
            Welcome back
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#17171C] sm:text-5xl">
            {user.username ?? "Your closet"}
          </h1>
        </div>

        {loading && (
          <div className="mt-10 py-12 text-center">
            <p className="text-sm text-[#6B6B73]">Loading your dashboard...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
            <p className="text-sm text-[#9A4A25]">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Quick stats + actions */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-5">
                <p className="text-2xl font-semibold text-[#17171C]">
                  {clothingItems.length}
                </p>
                <p className="mt-1 text-sm text-[#6B6B73]">
                  {clothingItems.length === 1
                    ? "Wardrobe item"
                    : "Wardrobe items"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-5">
                <p className="text-2xl font-semibold text-[#17171C]">
                  {outfits.length}
                </p>
                <p className="mt-1 text-sm text-[#6B6B73]">
                  {outfits.length === 1 ? "Outfit" : "Outfits"}
                </p>
              </div>

              <Link
                href="/wardrobe"
                className="flex items-center justify-center rounded-2xl bg-[#22252E] p-5 text-center text-sm font-medium text-white hover:bg-[#15171D]"
              >
                + Add clothing
              </Link>

              <Link
                href="/outfits/new"
                className="flex items-center justify-center rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-5 text-center text-sm font-medium text-[#4B4B52] hover:bg-[#F3EDE4]"
              >
                + Create outfit
              </Link>
            </div>

            {/* Recent outfits */}
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#17171C]">
                  Recent outfits
                </h2>

                {outfits.length > 0 && (
                  <Link
                    href="/outfits"
                    className="text-sm text-[#6B6B73] hover:text-[#9B7EA8]"
                  >
                    View all →
                  </Link>
                )}
              </div>

              {outfits.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
                  <h3 className="text-base font-medium text-[#17171C]">
                    No outfits yet
                  </h3>

                  <p className="mt-2 text-sm text-[#6B6B73]">
                    {clothingItems.length === 0
                      ? "Add a few pieces to your wardrobe first, then build your first outfit."
                      : "Build your first outfit from what's already in your wardrobe."}
                  </p>

                  <Link
                    href={
                      clothingItems.length === 0 ? "/wardrobe" : "/outfits/new"
                    }
                    className="mt-6 inline-block rounded-xl bg-[#22252E] px-5 py-3 text-sm font-medium text-white hover:bg-[#15171D]"
                  >
                    {clothingItems.length === 0
                      ? "+ Add clothing"
                      : "+ Create your first outfit"}
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recentOutfits.map((outfit) => (
                    <RecentOutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      clothingItems={clothingItems}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      try {
        const data = await apiFetch("/api/users/me");
        setUser(data);
      } catch (error) {
        console.error("Could not load current user:", error);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    loadUser();

    function handleAuthChange() {
      loadUser();
    }

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  if (checkingAuth) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
           <p className="text-sm text-[#6B6B73]">Loading...</p>
        </div>
      </main>
    );
  }

  return user ? <DashboardPage user={user} /> : <LandingPage />;
}
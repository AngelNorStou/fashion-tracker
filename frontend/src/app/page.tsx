"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ClothingItem, Outfit, imageUrlFor } from "@/lib/outfitZones";

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
        <p className="truncate text-sm font-medium text-[#2B2620]">
          {outfit.name}
        </p>

        <p className="mt-0.5 text-xs text-[#8A8172]">
          {outfit.items.length}{" "}
          {outfit.items.length === 1 ? "item" : "items"}
        </p>
      </div>
    </Link>
  );
}

function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#C1592F]">
            Your personal wardrobe
          </p>

          <h1 className="text-5xl font-semibold leading-tight text-[#2B2620]">
            Build outfits from the clothes you own.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8A8172]">
            Keep track of your wardrobe, organize your clothing, and create
            outfits from your collection — layer by layer, zone by zone.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-[#C1592F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#9A4A25]"
            >
              Get started
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-[#D8CFC1] bg-[#FFFDF9] px-6 py-3 text-sm font-medium text-[#5C5344] transition hover:bg-[#F3EDE4]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
          <i className="fi fi-rr-hanger text-3xl text-[#C1592F]" aria-hidden="true"></i>
            <h3 className="mt-4 text-base font-semibold text-[#2B2620]">
             <i className="fi fi-rr-archive text-3xl text-[#C1592F]" aria-hidden="true"></i> Catalog your wardrobe
            </h3>
            <p className="mt-2 text-sm text-[#8A8172]">
              Add photos, brands, colors, and categories for everything you
              own.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
            <h3 className="mt-4 text-base font-semibold text-[#2B2620]">
              <i className="fi fi-rr-shopping-bag text-3xl text-[#C1592F]" aria-hidden="true"></i>  Build outfits visually
            </h3>
            <p className="mt-2 text-sm text-[#8A8172]">
              Pick pieces zone by zone such as hat, top, bottom, shoes, and see
              them laid out together.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
            <h3 className="mt-4 text-base font-semibold text-[#2B2620]">
             <i className="fi fi-rr-layers text-3xl text-[#C1592F]" aria-hidden="true"></i>   Plan by layer
            </h3>

            <p className="mt-2 text-sm text-[#8A8172]">
              Stack a t-shirt under a hoodie, reorder layers, and save the
              exact look for next time.
            </p>
          </div>
        </div>
      </section>
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
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[#C1592F]">
            Welcome back
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#2B2620] sm:text-5xl">
            {user.username ?? "Your closet"}
          </h1>
        </div>

        {loading && (
          <div className="mt-10 py-12 text-center">
            <p className="text-sm text-[#8A8172]">Loading your dashboard...</p>
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
                <p className="text-2xl font-semibold text-[#2B2620]">
                  {clothingItems.length}
                </p>
                <p className="mt-1 text-sm text-[#8A8172]">
                  {clothingItems.length === 1
                    ? "Wardrobe item"
                    : "Wardrobe items"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-5">
                <p className="text-2xl font-semibold text-[#2B2620]">
                  {outfits.length}
                </p>
                <p className="mt-1 text-sm text-[#8A8172]">
                  {outfits.length === 1 ? "Outfit" : "Outfits"}
                </p>
              </div>

              <Link
                href="/wardrobe"
                className="flex items-center justify-center rounded-2xl bg-[#C1592F] p-5 text-center text-sm font-medium text-white hover:bg-[#9A4A25]"
              >
                + Add clothing
              </Link>

              <Link
                href="/outfits/new"
                className="flex items-center justify-center rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-5 text-center text-sm font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
              >
                + Create outfit
              </Link>
            </div>

            {/* Recent outfits */}
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#2B2620]">
                  Recent outfits
                </h2>

                {outfits.length > 0 && (
                  <Link
                    href="/outfits"
                    className="text-sm text-[#8A8172] hover:text-[#C1592F]"
                  >
                    View all →
                  </Link>
                )}
              </div>

              {outfits.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
                  <h3 className="text-base font-medium text-[#2B2620]">
                    No outfits yet
                  </h3>

                  <p className="mt-2 text-sm text-[#8A8172]">
                    {clothingItems.length === 0
                      ? "Add a few pieces to your wardrobe first, then build your first outfit."
                      : "Build your first outfit from what's already in your wardrobe."}
                  </p>

                  <Link
                    href={
                      clothingItems.length === 0 ? "/wardrobe" : "/outfits/new"
                    }
                    className="mt-6 inline-block rounded-xl bg-[#C1592F] px-5 py-3 text-sm font-medium text-white hover:bg-[#9A4A25]"
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
          <p className="text-sm text-[#8A8172]">Loading...</p>
        </div>
      </main>
    );
  }

  return user ? <DashboardPage user={user} /> : <LandingPage />;
}
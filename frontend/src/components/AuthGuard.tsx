"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { safeGetItem, safeRemoveItem } from "@/lib/storage";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const token = safeGetItem("accessToken");

      if (!token) {
        router.replace("/login");
        setChecking(false);
        return;
      }

      try {
        await apiFetch("/api/users/me");

        setAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);

        safeRemoveItem("accessToken");
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    checkAuthentication();
  }, [router]);

  if (checking || !authenticated) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F7F3EC]">
        <p className="text-sm text-[#8A8172]">
          Checking authentication...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
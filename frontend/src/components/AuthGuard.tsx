"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await apiFetch("/api/users/me");

        setAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("accessToken");
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
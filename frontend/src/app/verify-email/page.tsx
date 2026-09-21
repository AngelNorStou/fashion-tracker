"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setError("Missing verification token.");
        return;
      }

      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      try {
        await apiFetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify your email."
        );
      }
    }

    verify();
  }, [token]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6 text-center">
        {status === "loading" && (
          <p className="text-sm text-[#8A8172]">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-[#2B2620]">
              Email verified
            </h1>
            <p className="mt-2 text-sm text-[#8A8172]">
              Your email has been verified. You can now log in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25]"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-[#2B2620]">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-[#9A4A25]">{error}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6 text-center">
        {status === "loading" && (
          <p className="text-sm text-[#6B6B73]">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-[#17171C]">
              Email verified
            </h1>
            <p className="mt-2 text-sm text-[#6B6B73]">
              Your email has been verified. You can now log in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-[#22252E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#15171D]"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-[#17171C]">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-[#9A4A25]">{error}</p>
          </>
        )}
      </div>
    </main>
  );
}
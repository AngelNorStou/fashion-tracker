"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ConfirmEmailChangePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus("error");
        setError("Missing confirmation token.");
        return;
      }

      if (hasConfirmed.current) {
        return;
      }
      hasConfirmed.current = true;

      try {
        await apiFetch(
          `/api/users/confirm-email-change?token=${encodeURIComponent(token)}`
        );
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to confirm your new email."
        );
      }
    }

    confirm();
  }, [token]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6 text-center">
        {status === "loading" && (
          <p className="text-sm text-[#8A8172]">Confirming your new email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-[#2B2620]">
              Email updated
            </h1>
            <p className="mt-2 text-sm text-[#8A8172]">
              Your email address has been changed successfully.
            </p>
            <Link
              href="/account"
              className="mt-6 inline-block rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25]"
            >
              Go to account
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-[#2B2620]">
              Confirmation failed
            </h1>
            <p className="mt-2 text-sm text-[#9A4A25]">{error}</p>
          </>
        )}
      </div>
    </main>
  );
}
"use client";


import { apiFetch } from "@/lib/api";
import {
  MannequinGender,
  OutfitGeneration,
  generatedImageUrlFor,
} from "@/lib/generation";
import { useRef, useState } from "react";

export default function OutfitGenerationPanel({
  outfitId,
}: {
  outfitId: number;
}) {
  const [gender, setGender] = useState<MannequinGender>("FEMALE");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<OutfitGeneration | null>(null);
  const [error, setError] = useState("");
  const isGeneratingRef = useRef(false);

  async function handleGenerate() {
      if (isGeneratingRef.current) {
        return;
      }
      isGeneratingRef.current = true;
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const data: OutfitGeneration = await apiFetch(
        `/api/outfits/${outfitId}/generate`,
        {
          method: "POST",
          body: JSON.stringify({ mannequinGender: gender }),
        }
      );

      setResult(data);

      if (data.status === "FAILED") {
        setError(
          data.errorMessage ?? "Generation failed. Please try again."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate image."
      );
    } finally {
      setGenerating(false);
      isGeneratingRef.current = false;
    }
  }

  const imageUrl = result ? generatedImageUrlFor(result) : null;

  return (
    <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-6">
      <h3 className="text-base font-semibold text-[#17171C]">
        AI outfit preview
      </h3>

      <p className="mt-1 text-sm text-[#6B6B73]">
        Generate an image of this outfit being worn.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex rounded-lg border border-[#E3DACB] p-1">
          <button
            type="button"
            onClick={() => setGender("FEMALE")}
            disabled={generating}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              gender === "FEMALE"
                ? "bg-[#22252E] text-white"
                : "text-[#4B4B52] hover:bg-[#F3EDE4]"
            }`}
          >
            Woman
          </button>

          <button
            type="button"
            onClick={() => setGender("MALE")}
            disabled={generating}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              gender === "MALE"
                ? "bg-[#22252E] text-white"
                : "text-[#4B4B52] hover:bg-[#F3EDE4]"
            }`}
          >
            Man
          </button>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg bg-[#22252E] px-5 py-2 text-sm font-medium text-white hover:bg-[#15171D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {generating && (
        <div className="mt-4 flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#C9BFAF] bg-[#F7F3EC] text-center">
          <p className="text-sm text-[#6B6B73]">
            Generating your outfit image...
          </p>
          <p className="mt-1 text-xs text-[#A69C8C]">
            This can take a few seconds.
          </p>
        </div>
      )}

      {!generating && error && (
        <div className="mt-4 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
          {error}
        </div>
      )}

      {!generating && imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E3DACB]">
          <img
            src={imageUrl}
            alt="AI-generated outfit preview"
            className="w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
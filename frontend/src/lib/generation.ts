export type MannequinGender = "MALE" | "FEMALE";

export type OutfitGeneration = {
  id: number;
  outfitId: number;
  mannequinGender: MannequinGender;
  status: "PENDING" | "SUCCESS" | "FAILED";
  generatedImagePath: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export function generatedImageUrlFor(generation: OutfitGeneration): string | null {
  if (!generation.generatedImagePath) return null;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/outfit-generations/${generation.generatedImagePath}`;
}
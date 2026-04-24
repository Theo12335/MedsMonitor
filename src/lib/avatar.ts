import { createClient } from "@/lib/supabase/client";

const BUCKET = "patient-avatars";
const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const GRADIENTS = [
  "from-[var(--accent-blue)] to-[var(--accent-violet)]",
  "from-[var(--accent-cyan)] to-[var(--accent-emerald)]",
  "from-[var(--accent-violet)] to-[var(--accent-rose)]",
  "from-[var(--accent-amber)] to-[var(--accent-rose)]",
  "from-[var(--accent-emerald)] to-[var(--accent-cyan)]",
  "from-[var(--accent-rose)] to-[var(--accent-violet)]",
  "from-[var(--accent-blue)] to-[var(--accent-cyan)]",
  "from-[var(--accent-amber)] to-[var(--accent-emerald)]",
];

export function getGradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

async function resizeImageToJpeg(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.drawImage(img, 0, 0, width, height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export async function uploadPatientAvatar(patientId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new Error(validationError);

  const supabase = createClient();
  const blob = await resizeImageToJpeg(file);
  const path = `${patientId}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { data: updated, error: updateError } = await supabase
    .from("patients")
    .update({ avatar_url: publicUrl })
    .eq("id", patientId)
    .select("id");
  if (updateError) throw updateError;
  if (!updated || updated.length === 0) {
    throw new Error(
      "Photo uploaded but the patient record wasn't updated. You likely don't have permission to edit this patient — check Supabase RLS policies."
    );
  }

  return publicUrl;
}

export async function removePatientAvatar(patientId: string): Promise<void> {
  const supabase = createClient();
  const path = `${patientId}.jpg`;

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
  if (removeError && removeError.message && !removeError.message.toLowerCase().includes("not found")) {
    throw removeError;
  }

  const { data: updated, error: updateError } = await supabase
    .from("patients")
    .update({ avatar_url: null })
    .eq("id", patientId)
    .select("id");
  if (updateError) throw updateError;
  if (!updated || updated.length === 0) {
    throw new Error(
      "Couldn't clear the photo on the patient record — check Supabase RLS policies."
    );
  }
}

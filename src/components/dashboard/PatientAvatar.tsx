"use client";

import { useRef, useState } from "react";
import {
  ALLOWED_MIME_TYPES,
  getGradientForId,
  getInitials,
  removePatientAvatar,
  uploadPatientAvatar,
} from "@/lib/avatar";

interface PatientAvatarProps {
  patient: { id: string; name: string; avatar_url: string | null };
  size?: number;
  rounded?: "xl" | "full";
  editable?: boolean;
  onChanged?: (avatarUrl: string | null) => void;
  onError?: (message: string) => void;
  className?: string;
}

export default function PatientAvatar({
  patient,
  size = 40,
  rounded = "xl",
  editable = false,
  onChanged,
  onError,
  className = "",
}: PatientAvatarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const gradient = getGradientForId(patient.id);
  const initials = getInitials(patient.name);
  const fontPx = Math.max(10, Math.round(size * 0.38));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPatientAvatar(patient.id, file);
      onChanged?.(url);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      setMenuOpen(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    setMenuOpen(false);
    try {
      await removePatientAvatar(patient.id);
      onChanged?.(null);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  const pickFile = () => inputRef.current?.click();

  const wrapperClasses = [
    "relative flex-shrink-0",
    editable ? "group" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const avatarBase = `${radius} overflow-hidden flex items-center justify-center text-white font-semibold select-none`;

  const content = patient.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={patient.avatar_url}
      alt={patient.name}
      className={`${avatarBase} object-cover w-full h-full`}
      draggable={false}
    />
  ) : (
    <div
      className={`${avatarBase} bg-gradient-to-br ${gradient} w-full h-full`}
      style={{ fontSize: `${fontPx}px` }}
    >
      {initials}
    </div>
  );

  return (
    <div className={wrapperClasses} style={{ width: size, height: size }}>
      {content}

      {editable && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (patient.avatar_url) {
                setMenuOpen((v) => !v);
              } else {
                pickFile();
              }
            }}
            disabled={uploading}
            title={patient.avatar_url ? "Change or remove photo" : "Upload photo"}
            aria-label={patient.avatar_url ? "Change or remove photo" : "Upload photo"}
            className={`absolute inset-0 ${radius} flex items-center justify-center bg-black/0 hover:bg-black/40 focus:bg-black/40 transition-colors outline-none`}
          >
            <span className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              {uploading ? (
                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 019.414 5h5.172a1 1 0 01.707.293l1.414 1.414A1 1 0 0017.414 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </span>
          </button>

          {menuOpen && patient.avatar_url && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                className="absolute z-50 left-0 top-full mt-1 min-w-[150px] bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    pickFile();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full px-3 py-2 text-left text-xs text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 transition-colors"
                >
                  Remove photo
                </button>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_MIME_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

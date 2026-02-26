"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";

interface PhotoUploadProps {
  questionId: string;
  file: File | null;
  onChange: (questionId: string, file: File | null) => void;
}

export function PhotoUpload({ questionId, file, onChange }: PhotoUploadProps) {
  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#EAD087] transition hover:bg-[#D4AF37]/20">
        <ImagePlus className="h-3 w-3" />
        Foto
        <input
          className="hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            onChange(questionId, nextFile);
          }}
        />
      </label>

      {file && previewUrl ? (
        <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-[#D4AF37]/35">
          <Image src={previewUrl} alt="Vista previa" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(questionId, null)}
            className="absolute top-1 right-1 rounded-full bg-black/65 p-1 text-[#D4AF37] backdrop-blur"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}


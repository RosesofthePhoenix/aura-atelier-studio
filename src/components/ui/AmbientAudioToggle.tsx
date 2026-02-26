"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Volume2, VolumeX } from "lucide-react";

interface AmbientAudioToggleProps {
  src?: string;
}

export function AmbientAudioToggle({
  src = "/audio/andean-winds-crystal-chimes.mp3",
}: AmbientAudioToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = 0.22;

    if (!enabled) {
      audio.pause();
      return;
    }

    void audio.play().catch(() => {
      setEnabled(false);
    });
  }, [enabled]);

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#1A1721]/80 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#D4AF37]">
      <Music2 className="h-4 w-4" />
      <span>Ambient audio</span>
      <button
        type="button"
        onClick={() => setEnabled((value) => !value)}
        disabled={!available}
        className="rounded-full border border-[#D4AF37]/40 p-1 transition hover:bg-[#D4AF37]/15 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={enabled ? "Desactivar audio ambiente" : "Activar audio ambiente"}
      >
        {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      </button>
      <audio
        ref={audioRef}
        preload="none"
        loop
        onError={() => {
          setAvailable(false);
          setEnabled(false);
        }}
      >
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  );
}


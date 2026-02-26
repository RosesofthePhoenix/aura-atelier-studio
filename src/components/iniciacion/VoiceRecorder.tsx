"use client";

import { Mic, Square, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  questionId: string;
  onRecorded: (params: {
    questionId: string;
    blob: Blob;
    durationSeconds: number;
  }) => void;
  onClear: (questionId: string) => void;
  hasRecording: boolean;
}

export function VoiceRecorder({
  questionId,
  onRecorded,
  onClear,
  hasRecording,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);

  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tu dispositivo no permite grabación de audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationSeconds = startedAtRef.current
          ? (Date.now() - startedAtRef.current) / 1000
          : 0;
        onRecorded({
          questionId,
          blob,
          durationSeconds,
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition",
            recording
              ? "border-[#C45A3A] bg-[#C45A3A]/20 text-[#F2B7A6]"
              : "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#EAD087]",
          )}
        >
          {recording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          {recording ? "Detener" : "Voz"}
        </button>

        {hasRecording ? (
          <button
            type="button"
            onClick={() => onClear(questionId)}
            className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]/90 transition hover:bg-[#D4AF37]/10"
          >
            <Trash2 className="h-3 w-3" />
            Limpiar
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-[#C45A3A]">{error}</p> : null}
    </div>
  );
}


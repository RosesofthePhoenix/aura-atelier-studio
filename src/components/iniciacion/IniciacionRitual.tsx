"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { ritualQuestionFlatList, ritualIntakeFields, ritualPreludeText, ritualSections, ritualStepDisplayTotal, sacredWalkLines } from "@/content/iniciacion-questionnaire";
import { BolivianitaCrystal } from "@/components/bolivianita/BolivianitaCrystal";
import { AmbientAudioToggle } from "@/components/ui/AmbientAudioToggle";
import { GoldThreadProgress } from "@/components/ui/GoldThreadProgress";
import { RitualButton } from "@/components/ui/RitualButton";
import { PhotoUpload } from "@/components/iniciacion/PhotoUpload";
import { VoiceRecorder } from "@/components/iniciacion/VoiceRecorder";
import { veilLift } from "@/lib/motion/ritual";
import { inferEnergyIntensity, inferPieceRecommendation } from "@/lib/ritual/recommendation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notifyValNewInitiationAction } from "@/app/iniciacion/actions";
import type { InitiationAnswer } from "@/types/initiation";

const formSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  instagram_handle: z.string().max(100).optional().or(z.literal("")),
  answers: z.record(z.string(), z.string().optional()),
});

type RitualFormValues = z.infer<typeof formSchema>;

export interface IniciacionDraftHydration {
  initiationId: string | null;
  email: string;
  instagram_handle: string;
  answers: Record<string, string>;
  lastStep: number;
  assets: Array<{
    questionId: string;
    assetType: "voice" | "photo";
    storagePath: string;
  }>;
}

interface IniciacionRitualProps {
  userId: string;
  userEmail: string;
  initialDraft: IniciacionDraftHydration;
}

type RitualPhase = "entry" | "sacred_walk" | "ritual" | "confirmation";

type VoiceState = {
  blob?: Blob;
  durationSeconds?: number;
  uploadedPath?: string;
};

type PhotoState = {
  file?: File;
  uploadedPath?: string;
};

const totalRitualQuestions = ritualQuestionFlatList.length;
const totalFlowSteps = ritualIntakeFields.length + totalRitualQuestions;

export function IniciacionRitual({
  userId,
  userEmail,
  initialDraft,
}: IniciacionRitualProps) {
  const [phase, setPhase] = useState<RitualPhase>("entry");
  const [currentStep, setCurrentStep] = useState(
    Math.max(0, Math.min(initialDraft.lastStep, totalFlowSteps - 1)),
  );
  const [draftId, setDraftId] = useState<string | null>(initialDraft.initiationId);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState(0);
  const [voiceByQuestion, setVoiceByQuestion] = useState<Record<string, VoiceState>>(
    () =>
      Object.fromEntries(
        initialDraft.assets
          .filter((asset) => asset.assetType === "voice")
          .map((asset) => [
            asset.questionId,
            {
              uploadedPath: asset.storagePath,
            },
          ]),
      ),
  );
  const [photoByQuestion, setPhotoByQuestion] = useState<Record<string, PhotoState>>(
    () =>
      Object.fromEntries(
        initialDraft.assets
          .filter((asset) => asset.assetType === "photo")
          .map((asset) => [
            asset.questionId,
            {
              uploadedPath: asset.storagePath,
            },
          ]),
      ),
  );

  const {
    register,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RitualFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialDraft.email || userEmail || "",
      instagram_handle: initialDraft.instagram_handle || "",
      answers: initialDraft.answers ?? {},
    },
  });

  const watchedEmail = watch("email");
  const watchedInstagram = watch("instagram_handle");
  const watchedAnswers = watch("answers");
  const autosaveSignature = `${watchedEmail ?? ""}|${watchedInstagram ?? ""}|${JSON.stringify(
    watchedAnswers ?? {},
  )}|${currentStep}`;
  const currentQuestion = useMemo(() => {
    if (currentStep < ritualIntakeFields.length) {
      return null;
    }
    return ritualQuestionFlatList[currentStep - ritualIntakeFields.length];
  }, [currentStep]);

  function bumpActivity(delta = 1) {
    setActivityLevel((level) => Math.min(10, level + delta));
    window.setTimeout(() => {
      setActivityLevel((level) => Math.max(0, level - 1));
    }, 2200);
  }

  function buildAnswerPayload(values: RitualFormValues): InitiationAnswer[] {
    return ritualQuestionFlatList.map((question) => ({
      id: question.id,
      label: question.prompt,
      value: values.answers?.[question.id]?.trim() ?? "",
    }));
  }

  async function upsertAsset(
    initiationId: string,
    questionId: string,
    assetType: "voice" | "photo",
    storagePath: string,
    mimeType: string,
    durationSeconds?: number,
  ) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("aura_initiation_assets").upsert(
      {
        initiation_id: initiationId,
        question_id: questionId,
        asset_type: assetType,
        storage_path: storagePath,
        mime_type: mimeType,
        duration_seconds: durationSeconds ?? null,
      },
      {
        onConflict: "initiation_id,question_id,asset_type",
      },
    );
    if (error) {
      throw error;
    }
  }

  async function ensureDraft(values: RitualFormValues, step: number) {
    const supabase = getSupabaseBrowserClient();
    const answers = buildAnswerPayload(values);
    const completedCount =
      Number(values.email.length > 0) +
      Number((values.instagram_handle ?? "").length > 0) +
      answers.filter((item) => item.value.length > 0).length;
    const completionRatio = (completedCount / ritualStepDisplayTotal) * 100;

    const payload = {
      user_id: userId,
      email: values.email || userEmail,
      instagram_handle: values.instagram_handle?.trim() || null,
      answers,
      piece_recommendation: inferPieceRecommendation(answers),
      energy_intensity: inferEnergyIntensity(answers),
      completion_ratio: completionRatio,
      last_step: step,
      draft: true,
      status: "nueva",
    };

    if (draftId) {
      const { error } = await supabase
        .from("aura_initiations")
        .update(payload)
        .eq("id", draftId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
      return draftId;
    }

    const { data, error } = await supabase
      .from("aura_initiations")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    setDraftId(data.id);
    return data.id as string;
  }

  async function persistDraft(step = currentStep) {
    setSaving(true);
    try {
      await ensureDraft(getValues(), step);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo guardar el progreso.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadVoice(questionId: string, blob: Blob, durationSeconds: number) {
    const values = getValues();
    const initiationId = await ensureDraft(values, currentStep + 1);
    const supabase = getSupabaseBrowserClient();
    const extension = blob.type.includes("webm") ? "webm" : "audio";
    const filePath = `${userId}/${initiationId}/${questionId}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("initiation-voice-notes")
      .upload(filePath, blob, {
        contentType: blob.type || "audio/webm",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    await upsertAsset(
      initiationId,
      questionId,
      "voice",
      filePath,
      blob.type || "audio/webm",
      durationSeconds,
    );

    setVoiceByQuestion((current) => ({
      ...current,
      [questionId]: {
        uploadedPath: filePath,
        durationSeconds,
      },
    }));
  }

  async function uploadPhoto(questionId: string, file: File) {
    const values = getValues();
    const initiationId = await ensureDraft(values, currentStep + 1);
    const supabase = getSupabaseBrowserClient();
    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${userId}/${initiationId}/${questionId}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("initiation-photos")
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    await upsertAsset(
      initiationId,
      questionId,
      "photo",
      filePath,
      file.type || "image/jpeg",
    );

    setPhotoByQuestion((current) => ({
      ...current,
      [questionId]: {
        uploadedPath: filePath,
      },
    }));
  }

  async function handleNext() {
    setErrorMessage(null);

    if (currentStep === 0) {
      const isEmailValid = await trigger("email");
      if (!isEmailValid) {
        return;
      }
    }

    const nextStep = currentStep + 1;
    if (nextStep >= totalFlowSteps) {
      await handleSubmitFinal();
      return;
    }

    setCurrentStep(nextStep);
    bumpActivity();
    await persistDraft(nextStep);
  }

  async function handleSubmitFinal() {
    setSubmitting(true);
    try {
      const values = getValues();
      const initiationId = await ensureDraft(values, totalFlowSteps);

      const { error } = await getSupabaseBrowserClient()
        .from("aura_initiations")
        .update({
          draft: false,
          submitted_at: new Date().toISOString(),
          status: "nueva",
        })
        .eq("id", initiationId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const identifier = values.instagram_handle?.trim() || values.email;
      await notifyValNewInitiationAction({
        initiationId,
        identifier,
      });

      setPhase("confirmation");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo enviar tu iniciación.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (phase !== "ritual") {
      return;
    }
    const timer = window.setTimeout(() => {
      void persistDraft();
    }, 1400);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveSignature, phase]);

  if (phase === "entry") {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 aura-veil" />
        <div className="absolute inset-0">
          <BolivianitaCrystal className="h-full w-full" activityLevel={1} />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl space-y-8 text-center">
          <p className="text-sm tracking-[0.18em] text-[#D4AF37] uppercase">
            Aura Atelier Initiation
          </p>
          <h1 className="text-balance text-3xl leading-tight text-[#F6E7B8] md:text-5xl">
            {ritualPreludeText}
          </h1>
          <div className="mx-auto max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-black/30 px-4 py-3 text-xs text-[#CEC5B3]">
            <p>Whisper text activo. Opcional: voz de Val.</p>
            <audio controls preload="none" className="mt-2 w-full">
              <source src="/audio/val-whisper.mp3" type="audio/mpeg" />
            </audio>
          </div>
          <RitualButton onClick={() => setPhase("sacred_walk")}>
            Iniciar mi Iniciación
          </RitualButton>
        </div>
      </section>
    );
  }

  if (phase === "sacred_walk") {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-110%" }}
          transition={{ duration: 5.5, ease: [0.22, 0.05, 0.17, 0.99] }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#F5E8C5]/15 to-transparent"
        />
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "110%" }}
          transition={{ duration: 5.5, ease: [0.22, 0.05, 0.17, 0.99] }}
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#F5E8C5]/15 to-transparent"
        />
        <div className="absolute inset-0">
          <BolivianitaCrystal className="h-full w-full opacity-85" activityLevel={2} />
        </div>
        <motion.div
          variants={veilLift}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl rounded-3xl aura-surface p-8 text-center md:p-12"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">
            Sacred Walk
          </p>
          <div className="mt-6 space-y-3 text-lg leading-relaxed text-[#F0E2B8]">
            {sacredWalkLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <RitualButton className="mt-10" onClick={() => setPhase("ritual")}>
            Continuar al Ritual
          </RitualButton>
        </motion.div>
      </section>
    );
  }

  if (phase === "confirmation") {
    return (
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 6 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.28),rgba(63,42,86,0.28),rgba(15,15,15,0.98))]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 5.5 }}
          className="relative z-10 max-w-3xl text-center"
        >
          <p className="text-balance text-2xl leading-relaxed text-[#F6E7B8] md:text-4xl">
            Your light has been received. Val is now listening in the studio
            beneath the Equipetrol lights. She will weave your essence and return
            to you soon.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-8 py-3 text-xs uppercase tracking-[0.2em] text-[#F6E7B8]"
          >
            Return to Atelier
          </Link>
        </motion.div>
      </section>
    );
  }

  const stepDisplay = Math.min(currentStep + 1, ritualStepDisplayTotal);

  const questionFieldName = currentQuestion
    ? (`answers.${currentQuestion.id}` as const)
    : null;
  const questionRegistration = questionFieldName ? register(questionFieldName) : null;
  const currentSection = currentQuestion
    ? ritualSections.find((section) => section.id === currentQuestion.sectionId)
    : null;

  return (
    <section className="relative min-h-screen overflow-hidden px-5 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row">
        <div className="order-2 lg:order-1 lg:w-[58%]">
          <GoldThreadProgress current={stepDisplay} total={ritualStepDisplayTotal} />

          <div className="mt-6 rounded-3xl aura-surface p-6 md:p-9">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]/85">
                The Ritual
              </p>
              {saving ? (
                <p className="inline-flex items-center gap-1 text-xs text-[#D4AF37]/85">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Auto-guardando
                </p>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}`}
                variants={veilLift}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                {currentStep === 0 ? (
                  <>
                    <h2 className="text-2xl text-[#F5EFE3]">Email (required)</h2>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="tu@email.com"
                      onChange={(event) => {
                        register("email").onChange(event);
                        bumpActivity();
                      }}
                      className="w-full rounded-2xl border border-[#D4AF37]/35 bg-[#17151D] px-4 py-3 text-sm text-[#F5EFE3] outline-none placeholder:text-[#8A8073]"
                    />
                    {errors.email ? (
                      <p className="text-xs text-[#C45A3A]">{errors.email.message}</p>
                    ) : null}
                  </>
                ) : null}

                {currentStep === 1 ? (
                  <>
                    <h2 className="text-2xl text-[#F5EFE3]">
                      Instagram username/handle (optional)
                    </h2>
                    <input
                      {...register("instagram_handle")}
                      type="text"
                      placeholder="@tuusuario"
                      onChange={(event) => {
                        register("instagram_handle").onChange(event);
                        bumpActivity();
                      }}
                      className="w-full rounded-2xl border border-[#D4AF37]/35 bg-[#17151D] px-4 py-3 text-sm text-[#F5EFE3] outline-none placeholder:text-[#8A8073]"
                    />
                  </>
                ) : null}

                {currentQuestion ? (
                  <>
                    {currentSection ? (
                      <p className="inline-flex rounded-full border border-[#D4AF37]/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]/85">
                        {currentSection.title}
                      </p>
                    ) : null}
                    <h2 className="text-pretty text-2xl leading-relaxed text-[#F5EFE3] md:text-3xl">
                      {currentQuestion.prompt}
                    </h2>
                    <textarea
                      {...questionRegistration}
                      rows={5}
                      placeholder="Escribe desde tu centro..."
                      onChange={(event) => {
                        questionRegistration?.onChange(event);
                        bumpActivity();
                      }}
                      className="w-full resize-none rounded-2xl border border-[#D4AF37]/35 bg-[#17151D] px-4 py-3 text-sm leading-7 text-[#F5EFE3] outline-none placeholder:text-[#8A8073]"
                    />

                    <div className="flex flex-wrap items-center gap-3 border-t border-[#D4AF37]/20 pt-4">
                      <VoiceRecorder
                        questionId={currentQuestion.id}
                        hasRecording={Boolean(voiceByQuestion[currentQuestion.id])}
                        onRecorded={({ questionId, blob, durationSeconds }) => {
                          bumpActivity(2);
                          setVoiceByQuestion((current) => ({
                            ...current,
                            [questionId]: { blob, durationSeconds },
                          }));
                          void uploadVoice(questionId, blob, durationSeconds).catch((err) => {
                            setErrorMessage(err instanceof Error ? err.message : "No se pudo subir el audio.");
                          });
                        }}
                        onClear={(questionId) => {
                          setVoiceByQuestion((current) => {
                            const next = { ...current };
                            delete next[questionId];
                            return next;
                          });
                          bumpActivity();
                        }}
                      />

                      <PhotoUpload
                        questionId={currentQuestion.id}
                        file={photoByQuestion[currentQuestion.id]?.file ?? null}
                        onChange={(questionId, file) => {
                          bumpActivity(2);
                          if (!file) {
                            setPhotoByQuestion((current) => {
                              const next = { ...current };
                              delete next[questionId];
                              return next;
                            });
                            return;
                          }

                          setPhotoByQuestion((current) => ({
                            ...current,
                            [questionId]: {
                              file,
                            },
                          }));
                          void uploadPhoto(questionId, file).catch((err) => {
                            setErrorMessage(err instanceof Error ? err.message : "No se pudo subir la foto.");
                          });
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {errorMessage ? (
              <p className="mt-4 rounded-xl border border-[#C45A3A]/45 bg-[#C45A3A]/12 px-3 py-2 text-xs text-[#F3C3B3]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <RitualButton
                type="button"
                onClick={() => {
                  const previous = Math.max(0, currentStep - 1);
                  setCurrentStep(previous);
                }}
                glow={false}
                className="border-[#D4AF37]/40 bg-transparent text-[#D4AF37]"
                disabled={currentStep === 0 || submitting}
              >
                Atrás
              </RitualButton>

              <RitualButton type="button" onClick={handleNext} disabled={submitting}>
                {submitting
                  ? "Enviando..."
                  : currentStep + 1 >= totalFlowSteps
                    ? "Enviar Iniciación"
                    : "Siguiente"}
              </RitualButton>
            </div>
          </div>
        </div>

        <aside className="order-1 lg:order-2 lg:w-[42%]">
          <div className="sticky top-6 space-y-4 rounded-3xl aura-surface p-6">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D4AF37]/85">
              <Sparkles className="h-3.5 w-3.5" />
              Bolivianita viva
            </p>
            <p className="text-sm leading-7 text-[#D8D2C4]">
              La piedra escucha tu pulso. Cada palabra, nota de voz o imagen la
              vuelve más cálida.
            </p>
            <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-black/30">
              <BolivianitaCrystal activityLevel={activityLevel} interactive />
            </div>
            <AmbientAudioToggle />
          </div>
        </aside>
      </div>
    </section>
  );
}


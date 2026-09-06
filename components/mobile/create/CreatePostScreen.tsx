"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUploadUrl,
  uploadFileToS3,
  createPost,
  PostValidationError,
} from "@/lib/api";
import type { Hotel, RatingCategory } from "@/types/feed";
import { RATING_CATEGORIES } from "@/types/feed";
import AppShell from "@/components/mobile/AppShell";
import ConfirmDialog from "@/components/mobile/profile/ConfirmDialog";
import Stars from "@/components/mobile/explore/Stars";
import MediaPicker from "./MediaPicker";
import HotelSelect from "./HotelSelect";
import CameraCaptureScreen from "./CameraCaptureScreen";

const RATING_LABELS: Record<RatingCategory, string> = {
  food: "Food",
  service: "Service",
  cleanliness: "Cleanliness",
  value: "Value",
};

type CategoryRating = { score: number; review: string };
const EMPTY_RATINGS: Record<RatingCategory, CategoryRating> = {
  food: { score: 0, review: "" },
  service: { score: 0, review: "" },
  cleanliness: { score: 0, review: "" },
  value: { score: 0, review: "" },
};

type FieldErrors = Partial<
  Record<"description" | "hotel" | "media" | "ratings", string>
>;

export default function CreatePostScreen() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [description, setDescription] = useState("");
  const [ratings, setRatings] =
    useState<Record<RatingCategory, CategoryRating>>(EMPTY_RATINGS);

  const [phase, setPhase] = useState<"idle" | "uploading" | "publishing">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showDiscard, setShowDiscard] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const submitting = phase !== "idle";
  const canNext1 = !!file;
  const canNext2 = !!hotel;
  const dirty = file !== null || hotel !== null || description.trim() !== "";
  const hasAnyRating = RATING_CATEGORIES.some((c) => ratings[c].score >= 1);
  const ratingsComplete = RATING_CATEGORIES.every((c) => ratings[c].score >= 1);
  // Instant posts: ratings are optional, but a partial rating is not allowed.
  const ratingsValid = !hasAnyRating || ratingsComplete;
  const canSubmit = !!file && !!hotel && ratingsComplete && !submitting;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function selectFile(next: File) {
    const isImage = next.type.startsWith("image/");
    const isVideo = next.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setBanner("Please pick an image or a video file.");
      return;
    }
    setBanner(null);
    setFieldErrors((fe) => ({ ...fe, media: undefined }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setMediaType(isVideo ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(next));
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  }

  function goBack() {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3);
      return;
    }
    if (dirty) setShowDiscard(true);
    else router.push("/feed");
  }

  async function handlePublish() {
    if (!canSubmit || !file || !hotel) return;
    await publish(file, mediaType, "regular");
  }

  async function handleInstantCapture(clipFile: File) {
    if (submitting || !hotel || !ratingsValid) return;
    await publish(clipFile, "video", "instant");
  }

  async function publish(
    mediaFile: File,
    type: "image" | "video",
    postType: "regular" | "instant"
  ) {
    if (!hotel) return;
    setBanner(null);
    setFieldErrors({});

    try {
      setPhase("uploading");
      const { upload_url, key } = await getUploadUrl(mediaFile.name, mediaFile.type);
      await uploadFileToS3(upload_url, mediaFile);

      setPhase("publishing");
      await createPost({
        hotel: hotel.id,
        description: description.trim(),
        media: [
          {
            content_type: type,
            category:
              postType === "instant"
                ? "instant"
                : type === "video"
                ? "video"
                : "instant",
            media_key: key,
          },
        ],
        status: "published",
        ratings: hasAnyRating
          ? RATING_CATEGORIES.map((c) => ({
              category: c,
              score: ratings[c].score,
              review: ratings[c].review.trim(),
            }))
          : [],
        ...(postType === "instant" ? { post_type: "instant" as const } : {}),
      });

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setPhase("idle");
      if (err instanceof PostValidationError) {
        if (err.errors && typeof err.errors === "object") {
          const fe: FieldErrors = {};
          for (const [k, v] of Object.entries(err.errors)) {
            fe[k as keyof FieldErrors] = Array.isArray(v) ? v[0] : String(v);
          }
          setFieldErrors(fe);
          if (postType === "regular") {
            if (fe.media) setStep(1);
            else if (fe.hotel || fe.description) setStep(2);
          }
        }
        setBanner(err.message);
      } else {
        setBanner("Upload failed. Please check your connection and try again.");
      }
    }
  }

  if (step === 0) {
    return (
      <CameraCaptureScreen
        hotel={hotel}
        onHotelChange={setHotel}
        description={description}
        onDescriptionChange={setDescription}
        ratings={ratings}
        onRatingChange={(category, score) =>
          setRatings((r) => ({ ...r, [category]: { ...r[category], score } }))
        }
        ratingsValid={ratingsValid}
        onCapturePhoto={(f) => {
          selectFile(f);
          setStep(2);
        }}
        onCaptureVideo={(f) => {
          selectFile(f);
          setStep(2);
        }}
        onCaptureInstant={handleInstantCapture}
        onFallback={() => setStep(1)}
        onClose={() => router.push("/feed")}
        submitting={submitting}
        banner={banner}
      />
    );
  }

  return (
    <AppShell nav={false}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E0F5] bg-white px-4 py-3 sm:px-6">
        <button onClick={goBack} className="-ml-1 p-1 text-[#6F2DBD]" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[#1A1A1A] font-bold text-base">New Post</h1>
        <span className="w-6" />
      </div>

      <div className="flex justify-center gap-1.5 py-3">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-2 rounded-full transition-all ${
              n === step ? "w-5 bg-[#6F2DBD]" : "w-2 bg-[#E5E0F5]"
            }`}
          />
        ))}
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4 px-4 mt-2 sm:gap-5 sm:px-6">
        {banner && <p className="text-red-500 text-sm text-center">{banner}</p>}

        {step === 1 && (
          <>
            <MediaPicker
              previewUrl={previewUrl}
              mediaType={mediaType}
              onSelect={selectFile}
              onClear={clearFile}
            />
            {fieldErrors.media && (
              <p className="text-red-500 text-xs -mt-2 ml-1">
                {fieldErrors.media}
              </p>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[#1A1A1A] font-bold text-lg">
              Tell us about the wonderful meal you had
            </h2>

            <HotelSelect value={hotel} onChange={setHotel} error={fieldErrors.hotel} />

        <div>
          <label className="text-[#888] text-xs font-medium ml-1">Description</label>
          <div className="mt-1 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <textarea
              placeholder="Crispy and huge"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.description}</p>
          )}
        </div>

            <button
              onClick={() => setStep(3)}
              disabled={!canNext2}
              className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
            >
              Next
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-[#1A1A1A] font-bold text-lg">
              Now tell us about the experience you had
            </h2>

        <div>
          <label className="text-[#888] text-xs font-medium ml-1">
            Rate your visit
          </label>
          <div className="mt-1 flex flex-col gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            {RATING_CATEGORIES.map((c) => (
              <div key={c} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#333] text-sm font-semibold">
                    {RATING_LABELS[c]}
                  </span>
                  <Stars
                    value={ratings[c].score}
                    size={22}
                    interactive
                    onChange={(score) =>
                      setRatings((r) => ({ ...r, [c]: { ...r[c], score } }))
                    }
                  />
                </div>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Short review (optional, max 100 chars)"
                  value={ratings[c].review}
                  onChange={(e) =>
                    setRatings((r) => ({
                      ...r,
                      [c]: { ...r[c], review: e.target.value },
                    }))
                  }
                  className="w-full bg-transparent text-[#333] placeholder-[#BBB] text-[14px] outline-none border-b border-[#EEE] pb-1"
                />
              </div>
            ))}
          </div>
          {fieldErrors.ratings && (
            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.ratings}</p>
          )}
        </div>

        <button
          onClick={handlePublish}
          disabled={!canSubmit}
          className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
        >
          {phase === "uploading"
            ? "Uploading media…"
            : phase === "publishing"
            ? "Publishing…"
            : "Publish post"}
        </button>
          </>
        )}
      </div>

      {showDiscard && (
        <ConfirmDialog
          title="Discard post?"
          message="You have an unfinished post. Leaving now will lose it."
          onCancel={() => setShowDiscard(false)}
          onConfirm={() => {
            setShowDiscard(false);
            router.push("/feed");
          }}
        />
      )}
    </AppShell>
  );
}

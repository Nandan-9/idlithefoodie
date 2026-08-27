"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUploadUrl,
  uploadFileToS3,
  createPost,
  PostValidationError,
} from "@/lib/api";
import type { Hotel } from "@/types/feed";
import AppShell from "@/components/mobile/AppShell";
import ConfirmDialog from "@/components/mobile/profile/ConfirmDialog";
import MediaPicker from "./MediaPicker";
import HotelSelect from "./HotelSelect";

type FieldErrors = Partial<
  Record<"title" | "description" | "hotel" | "food_spot" | "media_type" | "raw_s3_key", string>
>;

export default function CreatePostScreen() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [foodSpot, setFoodSpot] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [phase, setPhase] = useState<"idle" | "uploading" | "publishing">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const submitting = phase !== "idle";
  const dirty =
    file !== null || hotel !== null || title.trim() !== "" || description.trim() !== "";
  const canSubmit = !!file && !!hotel && title.trim() !== "" && !submitting;

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
    setFieldErrors((fe) => ({ ...fe, raw_s3_key: undefined, media_type: undefined }));
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
    if (dirty) setShowDiscard(true);
    else router.push("/feed");
  }

  async function handlePublish() {
    if (!canSubmit || !file || !hotel) return;
    setBanner(null);
    setFieldErrors({});

    try {
      setPhase("uploading");
      const { upload_url, key } = await getUploadUrl(file.name, file.type);
      await uploadFileToS3(upload_url, file);

      setPhase("publishing");
      await createPost({
        hotel: hotel.id,
        food_spot: foodSpot.trim() ? Number(foodSpot.trim()) : null,
        title: title.trim(),
        description: description.trim(),
        media_type: mediaType,
        raw_s3_key: key,
        status: "published",
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
        }
        setBanner(err.message);
      } else {
        setBanner("Upload failed. Please check your connection and try again.");
      }
    }
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
        <button
          onClick={handlePublish}
          disabled={!canSubmit}
          className="text-[#6F2DBD] font-bold text-sm disabled:opacity-40"
        >
          {phase === "uploading" ? "Uploading…" : phase === "publishing" ? "Publishing…" : "Publish"}
        </button>
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4 px-4 mt-6 sm:gap-5 sm:px-6">
        {banner && <p className="text-red-500 text-sm text-center">{banner}</p>}

        <MediaPicker
          previewUrl={previewUrl}
          mediaType={mediaType}
          onSelect={selectFile}
          onClear={clearFile}
        />
        {(fieldErrors.raw_s3_key || fieldErrors.media_type) && (
          <p className="text-red-500 text-xs -mt-2 ml-1">
            {fieldErrors.raw_s3_key ?? fieldErrors.media_type}
          </p>
        )}

        <HotelSelect value={hotel} onChange={setHotel} error={fieldErrors.hotel} />

        <div>
          <label className="text-[#888] text-xs font-medium ml-1">Food spot ID (optional)</label>
          <div className="mt-1 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <input
              inputMode="numeric"
              placeholder="e.g. 5"
              value={foodSpot}
              onChange={(e) => setFoodSpot(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
          {fieldErrors.food_spot && (
            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.food_spot}</p>
          )}
        </div>

        <div>
          <label className="text-[#888] text-xs font-medium ml-1">Title</label>
          <div className="mt-1 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
            <input
              type="text"
              maxLength={255}
              placeholder="Best dosa in town"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
            />
          </div>
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.title}</p>
          )}
        </div>

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

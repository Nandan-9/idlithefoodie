"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Type, Home, X, MapPin } from "lucide-react";
import type { Hotel, RatingCategory } from "@/types/feed";
import { RATING_CATEGORIES } from "@/types/feed";
import { fetchNearestHotel } from "@/lib/api";
import Stars from "@/components/mobile/explore/Stars";
import HotelSelect from "./HotelSelect";

const RATING_LABELS: Record<RatingCategory, string> = {
  food: "Food",
  service: "Service",
  cleanliness: "Cleanliness",
  value: "Value",
};

type Overlay = "rating" | "text" | "tag" | null;

const MAX_INSTANT_MS = 60_000;
const MIN_INSTANT_MS = 3_000;

type Props = {
  hotel: Hotel | null;
  onHotelChange: (hotel: Hotel) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  ratings: Record<RatingCategory, { score: number; review: string }>;
  onRatingChange: (category: RatingCategory, score: number) => void;
  ratingsValid: boolean;
  onCapturePhoto: (file: File) => void;
  onCaptureVideo: (file: File) => void;
  onCaptureInstant: (file: File) => void;
  onFallback: () => void;
  onClose: () => void;
  submitting: boolean;
  banner: string | null;
};

export default function CameraCaptureScreen({
  hotel,
  onHotelChange,
  description,
  onDescriptionChange,
  ratings,
  onRatingChange,
  ratingsValid,
  onCapturePhoto,
  onCaptureVideo,
  onCaptureInstant,
  onFallback,
  onClose,
  submitting,
  banner,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const galleryTypeRef = useRef<"image" | "video">("image");
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const keepRef = useRef(true);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [overlay, setOverlay] = useState<Overlay>(null);
  const [instantRecording, setInstantRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [clip, setClip] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onFallback();
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: true,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      } catch {
        if (!cancelled) onFallback();
      }
    }

    start();

    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-detect the nearest hotel from the device location (instant mode).
  useEffect(() => {
    if (hotel) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearest = await fetchNearestHotel(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (nearest) onHotelChange(nearest);
        } catch {
          /* silent — manual "Tag Hotel" stays available */
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (clip) URL.revokeObjectURL(clip.url);
    };
  }, [clip]);

  function pickMimeType() {
    return ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"].find(
      (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
    );
  }

  function openGallery(type: "image" | "video") {
    galleryTypeRef.current = type;
    const input = galleryInputRef.current;
    if (!input) return;
    input.accept = type === "video" ? "video/*" : "image/*";
    input.value = "";
    input.click();
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (galleryTypeRef.current === "video") onCaptureVideo(file);
    else onCapturePhoto(file);
  }

  function startInstant() {
    if (submitting || !ready || instantRecording) return;
    if (!hotel || !ratingsValid) {
      setHint(
        "Tag a hotel before posting, and rate all 4 categories if you add a rating."
      );
      return;
    }
    const stream = streamRef.current;
    if (!stream) return;
    setHint(null);
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    keepRef.current = true;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      if (tickRef.current) clearInterval(tickRef.current);
      const kept = keepRef.current && elapsedRef.current >= MIN_INSTANT_MS;
      const blob = new Blob(chunksRef.current, { type: mimeType ?? "video/webm" });
      const ext = mimeType?.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `instant-${Date.now()}.${ext}`, {
        type: blob.type,
      });
      setInstantRecording(false);
      setElapsedMs(0);
      if (kept) {
        setClip({ file, url: URL.createObjectURL(file) });
      } else if (keepRef.current) {
        setHint("Record between 3s and 60s.");
      }
    };
    recorderRef.current = recorder;
    recorder.start();
    setInstantRecording(true);
    startRef.current = performance.now();
    elapsedRef.current = 0;
    tickRef.current = setInterval(() => {
      elapsedRef.current = performance.now() - startRef.current;
      setElapsedMs(elapsedRef.current);
      if (elapsedRef.current >= MAX_INSTANT_MS) stopInstant(true);
    }, 50);
  }

  function stopInstant(keep: boolean) {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    keepRef.current = keep;
    recorder.stop();
  }

  function retake() {
    if (clip) URL.revokeObjectURL(clip.url);
    setClip(null);
  }

  const ringPct = Math.min(elapsedMs / MAX_INSTANT_MS, 1);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0d]">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <input
        ref={galleryInputRef}
        type="file"
        onChange={handleGalleryChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
      >
        <X size={20} />
      </button>

      {hotel && (
        <HotelChip name={hotel.name} className="absolute left-1/2 top-4 -translate-x-1/2" />
      )}

      {(banner || hint) && (
        <p className="absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
          {banner ?? hint}
        </p>
      )}

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-4 rounded-[28px] border border-white/35 bg-white/[0.14] px-2.5 py-4 backdrop-blur-md">
        <PillItem icon={<Star size={18} />} label="Rating" onClick={() => setOverlay("rating")} />
        <PillItem icon={<Type size={18} />} label="Text" onClick={() => setOverlay("text")} />
        <PillItem icon={<Home size={18} />} label="Tag Hotel" onClick={() => setOverlay("tag")} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-[170px] flex-col items-center justify-center gap-[18px] bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => !instantRecording && openGallery("image")}
            className="font-normal text-white/55"
          >
            Photo
          </button>
          <button type="button" className="font-semibold text-white">
            Instant
          </button>
          <button
            type="button"
            onClick={() => !instantRecording && openGallery("video")}
            className="font-normal text-white/55"
          >
            Video
          </button>
        </div>

        <button
          type="button"
          onClick={() => (instantRecording ? stopInstant(true) : startInstant())}
          disabled={submitting || !ready}
          aria-label={instantRecording ? "Stop recording" : "Start recording"}
          className="relative flex h-[78px] w-[78px] items-center justify-center disabled:opacity-50"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 78 78">
            <circle cx="39" cy="39" r="37" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
            {instantRecording && (
              <circle
                cx="39"
                cy="39"
                r="37"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 37}
                strokeDashoffset={2 * Math.PI * 37 * (1 - ringPct)}
              />
            )}
          </svg>
          <span
            className={`rounded-full bg-[#6F2DBD] transition-all ${
              instantRecording ? "h-[54px] w-[54px]" : "h-[70px] w-[70px] border-4 border-white"
            }`}
          />
        </button>
      </div>

      {clip && (
        <div className="absolute inset-0 z-30 bg-[#0a0a0d]">
          <video
            src={clip.url}
            loop
            muted
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          {hotel && (
            <HotelChip name={hotel.name} className="absolute left-1/2 top-4 -translate-x-1/2" />
          )}
          <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-black/60 to-transparent p-4">
            <button
              type="button"
              onClick={retake}
              disabled={submitting}
              className="flex-1 rounded-2xl border border-white/70 py-3 font-bold text-white disabled:opacity-50"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => onCaptureInstant(clip.file)}
              disabled={submitting}
              className="flex-1 rounded-2xl bg-[#6F2DBD] py-3 font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Done"}
            </button>
          </div>
        </div>
      )}

      {overlay && (
        <CameraOverlay onClose={() => setOverlay(null)}>
          {overlay === "rating" && (
            <div className="flex flex-col gap-3">
              {RATING_CATEGORIES.map((c) => (
                <div key={c} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {RATING_LABELS[c]}
                  </span>
                  <Stars
                    value={ratings[c].score}
                    size={22}
                    interactive
                    onChange={(score) => onRatingChange(c, score)}
                  />
                </div>
              ))}
            </div>
          )}
          {overlay === "text" && (
            <textarea
              placeholder="Crispy and huge"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-[#E5E0F5] bg-white px-4 py-3 text-[15px] text-[#333] placeholder-[#BBB] outline-none"
            />
          )}
          {overlay === "tag" && <HotelSelect value={hotel} onChange={onHotelChange} />}
        </CameraOverlay>
      )}
    </div>
  );
}

function HotelChip({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={`flex max-w-[70%] items-center gap-1.5 rounded-full border border-white/35 bg-black/45 px-3 py-1.5 text-[13px] font-semibold text-white ${className ?? ""}`}
    >
      <MapPin size={14} className="shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}

function PillItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
        {icon}
      </span>
      <span className="text-[10px] text-white">{label}</span>
    </button>
  );
}

function CameraOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="absolute inset-0 z-10 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[70vh] flex-col gap-3 rounded-t-3xl bg-[#FAF7F2] p-5 pb-8">
        <div className="flex items-center justify-end">
          <button onClick={onClose} className="text-sm font-bold text-[#6F2DBD]">
            Done
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchProfile,
  updateProfile,
  getAvatarUploadUrl,
  uploadFileToS3,
  ProfileValidationError,
} from "@/lib/api";
import type { Diet, ProfileUpdate } from "@/types/profile";
import AppShell from "@/components/mobile/AppShell";
import ConfirmDialog from "./ConfirmDialog";

type EditableField = "name" | "bio" | "dob" | "diet" | "food_preference" | "avatar";
type FieldErrors = Partial<Record<EditableField, string>>;

type FormState = {
  name: string;
  bio: string;
  dob: string;
  diet: Diet;
  food_preference: string;
};

const EMPTY: FormState = { name: "", bio: "", dob: "", diet: "", food_preference: "" };

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BIO_MAX = 300;
const FOOD_PREF_MAX = 100;

const DIET_OPTIONS: { value: Diet; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "veg", label: "Vegetarian" },
  { value: "non_veg", label: "Non-Vegetarian" },
];

/** Today as `YYYY-MM-DD`, for the date input's `max`. */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [initial, setInitial] = useState<FormState>(EMPTY);
  const [form, setForm] = useState<FormState>(EMPTY);

  // Avatar. `initialAvatarUrl` is the persisted URL from the server.
  // `avatarPreview` is what we render (object URL for a fresh pick, else the URL).
  // `avatarKey` is the S3 key of a freshly uploaded image, pending save.
  const [initialAvatarUrl, setInitialAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const fieldsDirty = (Object.keys(EMPTY) as (keyof FormState)[]).some(
    (k) => form[k] !== initial[k]
  );
  const dirty = fieldsDirty || avatarKey !== null;

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((p) => {
        if (cancelled) return;
        const next: FormState = {
          name: p.name ?? "",
          bio: p.bio ?? "",
          dob: p.dob ?? "",
          diet: p.diet ?? "",
          food_preference: p.food_preference ?? "",
        };
        setInitial(next);
        setForm(next);
        setInitialAvatarUrl(p.avatar ?? "");
        setAvatarPreview(p.avatar ?? "");
      })
      .catch(() => {
        if (!cancelled)
          setLoadError("Could not load your profile. Go back and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  function goBack() {
    if (dirty) setShowDiscard(true);
    else router.push("/profile");
  }

  async function handlePickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;

    setBanner(null);
    setFieldErrors((err) => ({ ...err, avatar: undefined }));

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setFieldErrors((err) => ({ ...err, avatar: "Use a JPG, PNG or WebP image." }));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFieldErrors((err) => ({ ...err, avatar: "Image must be under 5 MB." }));
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const preview = URL.createObjectURL(file);
    objectUrlRef.current = preview;
    setAvatarPreview(preview);

    setAvatarUploading(true);
    try {
      const { upload_url, key } = await getAvatarUploadUrl(file.name, file.type);
      await uploadFileToS3(upload_url, file);
      setAvatarKey(key);
    } catch {
      setFieldErrors((err) => ({
        ...err,
        avatar: "Upload failed. Please try again.",
      }));
      setAvatarPreview(initialAvatarUrl);
      setAvatarKey(null);
    } finally {
      setAvatarUploading(false);
    }
  }

  function removeAvatar() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAvatarPreview(initialAvatarUrl);
    setAvatarKey(null);
    setFieldErrors((err) => ({ ...err, avatar: undefined }));
  }

  async function handleSave() {
    if (!dirty || saving || avatarUploading) return;
    setSaving(true);
    setBanner(null);
    setFieldErrors({});

    const patch: ProfileUpdate = {};
    if (form.name !== initial.name) patch.name = form.name.trim();
    if (form.bio !== initial.bio) patch.bio = form.bio.trim();
    if (form.dob !== initial.dob) patch.dob = form.dob || null;
    if (form.diet !== initial.diet) patch.diet = form.diet;
    if (form.food_preference !== initial.food_preference)
      patch.food_preference = form.food_preference.trim();
    if (avatarKey) patch.avatar = avatarKey;

    try {
      await updateProfile(patch);
      setSaved(true);
      router.push("/profile");
    } catch (err) {
      if (err instanceof ProfileValidationError) {
        const fe: FieldErrors = {};
        for (const key of [
          "name",
          "bio",
          "dob",
          "diet",
          "food_preference",
          "avatar",
        ] as EditableField[]) {
          const msg = err.errors?.[key]?.[0];
          if (msg) fe[key] = msg;
        }
        setFieldErrors(fe);
        setBanner(err.message);
      } else {
        setBanner("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  const saveDisabled = !dirty || saving || avatarUploading;

  return (
    <AppShell nav={false}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E0F5] bg-white px-4 py-3 sm:px-6">
        <button onClick={goBack} className="-ml-1 p-1 text-[#6F2DBD]" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-[#1A1A1A]">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saveDisabled}
          className="text-sm font-bold text-[#6F2DBD] disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6F2DBD] border-t-transparent" />
        </div>
      ) : loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-center text-sm text-[#555]">{loadError}</p>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-2xl bg-[#6F2DBD] px-6 py-3 text-sm font-bold text-white"
          >
            Back to profile
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-lg flex-col gap-4 px-4 mt-6 sm:gap-5 sm:px-6 lg:mx-0">
          {banner && <p className="text-center text-sm text-red-500">{banner}</p>}
          {saved && !banner && (
            <p className="text-center text-sm text-[#6F2DBD]">Saved</p>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E5E0F5]">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile photo"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9B8DC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-sm font-bold text-[#6F2DBD] disabled:opacity-40"
              >
                Change photo
              </button>
              {avatarKey && !avatarUploading && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-sm font-medium text-[#888]"
                >
                  Undo
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              onChange={handlePickAvatar}
              className="hidden"
            />
            {fieldErrors.avatar && (
              <p className="text-xs text-red-500">{fieldErrors.avatar}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="ml-1 text-xs font-medium text-[#888]">Name</label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 shadow-sm">
              <input
                type="text"
                placeholder="Your name"
                maxLength={150}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-[#333] placeholder-[#BBB] outline-none"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="ml-1 text-xs font-medium text-[#888]">Bio</label>
            <div className="mt-1 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 shadow-sm">
              <textarea
                placeholder="Tell other foodies about yourself"
                value={form.bio}
                maxLength={BIO_MAX}
                onChange={(e) => set("bio", e.target.value)}
                rows={4}
                className="w-full resize-none bg-transparent text-[15px] text-[#333] placeholder-[#BBB] outline-none"
              />
            </div>
            <div className="mt-1 ml-1 flex justify-between">
              {fieldErrors.bio ? (
                <p className="text-xs text-red-500">{fieldErrors.bio}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-[#BBB]">
                {form.bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="ml-1 text-xs font-medium text-[#888]">
              Date of birth
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 shadow-sm">
              <input
                type="date"
                value={form.dob}
                max={todayISO()}
                onChange={(e) => set("dob", e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-[#333] outline-none"
              />
              {form.dob && (
                <button
                  type="button"
                  onClick={() => set("dob", "")}
                  className="text-xs font-medium text-[#888]"
                >
                  Clear
                </button>
              )}
            </div>
            {fieldErrors.dob && (
              <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.dob}</p>
            )}
          </div>

          {/* Diet */}
          <div>
            <label className="ml-1 text-xs font-medium text-[#888]">Diet</label>
            <div className="mt-1 flex items-center rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 shadow-sm">
              <select
                value={form.diet}
                onChange={(e) => set("diet", e.target.value as Diet)}
                className="flex-1 bg-transparent text-[15px] text-[#333] outline-none"
              >
                {DIET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.diet && (
              <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.diet}</p>
            )}
          </div>

          {/* Food preference */}
          <div>
            <label className="ml-1 text-xs font-medium text-[#888]">
              Food preference
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-2xl border border-[#E5E0F5] bg-white px-4 py-4 shadow-sm">
              <input
                type="text"
                placeholder="e.g. South Indian, spicy, street food"
                maxLength={FOOD_PREF_MAX}
                value={form.food_preference}
                onChange={(e) => set("food_preference", e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-[#333] placeholder-[#BBB] outline-none"
              />
            </div>
            {fieldErrors.food_preference && (
              <p className="mt-1 ml-1 text-xs text-red-500">
                {fieldErrors.food_preference}
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saveDisabled}
            className="mt-1 w-full rounded-2xl bg-[#6F2DBD] py-4 text-base font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}

      {showDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes. Leaving now will lose them."
          onCancel={() => setShowDiscard(false)}
          onConfirm={() => {
            setShowDiscard(false);
            router.push("/profile");
          }}
        />
      )}
    </AppShell>
  );
}

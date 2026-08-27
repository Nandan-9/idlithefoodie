"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, updateProfile, ProfileValidationError } from "@/lib/api";
import type { ProfileUpdate } from "@/types/profile";
import AppShell from "@/components/mobile/AppShell";
import ConfirmDialog from "./ConfirmDialog";

type FieldErrors = Partial<Record<"name" | "bio", string>>;

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [initial, setInitial] = useState({ name: "", bio: "" });
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const dirty = name !== initial.name || bio !== initial.bio;

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((p) => {
        if (cancelled) return;
        setInitial({ name: p.name ?? "", bio: p.bio ?? "" });
        setName(p.name ?? "");
        setBio(p.bio ?? "");
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load your profile. Go back and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
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

  function goBack() {
    if (dirty) {
      setShowDiscard(true);
    } else {
      router.push("/profile");
    }
  }

  async function handleSave() {
    if (!dirty || saving) return;
    setSaving(true);
    setBanner(null);
    setFieldErrors({});

    const patch: ProfileUpdate = {};
    if (name !== initial.name) patch.name = name.trim();
    if (bio !== initial.bio) patch.bio = bio.trim();

    try {
      await updateProfile(patch);
      setInitial({ name: patch.name ?? initial.name, bio: patch.bio ?? initial.bio });
      setSaved(true);
      router.push("/profile");
    } catch (err) {
      if (err instanceof ProfileValidationError) {
        const fe: FieldErrors = {};
        if (err.errors?.name) fe.name = err.errors.name[0];
        if (err.errors?.bio) fe.bio = err.errors.bio[0];
        setFieldErrors(fe);
        setBanner(err.message);
      } else {
        setBanner("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell nav={false}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E0F5] sm:px-6">
        <button
          onClick={goBack}
          className="text-[#6F2DBD] p-1 -ml-1"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[#1A1A1A] font-bold text-base">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="text-[#6F2DBD] font-bold text-sm disabled:opacity-40"
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
          <p className="text-[#555] text-sm text-center">{loadError}</p>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-2xl bg-[#6F2DBD] text-white font-bold text-sm px-6 py-3"
          >
            Back to profile
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-lg flex-col gap-4 px-4 mt-6 sm:gap-5 sm:px-6 lg:mx-0">
          {banner && (
            <p className="text-red-500 text-sm text-center">{banner}</p>
          )}
          {saved && !banner && (
            <p className="text-[#6F2DBD] text-sm text-center">Saved</p>
          )}

          <div>
            <label className="text-[#888] text-xs font-medium ml-1">Name</label>
            <div className="mt-1 flex items-center gap-3 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="text-[#888] text-xs font-medium ml-1">Bio</label>
            <div className="mt-1 bg-white border border-[#E5E0F5] rounded-2xl px-4 py-4 shadow-sm">
              <textarea
                placeholder="Tell other foodies about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-[#333] placeholder-[#BBB] text-[15px] outline-none resize-none"
              />
            </div>
            {fieldErrors.bio && (
              <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.bio}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="w-full bg-[#6F2DBD] text-white font-bold text-base rounded-2xl py-4 mt-1 shadow-md active:scale-95 transition-transform disabled:opacity-60"
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

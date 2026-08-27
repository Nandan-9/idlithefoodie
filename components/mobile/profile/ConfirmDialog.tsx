"use client";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onCancel}
        aria-hidden
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-[#1A1A1A] font-bold text-lg">{title}</h2>
        <p className="text-[#555] text-sm mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[#E5E0F5] py-3 text-[#6F2DBD] font-semibold text-sm active:scale-95 transition-transform"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-[#E84855] py-3 text-white font-semibold text-sm active:scale-95 transition-transform"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

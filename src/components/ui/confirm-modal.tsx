"use client";

import { Button } from "./button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-semibold text-base">{title}</h2>
        {description && (
          <p className="text-white/40 text-sm mt-2">{description}</p>
        )}
        <div className="flex gap-2 justify-end mt-6">
          <Button
            variant="ghost"
            className="h-9 px-4 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className="h-9 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

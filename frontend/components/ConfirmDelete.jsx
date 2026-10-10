"use client";
import { useEffect } from "react";

export default function ConfirmDelete({ student, busy, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
         onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="font-display text-lg font-semibold">Delete this student?</h2>
        <p className="mt-2 text-sm text-slate">
          {student.name} ({student.studentId}) will be removed from the registry. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onCancel}>Keep student</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete student"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const THIS_YEAR = new Date().getFullYear();
const EMPTY = { name: "", studentId: "", facultyId: "", courseId: "", admissionYear: THIS_YEAR };

export default function StudentModal({ meta, student, onClose, onSaved }) {
  const editing = Boolean(student);
  const [form, setForm] = useState(
    editing
      ? {
          name: student.name, studentId: student.studentId, facultyId: String(student.facultyId),
          courseId: String(student.courseId), admissionYear: student.admissionYear,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [idTouched, setIdTouched] = useState(editing);
  const firstField = useRef(null);

  const courses = meta.faculties.find((f) => String(f.id) === String(form.facultyId))?.courses || [];
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Suggest the next free ID once course + year are known (until the user types their own).
  useEffect(() => {
    if (idTouched || !form.courseId || !form.admissionYear) return;
    api.nextId(form.courseId, form.admissionYear)
      .then((r) => r.studentId && set({ studentId: r.studentId }))
      .catch(() => {});
  }, [form.courseId, form.admissionYear, idTouched]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = { ...form, facultyId: Number(form.facultyId), courseId: Number(form.courseId), admissionYear: Number(form.admissionYear) };
      const saved = editing ? await api.updateStudent(student.id, payload) : await api.createStudent(payload);
      onSaved(saved, editing);
    } catch (err) {
      setErrors(err.errors || { form: err.message });
    } finally {
      setSaving(false);
    }
  }

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-[#B42318]">{errors[k]}</p> : null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
         onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="modal-title"
            className="w-full max-w-lg rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl">
        <h2 id="modal-title" className="font-display text-xl font-semibold">
          {editing ? "Edit student" : "Add student"}
        </h2>
        <p className="mt-1 text-sm text-slate">
          {editing ? "Update this student's record." : "Register a new student in the university records."}
        </p>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="mb-1 block text-sm font-medium">Full name</span>
            <input ref={firstField} className="field" value={form.name} onChange={(e) => set({ name: e.target.value })} />
            <Err k="name" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium">Faculty</span>
              <select className="field" value={form.facultyId}
                      onChange={(e) => set({ facultyId: e.target.value, courseId: "" })}>
                <option value="">Choose faculty</option>
                {meta.faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <Err k="facultyId" />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium">Course</span>
              <select className="field" value={form.courseId} disabled={!form.facultyId}
                      onChange={(e) => set({ courseId: e.target.value })}>
                <option value="">{form.facultyId ? "Choose course" : "Choose a faculty first"}</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Err k="courseId" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium">Admission year</span>
              <input className="field" type="number" min="1990" max={THIS_YEAR + 1}
                     value={form.admissionYear} onChange={(e) => set({ admissionYear: e.target.value })} />
              <Err k="admissionYear" />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium">Student ID</span>
              <input className="field tabular-nums" value={form.studentId} placeholder="e.g. 2024-CSE-012"
                     onChange={(e) => { setIdTouched(true); set({ studentId: e.target.value }); }} />
              <Err k="studentId" />
            </label>
          </div>
          {!editing && !idTouched && (
            <p className="-mt-2 text-xs text-slate">The ID is filled in once you pick a course and year. You can change it.</p>
          )}
        </div>

        {errors.form && <p className="mt-4 rounded-md bg-[#B42318]/10 px-3 py-2 text-sm text-[#B42318]">{errors.form}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add student"}
          </button>
        </div>
      </form>
    </div>
  );
}

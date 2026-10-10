"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import Filters from "@/components/Filters";
import StudentTable from "@/components/StudentTable";
import Pagination from "@/components/Pagination";
import StudentModal from "@/components/StudentModal";
import ConfirmDelete from "@/components/ConfirmDelete";

const LIMIT = 10;
const NO_FILTERS = { search: "", faculty: "", course: "", year: "" };

export default function Home() {
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("added");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | { student? }
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };

  // Debounce the search box so we don't query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const loadMeta = useCallback(async () => {
    const [m, s] = await Promise.all([api.meta(), api.stats()]);
    setMeta(m);
    setStats(s);
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.listStudents({
        search: debouncedSearch, faculty: filters.faculty, course: filters.course,
        year: filters.year, sort, dir, page, limit: LIMIT,
      });
      setResult(r);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.faculty, filters.course, filters.year, sort, dir, page]);

  useEffect(() => { loadMeta().catch((e) => setError(e.message)); }, [loadMeta]);
  useEffect(() => { loadStudents(); }, [loadStudents]);

  const changeFilters = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
  const resetFilters = () => { setFilters(NO_FILTERS); setPage(1); };
  const changeSort = (key) => {
    if (key === sort) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setDir("asc"); }
    setPage(1);
  };

  async function onSaved(saved, wasEditing) {
    setModal(null);
    if (!wasEditing) {
      // Jump to the newest-first list so the new record is visible.
      setFilters(NO_FILTERS); setSort("added"); setDir("desc"); setPage(1);
      setHighlightId(saved.id);
      setTimeout(() => setHighlightId(null), 2600);
    }
    notify(wasEditing ? `Saved changes to ${saved.name}` : `Added ${saved.name}`);
    await Promise.all([loadStudents(), loadMeta()]);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.deleteStudent(toDelete.id);
      notify(`Deleted ${toDelete.name}`);
      setToDelete(null);
      await Promise.all([loadStudents(), loadMeta()]);
    } catch (e) {
      notify(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="font-display text-xl font-semibold leading-tight">Meridian University</p>
            <p className="text-sm text-white/65">Office of the Registrar</p>
          </div>
          <button onClick={() => setModal({})} disabled={!meta} className="btn bg-marigold text-ink hover:bg-[#E6A91A]">
            Add student
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="py-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Student registry</h1>
          {stats && (
            <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              {[
                [stats.students, "enrolled students"],
                [stats.faculties, "faculties"],
                [stats.courses, "courses"],
                [stats.since, "oldest admission year"],
              ].map(([v, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <dd className="font-display text-2xl font-semibold tabular-nums">{v}</dd>
                  <dt className="text-sm text-slate">{l}</dt>
                </div>
              ))}
            </dl>
          )}
        </section>

        {error && (
          <div role="alert" className="mb-4 rounded-md border border-[#B42318]/30 bg-[#B42318]/10 px-4 py-3 text-sm text-[#B42318]">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          {meta && (
            <Filters meta={meta} filters={filters} onChange={changeFilters} onReset={resetFilters} resultCount={result.total} />
          )}
          <StudentTable
            students={result.data} loading={loading} sort={sort} dir={dir} onSort={changeSort}
            onEdit={(s) => setModal({ student: s })} onDelete={setToDelete}
            highlightId={highlightId} hasFilters={hasFilters} onAdd={() => setModal({})}
          />
          <Pagination page={page} pages={result.pages} total={result.total} limit={LIMIT} onPage={setPage} />
        </div>
      </main>

      {modal && meta && (
        <StudentModal meta={meta} student={modal.student} onClose={() => setModal(null)} onSaved={onSaved} />
      )}
      {toDelete && (
        <ConfirmDelete student={toDelete} busy={deleting} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      )}
      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

"use client";
import { facultyColor } from "./facultyColors";

const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "name", label: "Name" },
  { key: "faculty", label: "Faculty" },
  { key: "course", label: "Course" },
  { key: "year", label: "Admitted" },
];

function SortIcon({ active, dir }) {
  return (
    <span aria-hidden className={`ml-1 text-[10px] ${active ? "text-ink" : "text-transparent"}`}>
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

export default function StudentTable({
  students, loading, sort, dir, onSort, onEdit, onDelete, highlightId, hasFilters, onAdd,
}) {
  if (!loading && students.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">
          {hasFilters ? "No students match these filters" : "No students registered yet"}
        </p>
        <p className="mt-1 text-sm text-slate">
          {hasFilters ? "Try a different name, faculty or course." : "Add the first student to start the registry."}
        </p>
        {!hasFilters && (
          <button onClick={onAdd} className="btn-primary mt-4">Add student</button>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : ""}`}>
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-slate">
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 font-medium"
                  aria-sort={sort === c.key ? (dir === "asc" ? "ascending" : "descending") : "none"}>
                <button onClick={() => onSort(c.key)} className="inline-flex items-center hover:text-ink">
                  {c.label}
                  <SortIcon active={sort === c.key} dir={dir} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {students.map((s) => (
            <tr key={s.id} className={`hover:bg-paper/70 ${s.id === highlightId ? "row-new" : ""}`}>
              <td className="px-4 py-3 font-medium tabular-nums">{s.studentId}</td>
              <td className="px-4 py-3">{s.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: facultyColor(s.facultyId) }} />
                  {s.faculty}
                </span>
              </td>
              <td className="px-4 py-3 text-slate">{s.course}</td>
              <td className="px-4 py-3 tabular-nums text-slate">{s.admissionYear}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button onClick={() => onEdit(s)} className="rounded px-2 py-1 font-medium text-signal hover:bg-signal/10">
                  Edit
                </button>
                <button onClick={() => onDelete(s)} className="ml-1 rounded px-2 py-1 font-medium text-[#B42318] hover:bg-[#B42318]/10">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

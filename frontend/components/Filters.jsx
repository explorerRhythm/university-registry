"use client";

export default function Filters({ meta, filters, onChange, onReset, resultCount }) {
  const courses = filters.faculty
    ? meta.faculties.find((f) => String(f.id) === String(filters.faculty))?.courses || []
    : meta.faculties.flatMap((f) => f.courses);
  const active = filters.search || filters.faculty || filters.course || filters.year;

  return (
    <div className="flex flex-col gap-3 border-b border-line bg-white p-4 lg:flex-row lg:items-end">
      <label className="flex-1">
        <span className="mb-1 block text-xs font-medium text-slate">Search</span>
        <input
          className="field"
          type="search"
          placeholder="Name or student ID"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </label>

      <label className="lg:w-56">
        <span className="mb-1 block text-xs font-medium text-slate">Faculty</span>
        <select
          className="field"
          value={filters.faculty}
          onChange={(e) => onChange({ faculty: e.target.value, course: "" })}
        >
          <option value="">All faculties</option>
          {meta.faculties.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </label>

      <label className="lg:w-64">
        <span className="mb-1 block text-xs font-medium text-slate">Course</span>
        <select
          className="field"
          value={filters.course}
          onChange={(e) => onChange({ course: e.target.value })}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="lg:w-32">
        <span className="mb-1 block text-xs font-medium text-slate">Admitted</span>
        <select
          className="field"
          value={filters.year}
          onChange={(e) => onChange({ year: e.target.value })}
        >
          <option value="">Any year</option>
          {meta.years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3 lg:pb-2">
        <span className="whitespace-nowrap text-sm text-slate" aria-live="polite">
          {resultCount} {resultCount === 1 ? "student" : "students"}
        </span>
        {active && (
          <button onClick={onReset} className="text-sm font-medium text-signal hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

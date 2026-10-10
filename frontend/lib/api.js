const BASE = "https://university-registry.onrender.com/api";
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });
  } catch {
    throw { message: `Can't reach the server at ${BASE}. If it was idle, wait a minute and reload.` };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { message: body.error || "Request failed", errors: body.errors };
  return body;
}

export const api = {
  meta: () => request("/meta"),
  stats: () => request("/stats"),
  listStudents: (params) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/students?${qs}`);
  },
  nextId: (courseId, year) => request(`/students/next-id?courseId=${courseId}&year=${year}`),
  createStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),
};

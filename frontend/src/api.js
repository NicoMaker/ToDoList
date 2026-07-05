const BASE_URL = "/api/todos";

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
    throw new Error(err.error || "Errore richiesta");
  }
  return res.json();
}

export const api = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}${query ? `?${query}` : ""}`).then(handleResponse);
  },

  create: (todo) =>
    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    }).then(handleResponse),

  update: (id, todo) =>
    fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    }).then(handleResponse),

  toggle: (id) =>
    fetch(`${BASE_URL}/${id}/toggle`, { method: "PATCH" }).then(handleResponse),

  remove: (id) =>
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then(handleResponse),

  clearCompleted: () =>
    fetch(`${BASE_URL}/clear/completed`, { method: "DELETE" }).then(
      handleResponse,
    ),
};

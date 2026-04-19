const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, { method, token, body, isForm } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data?.error?.message ? data.error.message : `Request failed (${res.status})`;
    const err = new Error(message);
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get(path, token) {
    return request(path, { method: "GET", token });
  },
  post(path, body, token) {
    return request(path, { method: "POST", token, body, isForm: body instanceof FormData });
  },
  put(path, body, token) {
    return request(path, { method: "PUT", token, body });
  },
  delete(path, token) {
    return request(path, { method: "DELETE", token });
  },
  download(path, token) {
    return fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
};


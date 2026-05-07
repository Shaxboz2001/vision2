const CAMERA_ADMIN_API = "https://172.16.55.13:8011";

async function request(url, options = {}) {
  const res = await fetch(`${CAMERA_ADMIN_API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API xatolik");
  }

  return res.json();
}

export function getKameralar() {
  return request("/api/cameras");
}

export function createKamera(payload) {
  return request("/api/cameras", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateKamera(id, payload) {
  return request(`/api/cameras/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteKamera(id) {
  return request(`/api/cameras/${id}`, {
    method: "DELETE",
  });
}

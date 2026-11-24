// Client HTTP centralisé pour communiquer avec l'API Laravel
// Tous les appels à l'API passent par ici — un seul endroit à modifier

const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api"
    : process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Récupère le token d'authentification depuis le localStorage.
 * (côté navigateur uniquement)
 */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Construit les headers par défaut pour chaque requête.
 */
function buildHeaders(customHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true", // <-- AJOUTÉ
    ...customHeaders,
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Gère la réponse de l'API :
 * - Parse le JSON
 * - Lève une erreur si le statut HTTP n'est pas OK
 */
async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Erreur HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Client API avec méthodes HTTP simples.
 */
export const api = {
  async get(path) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(),
    });
    return handleResponse(response);
  },

  async post(path, body = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async put(path, body = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete(path) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    return handleResponse(response);
  },
};

/**
 * Helpers d'authentification (stockage local du token).
 */
export const auth = {
  setToken(token) {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },

  getToken() {
    return getToken();
  },

  removeToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },

  isAuthenticated() {
    return !!getToken();
  },
};
const DEFAULT_BASE_URL = "https://localhost:7110/api";

const deriveBaseUrl = () => {
  const envBase =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL;
  const source =
    typeof envBase === "string" && envBase.trim().length > 0
      ? envBase.trim()
      : DEFAULT_BASE_URL;
  return source.endsWith("/") ? source.slice(0, -1) : source;
};

export const API_BASE_URL = deriveBaseUrl();

const isAbsoluteUrl = (path) => /^https?:\/\//i.test(path);

export const resolveUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const appendQueryParams = (url, query) => {
  if (!query || typeof query !== "object") {
    return url;
  }

  const urlObj = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    urlObj.searchParams.set(key, value);
  });
  return urlObj.toString();
};

const isFormData = (value) => {
  if (typeof FormData === "undefined") {
    return false;
  }
  return value instanceof FormData;
};

const toJsonString = (body) => {
  if (!body) {
    return undefined;
  }
  if (typeof body === "string") {
    return body;
  }
  return JSON.stringify(body);
};

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    query,
    skipAuth = false,
    ...rest
  } = options;

  let requestUrl = resolveUrl(path);
  requestUrl = appendQueryParams(requestUrl, query);

  const finalHeaders = new Headers();
  finalHeaders.set("Accept", "application/json");

  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    finalHeaders.set(key, value);
  });

  const bodyIsFormData = isFormData(body);

  if (
    !bodyIsFormData &&
    !finalHeaders.has("Content-Type") &&
    method.toUpperCase() !== "GET" &&
    method.toUpperCase() !== "HEAD"
  ) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth && !finalHeaders.has("Authorization")) {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = window.localStorage.getItem("accessToken");
      if (token) {
        finalHeaders.set("Authorization", `Bearer ${token}`);
      }
    }
  }

  let preparedBody = body;
  if (body && !bodyIsFormData && finalHeaders.get("Content-Type") === "application/json") {
    preparedBody = toJsonString(body);
  }

  const response = await fetch(requestUrl, {
    method,
    headers: finalHeaders,
    body: preparedBody,
    ...rest,
  });

  const contentType = response.headers.get("Content-Type") || "";
  const expectsJson = contentType.includes("application/json");

  let responsePayload;
  try {
    responsePayload = expectsJson ? await response.json() : await response.text();
  } catch {
    responsePayload = expectsJson ? {} : "";
  }

  if (!response.ok) {
    const message =
      typeof responsePayload === "object" && responsePayload !== null
        ? responsePayload.message || responsePayload.error || response.statusText
        : response.statusText;
    const error = new Error(message || "Request failed");
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  if (
    responsePayload &&
    typeof responsePayload === "object" &&
    Object.prototype.hasOwnProperty.call(responsePayload, "data")
  ) {
    return responsePayload.data;
  }

  return responsePayload;
}

export default apiFetch;

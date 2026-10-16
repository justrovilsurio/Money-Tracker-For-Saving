export function getAppOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  const value = configuredOrigin ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : null);
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL must be configured for this environment.");

  const parsed = new URL(value);
  const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) {
    throw new Error("Application origin must use HTTPS outside local development.");
  }
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("Application URL must be an origin without credentials, path, or query string.");
  }

  return parsed.origin;
}

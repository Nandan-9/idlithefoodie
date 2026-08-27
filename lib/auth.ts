const KEY = "idli_token";
const REFRESH_KEY = "idli_refresh";

const hasWindow = () => typeof window !== "undefined";

export const setToken = (token: string) => {
  if (hasWindow()) localStorage.setItem(KEY, token);
};

export const getToken = () => (hasWindow() ? localStorage.getItem(KEY) : null);

export const setRefreshToken = (token: string) => {
  if (hasWindow()) localStorage.setItem(REFRESH_KEY, token);
};

export const getRefreshToken = () =>
  hasWindow() ? localStorage.getItem(REFRESH_KEY) : null;

export const setSession = (access: string, refresh?: string | null) => {
  setToken(access);
  if (refresh) setRefreshToken(refresh);
};

export const clearSession = () => {
  if (!hasWindow()) return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(REFRESH_KEY);
};

/** @deprecated use clearSession */
export const clearToken = clearSession;

/** Base64url-decode a JWT payload segment. Returns null on any malformation. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * The authenticated user's numeric id, read from the `user_id` claim of the
 * stored access token (SimpleJWT). Null if not logged in or the claim is absent.
 */
export const getUserId = (): number | null => {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const raw = payload?.user_id ?? payload?.user ?? payload?.id ?? payload?.sub;
  const id = typeof raw === "string" ? Number(raw) : raw;
  return typeof id === "number" && Number.isFinite(id) ? id : null;
};

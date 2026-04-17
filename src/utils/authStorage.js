export function getStoredAuthValue(key) {
  return sessionStorage.getItem(key) || localStorage.getItem(key) || "";
}

export function getStoredUser() {
  const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setAuthSession({ token, refreshToken, role, user }) {
  clearAuthSession();

  sessionStorage.setItem("token", token || "");
  sessionStorage.setItem("refreshToken", refreshToken || "");
  sessionStorage.setItem("role", role || "");
  sessionStorage.setItem("user", JSON.stringify(user || {}));
}

export function updateStoredUser(nextUser) {
  sessionStorage.setItem("user", JSON.stringify(nextUser || {}));
  localStorage.removeItem("user");
}

export function clearAuthSession() {
  ["token", "refreshToken", "role", "user"].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);
const TOKEN_KEY = "access_token";

function getUserFromToken(token) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Token inválido.");
    }

    const normalizedPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    const decodedPayload = atob(paddedPayload);
    const bytes = Uint8Array.from(decodedPayload, (character) =>
      character.charCodeAt(0),
    );

    const payload = JSON.parse(new TextDecoder().decode(bytes));

    if (
      !payload.sub ||
      !Array.isArray(payload.roles) ||
      (payload.exp && payload.exp * 1000 <= Date.now())
    ) {
      throw new Error("Token inválido o vencido.");
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  } catch {
    throw new Error("El token de acceso es inválido o venció.");
  }
}

function readStoredSession() {
  const storedToken = sessionStorage.getItem(TOKEN_KEY);

  if (!storedToken) {
    return { token: null, user: null };
  }

  try {
    return {
      token: storedToken,
      user: getUserFromToken(storedToken),
    };
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const refreshSession = useCallback(() => {
    const currentSession = readStoredSession();
    setSession(currentSession);

    return Boolean(currentSession.token && currentSession.user);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const accessToken = response.access_token;
    const user = getUserFromToken(accessToken);

    sessionStorage.setItem(TOKEN_KEY, accessToken);
    setSession({ token: accessToken, user });

    return user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setSession({ token: null, user: null });
  }, []);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
      refreshSession,
    }),
    [session, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}

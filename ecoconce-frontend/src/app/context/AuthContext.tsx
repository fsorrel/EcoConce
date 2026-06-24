import React, { createContext, useContext, useState, ReactNode } from "react";
import { saveToken, clearToken, getToken, clearCurrentUser } from "../lib/api";

interface AuthState {
  token: string | null;
  userId: number | null;
  rol: string | null;
}

interface AuthContextValue {
  auth: AuthState;
  login: (token: string, userId: number, rol: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    token: getToken(),
    userId: null,
    rol: null,
  });

  const login = (token: string, userId: number, rol: string) => {
    saveToken(token);
    setAuth({ token, userId, rol });
  };

  const logout = () => {
    clearToken();
    clearCurrentUser();
    setAuth({ token: null, userId: null, rol: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
    token: string | null;
    userId: number | null;
    rol: string | null;
}

const AuthContext = createContext<{
    auth: AuthState;
    login: (token: string, userId: number, rol: string) => void;
    logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>({
        token: localStorage.getItem("token"),
        userId: null,
        rol: null,
    });

    const login = (token: string, userId: number, rol: string) => {
        localStorage.setItem("token", token);
        setAuth({ token, userId, rol });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("ecoconce_user");
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

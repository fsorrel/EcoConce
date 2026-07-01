import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../app/context/AuthContext";

// Mock de las funciones de api que toca AuthContext
vi.mock("../../app/lib/api", () => ({
  saveToken: vi.fn(),
  clearToken: vi.fn(),
  getToken: vi.fn(() => null),
  clearCurrentUser: vi.fn(),
}));

// Componente auxiliar que expone el contexto en el DOM para poder afirmarlo
function AuthConsumer() {
  const { auth, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{auth.token ?? "sin-token"}</span>
      <span data-testid="rol">{auth.rol ?? "sin-rol"}</span>
      <span data-testid="userId">{auth.userId ?? "sin-id"}</span>
      <button onClick={() => login("tok-123", 7, "ADMIN")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("empieza sin token ni usuario", () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("token").textContent).toBe("sin-token");
    expect(screen.getByTestId("rol").textContent).toBe("sin-rol");
  });

  it("login actualiza token, rol y userId en el contexto", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("token").textContent).toBe("tok-123");
    expect(screen.getByTestId("rol").textContent).toBe("ADMIN");
    expect(screen.getByTestId("userId").textContent).toBe("7");
  });

  it("logout limpia el contexto completamente", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => { screen.getByText("Login").click(); });
    await act(async () => { screen.getByText("Logout").click(); });

    expect(screen.getByTestId("token").textContent).toBe("sin-token");
    expect(screen.getByTestId("rol").textContent).toBe("sin-rol");
  });

  it("useAuth fuera de AuthProvider lanza error descriptivo", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth debe usarse dentro de AuthProvider"
    );
    consoleError.mockRestore();
  });
});

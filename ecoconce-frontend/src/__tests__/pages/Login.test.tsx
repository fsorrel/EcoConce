import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Login } from "../../app/pages/Login";
import { AuthProvider } from "../../app/context/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../app/lib/api", () => ({
  api: {
    login: vi.fn(),
    usuarioPorId: vi.fn(),
  },
  getRolePath: vi.fn(() => "/ciudadano"),
  saveToken: vi.fn(),
  clearToken: vi.fn(),
  getToken: vi.fn(() => null),
  clearCurrentUser: vi.fn(),
  saveCurrentUser: vi.fn(() => ({ id: 1, rol: "CIUDADANO", rolId: 1 })),
}));

import { api } from "../../app/lib/api";

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el formulario con los campos de correo y contraseña", () => {
    renderLogin();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ingresar/i })).toBeInTheDocument();
  });

  it("login exitoso navega al path del rol", async () => {
    (api.login as any).mockResolvedValue({ token: "jwt-abc", userId: 1, rol: "CIUDADANO" });
    (api.usuarioPorId as any).mockResolvedValue({ id: 1, nombreAlias: "Juan" });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: "juan@test.cl" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/ciudadano");
    });
  });

  it("muestra mensaje de error cuando las credenciales son inválidas", async () => {
    (api.login as any).mockRejectedValue(new Error("Credenciales inválidas"));

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: "malo@test.cl" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });
  });

  it("botón demo 'Ciudadano' precarga las credenciales en el formulario", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /Ciudadano/i }));
    expect((screen.getByLabelText(/Correo/i) as HTMLInputElement).value).toBe("jordan@ecoconce.cl");
  });

  it("muestra 'Validando...' mientras espera la respuesta del API", async () => {
    (api.login as any).mockReturnValue(new Promise(() => {})); // nunca resuelve

    renderLogin();
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: "a@b.cl" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    expect(await screen.findByText("Validando...")).toBeInTheDocument();
  });
});

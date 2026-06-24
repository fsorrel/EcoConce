import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PremiosCiudadano } from "../../app/pages/PremiosCiudadano";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../../app/lib/api";

// Mock de API de EcoConce
vi.mock("../../app/lib/api", () => {
  const mockApi = {
    premios: vi.fn(),
    canjearPremio: vi.fn(),
  };
  return {
    api: mockApi,
    getCurrentUser: vi.fn(),
    refreshCurrentUserFromBackend: vi.fn(),
    getToken: vi.fn(() => "token-test"),
    API_BASE: "http://localhost:3000",
  };
});

describe("PremiosCiudadano Page Tests", () => {
  const mockUserSession = {
    id: 1,
    rut: "12.345.678-9",
    nombreAlias: "EcoUser",
    correo: "user@ecoconce.cl",
    puntos: 1000,
    direccion: "Los Canarios 200, Concepción",
    comuna: "Concepción",
    rol: "Ciudadano",
  };

  const mockPremios = [
    {
      id: 1,
      nombre: "Compostera Familiar",
      descripcion: "Compostera plástica de 100L para residuos orgánicos.",
      costoPuntos: 800,
      stock: 3,
      activo: "S",
      envioDomicilio: "S",
    },
    {
      id: 2,
      nombre: "Termo EcoConce",
      descripcion: "Termo de acero inoxidable con aislamiento al vacío.",
      costoPuntos: 1500,
      stock: 5,
      activo: "S",
      envioDomicilio: "N",
    },
    {
      id: 3,
      nombre: "Bolsa Reutilizable",
      descripcion: "Bolsa de algodón orgánico.",
      costoPuntos: 200,
      stock: 0,
      activo: "S",
      envioDomicilio: "N",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockReturnValue(mockUserSession);
    (refreshCurrentUserFromBackend as any).mockResolvedValue(mockUserSession);
    (api.premios as any).mockResolvedValue(mockPremios);

    // Mock de global.fetch para el hook usePremios
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPremios,
    } as Response);
  });

  it("debe renderizar el catálogo de premios con la descripción amigable", async () => {
    render(
      <MemoryRouter>
        <PremiosCiudadano />
      </MemoryRouter>
    );

    // Esperar a que se carguen los premios
    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
    });

    // Validar descripción amigable y no técnica
    expect(screen.getByText("Elige y canjea tus premios favoritos con los puntos acumulados por reciclar.")).toBeInTheDocument();
    expect(screen.queryByText("Se muestran los premios disponibles cargados desde el backend.")).not.toBeInTheDocument();

    // Validar eco-puntos del usuario
    expect(screen.getByText("1.000 pts")).toBeInTheDocument();
  });

  it("debe permitir buscar y filtrar los premios por su nombre", async () => {
    render(
      <MemoryRouter>
        <PremiosCiudadano />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar premio...");
    fireEvent.change(searchInput, { target: { value: "Termo" } });

    // "Termo EcoConce" debe estar presente
    expect(screen.getByText("Termo EcoConce")).toBeInTheDocument();
    // "Compostera Familiar" no debe aparecer al filtrarse
    expect(screen.queryByText("Compostera Familiar")).not.toBeInTheDocument();
  });

  it("debe habilitar/deshabilitar el botón de canje según stock y puntos", async () => {
    render(
      <MemoryRouter>
        <PremiosCiudadano />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
    });

    // Bolsa Reutilizable (ID 3) no tiene stock. Botón debe decir "Sin stock" y estar disabled
    const outOfStockButton = screen.getAllByRole("button", { name: /Sin stock/i })[0];
    expect(outOfStockButton).toBeDisabled();

    // Termo EcoConce (ID 2) cuesta 1500 pts, usuario tiene 1000 pts. Botón debe decir "Puntos insuficientes" y estar disabled
    const lowPointsButton = screen.getByRole("button", { name: /Puntos insuficientes/i });
    expect(lowPointsButton).toBeDisabled();

    // Compostera Familiar (ID 1) cuesta 800 pts, usuario tiene 1000 pts y tiene dirección. Botón debe decir "Canjear premio" y estar habilitado
    const redeemButton = screen.getByRole("button", { name: /Canjear premio/i });
    expect(redeemButton).not.toBeDisabled();
  });

  it("debe mostrar advertencia si el premio requiere envío y el usuario no tiene dirección", async () => {
    // Usuario sin dirección (también en el refresh desde backend, que es el que fija el estado final)
    const userWithoutAddress = { ...mockUserSession, direccion: "" };
    (getCurrentUser as any).mockReturnValue(userWithoutAddress);
    (refreshCurrentUserFromBackend as any).mockResolvedValue(userWithoutAddress);

    render(
      <MemoryRouter>
        <PremiosCiudadano />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
    });

    // Advertencia de envío a domicilio debe mostrarse (aviso en la tarjeta del premio)
    expect(screen.getByText("Requiere envío a domicilio.")).toBeInTheDocument();
    expect(screen.getByText("Debes ingresar tu dirección en tu perfil antes de canjear.")).toBeInTheDocument();

    const disabledRedeemButton = screen.getByRole("button", { name: /Completa tu dirección/i });
    expect(disabledRedeemButton).toBeDisabled();
  });

  it("debe procesar el canje de un premio exitosamente", async () => {
    const mockCanjeResponse = {
      id: 10,
      premioId: 1,
      premio: "Compostera Familiar",
      puntosGastados: 800,
      codigoCanje: "ECO-A1B2C3",
      estado: "PENDIENTE",
      envioDomicilio: "S",
      direccionEnvio: "Los Canarios 200, Concepción",
      puntosRestantes: 200,
      fechaCanje: "2026-06-10T12:00:00Z",
    };

    (api.canjearPremio as any).mockResolvedValue(mockCanjeResponse);

    render(
      <MemoryRouter>
        <PremiosCiudadano />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
    });

    const redeemButton = screen.getByRole("button", { name: /Canjear premio/i });
    fireEvent.click(redeemButton);

    // Debe mostrar la tarjeta de éxito tras el canje
    await waitFor(() => {
      expect(screen.getByText("Canje generado correctamente")).toBeInTheDocument();
      expect(screen.getByText("ECO-A1B2C3")).toBeInTheDocument();
    });
  });
});

/*
  EXPLICACIÓN DEL TEST:
  Este archivo prueba PremiosCiudadano.tsx:
  1. Catálogo de premios: verifica que renderice tarjetas de premios y use textos claros.
  2. Búsqueda y Filtro: evalúa el campo de búsqueda simulando cambios en el input.
  3. Lógica de negocio (puntos/stock): comprueba que los botones cambien su estado y etiqueta basándose en los puntos y dirección del usuario y stock del premio.
  4. Flujo de Canje: mockea la respuesta de api.canjearPremio y comprueba el feedback visual de éxito.
*/

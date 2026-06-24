import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CitizenDashboard } from "../../app/pages/CitizenDashboard";
import { api } from "../../app/lib/api";

// Mock de la API y utilidades del GPS
vi.mock("../../app/lib/api", () => {
  const mockApi = {
    dashboard: vi.fn(),
  };
  return {
    api: mockApi,
    getDemoUserId: () => 1,
    getToken: vi.fn(() => "token-test"),
    API_BASE: "http://localhost:3000",
  };
});

vi.mock("../../app/lib/gps", () => {
  return {
    getStoredLocation: () => null,
    shouldShowGpsPrompt: () => Promise.resolve(true),
    refreshLocationIfAllowed: () => Promise.resolve(null),
    requestUserLocation: () => Promise.resolve({ latitud: -36.8, longitud: -73.0, precisionM: 15, timestamp: 12345 }),
    tieneCoordenadasValidas: (point: any) => !!point.latitud && !!point.longitud,
    calcularDistanciaMetros: () => 150,
    formatDistance: (dist: number) => `${dist} m`,
    GPS_UPDATED_EVENT: "ecoconce:gps-updated",
    markGpsPromptDismissed: vi.fn(),
  };
});

describe("CitizenDashboard Page Tests", () => {
  const mockDashboardData = {
    usuario: {
      id: 1,
      nombreAlias: "EcoCiudadano",
      correo: "ciudadano@ecoconce.cl",
      puntos: 1250,
      rol: "Ciudadano",
    },
    resumen: {
      materialesReciclados: 25,
      puntosGanados: 1250,
      desafiosCompletados: 4,
      nivelesGanados: 2,
    },
    medallas: [
      { nombre: "Eco Novato", icono: "🥉", obtenida: true, puntosRequeridos: 0 },
      { nombre: "Recolector Verde", icono: "🌱", obtenida: false, puntosRequeridos: 5000 },
    ],
    puntos: [
      {
        id: 1,
        nombre: "Punto Central Plaza",
        direccion: "Barros Arana 500",
        estado: "Operativo",
        latitud: -36.82,
        longitud: -73.03,
        materiales: ["Vidrio", "Plástico"],
      },
    ],
    guias: [
      {
        id: 1,
        titulo: "Cómo clasificar PET",
        descripcion: "Una guía breve para clasificar envases PET-1.",
        contenido: "Lavar, secar y aplastar...",
        material: "Plástico",
      },
    ],
    materiales: [],
    premios: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.dashboard as any).mockResolvedValue(mockDashboardData);

    // Mock de global.fetch para el hook useDashboard
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData,
    } as Response);
  });

  it("debe renderizar el saludo al usuario y los eco-puntos correctamente", async () => {
    render(
      <MemoryRouter>
        <CitizenDashboard />
      </MemoryRouter>
    );

    // Esperar a que los datos de la API se carguen
    await waitFor(() => {
      expect(screen.getByText(/¡Hola EcoCiudadano!/i)).toBeInTheDocument();
    });

    // Validar las estadísticas
    expect(screen.getByText("25")).toBeInTheDocument(); // Materiales reciclados
    expect(screen.getByText("1.250")).toBeInTheDocument(); // Puntos ganados
    expect(screen.getByText("4")).toBeInTheDocument(); // Formularios aprobados
  });

  it("debe mostrar las medallas obtenidas y las pendientes", async () => {
    render(
      <MemoryRouter>
        <CitizenDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Eco Novato")).toBeInTheDocument();
    });

    // Medalla obtenida tiene el badge "Obtenida"
    expect(screen.getByText("Obtenida")).toBeInTheDocument();
    expect(screen.getByText("Recolector Verde")).toBeInTheDocument();
  });

  it("debe mostrar los puntos de reciclaje cercanos y las guías destacadas", async () => {
    render(
      <MemoryRouter>
        <CitizenDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Punto Central Plaza")).toBeInTheDocument();
    });

    expect(screen.getByText("Barros Arana 500")).toBeInTheDocument();
    expect(screen.getByText("Cómo clasificar PET")).toBeInTheDocument();
  });

  it("debe manejar la interacción de activación del GPS", async () => {
    render(
      <MemoryRouter>
        <CitizenDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Activa tu ubicación")).toBeInTheDocument();
    });

    const gpsButton = screen.getByRole("button", { name: /Activar GPS/i });
    fireEvent.click(gpsButton);

    await waitFor(() => {
      expect(screen.getByText(/GPS activo/i)).toBeInTheDocument();
    });
  });

  it("debe permitir descartar el prompt de activación de GPS", async () => {
    render(
      <MemoryRouter>
        <CitizenDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Activa tu ubicación")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /Ahora no/i });
    fireEvent.click(closeButton);

    // El prompt de GPS debe desaparecer de la vista
    expect(screen.queryByText("Activa tu ubicación")).not.toBeInTheDocument();
  });
});

/*
  EXPLICACIÓN DEL TEST:
  Este archivo evalúa el comportamiento del componente CitizenDashboard:
  1. Renderizado inicial: valida que se cargue la información del usuario del API mock.
  2. Stats de reciclaje: comprueba el formateo de números en las tarjetas de estadísticas.
  3. Despliegue de medallas: asegura que medallas obtenidas y bloqueadas se distingan.
  4. Interacciones GPS: simula la autorización de geolocalización y los cambios de UI correspondientes.
*/

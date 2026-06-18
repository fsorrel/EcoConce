import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { FormulariosReciclaje } from "../../app/pages/FormulariosReciclaje";
import { api } from "../../app/lib/api";

// Mock de la API
vi.mock("../../app/lib/api", () => {
  const mockApi = {
    formularios: vi.fn(),
    detalleFormularios: vi.fn(),
    puntos: vi.fn(),
    materiales: vi.fn(),
    crearFormulario: vi.fn(),
  };
  return {
    api: mockApi,
    getCurrentUserId: () => 1,
  };
});

describe("FormulariosReciclaje Page Tests", () => {
  const mockPuntos = [
    {
      id: 1,
      nombre: "Punto Plaza Concepción",
      direccion: "O'Higgins 500",
      latitud: -36.8268,
      longitud: -73.0498,
      estado: "Operativo",
      materiales: ["Plástico"],
    },
  ];

  const mockMateriales = [
    { id: 1, nombre: "Plástico PET", codigoIdentificador: "PET", descripcion: "Plástico PET-1" },
  ];

  const mockFormularios = [
    {
      id: 100,
      usuario_id: 1,
      punto_id: 1,
      distancia_metros: 15,
      total_puntos_obtenidos: 100,
      estado: "PENDIENTE",
      fecha_formulario: "2026-06-10T14:00:00Z",
      observacion: "PET limpio y aplastado",
    },
  ];

  const mockDetalles = [
    {
      id: 50,
      formulario_id: 100,
      material_id: 1,
      cantidad_declarada: 10,
      unidad_declarada: "UNIDAD",
      puntos_obtenidos: 100,
      observacion: "10 botellas",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.puntos as any).mockResolvedValue(mockPuntos);
    (api.materiales as any).mockResolvedValue(mockMateriales);
    (api.formularios as any).mockResolvedValue(mockFormularios);
    (api.detalleFormularios as any).mockResolvedValue(mockDetalles);

    // Mock de geolocalización global en el navegador
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        // Coordenadas idénticas a las del Punto 1 para distancia = 0
        success({
          coords: {
            latitude: -36.8268,
            longitude: -73.0498,
            accuracy: 5,
          },
        });
      }),
    };
    vi.stubGlobal("navigator", {
      geolocation: mockGeolocation,
    });
  });

  it("debe renderizar el listado de formularios y estadísticas iniciales", async () => {
    render(
      <MemoryRouter>
        <FormulariosReciclaje />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Formularios de Reciclaje")).toBeInTheDocument();
    });

    expect(screen.getByText("Total formularios")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Aprobados")).toBeInTheDocument();

    // ID del formulario debe ser mostrado en la tabla (ej: #100)
    expect(screen.getByText("#100")).toBeInTheDocument();
    // Columna Punto Plaza Concepción debe estar
    expect(screen.getByText("Punto Plaza Concepción")).toBeInTheDocument();
    // No debe aparecer la columna de "Usuario" con el ID del usuario demo (#1 1)
    expect(screen.queryByText("#1 1")).not.toBeInTheDocument();
  });

  it("debe abrir el modal de detalles al presionar Ver Detalle", async () => {
    render(
      <MemoryRouter>
        <FormulariosReciclaje />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ver detalle")).toBeInTheDocument();
    });

    const detailButton = screen.getByText("Ver detalle");
    fireEvent.click(detailButton);

    // Debe abrir el diálogo con la info detallada del formulario
    await waitFor(() => {
      expect(screen.getByText("Detalle del Formulario #100")).toBeInTheDocument();
      expect(screen.getByText("PET limpio y aplastado")).toBeInTheDocument();
      expect(screen.getByText("Plástico PET")).toBeInTheDocument();
      expect(screen.getByText("10 botellas")).toBeInTheDocument();
    });

    // Cerrar el modal
    const closeButton = screen.getByRole("button", { name: /Cerrar/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Detalle del Formulario #100")).not.toBeInTheDocument();
    });
  });

  it("debe simular obtención de GPS y permitir enviar un nuevo reciclaje", async () => {
    (api.crearFormulario as any).mockResolvedValue({ id: 101 });

    render(
      <MemoryRouter>
        <FormulariosReciclaje />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Informar reciclaje")).toBeInTheDocument();
    });

    // 1. Simular clic en calcular distancia con GPS
    const gpsButton = screen.getByTitle("Calcular distancia usando el GPS del dispositivo");
    fireEvent.click(gpsButton);

    await waitFor(() => {
      expect(screen.getByText("Estás dentro del rango permitido. Puedes informar reciclaje.")).toBeInTheDocument();
    });

    // 2. Llenar los campos adicionales
    const cantidadInput = screen.getByLabelText(/Cantidad declarada/i);
    fireEvent.change(cantidadInput, { target: { value: "15" } });

    const obsInput = screen.getByPlaceholderText(/Ej: Dejé el material en el contenedor principal/i);
    fireEvent.change(obsInput, { target: { value: "Ingresando botellas PET" } });

    // 3. Enviar el formulario
    const submitButton = screen.getByRole("button", { name: /Registrar formulario/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.crearFormulario).toHaveBeenCalledWith(1, {
        puntoId: 1,
        distanciaMetros: 0,
        observacion: "Ingresando botellas PET",
        materiales: [
          {
            materialId: 1,
            cantidadDeclarada: 15,
            unidadDeclarada: "UNIDAD",
            observacion: "",
          },
        ],
      });
      expect(screen.getByText("Formulario registrado correctamente. Queda pendiente de revisión.")).toBeInTheDocument();
    });
  });
});

/*
  EXPLICACIÓN DEL TEST:
  Este archivo prueba el componente FormulariosReciclaje:
  1. Renderizado e Inexistencia de Redundancia: verifica que cargue la lista y no contenga la columna "Usuario" (#1 1).
  2. Dialog Modal: comprueba que al dar clic a "Ver detalle" se dispare el modal flotante de Radix UI y muestre la tabla de desglose.
  3. Envío de Formulario: simula la consulta de geolocalización, comprueba que la distancia esté dentro del radio permitido (<= 50m), habilita el botón y realiza el submit enviando los datos correspondientes.
*/

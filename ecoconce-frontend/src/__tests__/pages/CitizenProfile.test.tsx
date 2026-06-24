import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CitizenProfile } from "../../app/pages/CitizenProfile";
import { api, getCurrentUser, refreshCurrentUserFromBackend, saveCurrentUser } from "../../app/lib/api";
import { toast } from "sonner";

// Mock de sonner para evitar fallas asíncronas en el DOM
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de la API y funciones de autenticación
vi.mock("../../app/lib/api", () => {
  const mockApi = {
    formulariosUsuario: vi.fn(),
    detallesUsuario: vi.fn(),
    canjesAdmin: vi.fn(),
    actualizarEstadoCanjeAdmin: vi.fn(),
  };
  return {
    api: mockApi,
    getCurrentUser: vi.fn(),
    refreshCurrentUserFromBackend: vi.fn(),
    saveCurrentUser: vi.fn(),
    getToken: vi.fn(() => "token-test"),
    API_BASE: "http://localhost:3000",
  };
});

describe("CitizenProfile Page Tests", () => {
  const mockUserSession = {
    id: 1,
    rut: "12.345.678-5", // RUT válido
    nombreAlias: "EcoUser",
    correo: "user@ecoconce.cl",
    sexoGenero: "Masculino",
    fechaNacimiento: "1995-04-12",
    telefono: "987654321",
    comunaId: 1,
    comuna: "Concepción",
    direccion: "Los Canarios 200, Concepción",
    puntos: 1200,
    rolId: 1,
    rol: "Ciudadano",
    activo: "S",
    fechaRegistro: "2026-01-10T10:00:00Z",
  };

  const mockFormularios = [
    {
      id: 1,
      usuario_id: 1,
      fecha_formulario: "2026-06-05T14:00:00Z",
      total_puntos_obtenidos: 150,
      estado: "APROBADO",
      punto_id: 1,
      distancia_metros: 12,
      observacion: "Material clasificado",
    },
  ];

  const mockDetalles = [
    {
      id: 1,
      formulario_id: 1,
      cantidad_declarada: 5,
    },
  ];

  const mockCanjes = [
    {
      id: 10,
      usuarioId: 1,
      usuario: "EcoUser",
      correo: "user@ecoconce.cl",
      premioId: 1,
      premio: "Compostera Familiar",
      puntosGastados: 800,
      codigoCanje: "ECO-12345",
      estado: "PENDIENTE",
      envioDomicilio: "S",
      direccionEnvio: "Los Canarios 200, Concepción",
      observacion: "Canje generado",
      fechaCanje: "2026-06-08T15:30:00Z",
      fechaEntrega: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockReturnValue(mockUserSession);
    (refreshCurrentUserFromBackend as any).mockResolvedValue(mockUserSession);
    (api.formulariosUsuario as any).mockResolvedValue(mockFormularios);
    (api.detallesUsuario as any).mockResolvedValue(mockDetalles);
    (api.canjesAdmin as any).mockResolvedValue(mockCanjes);
    (saveCurrentUser as any).mockImplementation((data: any) => data);
  });

  it("debe renderizar los datos del usuario en la pestaña Información", async () => {
    render(
      <MemoryRouter>
        <CitizenProfile />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    });

    // Validar visualización de datos de perfil
    expect(screen.getByDisplayValue("EcoUser")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12.345.678-5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("user@ecoconce.cl")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Los Canarios 200, Concepción")).toBeInTheDocument();
  });

  it("debe habilitar el modo de edición y permitir guardar cambios tras validación exitosa", async () => {
    render(
      <MemoryRouter>
        <CitizenProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    });

    // Cambiar a modo edición
    const editButton = screen.getByRole("button", { name: /Editar Perfil/i });
    fireEvent.click(editButton);

    // El botón "Editar Perfil" ya no debe estar en la cabecera
    expect(screen.queryByRole("button", { name: /Editar Perfil/i })).not.toBeInTheDocument();

    // Modificar nombre
    const nameInput = screen.getByLabelText(/Nombre o Alias/i);
    fireEvent.change(nameInput, { target: { value: "EcoUser Modificado" } });

    // Guardar cambios usando el botón que aparece al pie
    const saveButton = screen.getByRole("button", { name: /Guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveCurrentUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Perfil actualizado correctamente.");
    });
  });

  it("debe validar inputs inválidos (RUT y Correo) y mostrar mensajes de error", async () => {
    render(
      <MemoryRouter>
        <CitizenProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /Editar Perfil/i });
    fireEvent.click(editButton);

    // Ingresar RUT inválido y correo inválido
    const rutInput = screen.getByLabelText(/RUT/i);
    fireEvent.change(rutInput, { target: { value: "12.345.678-0" } }); // Inválido (DV correcto es 5)

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    fireEvent.change(emailInput, { target: { value: "correo_invalido" } }); // Inválido

    const saveButton = screen.getByRole("button", { name: /Guardar cambios/i });
    fireEvent.click(saveButton);

    // Comprobar mensajes de error en rojo
    await waitFor(() => {
      expect(screen.getByText("El RUT ingresado no es válido (ej: 12.345.678-9).")).toBeInTheDocument();
      expect(screen.getByText("El correo electrónico no tiene un formato válido.")).toBeInTheDocument();
    });

    expect(saveCurrentUser).not.toHaveBeenCalled();
  });

  it("debe mostrar el historial de canjes en la pestaña Historial de Canjes", async () => {
    render(
      <MemoryRouter>
        <CitizenProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Historial de Canjes")).toBeInTheDocument();
    });

    const tabTrigger = screen.getByText("Historial de Canjes");
    // Radix Tabs cambia de pestaña en mouseDown; el click dispara además la recarga (onClick)
    fireEvent.mouseDown(tabTrigger);
    fireEvent.click(tabTrigger);

    await waitFor(() => {
      expect(screen.getByText("Compostera Familiar")).toBeInTheDocument();
      expect(screen.getByText("ECO-12345")).toBeInTheDocument();
      expect(screen.getByText("-800 pts")).toBeInTheDocument();
    });
  });

  it("debe permitir confirmar la recepción de un canje y actualizar estado", async () => {
    (api.actualizarEstadoCanjeAdmin as any).mockResolvedValue({
      ...mockCanjes[0],
      estado: "ENTREGADO",
    });

    render(
      <MemoryRouter>
        <CitizenProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Historial de Canjes")).toBeInTheDocument();
    });

    // Ir a la pestaña de canjes
    const tabTrigger = screen.getByText("Historial de Canjes");
    // Radix Tabs cambia de pestaña en mouseDown; el click dispara además la recarga (onClick)
    fireEvent.mouseDown(tabTrigger);
    fireEvent.click(tabTrigger);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Confirmar recepción/i })).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: /Confirmar recepción/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.actualizarEstadoCanjeAdmin).toHaveBeenCalledWith(10, {
        estado: "ENTREGADO",
        observacion: "Recepción confirmada por el usuario en su domicilio.",
      });
      expect(toast.success).toHaveBeenCalledWith("¡Recepción confirmada con éxito! Estado actualizado.");
    });
  });
});

/*
  EXPLICACIÓN DEL TEST:
  Este archivo evalúa el comportamiento del componente CitizenProfile:
  1. Renderizado de Datos: comprueba la visualización en Inputs deshabilitados.
  2. Modificación de Perfil: habilita edición, realiza cambios válidos y comprueba el guardado en localStorage.
  3. Validaciones de Inputs: testea RUT chileno inválido y Correo inválido, bloqueando el guardado y mostrando feedback en rojo.
  4. Navegación e Historial de Canjes: valida el flujo de la nueva pestaña de canjes.
  5. Recepción de Envío: simula hacer clic en el botón de confirmación de recepción, llamando a la API y mostrando un toast.
*/

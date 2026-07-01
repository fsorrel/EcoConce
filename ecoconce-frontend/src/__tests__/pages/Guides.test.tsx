import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Guides } from "../../app/pages/Guides";

vi.mock("../../app/lib/api", () => ({
  api: {
    guias: vi.fn(),
  },
}));

import { api } from "../../app/lib/api";

const mockGuias = [
  {
    id: 1,
    titulo: "Cómo reciclar PET",
    descripcion: "Guía para reciclar botellas PET",
    contenido: "Lavar y aplastar la botella antes de depositarla en el contenedor.",
    material: "Plástico",
  },
  {
    id: 2,
    titulo: "Reciclaje de cartón",
    descripcion: "Pasos para reciclar cartón",
    contenido: "Doblar y amarrar el cartón en paquetes no mayores a 50cm.",
    material: "Cartón",
  },
];

// El título de la guía destacada se repite en la tarjeta, por eso usamos getAllByText
const renderGuides = () => render(<MemoryRouter><Guides /></MemoryRouter>);

describe("Guides Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.guias as any).mockResolvedValue(mockGuias);
  });

  it("renderiza el título y carga las guías desde la API", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText("Cómo reciclar PET").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Reciclaje de cartón")).toBeInTheDocument();
  });

  it("filtra guías por material al hacer clic en un badge", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText("Plástico").length).toBeGreaterThan(0);
    });

    // El primer "Plástico" es el badge de filtro
    fireEvent.click(screen.getAllByText("Plástico")[0]);

    expect(screen.getAllByText("Cómo reciclar PET").length).toBeGreaterThan(0);
    expect(screen.queryByText("Reciclaje de cartón")).not.toBeInTheDocument();
  });

  it("filtra guías por búsqueda de texto", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText("Cómo reciclar PET").length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), { target: { value: "cartón" } });

    expect(screen.queryByText("Cómo reciclar PET")).not.toBeInTheDocument();
    // "Reciclaje de cartón" aparece en la destacada y en la tarjeta
    expect(screen.getAllByText("Reciclaje de cartón").length).toBeGreaterThan(0);
  });

  it("abre el modal con el contenido completo al hacer clic en una guía", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText(/Leer Artículo/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText(/Leer Artículo/i)[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Lavar y aplastar la botella antes de depositarla en el contenedor.")
      ).toBeInTheDocument();
    });
  });

  it("cierra el modal al hacer clic en el botón de cerrar", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText(/Leer Artículo/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText(/Leer Artículo/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Lavar y aplastar/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Lavar y aplastar/i)).not.toBeInTheDocument();
    });
  });

  it("muestra mensaje de filtro vacío cuando no hay resultados", async () => {
    renderGuides();

    await waitFor(() => {
      expect(screen.getAllByText("Cómo reciclar PET").length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), { target: { value: "xyzxyzxyz" } });

    expect(screen.getByText(/No hay guías disponibles para este filtro/i)).toBeInTheDocument();
  });

  it("muestra error si la API falla", async () => {
    (api.guias as any).mockRejectedValue(new Error("Error de red"));

    renderGuides();

    await waitFor(() => {
      expect(screen.getByText("Error de red")).toBeInTheDocument();
    });
  });
});

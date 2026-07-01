import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePuntos } from "../../app/hooks/usePuntos";

// usePuntos llama directamente a fetch(`${API_BASE}/api/puntos`), no a api.puntos()
const mockPuntos = [
  { id: 1, nombre: "Punto A", estado: "Activo", latitud: -36.8, longitud: -73.0 },
  { id: 2, nombre: "Punto B", estado: "Lleno", latitud: -36.82, longitud: -73.01 },
];

describe("usePuntos", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("carga puntos correctamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPuntos,
    } as Response);

    const { result } = renderHook(() => usePuntos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.puntos).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("maneja error HTTP (respuesta no ok)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => usePuntos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.puntos).toHaveLength(0);
    expect(result.current.error).toContain("500");
  });

  it("maneja error de red", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Sin conexión"));

    const { result } = renderHook(() => usePuntos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.puntos).toHaveLength(0);
    expect(result.current.error).toContain("Sin conexión");
  });
});

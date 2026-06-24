import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePremios } from "../../app/hooks/usePremios";

const premiosMock = [
  { id: 1, nombre: "Bolsa Reutilizable", costoPuntos: 100, stock: 5 },
  { id: 2, nombre: "Botella Térmica", costoPuntos: 200, stock: 3 },
];

describe("usePremios", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem("ecoconce_token", "token-test");
  });

  it("devuelve lista de premios al cargar correctamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => premiosMock,
    } as Response);

    const { result } = renderHook(() => usePremios());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.premios).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("establece error cuando la API falla", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => usePremios());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.premios).toHaveLength(0);
  });

  it("establece error cuando la red falla", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => usePremios());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("inicia con loading = true y premios vacíos", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => usePremios());
    expect(result.current.loading).toBe(true);
    expect(result.current.premios).toHaveLength(0);
  });

  it("refetch vuelve a llamar la API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => premiosMock,
    } as Response);
    global.fetch = fetchMock;

    const { result } = renderHook(() => usePremios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.refetch();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

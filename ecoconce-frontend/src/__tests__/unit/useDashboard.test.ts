import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDashboard } from "../../app/hooks/useDashboard";

describe("useDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem("ecoconce_token", "token-test");
  });

  it("carga datos del dashboard correctamente", async () => {
    const mockData = { puntosTotales: 150, actividadesRealizadas: 5, medallas: ["Bronce"] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useDashboard(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("maneja usuario inexistente → error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useDashboard(9999));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain("404");
  });

  it("refetch vuelve a llamar la API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ puntosTotales: 100 }),
    } as Response);
    global.fetch = fetchMock;

    const { result } = renderHook(() => useDashboard(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    result.current.refetch();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

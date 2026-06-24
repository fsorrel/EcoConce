import { useState, useEffect, useCallback } from "react";
import { API_BASE, getToken } from "../lib/api";
import type { Dashboard } from "../lib/api";

interface UseDashboardReturn {
  data: Dashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDashboard = (usuarioId: number): UseDashboardReturn => {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/dashboard/${usuarioId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json as Dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

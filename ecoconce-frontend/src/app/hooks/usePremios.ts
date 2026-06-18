import { useState, useEffect } from "react";
import { API_BASE, getToken } from "../lib/api";
import type { Premio } from "../lib/api";

export const usePremios = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPremios = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/premios`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setPremios(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar premios");
      } finally {
        setLoading(false);
      }
    };
    fetchPremios();
  }, []);

  return { premios, loading, error };
};

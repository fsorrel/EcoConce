import { useState, useEffect } from "react";
import { API_BASE } from "../lib/api";
import type { PuntoReciclaje } from "../lib/api";

export const usePuntos = () => {
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        // /api/puntos es público (mapa) — no requiere token
        const res = await fetch(`${API_BASE}/api/puntos`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setPuntos(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar puntos");
      } finally {
        setLoading(false);
      }
    };
    fetchPuntos();
  }, []);

  return { puntos, loading, error };
};

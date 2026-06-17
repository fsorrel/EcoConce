import React from 'react';
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../lib/api";
import type { PuntoReciclaje, ReportePuntoResponse, UsuarioSesion } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const estadoPuntoClass = (estado: string | null | undefined) => {
  const normalizado = (estado ?? "").toLowerCase();

  if (normalizado.includes("activo") || normalizado.includes("disponible")) {
    return "bg-green-100 text-green-700";
  }

  if (normalizado.includes("lleno") || normalizado.includes("colapsado")) {
    return "bg-red-100 text-red-700";
  }

  if (normalizado.includes("mantención") || normalizado.includes("mantenimiento")) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-gray-100 text-gray-700";
};

const porcentajeMaterial = (actual: number, capacidad: number) => {
  if (!capacidad || capacidad <= 0) return 0;
  return Math.min(100, Math.round((actual / capacidad) * 100));
};

export function PuntosMantenedor() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [reportes, setReportes] = useState<ReportePuntoResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      let currentUser = getCurrentUser();

      const updated = await refreshCurrentUserFromBackend().catch(() => null);
      if (updated) {
        currentUser = updated;
        setUsuario(updated);
      }

      if (!currentUser?.id) {
        throw new Error("No se encontró la sesión del mantenedor.");
      }

      const [puntosData, reportesData] = await Promise.all([
        api.puntosMantenedor(currentUser.id),
        api.reportesMantenedor(currentUser.id),
      ]);

      setPuntos(puntosData);
      setReportes(reportesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar tus puntos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const reportesPorPunto = useMemo(() => {
    const mapa = new Map<number, number>();

    reportes.forEach((reporte) => {
      if (!reporte.puntoId) return;
      mapa.set(reporte.puntoId, (mapa.get(reporte.puntoId) ?? 0) + 1);
    });

    return mapa;
  }, [reportes]);

  const puntosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return puntos
      .filter((punto) => {
        if (!term) return true;

        return `${punto.nombre} ${punto.direccion} ${punto.comuna} ${punto.estado}`
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => {
        const aLleno = a.materialesDetalle?.some((material) => material.lleno) ? 1 : 0;
        const bLleno = b.materialesDetalle?.some((material) => material.lleno) ? 1 : 0;

        if (aLleno !== bLleno) return bLleno - aLleno;

        const reportesA = reportesPorPunto.get(a.id) ?? 0;
        const reportesB = reportesPorPunto.get(b.id) ?? 0;

        return reportesB - reportesA;
      });
  }, [puntos, search, reportesPorPunto]);

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Mis puntos asignados</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Revisa los puntos bajo tu responsabilidad y entra al detalle para actualizar estado o materiales.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Mantenedor: {usuario?.nombreAlias ?? "Sesión no disponible"}
          </p>
        </div>

        <Button
          onClick={cargarDatos}
          variant="outline"
          className="border-[#3d5a47] text-[#3d5a47]"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Buscar punto</CardTitle>
          <CardDescription>
            Puedes buscar por nombre, dirección, comuna o estado.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar punto asignado..."
              className="pl-10 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-10 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando puntos asignados...
          </CardContent>
        </Card>
      ) : puntosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-500">
            No tienes puntos asignados o no coinciden con la búsqueda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid xl:grid-cols-2 gap-4">
          {puntosFiltrados.map((punto) => {
            const materiales = punto.materialesDetalle ?? [];
            const materialesLlenos = materiales.filter((material) => material.lleno);
            const cantidadReportes = reportesPorPunto.get(punto.id) ?? 0;

            return (
              <Card key={punto.id} className="border-[#6fae7f]/20 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#1f3b2d]">{punto.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {punto.direccion} · {punto.comuna}
                      </p>
                    </div>

                    <Badge className={estadoPuntoClass(punto.estado)}>
                      {punto.estado ?? "Sin estado"}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <p className="text-gray-500">Materiales</p>
                      <p className="font-bold text-[#1f3b2d]">{materiales.length}</p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <p className="text-gray-500">Llenos</p>
                      <p className="font-bold text-[#1f3b2d]">{materialesLlenos.length}</p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <p className="text-gray-500">Reportes</p>
                      <p className="font-bold text-[#1f3b2d]">{cantidadReportes}</p>
                    </div>
                  </div>

                  {materiales.length > 0 && (
                    <div className="space-y-3">
                      {materiales.slice(0, 3).map((material) => {
                        const porcentaje = porcentajeMaterial(
                          material.actualCompactado,
                          material.capacidadCompactado
                        );

                        return (
                          <div key={material.materialId}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium text-[#1f3b2d]">{material.nombre}</span>
                              <span className="text-gray-500">{porcentaje}%</span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  material.lleno ? "bg-red-500" : "bg-[#6fae7f]"
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link to={`/mantenedor/puntos/${punto.id}`} className="flex-1">
                      <Button className="w-full bg-[#3d5a47] hover:bg-[#2d4437]">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalle
                      </Button>
                    </Link>

                    <Link to="/mantenedor/reportes" className="flex-1">
                      <Button variant="outline" className="w-full border-[#3d5a47] text-[#3d5a47]">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Reportes
                      </Button>
                    </Link>
                  </div>

                  {materialesLlenos.length > 0 && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                      <Package className="w-4 h-4 mt-0.5" />
                      Este punto tiene materiales llenos y requiere revisión.
                    </div>
                  )}

                  {cantidadReportes > 0 && (
                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      Este punto tiene reportes ciudadanos asociados.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
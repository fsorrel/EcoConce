import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../lib/api";
import type { PuntoReciclaje, ReportePuntoResponse, UsuarioSesion } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function MaintainerDashboard() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [reportes, setReportes] = useState<ReportePuntoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDashboard = async () => {
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
      setError(err instanceof Error ? err.message : "No se pudo cargar el panel del mantenedor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const resumen = useMemo(() => {
    const puntosActivos = puntos.filter((punto) => {
      const estado = (punto.estado ?? "").toLowerCase();
      return estado.includes("activo") || estado.includes("disponible");
    }).length;

    const puntosConMaterialLleno = puntos.filter((punto) =>
      punto.materialesDetalle?.some((material) => material.lleno)
    ).length;

    const totalMateriales = puntos.reduce(
      (total, punto) => total + (punto.materialesDetalle?.length ?? 0),
      0
    );

    const materialesLlenos = puntos.reduce(
      (total, punto) =>
        total + (punto.materialesDetalle?.filter((material) => material.lleno).length ?? 0),
      0
    );

    return {
      puntosAsignados: puntos.length,
      puntosActivos,
      puntosConMaterialLleno,
      totalReportes: reportes.length,
      totalMateriales,
      materialesLlenos,
    };
  }, [puntos, reportes]);

  const stats = [
    {
      label: "Puntos asignados",
      value: resumen.puntosAsignados,
      description: "Puntos bajo tu responsabilidad",
      icon: MapPin,
    },
    {
      label: "Puntos activos",
      value: resumen.puntosActivos,
      description: "Funcionando o disponibles",
      icon: CheckCircle,
    },
    {
      label: "Reportes",
      value: resumen.totalReportes,
      description: "Reportes ciudadanos asociados",
      icon: AlertTriangle,
    },
    {
      label: "Materiales llenos",
      value: resumen.materialesLlenos,
      description: `${resumen.totalMateriales} materiales monitoreados`,
      icon: Package,
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Resumen del mantenedor</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Vista general de tus puntos asignados, reportes y materiales que requieren atención.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Mantenedor: {usuario?.nombreAlias ?? "Sesión no disponible"}
          </p>
        </div>

        <Button
          onClick={cargarDashboard}
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

      {loading ? (
        <Card>
          <CardContent className="p-10 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando resumen del mantenedor...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.label} className="border-[#6fae7f]/20 bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#3d5a47] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>

                    <p className="text-3xl font-bold text-[#1f3b2d]">
                      {stat.value.toLocaleString("es-CL")}
                    </p>

                    <p className="font-medium text-[#2d4437] mt-1">{stat.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accesos principales</CardTitle>
                <CardDescription>
                  Usa estas opciones para revisar tus puntos o reportes.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-3">
                <Link to="/mantenedor/puntos">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <MapPin className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Ver mis puntos</span>
                      <span className="block text-xs text-gray-500">Lista completa de puntos asignados</span>
                    </span>
                  </Button>
                </Link>

                <Link to="/mantenedor/reportes">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <AlertTriangle className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Ver reportes</span>
                      <span className="block text-xs text-gray-500">Reportes ciudadanos asociados</span>
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado general</CardTitle>
                <CardDescription>
                  Alertas rápidas sobre tus puntos asignados.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {resumen.puntosAsignados === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Sin puntos asignados</p>
                      <p className="text-sm text-amber-800">
                        Todavía no tienes puntos de reciclaje asociados.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Puntos cargados correctamente</p>
                      <p className="text-sm text-green-800">
                        Se encontraron {resumen.puntosAsignados} punto(s) asignados.
                      </p>
                    </div>
                  </div>
                )}

                {resumen.puntosConMaterialLleno > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4">
                    <Package className="w-5 h-5 text-red-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Materiales llenos</p>
                      <p className="text-sm text-red-800">
                        Hay {resumen.puntosConMaterialLleno} punto(s) con materiales llenos.
                      </p>
                    </div>
                  </div>
                )}

                {resumen.totalReportes > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Reportes ciudadanos</p>
                      <p className="text-sm text-amber-800">
                        Tienes {resumen.totalReportes} reporte(s) asociados a tus puntos.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
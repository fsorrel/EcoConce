import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Link } from "react-router";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Download,
  Gift,
  Loader2,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import type { Premio, PuntoReciclaje, ReportePuntoResponse, UsuarioAdmin } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

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

export function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [premios, setPremios] = useState<Premio[]>([]);
  const [reportes, setReportes] = useState<ReportePuntoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [usuariosData, puntosData, premiosData, reportesData] = await Promise.all([
        api.usuariosActivosAdmin(),
        api.puntos(),
        api.premiosAdmin(),
        api.reportesAdmin(),
      ]);

      setUsuarios(usuariosData);
      setPuntos(puntosData);
      setPremios(premiosData);
      setReportes(reportesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el panel de administración.");
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

    const puntosSinMantenedor = puntos.filter((punto) => !punto.mantenedorId).length;
    const premiosActivos = premios.filter((premio) => premio.activo?.toUpperCase() === "S").length;
    const premiosAgotados = premios.filter((premio) => premio.stock <= 0).length;
    const reportesSinMantenedor = reportes.filter((reporte) => !reporte.mantenedorId).length;

    return {
      usuariosActivos: usuarios.length,
      puntosTotales: puntos.length,
      puntosActivos,
      puntosSinMantenedor,
      premiosTotales: premios.length,
      premiosActivos,
      premiosAgotados,
      reportesTotales: reportes.length,
      reportesSinMantenedor,
    };
  }, [usuarios, puntos, premios, reportes]);

  const ultimosReportes = useMemo(() => {
    return [...reportes]
      .sort((a, b) => new Date(b.fechaReporte).getTime() - new Date(a.fechaReporte).getTime())
      .slice(0, 5);
  }, [reportes]);

  const puntosCriticos = useMemo(() => {
    return puntos
      .filter((punto) => {
        const estado = (punto.estado ?? "").toLowerCase();
        const tieneMaterialLleno = punto.materialesDetalle?.some((material) => material.lleno);
        return estado.includes("lleno") || estado.includes("colapsado") || tieneMaterialLleno;
      })
      .slice(0, 5);
  }, [puntos]);

  const exportarResumen = () => {
    const filasResumen = [
      {
        Indicador: "Usuarios activos",
        Valor: resumen.usuariosActivos,
      },
      {
        Indicador: "Puntos totales",
        Valor: resumen.puntosTotales,
      },
      {
        Indicador: "Puntos activos",
        Valor: resumen.puntosActivos,
      },
      {
        Indicador: "Puntos sin mantenedor",
        Valor: resumen.puntosSinMantenedor,
      },
      {
        Indicador: "Premios totales",
        Valor: resumen.premiosTotales,
      },
      {
        Indicador: "Premios activos",
        Valor: resumen.premiosActivos,
      },
      {
        Indicador: "Premios agotados",
        Valor: resumen.premiosAgotados,
      },
      {
        Indicador: "Reportes totales",
        Valor: resumen.reportesTotales,
      },
      {
        Indicador: "Reportes sin mantenedor",
        Valor: resumen.reportesSinMantenedor,
      },
    ];

    const filasGrafico = filasResumen.map((fila) => ({
      Indicador: fila.Indicador,
      Valor: fila.Valor,
      Visual: "█".repeat(Math.min(Number(fila.Valor), 30)),
    }));

    const hojaResumen = XLSX.utils.json_to_sheet(filasResumen);
    const hojaGrafico = XLSX.utils.json_to_sheet(filasGrafico);

    hojaResumen["!cols"] = [
      { wch: 32 },
      { wch: 14 },
    ];

    hojaGrafico["!cols"] = [
      { wch: 32 },
      { wch: 14 },
      { wch: 35 },
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");
    XLSX.utils.book_append_sheet(libro, hojaGrafico, "Grafico simple");

    XLSX.writeFile(libro, "resumen-admin-ecoconce.xlsx");
  };

  const stats = [
    {
      label: "Usuarios activos",
      value: resumen.usuariosActivos,
      description: "Cuentas activas registradas",
      icon: Users,
      path: "/admin/usuarios",
    },
    {
      label: "Puntos de reciclaje",
      value: resumen.puntosTotales,
      description: `${resumen.puntosActivos} activos · ${resumen.puntosSinMantenedor} sin mantenedor`,
      icon: MapPin,
      path: "/admin/puntos",
    },
    {
      label: "Premios",
      value: resumen.premiosTotales,
      description: `${resumen.premiosActivos} activos · ${resumen.premiosAgotados} agotados`,
      icon: Gift,
      path: "/admin/premios",
    },
    {
      label: "Reportes",
      value: resumen.reportesTotales,
      description: `${resumen.reportesSinMantenedor} asociados a puntos sin mantenedor`,
      icon: AlertTriangle,
      path: "/admin/reportes",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Panel de administración</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Vista general conectada a usuarios, puntos, premios y reportes del sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={cargarDashboard}
            variant="outline"
            className="border-[#3d5a47] text-[#3d5a47]"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            onClick={exportarResumen}
            className="bg-[#3d5a47] hover:bg-[#2d4437]"
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar resumen
          </Button>
        </div>
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
            Cargando datos del panel...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link key={stat.label} to={stat.path}>
                  <Card className="border-[#6fae7f]/20 hover:shadow-lg transition bg-white h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#3d5a47] flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>

                        <Badge className="bg-[#3d5a47] text-white">Ver</Badge>
                      </div>

                      <p className="text-3xl font-bold text-[#1f3b2d]">
                        {stat.value.toLocaleString("es-CL")}
                      </p>

                      <p className="font-medium text-[#2d4437] mt-1">{stat.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accesos rápidos</CardTitle>
                <CardDescription>
                  Atajos a las funciones principales del administrador.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-3">
                <Link to="/admin/usuarios">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <Users className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Gestionar usuarios</span>
                      <span className="block text-xs text-gray-500">Roles, datos y usuarios activos</span>
                    </span>
                  </Button>
                </Link>

                <Link to="/admin/puntos">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <MapPin className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Gestionar puntos</span>
                      <span className="block text-xs text-gray-500">Materiales, estados y mantenedores</span>
                    </span>
                  </Button>
                </Link>

                <Link to="/admin/premios">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <Gift className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Gestionar premios</span>
                      <span className="block text-xs text-gray-500">Stock, costos y disponibilidad</span>
                    </span>
                  </Button>
                </Link>

                <Link to="/admin/reportes">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-[#6fae7f]/30">
                    <AlertTriangle className="w-5 h-5 mr-3 text-[#3d5a47]" />
                    <span className="text-left">
                      <span className="block font-medium">Revisar reportes</span>
                      <span className="block text-xs text-gray-500">Problemas informados por ciudadanos</span>
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado general</CardTitle>
                <CardDescription>
                  Indicadores que conviene revisar antes de cerrar la jornada.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-[#f5f7f5] p-4">
                  <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1f3b2d]">Sistema operativo</p>
                    <p className="text-sm text-gray-600">
                      El panel cargó correctamente los módulos principales.
                    </p>
                  </div>
                </div>

                {resumen.puntosSinMantenedor > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Puntos sin mantenedor</p>
                      <p className="text-sm text-amber-800">
                        Hay {resumen.puntosSinMantenedor} punto(s) sin mantenedor asignado.
                      </p>
                    </div>
                  </div>
                )}

                {resumen.premiosAgotados > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4">
                    <Gift className="w-5 h-5 text-red-700 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Premios agotados</p>
                      <p className="text-sm text-red-800">
                        Hay {resumen.premiosAgotados} premio(s) sin stock.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Últimos reportes ciudadanos</CardTitle>
                <CardDescription>
                  Los reportes más recientes enviados desde la vista ciudadana.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {ultimosReportes.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No hay reportes registrados todavía.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ultimosReportes.map((reporte) => (
                      <Link
                        key={reporte.id}
                        to="/admin/reportes"
                        className="block rounded-xl border bg-white p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className="bg-[#3d5a47] text-white">
                                #{reporte.id}
                              </Badge>
                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                {reporte.tipoReporte ?? "Sin tipo"}
                              </Badge>
                            </div>

                            <p className="font-medium text-[#1f3b2d]">
                              {reporte.punto ?? "Punto no disponible"}
                            </p>

                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {reporte.descripcion || "Sin descripción."}
                            </p>
                          </div>

                          <p className="text-xs text-gray-500 shrink-0">
                            {formatDate(reporte.fechaReporte)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Puntos que requieren atención</CardTitle>
                <CardDescription>
                  Puntos colapsados, llenos o con materiales marcados como llenos.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {puntosCriticos.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No hay puntos críticos detectados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {puntosCriticos.map((punto) => (
                      <Link
                        key={punto.id}
                        to="/admin/puntos"
                        className="block rounded-xl border bg-white p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-[#1f3b2d]">{punto.nombre}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {punto.direccion} · {punto.comuna}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Mantenedor: {punto.mantenedor ?? "Sin mantenedor"}
                            </p>
                          </div>

                          <Badge className={estadoPuntoClass(punto.estado)}>
                            {punto.estado ?? "Sin estado"}
                          </Badge>
                        </div>
                      </Link>
                    ))}
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
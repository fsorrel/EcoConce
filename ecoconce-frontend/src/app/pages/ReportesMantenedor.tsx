import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../lib/api";
import type { ReportePuntoResponse, UsuarioSesion } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const formatDate = (value: string) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizarTexto = (value: string | null | undefined) => {
  return (value ?? "").trim().toLowerCase();
};

export function ReportesMantenedor() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());
  const [reportes, setReportes] = useState<ReportePuntoResponse[]>([]);
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarReportes = async () => {
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

      const data = await api.reportesMantenedor(currentUser.id);
      setReportes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const tiposDisponibles = useMemo(() => {
    const tipos = new Set<string>();

    reportes.forEach((reporte) => {
      if (reporte.tipoReporte) tipos.add(reporte.tipoReporte);
    });

    return Array.from(tipos).sort((a, b) => a.localeCompare(b));
  }, [reportes]);

  const reportesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reportes.filter((reporte) => {
      const coincideBusqueda =
        !term ||
        `${reporte.id} ${reporte.usuario ?? ""} ${reporte.punto ?? ""} ${
          reporte.tipoReporte ?? ""
        } ${reporte.descripcion ?? ""}`
          .toLowerCase()
          .includes(term);

      const coincideTipo =
        tipoFiltro === "todos" || normalizarTexto(reporte.tipoReporte) === normalizarTexto(tipoFiltro);

      return coincideBusqueda && coincideTipo;
    });
  }, [reportes, search, tipoFiltro]);

  const resumen = useMemo(() => {
    const puntosReportados = new Set(reportes.map((reporte) => reporte.puntoId).filter(Boolean)).size;
    const tipos = new Set(reportes.map((reporte) => reporte.tipoReporteId).filter(Boolean)).size;

    return {
      total: reportes.length,
      puntosReportados,
      tipos,
    };
  }, [reportes]);

  const exportarCsv = () => {
    const headers = ["ID", "Fecha", "Usuario", "Punto", "Tipo reporte", "Descripcion"];

    const rows = reportesFiltrados.map((reporte) => [
      reporte.id,
      formatDate(reporte.fechaReporte),
      reporte.usuario ?? "Sin usuario",
      reporte.punto ?? "Sin punto",
      reporte.tipoReporte ?? "Sin tipo",
      reporte.descripcion ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reportes-mantenedor-ecoconce.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Reportes de mis puntos</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Revisa los reportes ciudadanos asociados a los puntos de reciclaje que tienes asignados.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Mantenedor: {usuario?.nombreAlias ?? "Sesión no disponible"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={cargarReportes}
            variant="outline"
            className="border-[#3d5a47] text-[#3d5a47]"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            onClick={exportarCsv}
            className="bg-[#3d5a47] hover:bg-[#2d4437]"
            disabled={loading || reportesFiltrados.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total reportes</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Puntos reportados</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.puntosReportados}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tipos de problema</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.tipos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Puedes buscar por usuario, punto, tipo de reporte o descripción.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="busqueda"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar reporte..."
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de reporte</Label>
              <select
                id="tipo"
                value={tipoFiltro}
                onChange={(event) => setTipoFiltro(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todos">Todos los tipos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de reportes asignados</CardTitle>
          <CardDescription>
            Mostrando {reportesFiltrados.length} de {reportes.length} reportes cargados.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando reportes...
            </div>
          ) : reportesFiltrados.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No hay reportes asociados a tus puntos o no coinciden con los filtros.
            </div>
          ) : (
            <div className="space-y-4">
              {reportesFiltrados.map((reporte) => (
                <div
                  key={reporte.id}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-[#3d5a47] text-white">
                          Reporte #{reporte.id}
                        </Badge>

                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          {reporte.tipoReporte ?? "Sin tipo"}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#1f3b2d]">
                          {reporte.punto ?? "Punto no disponible"}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">
                          {reporte.descripcion || "Sin descripción ingresada."}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 lg:text-right">
                      <div className="flex lg:justify-end items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(reporte.fechaReporte)}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm">
                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <User className="w-4 h-4" />
                        Usuario que reportó
                      </div>
                      <p className="font-medium text-[#1f3b2d]">
                        {reporte.usuario ?? "Sin usuario"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        Punto reportado
                      </div>
                      <p className="font-medium text-[#1f3b2d]">
                        {reporte.punto ?? "Sin punto"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#8ec79f]/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <FileText className="w-5 h-5 text-[#3d5a47] mt-0.5" />
            <p>
              Esta vista muestra solo reportes vinculados a puntos asignados al mantenedor actual.
              No permite cerrar reportes porque la base de datos actual no tiene una columna de estado para reportes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  Wrench,
} from "lucide-react";
import { api } from "../lib/api";
import type { ReportePuntoResponse } from "../lib/api";
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

export function ReportesAdmin() {
  const [reportes, setReportes] = useState<ReportePuntoResponse[]>([]);
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [mantenedorFiltro, setMantenedorFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarReportes = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.reportesAdmin();
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

  const mantenedoresDisponibles = useMemo(() => {
    const mantenedores = new Set<string>();

    reportes.forEach((reporte) => {
      if (reporte.mantenedor) mantenedores.add(reporte.mantenedor);
    });

    return Array.from(mantenedores).sort((a, b) => a.localeCompare(b));
  }, [reportes]);

  const reportesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reportes.filter((reporte) => {
      const coincideBusqueda =
        !term ||
        `${reporte.id} ${reporte.usuario ?? ""} ${reporte.punto ?? ""} ${reporte.mantenedor ?? ""} ${
          reporte.tipoReporte ?? ""
        } ${reporte.descripcion ?? ""}`
          .toLowerCase()
          .includes(term);

      const coincideTipo =
        tipoFiltro === "todos" || normalizarTexto(reporte.tipoReporte) === normalizarTexto(tipoFiltro);

      const coincideMantenedor =
        mantenedorFiltro === "todos" ||
        normalizarTexto(reporte.mantenedor) === normalizarTexto(mantenedorFiltro);

      return coincideBusqueda && coincideTipo && coincideMantenedor;
    });
  }, [reportes, search, tipoFiltro, mantenedorFiltro]);

  const resumen = useMemo(() => {
    const puntosReportados = new Set(reportes.map((reporte) => reporte.puntoId).filter(Boolean)).size;
    const sinMantenedor = reportes.filter((reporte) => !reporte.mantenedorId).length;
    const tipos = new Set(reportes.map((reporte) => reporte.tipoReporteId).filter(Boolean)).size;

    return {
      total: reportes.length,
      puntosReportados,
      sinMantenedor,
      tipos,
    };
  }, [reportes]);

  const exportarExcel = () => {
    const filasReportes = reportesFiltrados.map((reporte) => ({
        ID: reporte.id,
        Fecha: formatDate(reporte.fechaReporte),
        Usuario: reporte.usuario ?? "Sin usuario",
        Punto: reporte.punto ?? "Sin punto",
        Mantenedor: reporte.mantenedor ?? "Sin mantenedor",
        "Tipo reporte": reporte.tipoReporte ?? "Sin tipo",
        Descripción: reporte.descripcion ?? "",
    }));

    const filasResumen = [
        { Indicador: "Total reportes filtrados", Valor: reportesFiltrados.length },
        { Indicador: "Total reportes registrados", Valor: resumen.total },
        { Indicador: "Puntos reportados", Valor: resumen.puntosReportados },
        { Indicador: "Tipos de problema", Valor: resumen.tipos },
        { Indicador: "Reportes sin mantenedor", Valor: resumen.sinMantenedor },
    ];

    const conteoPorTipo = reportesFiltrados.reduce<Record<string, number>>((acc, reporte) => {
        const tipo = reporte.tipoReporte ?? "Sin tipo";
        acc[tipo] = (acc[tipo] ?? 0) + 1;
        return acc;
    }, {});

    const filasTipos = Object.entries(conteoPorTipo)
        .map(([tipo, total]) => ({
        "Tipo de reporte": tipo,
        Total: total,
        "Gráfico visual": "█".repeat(Math.min(total, 30)),
        }))
        .sort((a, b) => b.Total - a.Total);

    const conteoPorMantenedor = reportesFiltrados.reduce<Record<string, number>>((acc, reporte) => {
        const mantenedor = reporte.mantenedor ?? "Sin mantenedor";
        acc[mantenedor] = (acc[mantenedor] ?? 0) + 1;
        return acc;
    }, {});

    const filasMantenedores = Object.entries(conteoPorMantenedor)
        .map(([mantenedor, total]) => ({
        Mantenedor: mantenedor,
        Total: total,
        "Gráfico visual": "█".repeat(Math.min(total, 30)),
        }))
        .sort((a, b) => b.Total - a.Total);

    const hojaResumen = XLSX.utils.json_to_sheet(filasResumen);
    const hojaReportes = XLSX.utils.json_to_sheet(filasReportes);
    const hojaTipos = XLSX.utils.json_to_sheet(filasTipos);
    const hojaMantenedores = XLSX.utils.json_to_sheet(filasMantenedores);

    hojaResumen["!cols"] = [
        { wch: 32 },
        { wch: 14 },
    ];

    hojaReportes["!cols"] = [
        { wch: 8 },
        { wch: 24 },
        { wch: 24 },
        { wch: 32 },
        { wch: 28 },
        { wch: 24 },
        { wch: 60 },
    ];

    hojaTipos["!cols"] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 35 },
    ];

    hojaMantenedores["!cols"] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 35 },
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");
    XLSX.utils.book_append_sheet(libro, hojaReportes, "Reportes");
    XLSX.utils.book_append_sheet(libro, hojaTipos, "Por tipo");
    XLSX.utils.book_append_sheet(libro, hojaMantenedores, "Por mantenedor");

    XLSX.writeFile(libro, "reportes-puntos-ecoconce.xlsx");
    };

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Reportes de puntos</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Revisa los reportes ciudadanos asociados a puntos de reciclaje, tipos de problema y mantenedores.
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
            onClick={exportarExcel}
            className="bg-[#3d5a47] hover:bg-[#2d4437]"
            disabled={loading || reportesFiltrados.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader>
            <CardDescription>Sin mantenedor</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.sinMantenedor}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Puedes buscar por usuario, punto, mantenedor, tipo de reporte o descripción.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="mantenedor">Mantenedor</Label>
              <select
                id="mantenedor"
                value={mantenedorFiltro}
                onChange={(event) => setMantenedorFiltro(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todos">Todos los mantenedores</option>
                {mantenedoresDisponibles.map((mantenedor) => (
                  <option key={mantenedor} value={mantenedor}>
                    {mantenedor}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de reportes</CardTitle>
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
              No hay reportes que coincidan con los filtros.
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

                  <div className="grid md:grid-cols-3 gap-3 mt-5 text-sm">
                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <User className="w-4 h-4" />
                        Usuario
                      </div>
                      <p className="font-medium text-[#1f3b2d]">
                        {reporte.usuario ?? "Sin usuario"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        Punto
                      </div>
                      <p className="font-medium text-[#1f3b2d]">
                        {reporte.punto ?? "Sin punto"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Wrench className="w-4 h-4" />
                        Mantenedor
                      </div>
                      <p className="font-medium text-[#1f3b2d]">
                        {reporte.mantenedor ?? "Sin mantenedor"}
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
              Esta vista permite revisar y exportar reportes según la información disponible en la base de datos actual.
              No se agregaron columnas nuevas ni estados adicionales para respetar la estructura existente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
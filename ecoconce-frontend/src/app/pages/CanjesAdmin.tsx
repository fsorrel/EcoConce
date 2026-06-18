import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Gift,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api";
import type { CanjeAdmin } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const estadoClass = (estado: string) => {
  const normalizado = estado?.toUpperCase();

  if (normalizado === "PENDIENTE") return "bg-amber-100 text-amber-700";
  if (normalizado === "CONFIRMADO") return "bg-blue-100 text-blue-700";
  if (normalizado === "ENTREGADO") return "bg-green-100 text-green-700";
  if (normalizado === "CANCELADO") return "bg-red-100 text-red-700";

  return "bg-gray-100 text-gray-700";
};

const estadoIcon = (estado: string) => {
  const normalizado = estado?.toUpperCase();

  if (normalizado === "PENDIENTE") return Clock;
  if (normalizado === "CONFIRMADO") return CheckCircle;
  if (normalizado === "ENTREGADO") return PackageCheck;
  if (normalizado === "CANCELADO") return XCircle;

  return AlertTriangle;
};

export function CanjesAdmin() {
  const [canjes, setCanjes] = useState<CanjeAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});

  const cargarCanjes = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.canjesAdmin();
      setCanjes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los canjes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCanjes();
  }, []);

  const canjesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return canjes.filter((canje) => {
      const coincideBusqueda =
        !term ||
        `${canje.id} ${canje.usuario} ${canje.correo} ${canje.premio} ${canje.codigoCanje} ${canje.estado} ${
          canje.direccionEnvio ?? ""
        }`
          .toLowerCase()
          .includes(term);

      const coincideEstado =
        estadoFiltro === "todos" || canje.estado?.toUpperCase() === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }, [canjes, search, estadoFiltro]);

  const resumen = useMemo(() => {
    const pendientes = canjes.filter((canje) => canje.estado?.toUpperCase() === "PENDIENTE").length;
    const confirmados = canjes.filter((canje) => canje.estado?.toUpperCase() === "CONFIRMADO").length;
    const entregados = canjes.filter((canje) => canje.estado?.toUpperCase() === "ENTREGADO").length;
    const conEnvio = canjes.filter((canje) => canje.envioDomicilio?.toUpperCase() === "S").length;

    return {
      total: canjes.length,
      pendientes,
      confirmados,
      entregados,
      conEnvio,
    };
  }, [canjes]);

  const actualizarObservacion = (canjeId: number, value: string) => {
    setObservaciones((actual) => ({
      ...actual,
      [canjeId]: value,
    }));
  };

  const cambiarEstado = async (canje: CanjeAdmin, estado: string) => {
    setSavingId(canje.id);
    setError("");
    setSuccess("");

    try {
      const observacion =
        observaciones[canje.id]?.trim() ||
        (estado === "CONFIRMADO"
          ? "Canje confirmado por administrador."
          : estado === "ENTREGADO"
            ? "Canje marcado como entregado por administrador."
            : estado === "CANCELADO"
              ? "Canje cancelado por administrador."
              : "Estado actualizado por administrador.");

      await api.actualizarEstadoCanjeAdmin(canje.id, {
        estado,
        observacion,
      });

      setSuccess(`Canje #${canje.id} actualizado a ${estado}.`);
      await cargarCanjes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el canje.");
    } finally {
      setSavingId(null);
    }
  };

  const exportarExcel = () => {
    const filas = canjesFiltrados.map((canje) => ({
        ID: canje.id,
        Usuario: canje.usuario,
        Correo: canje.correo,
        Premio: canje.premio,
        "Puntos gastados": canje.puntosGastados,
        "Código de canje": canje.codigoCanje,
        Estado: canje.estado,
        "Envío a domicilio": canje.envioDomicilio === "S" ? "Sí" : "No",
        "Dirección de envío": canje.direccionEnvio ?? "",
        "Fecha de canje": formatDate(canje.fechaCanje),
        "Fecha de entrega": canje.fechaEntrega ? formatDate(canje.fechaEntrega) : "",
        Observación: canje.observacion ?? "",
    }));

    const resumen = [
        { Indicador: "Total canjes", Valor: canjesFiltrados.length },
        {
        Indicador: "Pendientes",
        Valor: canjesFiltrados.filter((canje) => canje.estado?.toUpperCase() === "PENDIENTE").length,
        },
        {
        Indicador: "Confirmados",
        Valor: canjesFiltrados.filter((canje) => canje.estado?.toUpperCase() === "CONFIRMADO").length,
        },
        {
        Indicador: "Entregados",
        Valor: canjesFiltrados.filter((canje) => canje.estado?.toUpperCase() === "ENTREGADO").length,
        },
        {
        Indicador: "Cancelados",
        Valor: canjesFiltrados.filter((canje) => canje.estado?.toUpperCase() === "CANCELADO").length,
        },
        {
        Indicador: "Con envío a domicilio",
        Valor: canjesFiltrados.filter((canje) => canje.envioDomicilio?.toUpperCase() === "S").length,
        },
    ];

    const hojaCanjes = XLSX.utils.json_to_sheet(filas);
    const hojaResumen = XLSX.utils.json_to_sheet(resumen);

    hojaCanjes["!cols"] = [
        { wch: 8 },
        { wch: 24 },
        { wch: 30 },
        { wch: 32 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 40 },
        { wch: 24 },
        { wch: 24 },
        { wch: 45 },
    ];

    hojaResumen["!cols"] = [
        { wch: 28 },
        { wch: 14 },
    ];

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");
    XLSX.utils.book_append_sheet(libro, hojaCanjes, "Canjes");

    XLSX.writeFile(libro, "canjes-ecoconce.xlsx");
    };

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Canjes de premios</h1>
          </div>

          <p className="text-gray-600 mt-2">
            Revisa los canjes realizados por ciudadanos y confirma su entrega.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={cargarCanjes}
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
            disabled={loading || canjesFiltrados.length === 0}
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

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total canjes</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.pendientes}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Confirmados</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.confirmados}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Entregados</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.entregados}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Con envío</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.conEnvio}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca por usuario, correo, premio, código o dirección de envío.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-[1fr_260px] gap-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="busqueda"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar canje..."
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={estadoFiltro}
                onChange={(event) => setEstadoFiltro(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todos">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-10 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando canjes...
          </CardContent>
        </Card>
      ) : canjesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-500">
            No hay canjes que coincidan con los filtros.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {canjesFiltrados.map((canje) => {
            const IconEstado = estadoIcon(canje.estado);
            const estado = canje.estado?.toUpperCase();
            const conEnvio = canje.envioDomicilio?.toUpperCase() === "S";
            const saving = savingId === canje.id;

            return (
              <Card key={canje.id} className="border-[#6fae7f]/20 bg-white">
                <CardContent className="p-5 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-[#3d5a47] text-white">
                          Canje #{canje.id}
                        </Badge>

                        <Badge className={estadoClass(canje.estado)}>
                          <IconEstado className="w-3.5 h-3.5 mr-1" />
                          {canje.estado}
                        </Badge>

                        {conEnvio && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Truck className="w-3.5 h-3.5 mr-1" />
                            Envío a domicilio
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[#1f3b2d]">
                        {canje.premio}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        Código: <span className="font-semibold">{canje.codigoCanje}</span>
                      </p>
                    </div>

                    <div className="text-sm text-gray-600 lg:text-right">
                      <p>Canjeado: {formatDate(canje.fechaCanje)}</p>
                      {canje.fechaEntrega && <p>Entrega: {formatDate(canje.fechaEntrega)}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <p className="text-gray-500">Usuario</p>
                      <p className="font-medium text-[#1f3b2d]">{canje.usuario}</p>
                      <p className="text-xs text-gray-500">{canje.correo}</p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3">
                      <p className="text-gray-500">Puntos gastados</p>
                      <p className="font-medium text-[#1f3b2d]">
                        {canje.puntosGastados.toLocaleString("es-CL")} pts
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#f5f7f5] p-3 md:col-span-2">
                      <p className="text-gray-500">Dirección de envío</p>
                      <p className="font-medium text-[#1f3b2d]">
                        {conEnvio ? canje.direccionEnvio ?? "Sin dirección registrada" : "No requiere envío"}
                      </p>
                    </div>
                  </div>

                  {canje.observacion && (
                    <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Observación actual</p>
                      {canje.observacion}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`obs-${canje.id}`}>Observación para actualizar estado</Label>
                    <Textarea
                      id={`obs-${canje.id}`}
                      value={observaciones[canje.id] ?? ""}
                      onChange={(event) => actualizarObservacion(canje.id, event.target.value)}
                      placeholder="Ej: Canje confirmado, se coordinará entrega durante la semana."
                      rows={2}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700"
                      disabled={saving || estado === "CONFIRMADO"}
                      onClick={() => cambiarEstado(canje, "CONFIRMADO")}
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Confirmar
                    </Button>

                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700"
                      disabled={saving || estado === "ENTREGADO"}
                      onClick={() => cambiarEstado(canje, "ENTREGADO")}
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PackageCheck className="w-4 h-4 mr-2" />}
                      Entregado
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700"
                      disabled={saving || estado === "CANCELADO"}
                      onClick={() => cambiarEstado(canje, "CANCELADO")}
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
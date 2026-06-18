import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
} from "lucide-react";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../lib/api";
import type {
  PuntoReciclaje,
  ReportePuntoResponse,
  TipoReporte,
  UsuarioSesion,
} from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

type FormState = {
  puntoId: string;
  tipoReporteId: string;
  descripcion: string;
};

const initialForm: FormState = {
  puntoId: "",
  tipoReporteId: "",
  descripcion: "",
};

const formatDate = (value: string) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function ReportarPuntoCiudadano() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [tiposReporte, setTiposReporte] = useState<TipoReporte[]>([]);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ReportePuntoResponse | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      const [puntosData, tiposData] = await Promise.all([
        api.puntos(),
        api.tiposReporte(),
      ]);

      setPuntos(puntosData);
      setTiposReporte(tiposData);

      const updated = await refreshCurrentUserFromBackend().catch(() => null);
      if (updated) setUsuario(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos para reportar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const puntoSeleccionado = useMemo(() => {
    const id = Number(formData.puntoId);
    return puntos.find((punto) => punto.id === id) ?? null;
  }, [formData.puntoId, puntos]);

  const tipoSeleccionado = useMemo(() => {
    const id = Number(formData.tipoReporteId);
    return tiposReporte.find((tipo) => tipo.id === id) ?? null;
  }, [formData.tipoReporteId, tiposReporte]);

  const actualizarCampo = (campo: keyof FormState, valor: string) => {
    setFormData((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const validarFormulario = () => {
    if (!usuario?.id) {
      throw new Error("No se encontró la sesión del usuario. Vuelve a iniciar sesión.");
    }

    if (!formData.puntoId) {
      throw new Error("Debes seleccionar un punto de reciclaje.");
    }

    if (!formData.tipoReporteId) {
      throw new Error("Debes seleccionar el tipo de problema.");
    }

    if (!formData.descripcion.trim()) {
      throw new Error("Debes escribir una descripción del problema.");
    }

    if (formData.descripcion.trim().length < 10) {
      throw new Error("La descripción debe tener al menos 10 caracteres.");
    }
  };

  const enviarReporte = async () => {
    setSending(true);
    setError("");
    setSuccess(null);

    try {
      validarFormulario();

      const response = await api.crearReportePunto({
        usuarioId: usuario?.id ?? 0,
        puntoId: Number(formData.puntoId),
        tipoReporteId: Number(formData.tipoReporteId),
        descripcion: formData.descripcion.trim(),
      });

      setSuccess(response);
      setFormData(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el reporte.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileWarning className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">
              Reportar punto de reciclaje
            </h1>
          </div>

          <p className="text-gray-600 mt-2">
            Informa problemas como contenedores llenos, daños o situaciones que necesiten revisión.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Usuario: {usuario?.nombreAlias ?? "Sesión no disponible"}
          </p>
        </div>

        <Button
          onClick={cargarDatos}
          variant="outline"
          className="border-[#3d5a47] text-[#3d5a47]"
          disabled={loading || sending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar datos
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-700 mt-1" />

                <div>
                  <p className="text-sm font-medium text-green-700">
                    Reporte enviado correctamente
                  </p>

                  <h2 className="text-2xl font-bold text-green-900">
                    Reporte #{success.id}
                  </h2>

                  <p className="text-sm text-green-800 mt-1">
                    Punto: {success.punto ?? "No disponible"}
                  </p>

                  <p className="text-sm text-green-800">
                    Tipo: {success.tipoReporte ?? "No disponible"}
                  </p>
                </div>
              </div>

              <Badge className="bg-green-700 text-white">
                {formatDate(success.fechaReporte)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del reporte</CardTitle>
            <CardDescription>
              Selecciona el punto afectado y describe claramente el problema.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando puntos y tipos de reporte...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="punto">Punto de reciclaje</Label>
                  <select
                    id="punto"
                    value={formData.puntoId}
                    onChange={(event) => actualizarCampo("puntoId", event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un punto</option>
                    {puntos.map((punto) => (
                      <option key={punto.id} value={punto.id}>
                        {punto.nombre} - {punto.comuna || "Comuna no disponible"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de problema</Label>
                  <select
                    id="tipo"
                    value={formData.tipoReporteId}
                    onChange={(event) => actualizarCampo("tipoReporteId", event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposReporte.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(event) => actualizarCampo("descripcion", event.target.value)}
                    placeholder="Ej: El contenedor de plástico está lleno desde ayer y hay bolsas acumuladas alrededor."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    Mínimo 10 caracteres. Sé claro para que admin o mantenedor pueda revisar el problema.
                  </p>
                </div>

                <Button
                  onClick={enviarReporte}
                  className="w-full bg-[#3d5a47] hover:bg-[#2d4437]"
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar reporte
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen seleccionado</CardTitle>
              <CardDescription>
                Confirma que el punto y el problema sean correctos antes de enviar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[#f5f7f5] p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Punto
                </div>

                <p className="font-medium text-[#1f3b2d]">
                  {puntoSeleccionado?.nombre ?? "No seleccionado"}
                </p>

                {puntoSeleccionado && (
                  <p className="text-sm text-gray-600 mt-1">
                    {puntoSeleccionado.direccion} - {puntoSeleccionado.comuna}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-[#f5f7f5] p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Tipo de problema
                </div>

                <p className="font-medium text-[#1f3b2d]">
                  {tipoSeleccionado?.nombre ?? "No seleccionado"}
                </p>
              </div>

              <div className="rounded-lg bg-[#f5f7f5] p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <CalendarDays className="w-4 h-4" />
                  Fecha
                </div>

                <p className="font-medium text-[#1f3b2d]">
                  {new Intl.DateTimeFormat("es-CL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date())}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#8ec79f]/40">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <AlertTriangle className="w-5 h-5 text-[#3d5a47] mt-0.5" />
                <p>
                  Tu reporte será visible para el administrador. Si el punto tiene mantenedor asignado,
                  también aparecerá en la vista de reportes del mantenedor correspondiente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
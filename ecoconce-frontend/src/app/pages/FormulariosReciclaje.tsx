import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { api, BdRow, getCurrentUserId, Material, PuntoReciclaje } from "../lib/api";
import { getUnidadesPermitidasPorMaterial, ordenarMaterialesFormulario, unidadLabel } from "../lib/materialUnits";
import { ClipboardList, RefreshCw, Plus, Database, Navigation, Loader2, MapPin } from "lucide-react";

type DetalleFormulario = BdRow & {
  formulario_id?: number;
  material_id?: number;
  cantidad_declarada?: number;
  unidad_declarada?: string;
  puntos_obtenidos?: number;
  observacion?: string | null;
};

const estadoClass = (estado: unknown) => {
  switch (String(estado ?? "").toUpperCase()) {
    case "APROBADO":
      return "bg-green-100 text-green-700 border-green-200";
    case "RECHAZADO":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("es-CL");
  }
  return String(value);
};

const toRad = (value: number) => (value * Math.PI) / 180;
const RADIO_MAXIMO_FORMULARIO_METROS = 50;

const calcularDistanciaMetros = (
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number
) => {
  const earthRadiusM = 6371000;
  const deltaLat = toRad(destinoLat - origenLat);
  const deltaLng = toRad(destinoLng - origenLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(origenLat)) *
      Math.cos(toRad(destinoLat)) *
      Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusM * c);
};

const tieneCoordenadasValidas = (punto: PuntoReciclaje) => {
  return Number.isFinite(Number(punto.latitud)) && Number.isFinite(Number(punto.longitud));
};


export function FormulariosReciclaje() {
  const [formularios, setFormularios] = useState<BdRow[]>([]);
  const [detalles, setDetalles] = useState<DetalleFormulario[]>([]);
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materialesFormulario, setMaterialesFormulario] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFormularioId, setSelectedFormularioId] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");

  const [formData, setFormData] = useState({
    puntoId: 1,
    materialId: 1,
    cantidadDeclarada: "1",
    unidadDeclarada: "UNIDAD",
    distanciaMetros: 0,
    observacion: "",
    observacionMaterial: "",
  });

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const [formulariosData, detallesData, puntosData, materialesData] = await Promise.all([
        api.formularios(),
        api.detalleFormularios(),
        api.puntos(),
        api.materiales(),
      ]);
      setFormularios(formulariosData);
      setDetalles(detallesData as DetalleFormulario[]);
      setPuntos(puntosData);
      setMateriales(materialesData);
      const materialesPermitidos = ordenarMaterialesFormulario(materialesData);
      setMaterialesFormulario(materialesPermitidos);
      if (puntosData[0]) setFormData((prev) => ({ ...prev, puntoId: puntosData[0].id }));
      if (materialesPermitidos[0]) {
        const unidades = getUnidadesPermitidasPorMaterial(materialesPermitidos[0].nombre);
        setFormData((prev) => ({
          ...prev,
          materialId: materialesPermitidos[0].id,
          unidadDeclarada: unidades[0] ?? "UNIDAD",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los formularios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalPendientes = useMemo(
    () => formularios.filter((f) => String(f.estado).toUpperCase() === "PENDIENTE").length,
    [formularios]
  );

  const totalAprobados = useMemo(
    () => formularios.filter((f) => String(f.estado).toUpperCase() === "APROBADO").length,
    [formularios]
  );

  const detallesSeleccionados = detalles.filter(
    (detalle) => Number(detalle.formulario_id) === selectedFormularioId
  );

  const materialNombre = (id: unknown) =>
    materiales.find((material) => material.id === Number(id))?.nombre ?? `Material ${id}`;

  const puntoNombre = (id: unknown) =>
    puntos.find((punto) => punto.id === Number(id))?.nombre ?? `Punto ${id}`;

  const puntoSeleccionado = puntos.find((punto) => punto.id === Number(formData.puntoId));
  const materialSeleccionado = materialesFormulario.find((material) => material.id === Number(formData.materialId));
  const unidadesPermitidas = materialSeleccionado ? getUnidadesPermitidasPorMaterial(materialSeleccionado.nombre) : [];

  const distanciaActual = Number(formData.distanciaMetros);
  const distanciaCalculada = Number.isFinite(distanciaActual) && distanciaActual > 0;
  const estaDentroDelRadio = distanciaCalculada && distanciaActual <= RADIO_MAXIMO_FORMULARIO_METROS;

  const cantidadDeclaradaNumero = Number(formData.cantidadDeclarada);
  const cantidadDeclaradaValida =
    /^\d+$/.test(String(formData.cantidadDeclarada)) && cantidadDeclaradaNumero >= 1;

  const cambiarMaterial = (materialId: number) => {
    const material = materialesFormulario.find((item) => item.id === materialId);
    const unidades = material ? getUnidadesPermitidasPorMaterial(material.nombre) : [];
    setFormData((prev) => ({
      ...prev,
      materialId,
      unidadDeclarada: unidades[0] ?? "UNIDAD",
    }));
  };

  const calcularDistanciaConGps = () => {
    setError("");
    setSuccess("");
    setGpsMessage("");

    if (!navigator.geolocation) {
      setError("Tu navegador no permite usar GPS o ubicación.");
      return;
    }

    if (!puntoSeleccionado || !tieneCoordenadasValidas(puntoSeleccionado)) {
      setError("El punto seleccionado no tiene coordenadas válidas para calcular distancia.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distancia = calcularDistanciaMetros(
          position.coords.latitude,
          position.coords.longitude,
          Number(puntoSeleccionado.latitud),
          Number(puntoSeleccionado.longitud)
        );
        setFormData((prev) => ({ ...prev, distanciaMetros: distancia }));
        setGpsMessage(`Distancia calculada con GPS: ${distancia} m. Precisión aprox.: ${Math.round(position.coords.accuracy)} m.`);
        setGpsLoading(false);
      },
      (geoError) => {
        const mensajes: Record<number, string> = {
          1: "Permiso de ubicación denegado. Activa el permiso del navegador para usar el GPS.",
          2: "No se pudo obtener tu ubicación actual. Revisa que el GPS esté activo.",
          3: "La ubicación tardó demasiado en responder. Intenta nuevamente.",
        };
        setError(mensajes[geoError.code] ?? "No se pudo calcular la distancia con GPS.");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  const crearFormulario = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (!materialSeleccionado) {
        throw new Error("Debes seleccionar un material permitido para formularios.");
      }
      if (!unidadesPermitidas.includes(formData.unidadDeclarada)) {
        throw new Error(`La unidad ${formData.unidadDeclarada} no está permitida para ${materialSeleccionado.nombre}.`);
      }

      const usuarioId = getCurrentUserId();

      if (!usuarioId) {
        throw new Error("No se encontró usuario activo. Inicia sesión nuevamente.");
      }
      if (!distanciaCalculada) {
        throw new Error("Debes calcular la distancia con GPS antes de enviar el formulario.");
      }

      if (!estaDentroDelRadio) {
        throw new Error("Debes estar a 50 metros o menos del punto de reciclaje para ingresar el informe.");
      }
      
      if (!cantidadDeclaradaValida) {
        throw new Error("La cantidad declarada debe ser un número entero mayor o igual a 1.");
      }

      await api.crearFormulario(usuarioId, {
        puntoId: Number(formData.puntoId),
        distanciaMetros: Number(formData.distanciaMetros),
        observacion: formData.observacion,
        materiales: [
          {
            materialId: Number(formData.materialId),
            cantidadDeclarada: cantidadDeclaradaNumero,
            unidadDeclarada: formData.unidadDeclarada,
            observacion: formData.observacionMaterial,
          },
        ],
      });
      setSuccess("Formulario registrado correctamente. Queda pendiente de revisión.");
      setFormData((prev) => ({ ...prev, cantidadDeclarada: "1", observacion: "", observacionMaterial: "" }));
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el formulario");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (id: number, accion: "aprobar" | "rechazar") => {
    setError("");
    setSuccess("");
    try {
      if (accion === "aprobar") {
        await api.aprobarFormulario(id);
        setSuccess(`Formulario #${id} aprobado y puntos asignados.`);
      } else {
        await api.rechazarFormulario(id, "Rechazado desde el panel de formularios");
        setSuccess(`Formulario #${id} rechazado.`);
      }
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el formulario");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2d4437] mb-2 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#3d5a47]" />
            Formularios de Reciclaje
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Esta pestaña trabaja directamente con la tabla
            <strong> formularios_reciclaje</strong> y su detalle de materiales. La base de datos se respeta tal como está.
          </p>
        </div>
        <Button onClick={cargarDatos} variant="outline" className="border-[#3d5a47] text-[#3d5a47]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar datos
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      {gpsMessage && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2"><MapPin className="w-4 h-4" />{gpsMessage}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total formularios</p>
            <p className="text-3xl font-bold text-[#2d4437]">{formularios.length}</p>
          </CardContent>
        </Card>
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-700">{totalPendientes}</p>
          </CardContent>
        </Card>
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Aprobados</p>
            <p className="text-3xl font-bold text-green-700">{totalAprobados}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid xl:grid-cols-[420px_1fr] gap-8">
        <Card className="border-[#6fae7f]/20">
          <CardHeader>
            <CardTitle className="text-[#2d4437] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#3d5a47]" />
              Informar reciclaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={crearFormulario} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Distancia al punto</Label>

                  <div className="flex gap-2">
                    <div
                      className={`flex h-10 w-full items-center rounded-md border px-3 text-sm ${
                        !distanciaCalculada
                          ? "border-gray-300 bg-gray-50 text-gray-500"
                          : estaDentroDelRadio
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {distanciaCalculada ? `${distanciaActual} metros` : "Pendiente de calcular con GPS"}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={calcularDistanciaConGps}
                      disabled={gpsLoading}
                      className="border-[#3d5a47] text-[#3d5a47]"
                      title="Calcular distancia usando el GPS del dispositivo"
                    >
                      {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    </Button>
                  </div>

                  {!distanciaCalculada ? (
                    <p className="text-xs text-gray-500">
                      Debes calcular tu ubicación con GPS antes de enviar el formulario.
                    </p>
                  ) : estaDentroDelRadio ? (
                    <p className="text-xs text-green-700">
                      Estás dentro del rango permitido. Puedes informar reciclaje.
                    </p>
                  ) : (
                    <p className="text-xs text-red-700">
                      Estás a {distanciaActual} metros. Debes estar a 50 metros o menos para ingresar el informe.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Punto de reciclaje</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.puntoId}
                  onChange={(e) => {
                    setGpsMessage("");
                    setFormData({
                      ...formData,
                      puntoId: Number(e.target.value),
                      distanciaMetros: 0,
                    });
                  }}
                >
                  {puntos.map((punto) => (
                    <option key={punto.id} value={punto.id}>{punto.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.materialId}
                    onChange={(e) => cambiarMaterial(Number(e.target.value))}
                  >
                    {materialesFormulario.map((material) => (
                      <option key={material.id} value={material.id}>{material.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad declarada</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.cantidadDeclarada}
                    onKeyDown={(e) => {
                      if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const textoPegado = e.clipboardData.getData("text");
                      if (!/^\d+$/.test(textoPegado)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setFormData({
                        ...formData,
                        cantidadDeclarada: value,
                      });
                    }}
                    required
                  />
              </div>
            </div>
              <div className="space-y-2">
                <Label>Unidad declarada</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.unidadDeclarada}
                  onChange={(e) => setFormData({ ...formData, unidadDeclarada: e.target.value })}
                >
                  {unidadesPermitidas.map((unidad) => (
                    <option key={unidad} value={unidad}>{unidadLabel(unidad)}</option>
                  ))}
                </select>
                {materialSeleccionado && (
                  <p className="text-xs text-gray-500">
                    Unidades permitidas para {materialSeleccionado.nombre}: {unidadesPermitidas.map(unidadLabel).join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Observación general</Label>
                <Textarea
                  placeholder="Ej: Dejé el material en el contenedor principal"
                  value={formData.observacion}
                  onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Observación del material</Label>
                <Textarea
                  placeholder="Ej: Botellas lavadas y compactadas"
                  value={formData.observacionMaterial}
                  onChange={(e) => setFormData({ ...formData, observacionMaterial: e.target.value })}
                />
              </div>

              <Button
                disabled={saving || materialesFormulario.length === 0 || !estaDentroDelRadio || !cantidadDeclaradaValida}
                type="submit"
                className="w-full bg-[#3d5a47] hover:bg-[#2d4437]"
              >
                {saving
                  ? "Guardando..."
                  : !cantidadDeclaradaValida
                    ? "Ingresa una cantidad válida"
                    : !distanciaCalculada
                      ? "Calcula distancia con GPS"
                      : !estaDentroDelRadio
                        ? "Fuera del rango permitido"
                        : "Registrar formulario"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#2d4437] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3d5a47]" />
              Tabla formularios_reciclaje
            </CardTitle>
            <Badge variant="outline" className="border-[#6fae7f] text-[#3d5a47]">
              {formularios.length} registros
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Cargando formularios...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Punto</TableHead>
                    <TableHead>Distancia</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formularios.map((formulario) => {
                    const id = Number(formulario.id);
                    return (
                      <TableRow key={id} className={selectedFormularioId === id ? "bg-[#6fae7f]/10" : ""}>
                        <TableCell>#{id}</TableCell>
                        <TableCell>{formatValue(formulario.usuario_id)}</TableCell>
                        <TableCell>{puntoNombre(formulario.punto_id)}</TableCell>
                        <TableCell>{formatValue(formulario.distancia_metros)} m</TableCell>
                        <TableCell>{formatValue(formulario.total_puntos_obtenidos)}</TableCell>
                        <TableCell>
                          <Badge className={estadoClass(formulario.estado)}>{formatValue(formulario.estado)}</Badge>
                        </TableCell>
                        <TableCell>{formatValue(formulario.fecha_formulario)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedFormularioId(id)}>
                              Ver detalle
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#6fae7f]/20">
        <CardHeader>
          <CardTitle className="text-[#2d4437]">Detalle de materiales del formulario</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedFormularioId ? (
            <p className="text-gray-600">Selecciona un formulario de la tabla para ver su detalle.</p>
          ) : detallesSeleccionados.length === 0 ? (
            <p className="text-gray-600">El formulario #{selectedFormularioId} no tiene detalle registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID detalle</TableHead>
                  <TableHead>Formulario</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detallesSeleccionados.map((detalle) => (
                  <TableRow key={Number(detalle.id)}>
                    <TableCell>#{formatValue(detalle.id)}</TableCell>
                    <TableCell>#{formatValue(detalle.formulario_id)}</TableCell>
                    <TableCell>{materialNombre(detalle.material_id)}</TableCell>
                    <TableCell>{formatValue(detalle.cantidad_declarada)}</TableCell>
                    <TableCell>{formatValue(detalle.unidad_declarada)}</TableCell>
                    <TableCell>{formatValue(detalle.puntos_obtenidos)}</TableCell>
                    <TableCell>{formatValue(detalle.observacion)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

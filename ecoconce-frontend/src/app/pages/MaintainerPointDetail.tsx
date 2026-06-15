import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Package,
  RefreshCw,
  Save,
  Wrench,
} from "lucide-react";
import {
  api,
  BdRow,
  getCurrentUser,
  PuntoMaterialUpdateRequest,
  PuntoReciclaje,
} from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";

const getRowId = (row: BdRow) => Number(row.id ?? row.ID ?? 0);

const getRowName = (row: BdRow) =>
  String(row.nombre ?? row.NOMBRE ?? row.name ?? row.NAME ?? "");

const estadoColor = (estado: string) => {
  const normalizado = estado?.toUpperCase();

  if (normalizado.includes("INACTIVO")) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  if (normalizado.includes("OPERATIVO") || normalizado.includes("ACTIVO")) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (normalizado.includes("LLENO") || normalizado.includes("COLAPSADO")) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalizado.includes("MANTENIMIENTO")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
};

const materialColor = (lleno: boolean) => {
  return lleno
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-green-100 text-green-700 border-green-200";
};

export function MaintainerPointDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = getCurrentUser();
  const mantenedorId = usuario?.id ?? 0;
  const puntoId = Number(id);

  const [punto, setPunto] = useState<PuntoReciclaje | null>(null);
  const [estados, setEstados] = useState<BdRow[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<number>(0);
  const [descripcion, setDescripcion] = useState("");
  const [materialesEditados, setMaterialesEditados] = useState<PuntoMaterialUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingMateriales, setSavingMateriales] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const materialesLlenos = useMemo(() => {
    return (punto?.materialesDetalle ?? []).filter((material) => material.lleno).length;
  }, [punto]);

  const materialesDisponibles = useMemo(() => {
    return (punto?.materialesDetalle ?? []).filter((material) => material.disponible).length;
  }, [punto]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!mantenedorId) {
        throw new Error("No se encontró el mantenedor activo. Inicia sesión nuevamente.");
      }

      if (!Number.isFinite(puntoId) || puntoId <= 0) {
        throw new Error("Punto inválido.");
      }

      const [puntosData, estadosData] = await Promise.all([
        api.puntosMantenedor(mantenedorId),
        api.estadosPunto(),
      ]);

      const puntoEncontrado = puntosData.find((item) => item.id === puntoId);

      if (!puntoEncontrado) {
        throw new Error("Este punto no existe o no está asignado a tu cuenta de mantenedor.");
      }

      setPunto(puntoEncontrado);
      setEstados(estadosData);
      setEstadoSeleccionado(puntoEncontrado.estadoId ?? 1);
      setDescripcion("");

      setMaterialesEditados(
        (puntoEncontrado.materialesDetalle ?? []).map((material) => ({
          materialId: material.materialId,
          capacidadCompactado: material.capacidadCompactado ?? 0,
          actualCompactado: material.actualCompactado ?? 0,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el detalle del punto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerMaterialEditado = (materialId: number) => {
    return materialesEditados.find((material) => material.materialId === materialId);
  };

  const cambiarCantidadMaterial = (
    materialId: number,
    campo: "capacidadCompactado" | "actualCompactado",
    valor: string
  ) => {
    const numero = Number(valor);

    setMaterialesEditados((actual) =>
      actual.map((material) =>
        material.materialId === materialId
          ? {
              ...material,
              [campo]: Number.isFinite(numero) ? Math.max(0, numero) : 0,
            }
          : material
      )
    );
  };

  const validarMateriales = () => {
    if (materialesEditados.length === 0) {
      throw new Error("Este punto no tiene materiales para actualizar.");
    }

    for (const material of materialesEditados) {
      if (material.capacidadCompactado < 0 || material.actualCompactado < 0) {
        throw new Error("Las cantidades no pueden ser negativas.");
      }

      if (
        material.capacidadCompactado > 0 &&
        material.actualCompactado > material.capacidadCompactado
      ) {
        throw new Error("La cantidad actual no puede superar la capacidad del material.");
      }
    }
  };

  const actualizarEstado = async () => {
    if (!punto) return;

    if (!estadoSeleccionado) {
      setError("Debes seleccionar un estado válido.");
      return;
    }

    setSavingEstado(true);
    setError("");
    setSuccess("");

    try {
      await api.actualizarEstadoPuntoMantenedor(mantenedorId, punto.id, {
        estadoId: Number(estadoSeleccionado),
        descripcion,
      });

      setSuccess("Estado general del punto actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado del punto");
    } finally {
      setSavingEstado(false);
    }
  };

  const actualizarMateriales = async () => {
    if (!punto) return;

    setSavingMateriales(true);
    setError("");
    setSuccess("");

    try {
      validarMateriales();

      await api.actualizarMaterialesPuntoMantenedor(
        mantenedorId,
        punto.id,
        materialesEditados
      );

      setSuccess("Materiales del punto actualizados correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron actualizar los materiales");
    } finally {
      setSavingMateriales(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#f5f7f5]">
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            Cargando detalle del punto...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !punto) {
    return (
      <div className="p-8 space-y-6 bg-[#f5f7f5]">
        <Button
          variant="outline"
          onClick={() => navigate("/mantenedor")}
          className="border-[#3d5a47] text-[#3d5a47]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al panel
        </Button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!punto) return null;

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/mantenedor">
            <Button variant="outline" className="mb-4 border-[#3d5a47] text-[#3d5a47]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a mis puntos
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-3xl font-bold text-[#2d4437]">
              {punto.nombre}
            </h1>
          </div>

          <p className="text-gray-600 mt-2">
            Gestiona el estado general y la disponibilidad de materiales de este punto.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={cargarDatos}
          disabled={loading}
          className="border-[#3d5a47] text-[#3d5a47]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-[#2d4437] mb-1">
              {punto.materialesDetalle?.length ?? 0}
            </p>
            <p className="text-sm text-gray-600">Materiales asociados</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">
              {materialesDisponibles}
            </p>
            <p className="text-sm text-gray-600">Disponibles</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600 mb-1">
              {materialesLlenos}
            </p>
            <p className="text-sm text-gray-600">Llenos</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <Badge className={estadoColor(punto.estado)}>
              {punto.estado}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">Estado general</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#6fae7f]/20">
        <CardHeader>
          <CardTitle className="text-[#2d4437] flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Información del punto
          </CardTitle>
          <CardDescription>
            Datos principales del punto asignado.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Dirección</p>
            <p className="font-medium text-[#2d4437]">{punto.direccion}</p>
          </div>

          <div>
            <p className="text-gray-500">Comuna</p>
            <p className="font-medium text-[#2d4437]">{punto.comuna}</p>
          </div>

          <div>
            <p className="text-gray-500">Radio de validación</p>
            <p className="font-medium text-[#2d4437]">{punto.radioValidacionM} m</p>
          </div>

          <div>
            <p className="text-gray-500">Coordenadas</p>
            <p className="font-medium text-[#2d4437]">
              {punto.latitud}, {punto.longitud}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#6fae7f]/20">
        <CardHeader>
          <CardTitle className="text-[#2d4437] flex items-center gap-2">
            <Package className="w-5 h-5" />
            Materiales del punto
          </CardTitle>
          <CardDescription>
            Ajusta la capacidad y cantidad actual de cada material. Si actual alcanza la capacidad, el material queda lleno.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {(punto.materialesDetalle ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">
              Este punto no tiene materiales asociados.
            </p>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                {(punto.materialesDetalle ?? []).map((material) => {
                  const editado = obtenerMaterialEditado(material.materialId);
                  const capacidad = editado?.capacidadCompactado ?? material.capacidadCompactado;
                  const actual = editado?.actualCompactado ?? material.actualCompactado;
                  const lleno = capacidad > 0 && actual >= capacidad;

                  return (
                    <div
                      key={material.materialId}
                      className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#2d4437]">
                            {material.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID material: {material.materialId}
                          </p>
                        </div>

                        <Badge className={materialColor(lleno)}>
                          {lleno ? "Lleno" : "Disponible"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Capacidad</Label>
                          <Input
                            type="number"
                            min="0"
                            value={capacidad}
                            onChange={(e) =>
                              cambiarCantidadMaterial(
                                material.materialId,
                                "capacidadCompactado",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Actual</Label>
                          <Input
                            type="number"
                            min="0"
                            value={actual}
                            onChange={(e) =>
                              cambiarCantidadMaterial(
                                material.materialId,
                                "actualCompactado",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Ejemplo: si PET color tiene capacidad 100 y actual 100, se marca como lleno.
                      </p>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={actualizarMateriales}
                disabled={savingMateriales}
                className="w-full bg-[#3d5a47] hover:bg-[#2d4437]"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingMateriales ? "Guardando materiales..." : "Guardar materiales"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#6fae7f]/20">
        <CardHeader>
          <CardTitle className="text-[#2d4437]">
            Estado general del punto
          </CardTitle>
          <CardDescription>
            Cambia el estado general del punto completo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nuevo estado</Label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={estadoSeleccionado || punto.estadoId || ""}
              onChange={(e) => setEstadoSeleccionado(Number(e.target.value))}
            >
              {estados.map((estado) => (
                <option key={getRowId(estado)} value={getRowId(estado)}>
                  {getRowName(estado)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Observación</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Contenedor lleno, punto limpiado, requiere retiro..."
            />
          </div>

          <Button
            onClick={actualizarEstado}
            disabled={savingEstado}
            className="w-full bg-[#3d5a47] hover:bg-[#2d4437]"
          >
            <Save className="w-4 h-4 mr-2" />
            {savingEstado ? "Guardando estado..." : "Actualizar estado general"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
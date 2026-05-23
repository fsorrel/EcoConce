import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Search, MapPin, Plus, Edit, Ban, RefreshCw, Save, X, CheckCircle } from "lucide-react";
import {
  api,
  BdRow,
  Material,
  PuntoMaterialRequest,
  PuntoReciclaje,
  PuntoReciclajeRequest,
  UsuarioAdmin,
} from "../lib/api";

type PuntoFormState = {
  nombre: string;
  descripcion: string;
  comunaId: number;
  direccion: string;
  latitud: string;
  longitud: string;
  radioValidacionM: string;
  estadoId: number;
  mantenedorId: number | null;
  materiales: PuntoMaterialRequest[];
};

const emptyForm = (): PuntoFormState => ({
  nombre: "",
  descripcion: "",
  comunaId: 1,
  direccion: "",
  latitud: "-36.82699",
  longitud: "-73.04977",
  radioValidacionM: "50",
  estadoId: 1,
  mantenedorId: null,
  materiales: [],
});

const getRowId = (row: BdRow) => Number(row.id ?? row.ID ?? 0);
const getRowName = (row: BdRow) => String(row.nombre ?? row.NOMBRE ?? row.name ?? row.NAME ?? "");

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

const esInactivo = (estado: string) => {
  return estado?.toUpperCase().includes("INACTIVO");
};

const materialSeleccionado = (form: PuntoFormState, materialId: number) => {
  return form.materiales.some((item) => item.materialId === materialId);
};

const actualizarMaterial = (
  form: PuntoFormState,
  materialId: number,
  field: keyof PuntoMaterialRequest,
  value: number
): PuntoFormState => {
  const materiales = form.materiales.map((item) =>
    item.materialId === materialId ? { ...item, [field]: value } : item
  );

  return { ...form, materiales };
};

const cambiarSeleccionMaterial = (
  form: PuntoFormState,
  materialId: number,
  checked: boolean
): PuntoFormState => {
  if (checked) {
    if (materialSeleccionado(form, materialId)) return form;

    return {
      ...form,
      materiales: [
        ...form.materiales,
        {
          materialId,
          capacidadCompactado: 0,
          actualCompactado: 0,
        },
      ],
    };
  }

  return {
    ...form,
    materiales: form.materiales.filter((item) => item.materialId !== materialId),
  };
};

export function ManagePoints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [comunas, setComunas] = useState<BdRow[]>([]);
  const [estados, setEstados] = useState<BdRow[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PuntoReciclaje | null>(null);
  const [formData, setFormData] = useState<PuntoFormState>(emptyForm());

  const mantenedores = useMemo(() => {
    return usuarios.filter((usuario) => {
      const rolTexto = String(usuario.rol ?? "").toLowerCase();
      return usuario.rolId === 3 || rolTexto.includes("mantenedor");
    });
  }, [usuarios]);

  const puntosFiltrados = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return puntos;

    return puntos.filter((punto) => {
      return (
        punto.nombre.toLowerCase().includes(query) ||
        punto.direccion?.toLowerCase().includes(query) ||
        punto.comuna?.toLowerCase().includes(query) ||
        punto.estado?.toLowerCase().includes(query)
      );
    });
  }, [puntos, searchQuery]);

  const totalActivos = puntos.filter((punto) => !esInactivo(punto.estado)).length;
  const totalInactivos = puntos.filter((punto) => esInactivo(punto.estado)).length;
  const totalSinMantenedor = puntos.filter((punto) => !punto.mantenedorId).length;

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [puntosData, materialesData, comunasData, estadosData, usuariosData] = await Promise.all([
        api.puntos(),
        api.materiales(),
        api.comunas(),
        api.estadosPunto(),
        api.usuariosActivosAdmin(),
      ]);

      setPuntos(puntosData);
      setMateriales(materialesData);
      setComunas(comunasData);
      setEstados(estadosData);
      setUsuarios(usuariosData);

      const primeraComuna = comunasData[0] ? getRowId(comunasData[0]) : 1;
      const primerEstado = estadosData[0] ? getRowId(estadosData[0]) : 1;

      setFormData((actual) => ({
        ...actual,
        comunaId: actual.comunaId || primeraComuna,
        estadoId: actual.estadoId || primerEstado,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los puntos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCrear = () => {
    const primeraComuna = comunas[0] ? getRowId(comunas[0]) : 1;
    const primerEstado = estados[0] ? getRowId(estados[0]) : 1;

    setEditingPoint(null);
    setError("");
    setSuccess("");
    setFormData({
      ...emptyForm(),
      comunaId: primeraComuna,
      estadoId: primerEstado,
    });
    setIsFormOpen(true);
  };

  const abrirEditar = (punto: PuntoReciclaje) => {
    const materialesSeleccionados = punto.materiales
      .map((nombreMaterial) => {
        const material = materiales.find(
          (item) => item.nombre.toLowerCase() === nombreMaterial.toLowerCase()
        );

        if (!material) return null;

        return {
          materialId: material.id,
          capacidadCompactado: 0,
          actualCompactado: 0,
        };
      })
      .filter((item): item is PuntoMaterialRequest => item !== null);

    setEditingPoint(punto);
    setError("");
    setSuccess("");
    setFormData({
      nombre: punto.nombre ?? "",
      descripcion: punto.descripcion ?? "",
      comunaId: punto.comunaId ?? (comunas[0] ? getRowId(comunas[0]) : 1),
      direccion: punto.direccion ?? "",
      latitud: String(punto.latitud ?? ""),
      longitud: String(punto.longitud ?? ""),
      radioValidacionM: String(punto.radioValidacionM ?? 50),
      estadoId: punto.estadoId ?? (estados[0] ? getRowId(estados[0]) : 1),
      mantenedorId: punto.mantenedorId ?? null,
      materiales: materialesSeleccionados,
    });
    setIsFormOpen(true);
  };

  const cerrarFormulario = () => {
    setIsFormOpen(false);
    setEditingPoint(null);
    setError("");
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) throw new Error("Debes ingresar el nombre del punto");
    if (!formData.descripcion.trim()) throw new Error("Debes ingresar una descripción");
    if (!formData.direccion.trim()) throw new Error("Debes ingresar la dirección");
    if (!Number.isFinite(Number(formData.latitud))) throw new Error("Latitud inválida");
    if (!Number.isFinite(Number(formData.longitud))) throw new Error("Longitud inválida");

    if (!Number.isFinite(Number(formData.radioValidacionM)) || Number(formData.radioValidacionM) <= 0) {
      throw new Error("El radio de validación debe ser mayor a 0");
    }

    if (formData.materiales.length === 0) {
      throw new Error("Debes seleccionar al menos un material");
    }

    for (const material of formData.materiales) {
      if (material.capacidadCompactado < 0 || material.actualCompactado < 0) {
        throw new Error("Las capacidades de materiales no pueden ser negativas");
      }

      if (material.capacidadCompactado > 0 && material.actualCompactado > material.capacidadCompactado) {
        throw new Error("La cantidad actual no puede superar la capacidad compactada");
      }
    }
  };

  const crearPayload = (): PuntoReciclajeRequest => ({
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
    comunaId: Number(formData.comunaId),
    direccion: formData.direccion.trim(),
    latitud: Number(formData.latitud),
    longitud: Number(formData.longitud),
    radioValidacionM: Number(formData.radioValidacionM),
    estadoId: Number(formData.estadoId),
    mantenedorId: formData.mantenedorId ? Number(formData.mantenedorId) : null,
    materiales: formData.materiales,
  });

  const guardarPunto = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      validarFormulario();

      const payload = crearPayload();

      if (editingPoint) {
        await api.actualizarPuntoAdmin(editingPoint.id, payload);
        setSuccess("Punto actualizado correctamente.");
      } else {
        await api.crearPuntoAdmin(payload);
        setSuccess("Punto creado correctamente.");
      }

      setIsFormOpen(false);
      setEditingPoint(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el punto");
    } finally {
      setSaving(false);
    }
  };

  const desactivarPunto = async (punto: PuntoReciclaje) => {
    const confirmar = window.confirm(`¿Seguro que deseas desactivar "${punto.nombre}"?`);

    if (!confirmar) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.desactivarPuntoAdmin(punto.id);
      setSuccess("Punto desactivado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar el punto");
    } finally {
      setSaving(false);
    }
  };

  const activarPunto = async (punto: PuntoReciclaje) => {
    const confirmar = window.confirm(`¿Seguro que deseas activar "${punto.nombre}"?`);

    if (!confirmar) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.activarPuntoAdmin(punto.id);
      setSuccess("Punto activado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar el punto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2d4437] mb-2">
            Gestión de Puntos de Reciclaje
          </h1>
          <p className="text-gray-600">
            Administra puntos reales, materiales aceptados, mantenedores y estado de funcionamiento.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={loading}
            className="border-[#3d5a47] text-[#3d5a47]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3d5a47] hover:bg-[#2d4437]" onClick={abrirCrear}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Punto
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPoint ? "Editar Punto de Reciclaje" : "Agregar Nuevo Punto de Reciclaje"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del punto</Label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Ecopunto Plaza Perú"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe ubicación, acceso o referencias del punto"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Comuna</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={formData.comunaId}
                      onChange={(e) => setFormData({ ...formData, comunaId: Number(e.target.value) })}
                    >
                      {comunas.map((comuna) => (
                        <option key={getRowId(comuna)} value={getRowId(comuna)}>
                          {getRowName(comuna)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={formData.estadoId}
                      onChange={(e) => setFormData({ ...formData, estadoId: Number(e.target.value) })}
                    >
                      {estados.map((estado) => (
                        <option key={getRowId(estado)} value={getRowId(estado)}>
                          {getRowName(estado)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mantenedor asignado</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={formData.mantenedorId ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mantenedorId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    >
                      <option value="">Sin mantenedor</option>
                      {mantenedores.map((mantenedor) => (
                        <option key={mantenedor.id} value={mantenedor.id}>
                          {mantenedor.nombreAlias} - {mantenedor.correo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Latitud</Label>
                    <Input
                      value={formData.latitud}
                      onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Longitud</Label>
                    <Input
                      value={formData.longitud}
                      onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Radio de validación en metros</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.radioValidacionM}
                      onChange={(e) => setFormData({ ...formData, radioValidacionM: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Materiales aceptados</Label>
                    <p className="text-xs text-gray-500">
                      Selecciona los materiales reales registrados en la base de datos.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {materiales.map((material) => {
                      const seleccionado = formData.materiales.find((item) => item.materialId === material.id);

                      return (
                        <div key={material.id} className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(seleccionado)}
                              onChange={(e) =>
                                setFormData(cambiarSeleccionMaterial(formData, material.id, e.target.checked))
                              }
                            />
                            <span className="font-medium text-[#2d4437]">{material.nombre}</span>
                          </label>

                          {seleccionado && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Capacidad</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={seleccionado.capacidadCompactado}
                                  onChange={(e) =>
                                    setFormData(
                                      actualizarMaterial(
                                        formData,
                                        material.id,
                                        "capacidadCompactado",
                                        Number(e.target.value)
                                      )
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Actual</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={seleccionado.actualCompactado}
                                  onChange={(e) =>
                                    setFormData(
                                      actualizarMaterial(
                                        formData,
                                        material.id,
                                        "actualCompactado",
                                        Number(e.target.value)
                                      )
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={cerrarFormulario} disabled={saving}>
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>

                  <Button onClick={guardarPunto} disabled={saving} className="bg-[#3d5a47] hover:bg-[#2d4437]">
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? "Guardando..." : editingPoint ? "Guardar cambios" : "Crear punto"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && !isFormOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-[#2d4437] mb-1">{puntos.length}</p>
            <p className="text-sm text-gray-600">Total puntos</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{totalActivos}</p>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-gray-600 mb-1">{totalInactivos}</p>
            <p className="text-sm text-gray-600">Inactivos</p>
          </CardContent>
        </Card>

        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600 mb-1">{totalSinMantenedor}</p>
            <p className="text-sm text-gray-600">Sin mantenedor</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#6fae7f]/20">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar puntos por nombre, dirección, comuna o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-12 text-center text-gray-500">
            Cargando puntos de reciclaje...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {puntosFiltrados.map((punto) => (
            <Card key={punto.id} className="border-[#6fae7f]/20 hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#6fae7f]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#3d5a47]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-[#2d4437] mb-1">{punto.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-1">{punto.direccion}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {punto.comuna} · Radio {punto.radioValidacionM} m · Lat {punto.latitud}, Lng {punto.longitud}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={estadoColor(punto.estado)}>{punto.estado}</Badge>

                        {punto.mantenedor ? (
                          <Badge variant="outline" className="border-[#6fae7f]">
                            Mantenedor: {punto.mantenedor}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                            Sin mantenedor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#3d5a47] text-[#3d5a47]"
                      onClick={() => abrirEditar(punto)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    {esInactivo(punto.estado) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => activarPunto(punto)}
                        disabled={saving}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Activar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => desactivarPunto(punto)}
                        disabled={saving}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Desactivar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Materiales aceptados</p>
                    <div className="flex flex-wrap gap-1">
                      {punto.materiales.length > 0 ? (
                        punto.materiales.map((material, index) => (
                          <Badge key={`${punto.id}-${material}-${index}`} variant="outline" className="text-xs border-[#6fae7f]">
                            {material}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Sin materiales asociados</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Identificadores internos</p>
                    <p className="text-xs text-gray-500">
                      Punto #{punto.id} · Comuna #{punto.comunaId ?? "N/A"} · Estado #{punto.estadoId ?? "N/A"} · Mantenedor #{punto.mantenedorId ?? "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && puntosFiltrados.length === 0 && (
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron puntos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
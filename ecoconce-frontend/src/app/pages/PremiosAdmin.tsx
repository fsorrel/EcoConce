import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle, Edit, Gift, Loader2, Package, Plus, RefreshCw, Save, Search, X } from "lucide-react";
import { api } from "../lib/api";
import type { Premio, PremioAdminRequest } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

type PremioFormState = {
  nombre: string;
  descripcion: string;
  costoPuntos: string;
  stock: string;
  activo: string;
};

const initialForm: PremioFormState = {
  nombre: "",
  descripcion: "",
  costoPuntos: "",
  stock: "0",
  activo: "S",
};

const normalizarActivo = (activo: string) => (activo?.toUpperCase() === "S" ? "S" : "N");

const estadoPremio = (premio: Premio) => {
  if (premio.activo?.toUpperCase() !== "S") return "Inactivo";
  if (premio.stock <= 0) return "Agotado";
  return "Activo";
};

export function PremiosAdmin() {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPremio, setEditingPremio] = useState<Premio | null>(null);
  const [formData, setFormData] = useState<PremioFormState>(initialForm);

  const cargarPremios = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.premiosAdmin();
      setPremios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los premios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPremios();
  }, []);

  const premiosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return premios;

    return premios.filter((premio) =>
      `${premio.id} ${premio.nombre} ${premio.descripcion} ${estadoPremio(premio)}`
        .toLowerCase()
        .includes(term)
    );
  }, [premios, search]);

  const resumen = useMemo(() => {
    const activos = premios.filter((premio) => premio.activo?.toUpperCase() === "S").length;
    const agotados = premios.filter((premio) => premio.stock <= 0).length;
    const stockTotal = premios.reduce((total, premio) => total + Math.max(0, premio.stock), 0);

    return { activos, agotados, stockTotal };
  }, [premios]);

  const abrirNuevo = () => {
    setEditingPremio(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const abrirEdicion = (premio: Premio) => {
    setEditingPremio(premio);
    setFormData({
      nombre: premio.nombre ?? "",
      descripcion: premio.descripcion ?? "",
      costoPuntos: String(premio.costoPuntos ?? ""),
      stock: String(premio.stock ?? 0),
      activo: normalizarActivo(premio.activo),
    });
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const cancelarFormulario = () => {
    setFormOpen(false);
    setEditingPremio(null);
    setFormData(initialForm);
    setError("");
  };

  const actualizarCampo = (campo: keyof PremioFormState, valor: string) => {
    setFormData((actual) => ({ ...actual, [campo]: valor }));
  };

  const validarFormulario = () => {
    const costoPuntos = Number(formData.costoPuntos);
    const stock = Number(formData.stock);

    if (!formData.nombre.trim()) throw new Error("Debes ingresar el nombre del premio.");
    if (!formData.descripcion.trim()) throw new Error("Debes ingresar una descripción.");
    if (!Number.isInteger(costoPuntos) || costoPuntos <= 0) {
      throw new Error("El costo en puntos debe ser un número entero mayor a 0.");
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error("El stock debe ser un número entero igual o mayor a 0.");
    }
  };

  const crearPayload = (): PremioAdminRequest => ({
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
    costoPuntos: Number(formData.costoPuntos),
    stock: Number(formData.stock),
    activo: normalizarActivo(formData.activo),
  });

  const guardarPremio = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      validarFormulario();
      const payload = crearPayload();

      if (editingPremio) {
        await api.actualizarPremioAdmin(editingPremio.id, payload);
        setSuccess("Premio actualizado correctamente.");
      } else {
        await api.crearPremioAdmin(payload);
        setSuccess("Premio creado correctamente.");
      }

      setFormOpen(false);
      setEditingPremio(null);
      setFormData(initialForm);
      await cargarPremios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el premio.");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (premio: Premio) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (premio.activo?.toUpperCase() === "S") {
        await api.desactivarPremioAdmin(premio.id);
        setSuccess("Premio desactivado correctamente.");
      } else {
        await api.activarPremioAdmin(premio.id);
        setSuccess("Premio activado correctamente.");
      }

      await cargarPremios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado del premio.");
    } finally {
      setSaving(false);
    }
  };

  const marcarAgotado = async (premio: Premio) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.actualizarPremioAdmin(premio.id, {
        nombre: premio.nombre,
        descripcion: premio.descripcion,
        costoPuntos: premio.costoPuntos,
        stock: 0,
        activo: normalizarActivo(premio.activo),
      });

      setSuccess("Premio marcado como agotado correctamente.");
      await cargarPremios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo marcar el premio como agotado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#f5f7f5] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Gestión de premios</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Crea, edita, activa, desactiva y controla el stock de premios disponibles para ciudadanos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={cargarPremios}
            variant="outline"
            className="border-[#3d5a47] text-[#3d5a47]"
            disabled={loading || saving}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button onClick={abrirNuevo} className="bg-[#3d5a47] hover:bg-[#2d4437]" disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo premio
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

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total premios</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{premios.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Activos</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.activos}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Agotados</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">{resumen.agotados}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Stock total</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">
              {resumen.stockTotal.toLocaleString("es-CL")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {formOpen && (
        <Card className="border-[#8ec79f] bg-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{editingPremio ? "Editar premio" : "Crear premio"}</CardTitle>
                <CardDescription>
                  Los campos se guardan usando la tabla de premios existente. No se modifica la base de datos.
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" onClick={cancelarFormulario} disabled={saving}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(event) => actualizarCampo("nombre", event.target.value)}
                  placeholder="Ej: Descuento en tienda sustentable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activo">Estado</Label>
                <select
                  id="activo"
                  value={formData.activo}
                  onChange={(event) => actualizarCampo("activo", event.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="S">Activo</option>
                  <option value="N">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(event) => actualizarCampo("descripcion", event.target.value)}
                placeholder="Describe el premio y las condiciones del canje."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costoPuntos">Costo en puntos</Label>
                <Input
                  id="costoPuntos"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.costoPuntos}
                  onChange={(event) => actualizarCampo("costoPuntos", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(event) => actualizarCampo("stock", event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={cancelarFormulario} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>

              <Button onClick={guardarPremio} className="bg-[#3d5a47] hover:bg-[#2d4437]" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingPremio ? "Guardar cambios" : "Crear premio"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Listado de premios</CardTitle>
              <CardDescription>
                Los premios inactivos no aparecen en la vista del ciudadano.
              </CardDescription>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar premio..."
                className="pl-10 bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando premios...
            </div>
          ) : premiosFiltrados.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No hay premios que coincidan con la búsqueda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Premio</th>
                    <th className="py-3 px-2">Costo</th>
                    <th className="py-3 px-2">Stock</th>
                    <th className="py-3 px-2">Estado</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {premiosFiltrados.map((premio) => {
                    const activo = premio.activo?.toUpperCase() === "S";
                    const agotado = premio.stock <= 0;
                    const estado = estadoPremio(premio);

                    return (
                      <tr key={premio.id} className="border-b last:border-0 align-top">
                        <td className="py-3 px-2">{premio.id}</td>
                        <td className="py-3 px-2 max-w-md">
                          <div className="font-medium text-[#1f3b2d]">{premio.nombre}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{premio.descripcion}</div>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {premio.costoPuntos.toLocaleString("es-CL")} pts
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-500" />
                            {premio.stock.toLocaleString("es-CL")}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            className={
                              !activo
                                ? "bg-gray-200 text-gray-700"
                                : agotado
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {estado}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => abrirEdicion(premio)} disabled={saving}>
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarAgotado(premio)}
                              disabled={saving || agotado}
                            >
                              <Package className="w-4 h-4 mr-1" />
                              Agotar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cambiarEstado(premio)}
                              disabled={saving}
                              className={activo ? "text-red-700" : "text-green-700"}
                            >
                              {activo ? <Ban className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                              {activo ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
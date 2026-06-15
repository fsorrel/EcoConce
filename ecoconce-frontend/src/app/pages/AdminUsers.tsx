import { useEffect, useMemo, useState } from "react";
import { Shield, Users, RefreshCw, Edit, Save, X, Lock } from "lucide-react";
import { api, BdRow, UsuarioAdmin, UsuarioAdminUpdateRequest } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const ROLES = [
  { id: 1, nombre: "Usuario" },
  { id: 2, nombre: "Administrador" },
  { id: 3, nombre: "Mantenedor" },
];

const normalizarActivo = (activo: string) => {
  return activo?.toUpperCase() === "S" ? "Activo" : "Inactivo";
};

export function AdminUsers() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [comunas, setComunas] = useState<BdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null);

  const [formData, setFormData] = useState<UsuarioAdminUpdateRequest>({
    nombreAlias: "",
    correo: "",
    telefono: "",
    comunaId: null,
    direccion: "",
    rolId: 1,
    activo: "S",
  });

  const usuariosActivos = useMemo(() => {
    return usuarios.filter((usuario) => usuario.activo?.toUpperCase() === "S");
  }, [usuarios]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [usuariosData, comunasData] = await Promise.all([
        api.usuariosActivosAdmin(),
        api.comunas(),
      ]);

      setUsuarios(usuariosData);
      setComunas(comunasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirEdicion = (usuario: UsuarioAdmin) => {
    if (usuario.protegido) return;

    setUsuarioEditando(usuario);
    setError("");
    setSuccess("");

    setFormData({
      nombreAlias: usuario.nombreAlias ?? "",
      correo: usuario.correo ?? "",
      telefono: usuario.telefono ?? "",
      comunaId: usuario.comunaId ?? null,
      direccion: usuario.direccion ?? "",
      rolId: usuario.rolId ?? 1,
      activo: usuario.activo ?? "S",
    });
  };

  const cancelarEdicion = () => {
    setUsuarioEditando(null);
    setError("");
    setSuccess("");
  };

  const guardarUsuario = async () => {
    if (!usuarioEditando) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.actualizarUsuarioAdmin(usuarioEditando.id, {
        ...formData,
        activo: formData.activo.toUpperCase(),
      });

      setSuccess("Usuario actualizado correctamente.");
      setUsuarioEditando(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#3d5a47]" />
            <h1 className="text-4xl font-bold text-[#1f3b2d]">Usuarios activos</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Administra usuarios activos y cambia sus permisos dentro de EcoConce.
          </p>
        </div>

        <Button
          onClick={cargarDatos}
          variant="outline"
          className="border-[#3d5a47] text-[#3d5a47]"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total usuarios activos</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">
              {usuariosActivos.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">
              {usuariosActivos.filter((usuario) => usuario.rolId === 2).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Mantenedores</CardDescription>
            <CardTitle className="text-3xl text-[#1f3b2d]">
              {usuariosActivos.filter((usuario) => usuario.rolId === 3).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de usuarios</CardTitle>
          <CardDescription>
            El administrador original aparece protegido y no puede ser modificado.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-gray-500">Cargando usuarios...</p>
          ) : usuariosActivos.length === 0 ? (
            <p className="text-gray-500">No hay usuarios activos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Nombre</th>
                    <th className="py-3 px-2">Correo</th>
                    <th className="py-3 px-2">Rol</th>
                    <th className="py-3 px-2">Puntos</th>
                    <th className="py-3 px-2">Estado</th>
                    <th className="py-3 px-2">Protección</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosActivos.map((usuario) => (
                    <tr key={usuario.id} className="border-b last:border-0">
                      <td className="py-3 px-2">{usuario.id}</td>
                      <td className="py-3 px-2 font-medium text-[#1f3b2d]">
                        {usuario.nombreAlias}
                      </td>
                      <td className="py-3 px-2">{usuario.correo}</td>
                      <td className="py-3 px-2">{usuario.rol}</td>
                      <td className="py-3 px-2">
                        {usuario.puntos?.toLocaleString("es-CL") ?? 0}
                      </td>
                      <td className="py-3 px-2">{normalizarActivo(usuario.activo)}</td>
                      <td className="py-3 px-2">
                        {usuario.protegido ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                            <Lock className="w-3 h-3" />
                            Admin original
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            <Shield className="w-3 h-3" />
                            Editable
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={usuario.protegido}
                          onClick={() => abrirEdicion(usuario)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {usuarioEditando && (
        <Card className="border-[#8ec79f]">
          <CardHeader>
            <CardTitle>Editar usuario</CardTitle>
            <CardDescription>
              Modificando a {usuarioEditando.nombreAlias}. No se editan contraseñas ni puntos desde esta sección.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre / alias</Label>
                <Input
                  value={formData.nombreAlias}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreAlias: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Correo</Label>
                <Input
                  type="email"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({ ...formData, correo: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.rolId}
                  onChange={(e) =>
                    setFormData({ ...formData, rolId: Number(e.target.value) })
                  }
                >
                  {ROLES.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Comuna</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.comunaId ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      comunaId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">Sin comuna</option>
                  {comunas.map((comuna) => (
                    <option key={String(comuna.id)} value={Number(comuna.id)}>
                      {String(comuna.nombre)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.activo}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.value })
                  }
                >
                  <option value="S">Activo</option>
                  <option value="N">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelarEdicion} disabled={saving}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>

              <Button
                onClick={guardarUsuario}
                disabled={saving}
                className="bg-[#3d5a47] hover:bg-[#2d4437]"
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
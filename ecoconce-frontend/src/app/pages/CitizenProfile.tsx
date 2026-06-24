import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  User,
  Mail,
  MapPin,
  Award,
  TrendingUp,
  Calendar,
  Edit,
  Save,
  ClipboardList,
  Gift,
  CheckCircle,
  Truck,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  api,
  BdRow,
  getCurrentUser,
  refreshCurrentUserFromBackend,
  saveCurrentUser,
  UsuarioSesion,
  CanjeAdmin,
} from "../lib/api";

const value = (row: BdRow, key: string) => row[key] ?? "";
const numberValue = (row: BdRow, key: string) => Number(row[key] ?? 0) || 0;

const formatDate = (date: string) => {
  if (!date) return "Sin fecha";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const levelInfo = (points: number) => {
  if (points >= 15000) return { label: "Nivel 4: Campeón del Reciclaje", next: 15000, progress: 100, missing: 0 };
  if (points >= 10000) return { label: "Nivel 3: Guardián Ambiental", next: 15000, progress: Math.round((points / 15000) * 100), missing: 15000 - points };
  if (points >= 5000) return { label: "Nivel 2: Recolector Verde", next: 10000, progress: Math.round((points / 10000) * 100), missing: 10000 - points };
  return { label: "Nivel 1: Eco Novato", next: 5000, progress: Math.round((points / 5000) * 100), missing: 5000 - points };
};

const emptyUser: UsuarioSesion = {
  id: 1,
  rut: "",
  nombreAlias: "Usuario EcoConce",
  correo: "",
  sexoGenero: "",
  fechaNacimiento: "",
  telefono: "",
  comunaId: 0,
  comuna: "",
  direccion: "",
  puntos: 0,
  rolId: 2,
  rol: "Ciudadano",
  activo: "S",
  fechaRegistro: "",
  fechaUltimoAcceso: "",
};

// Algoritmo de validación de RUT chileno con dígito verificador
const validarRut = (rut: string): boolean => {
  if (!rut) return false;
  const clean = rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
  if (clean.length < 2) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * Number(cuerpo.charAt(i));
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = "";
  if (dvEsperado === 11) dvCalculado = "0";
  else if (dvEsperado === 10) dvCalculado = "K";
  else dvCalculado = String(dvEsperado);

  return dvCalculado === dv;
};

// Formatea el RUT automáticamente mientras se escribe (ej: 12.345.678-9)
const formatRut = (value: string) => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;
  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);
  
  let formattedCuerpo = cuerpo;
  if (cuerpo.length > 3 && cuerpo.length <= 6) {
    formattedCuerpo = `${cuerpo.slice(0, -3)}.${cuerpo.slice(-3)}`;
  } else if (cuerpo.length > 6) {
    formattedCuerpo = `${cuerpo.slice(0, -6)}.${cuerpo.slice(-6, -3)}.${cuerpo.slice(-3)}`;
  }
  return `${formattedCuerpo}-${dv}`;
};

const estadoCanjeClass = (estado: string) => {
  switch (String(estado ?? "").toUpperCase()) {
    case "ENTREGADO":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
    case "CONFIRMADO":
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    case "CANCELADO":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
  }
};

export function CitizenProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion>(() => getCurrentUser() ?? emptyUser);
  const [profileData, setProfileData] = useState<UsuarioSesion>(() => getCurrentUser() ?? emptyUser);
  const [formularios, setFormularios] = useState<BdRow[]>([]);
  const [detalles, setDetalles] = useState<BdRow[]>([]);
  
  // Estados para Historial de Canjes
  const [canjes, setCanjes] = useState<CanjeAdmin[]>([]);
  const [loadingCanjes, setLoadingCanjes] = useState(false);
  const [confirmingReceiptId, setConfirmingReceiptId] = useState<number | null>(null);
  
  // Validaciones y Toasts
  const [errors, setErrors] = useState<Record<string, string>>({});
  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const cargarCanjes = async () => {
    setLoadingCanjes(true);
    try {
      const data = await api.canjesAdmin();
      const userCanjes = data.filter((item) => Number(item.usuarioId) === usuario.id);
      setCanjes(userCanjes);
    } catch (err) {
      console.error("Error al cargar historial de canjes:", err);
    } finally {
      setLoadingCanjes(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    refreshCurrentUserFromBackend()
      .then((updated) => {
        if (!mounted || !updated) return;
        setUsuario(updated);
        setProfileData(updated);
      })
      .catch(() => undefined);

    const currentUserId = getCurrentUser()?.id ?? 1;

    Promise.all([
      api.formulariosUsuario(currentUserId),
      api.detallesUsuario(currentUserId),
      api.canjesAdmin(),
    ])
      .then(([formulariosData, detallesData, canjesData]) => {
        if (!mounted) return;
        setFormularios(formulariosData);
        setDetalles(detallesData);

        const userCanjes = canjesData.filter((item) => Number(item.usuarioId) === currentUserId);
        setCanjes(userCanjes);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const userForms = useMemo(
    () => formularios.filter((formulario) => Number(value(formulario, "usuario_id")) === usuario.id),
    [formularios, usuario.id]
  );

  const totalMaterialesDeclarados = useMemo(() => {
    const ids = new Set(userForms.map((formulario) => Number(value(formulario, "id"))));
    return detalles
      .filter((detalle) => ids.has(Number(value(detalle, "formulario_id"))))
      .reduce((total, detalle) => total + numberValue(detalle, "cantidad_declarada"), 0);
  }, [detalles, userForms]);

  const puntos = usuario.puntos ?? 0;
  const nivel = levelInfo(puntos);

  const stats = [
    { label: "Materiales declarados", value: totalMaterialesDeclarados.toLocaleString("es-CL"), icon: TrendingUp, color: "text-green-600" },
    { label: "Puntos Totales", value: puntos.toLocaleString("es-CL"), icon: Award, color: "text-yellow-600" },
    { label: "Formularios enviados", value: userForms.length.toLocaleString("es-CL"), icon: ClipboardList, color: "text-blue-600" },
    { label: "Nivel Actual", value: nivel.label.split(":")[0].replace("Nivel ", ""), icon: TrendingUp, color: "text-purple-600" },
  ];

  const medals = [
    { name: "Eco Novato", icon: "🥉", obtained: puntos >= 0, description: "Cuenta creada en EcoConce" },
    { name: "Recolector Verde", icon: "🌱", obtained: puntos >= 5000, description: "Alcanza 5.000 puntos" },
    { name: "Guardián Ambiental", icon: "🏆", obtained: puntos >= 10000, description: "Alcanza 10.000 puntos" },
    { name: "Campeón del Reciclaje", icon: "♻️", obtained: puntos >= 15000, description: "Alcanza 15.000 puntos" },
  ];

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setProfileData({ ...profileData, rut: formatted });
    if (errors.rut) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.rut;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.nombreAlias?.trim()) {
      newErrors.nombreAlias = "El nombre o alias es obligatorio.";
    } else if (profileData.nombreAlias.trim().length < 3) {
      newErrors.nombreAlias = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!profileData.rut?.trim()) {
      newErrors.rut = "El RUT es obligatorio.";
    } else if (!validarRut(profileData.rut)) {
      newErrors.rut = "El RUT ingresado no es válido (ej: 12.345.678-9).";
    }

    if (!profileData.correo?.trim()) {
      newErrors.correo = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.correo)) {
      newErrors.correo = "El correo electrónico no tiene un formato válido.";
    }

    if (profileData.fechaNacimiento) {
      const fechaNac = new Date(profileData.fechaNacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) {
        newErrors.fechaNacimiento = "La fecha de nacimiento no puede ser en el futuro.";
      }
    }

    if (profileData.telefono?.trim()) {
      const cleanPhone = profileData.telefono.replace(/\s+/g, "");
      if (!/^\+?\d{9,12}$/.test(cleanPhone)) {
        newErrors.telefono = "El teléfono debe contener entre 9 y 12 dígitos.";
      }
    }

    if (!profileData.direccion?.trim()) {
      newErrors.direccion = "La dirección es obligatoria.";
    } else if (profileData.direccion.trim().length < 5) {
      newErrors.direccion = "La dirección debe tener al menos 5 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      showToast("Por favor corrige los errores del formulario.", "error");
      return;
    }
    const updated = saveCurrentUser(profileData as unknown as Record<string, unknown>);
    setUsuario(updated);
    setProfileData(updated);
    setIsEditing(false);
    setErrors({});
    showToast("Perfil actualizado correctamente.", "success");
  };

  const handleConfirmarRecepcion = async (canjeId: number) => {
    setConfirmingReceiptId(canjeId);
    try {
      await api.actualizarEstadoCanjeAdmin(canjeId, {
        estado: "ENTREGADO",
        observacion: "Recepción confirmada por el usuario en su domicilio.",
      });
      showToast("¡Recepción confirmada con éxito! Estado actualizado.", "success");
      await cargarCanjes();
      const updated = await refreshCurrentUserFromBackend();
      if (updated) {
        setUsuario(updated);
        setProfileData(updated);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo confirmar la recepción.", "error");
    } finally {
      setConfirmingReceiptId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen relative">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2d4437] mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Revisa tu progreso ecológico e información personal.</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#3d5a47] hover:bg-[#2d4437] text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-[#6fae7f]/20">
              <CardContent className="p-6 text-center">
                <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <p className="text-3xl font-bold text-[#2d4437] mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="history">Formularios</TabsTrigger>
              <TabsTrigger value="redeems" onClick={cargarCanjes}>Historial de Canjes</TabsTrigger>
              <TabsTrigger value="progress">Progreso</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <Card className="border-[#6fae7f]/20">
                <CardHeader>
                  <CardTitle className="text-[#2d4437] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#3d5a47]" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className={errors.nombreAlias ? "text-red-500 font-semibold" : ""}>Nombre o Alias</Label>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          value={profileData.nombreAlias}
                          disabled={!isEditing}
                          onChange={(e) => {
                            setProfileData({ ...profileData, nombreAlias: e.target.value });
                            if (errors.nombreAlias) setErrors((prev) => { const copy = { ...prev }; delete copy.nombreAlias; return copy; });
                          }}
                          className={`${!isEditing ? "bg-gray-50" : ""} ${errors.nombreAlias ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      </div>
                      {errors.nombreAlias && (
                        <p className="text-xs text-red-500 font-medium">{errors.nombreAlias}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rut" className={errors.rut ? "text-red-500 font-semibold" : ""}>RUT</Label>
                      <Input
                        id="rut"
                        value={profileData.rut}
                        disabled={!isEditing}
                        onChange={handleRutChange}
                        placeholder="12.345.678-9"
                        className={`${!isEditing ? "bg-gray-50" : ""} ${errors.rut ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.rut && (
                        <p className="text-xs text-red-500 font-medium">{errors.rut}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento" className={errors.fechaNacimiento ? "text-red-500 font-semibold" : ""}>Fecha de Nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={profileData.fechaNacimiento}
                        disabled={!isEditing}
                        onChange={(e) => {
                          setProfileData({ ...profileData, fechaNacimiento: e.target.value });
                          if (errors.fechaNacimiento) setErrors((prev) => { const copy = { ...prev }; delete copy.fechaNacimiento; return copy; });
                        }}
                        className={`${!isEditing ? "bg-gray-50" : ""} ${errors.fechaNacimiento ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.fechaNacimiento && (
                        <p className="text-xs text-red-500 font-medium">{errors.fechaNacimiento}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo / Género</Label>
                      <select
                        id="sexo"
                        value={profileData.sexoGenero}
                        onChange={(e) => setProfileData({ ...profileData, sexoGenero: e.target.value })}
                        disabled={!isEditing}
                        className={`flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                      >
                        <option value="">Sin indicar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className={errors.correo ? "text-red-500 font-semibold" : ""}>Correo Electrónico</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.correo}
                          disabled={!isEditing}
                          onChange={(e) => {
                            setProfileData({ ...profileData, correo: e.target.value });
                            if (errors.correo) setErrors((prev) => { const copy = { ...prev }; delete copy.correo; return copy; });
                          }}
                          className={`${!isEditing ? "bg-gray-50" : ""} ${errors.correo ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      </div>
                      {errors.correo && (
                        <p className="text-xs text-red-500 font-medium">{errors.correo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className={errors.telefono ? "text-red-500 font-semibold" : ""}>Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.telefono}
                        disabled={!isEditing}
                        onChange={(e) => {
                          setProfileData({ ...profileData, telefono: e.target.value });
                          if (errors.telefono) setErrors((prev) => { const copy = { ...prev }; delete copy.telefono; return copy; });
                        }}
                        className={`${!isEditing ? "bg-gray-50" : ""} ${errors.telefono ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.telefono && (
                        <p className="text-xs text-red-500 font-medium">{errors.telefono}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className={errors.direccion ? "text-red-500 font-semibold" : ""}>Dirección</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <Input
                          id="address"
                          value={profileData.direccion}
                          disabled={!isEditing}
                          onChange={(e) => {
                            setProfileData({ ...profileData, direccion: e.target.value });
                            if (errors.direccion) setErrors((prev) => { const copy = { ...prev }; delete copy.direccion; return copy; });
                          }}
                          className={`${!isEditing ? "bg-gray-50" : ""} ${errors.direccion ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      </div>
                      {errors.direccion && (
                        <p className="text-xs text-red-500 font-medium">{errors.direccion}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setProfileData(usuario);
                          setErrors({});
                          setIsEditing(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </Button>
                    </div>
                  )}

                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Nota: Los cambios realizados se guardan en la sesión local.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="border-[#6fae7f]/20">
                <CardHeader>
                  <CardTitle className="text-[#2d4437]">Formularios de reciclaje enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userForms.length === 0 && <p className="text-sm text-gray-600">Esta cuenta aún no tiene formularios registrados.</p>}
                    {userForms.map((item) => (
                      <div key={String(value(item, "id"))} className="p-4 bg-[#f5f7f5] rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-[#2d4437]">Formulario #{String(value(item, "id"))}</p>
                            <p className="text-sm text-gray-600">{formatDate(String(value(item, "fecha_formulario")))}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            +{numberValue(item, "total_puntos_obtenidos").toLocaleString("es-CL")} pts
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <Badge variant="outline" className="border-[#6fae7f]">{String(value(item, "estado") || "Pendiente")}</Badge>
                          <span>Punto ID: {String(value(item, "punto_id"))}</span>
                          <span>Distancia: {numberValue(item, "distancia_metros").toLocaleString("es-CL")} m</span>
                        </div>
                        {value(item, "observacion") && <p className="mt-2 text-sm text-gray-600">{String(value(item, "observacion"))}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="redeems" className="mt-6">
              <Card className="border-[#6fae7f]/20">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-[#2d4437]">Historial de Premios Canjeados</CardTitle>
                  <Button
                    onClick={cargarCanjes}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[#3d5a47] hover:text-[#2d4437]"
                    disabled={loadingCanjes}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingCanjes ? "animate-spin" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingCanjes ? (
                    <div className="py-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#3d5a47]" />
                      Cargando historial de canjes...
                    </div>
                  ) : canjes.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-60" />
                      <p className="font-semibold text-gray-600">Aún no has canjeado ningún premio.</p>
                      <p className="text-sm text-gray-400 mt-1">¡Sigue reciclando para acumular puntos y canjear grandes premios!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Premio</TableHead>
                            <TableHead>Fecha de Canje</TableHead>
                            <TableHead>Puntos Gastados</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {canjes.map((canje) => {
                            const id = Number(canje.id);
                            const esEnvio = canje.envioDomicilio?.toUpperCase() === "S";
                            const sePuedeConfirmar = esEnvio && (canje.estado?.toUpperCase() === "PENDIENTE" || canje.estado?.toUpperCase() === "CONFIRMADO");

                            return (
                              <TableRow key={id} className="hover:bg-gray-50/50">
                                <TableCell className="font-semibold text-gray-900">
                                  <div className="flex flex-col">
                                    <span>{canje.premio}</span>
                                    {esEnvio && (
                                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                                        <Truck className="w-3.5 h-3.5" /> Envío a domicilio
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{formatDate(canje.fechaCanje)}</TableCell>
                                <TableCell className="font-bold text-red-600">
                                  -{Number(canje.puntosGastados).toLocaleString("es-CL")} pts
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-sm font-semibold text-xs">
                                    {canje.codigoCanje}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={estadoCanjeClass(canje.estado)} variant="outline">
                                    {canje.estado}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {sePuedeConfirmar ? (
                                    <div className="flex flex-col gap-1.5">
                                      <Button
                                        size="sm"
                                        onClick={() => handleConfirmarRecepcion(id)}
                                        disabled={confirmingReceiptId === id}
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
                                      >
                                        {confirmingReceiptId === id ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        )}
                                        Confirmar recepción
                                      </Button>
                                      {canje.direccionEnvio && (
                                        <span className="text-[10px] text-gray-500 max-w-[150px] truncate" title={canje.direccionEnvio}>
                                          A: {canje.direccionEnvio}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-500">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <Card className="border-[#6fae7f]/20">
                <CardHeader>
                  <CardTitle className="text-[#2d4437]">Progreso de Nivel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-[#2d4437]">{nivel.label}</span>
                    <span className="text-sm text-gray-600">{puntos.toLocaleString("es-CL")} / {nivel.next.toLocaleString("es-CL")} pts</span>
                  </div>
                  <Progress value={nivel.progress} className="h-3" />
                  <p className="text-xs text-gray-600">
                    {nivel.missing === 0 ? "Ya alcanzaste el nivel máximo disponible." : `${nivel.missing.toLocaleString("es-CL")} puntos para el siguiente nivel.`}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <Card className="border-[#6fae7f]/20">
            <CardContent className="p-6 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[#6fae7f] to-[#3d5a47] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <User className="w-16 h-16 text-white" />
              </div>
              <h3 className="font-bold text-xl text-[#2d4437] mb-1">{usuario.nombreAlias}</h3>
              <Badge className="bg-[#6fae7f] text-white border-0 mb-4">{nivel.label}</Badge>
              <p className="text-sm text-gray-600 mb-1">{usuario.correo}</p>
              <p className="text-sm text-gray-600">Miembro desde {formatDate(usuario.fechaRegistro)}</p>
            </CardContent>
          </Card>

          <Card className="border-[#6fae7f]/20">
            <CardHeader>
              <CardTitle className="text-[#2d4437] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#3d5a47]" />
                Medallas EcoConce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medals.map((medal) => (
                  <div key={medal.name} className={`flex items-start gap-3 p-3 rounded-lg border border-transparent transition ${medal.obtained ? "bg-[#f5f7f5] border-green-100" : "bg-gray-50 opacity-60"}`}>
                    <div className="text-3xl">{medal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#2d4437]">{medal.name}</p>
                      <p className="text-xs text-gray-600 mb-1">{medal.description}</p>
                      <p className="text-xs text-gray-500 font-semibold">{medal.obtained ? "Obtenida" : "Pendiente"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const SESSION_KEY = "ecoconce_user";

type RequestOptions = RequestInit & { raw?: boolean };

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.mensaje ?? errorBody.message ?? JSON.stringify(errorBody);
    } catch {
      message = await response.text();
    }
    throw new Error(message || `Error ${response.status}`);
  }

  if (options.raw) return response as T;
  return response.json() as Promise<T>;
}

export type UsuarioResumen = {
  id: number;
  nombreAlias: string;
  correo: string;
  puntos: number;
  rol: string;
};

export type UsuarioSesion = {
  id: number;
  rut: string;
  nombreAlias: string;
  correo: string;
  sexoGenero: string;
  fechaNacimiento: string;
  telefono: string;
  comunaId: number;
  comuna: string;
  direccion: string;
  puntos: number;
  rolId: number;
  rol: string;
  activo: string;
  fechaRegistro: string;
  fechaUltimoAcceso: string;
};

export type UsuarioAdmin = {
  id: number;
  rut: string;
  nombreAlias: string;
  correo: string;
  sexoGenero: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  comunaId: number | null;
  comuna: string | null;
  direccion: string | null;
  puntos: number;
  rolId: number | null;
  rol: string | null;
  activo: string;
  fechaRegistro: string | null;
  fechaUltimoAcceso: string | null;
  protegido: boolean;
};

export type UsuarioAdminUpdateRequest = {
  nombreAlias: string;
  correo: string;
  telefono: string;
  comunaId: number | null;
  direccion: string;
  rolId: number;
  activo: string;
};

export type ResumenReciclaje = {
  materialesReciclados: number;
  puntosGanados: number;
  desafiosCompletados: number;
  nivelesGanados: number;
};

export type Medalla = {
  nombre: string;
  descripcion: string;
  puntosRequeridos: number;
  obtenida: boolean;
  icono: string;
};

export type PuntoMaterialDetalle = {
  materialId: number;
  nombre: string;
  capacidadCompactado: number;
  actualCompactado: number;
  lleno: boolean;
  disponible: boolean;
};

export type PuntoReciclaje = {
  id: number;
  nombre: string;
  descripcion: string;
  comunaId: number | null;
  comuna: string;
  direccion: string;
  latitud: number;
  longitud: number;
  radioValidacionM: number;
  estadoId: number | null;
  estado: string;
  mantenedorId: number | null;
  mantenedor: string | null;
  materiales: string[];
  materialesDetalle: PuntoMaterialDetalle[];
};

export type PuntoMaterialRequest = {
  materialId: number;
  capacidadCompactado: number;
  actualCompactado: number;
};

export type PuntoMaterialUpdateRequest = {
  materialId: number;
  capacidadCompactado: number;
  actualCompactado: number;
};

export type PuntoReciclajeRequest = {
  nombre: string;
  descripcion: string;
  comunaId: number;
  direccion: string;
  latitud: number;
  longitud: number;
  radioValidacionM: number;
  estadoId: number;
  mantenedorId: number | null;
  materiales: PuntoMaterialRequest[];
};

export type PuntoEstadoRequest = {
  estadoId: number;
  descripcion: string;
};

export type Material = {
  id: number;
  nombre: string;
  codigoIdentificador: string;
  descripcion: string;
};

export type Guia = {
  id: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  material: string;
};

export type Premio = {
  id: number;
  nombre: string;
  descripcion: string;
  costoPuntos: number;
  stock: number;
  activo: string;
  envioDomicilio: string;
};

export type CanjeResponse = {
  id: number;
  premioId: number;
  premio: string;
  puntosGastados: number;
  codigoCanje: string;
  estado: string;
  envioDomicilio: string;
  direccionEnvio: string | null;
  puntosRestantes: number;
  fechaCanje: string;
};

export type PremioAdminRequest = {
  nombre: string;
  descripcion: string;
  costoPuntos: number;
  stock: number;
  activo: string;
  envioDomicilio: string;
};

export type CanjeAdmin = {
  id: number;
  usuarioId: number | null;
  usuario: string;
  correo: string;
  premioId: number | null;
  premio: string;
  puntosGastados: number;
  codigoCanje: string;
  estado: string;
  envioDomicilio: string;
  direccionEnvio: string | null;
  observacion: string | null;
  fechaCanje: string;
  fechaEntrega: string | null;
};

export type CanjeEstadoRequest = {
  estado: string;
  observacion: string;
};

export type ReportePuntoResponse = {
  id: number;
  usuarioId: number | null;
  usuario: string | null;
  puntoId: number | null;
  punto: string | null;
  mantenedorId: number | null;
  mantenedor: string | null;
  tipoReporteId: number | null;
  tipoReporte: string | null;
  descripcion: string;
  fechaReporte: string;
};

export type TipoReporte = {
  id: number;
  nombre: string;
};

export type ReportePuntoRequest = {
  usuarioId: number;
  puntoId: number;
  tipoReporteId: number;
  descripcion: string;
};

export type Dashboard = {
  usuario: UsuarioResumen;
  resumen: ResumenReciclaje;
  medallas: Medalla[];
  puntos: PuntoReciclaje[];
  guias: Guia[];
  materiales: Material[];
  premios: Premio[];
};

export type BdRow = Record<string, string | number | boolean | null>;

export type RegionRow = {
  id: number;
  nombre: string;
};

export type ComunaRow = {
  id: number;
  nombre: string;
  region_id: number;
};

export type FormularioRequest = {
  puntoId: number;
  distanciaMetros: number;
  observacion: string;
  materiales: Array<{
    materialId: number;
    cantidadDeclarada: number;
    unidadDeclarada: string;
    observacion: string;
  }>;
};

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asString = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const roleNameFromId = (rolId: number) => {
  if (rolId === 1) return "Ciudadano";
  if (rolId === 2) return "Administrador";
  if (rolId === 3) return "Mantenedor";
  return "Ciudadano";
};

const roleIdFromName = (rol: string) => {
  const normalized = rol.toLowerCase();
  if (normalized.includes("admin")) return 2;
  if (normalized.includes("mantenedor")) return 3;
  if (normalized.includes("usuario") || normalized.includes("ciudadano")) return 1;
  return 1;
};

export function getNormalizedRoleName(usuario: Pick<UsuarioSesion, "rolId" | "rol" | "correo">) {
  const rolTexto = asString(usuario.rol).toLowerCase();
  const correo = asString(usuario.correo).toLowerCase();

  if (rolTexto.includes("admin") || usuario.rolId === 2 || correo === "admin@ecoconce.cl") return "admin";
  if (rolTexto.includes("mantenedor") || usuario.rolId === 3 || correo === "mantenedor@ecoconce.cl") return "mantenedor";
  return "ciudadano";
}

export function normalizeUsuario(record: Record<string, unknown>): UsuarioSesion {
  const rolTexto = asString(record.rol ?? record.nombre_rol ?? record.role, "");
  const rolId = asNumber(record.rolId ?? record.rol_id, rolTexto ? roleIdFromName(rolTexto) : 1);

  return {
    id: asNumber(record.id, 1),
    rut: asString(record.rut),
    nombreAlias: asString(record.nombreAlias ?? record.nombre_alias ?? record.nombre ?? record.name, "Usuario EcoConce"),
    correo: asString(record.correo ?? record.email),
    sexoGenero: asString(record.sexoGenero ?? record.sexo_genero),
    fechaNacimiento: asString(record.fechaNacimiento ?? record.fecha_nacimiento),
    telefono: asString(record.telefono ?? record.phone),
    comunaId: asNumber(record.comunaId ?? record.comuna_id, 0),
    comuna: asString(record.comuna ?? record.nombre_comuna),
    direccion: asString(record.direccion ?? record.address),
    puntos: asNumber(record.puntos, 0),
    rolId,
    rol: rolTexto || roleNameFromId(rolId),
    activo: asString(record.activo, "S"),
    fechaRegistro: asString(record.fechaRegistro ?? record.fecha_registro),
    fechaUltimoAcceso: asString(record.fechaUltimoAcceso ?? record.fecha_ultimo_acceso),
  };
}

export function saveCurrentUser(usuario: Record<string, unknown>) {
  const normalized = normalizeUsuario(usuario);
  localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getCurrentUser(): UsuarioSesion | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return normalizeUsuario(JSON.parse(stored));
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUserId() {
  return getCurrentUser()?.id ?? 1;
}

export function getRolePath(usuario: Pick<UsuarioSesion, "rolId" | "rol" | "correo">) {
  const role = getNormalizedRoleName(usuario);
  if (role === "admin") return "/admin";
  if (role === "mantenedor") return "/mantenedor";
  return "/ciudadano";
}

export const api = {
  dashboard: (usuarioId = 1) => apiFetch<Dashboard>(`/api/dashboard/${usuarioId}`),

  puntos: () => apiFetch<PuntoReciclaje[]>("/api/puntos"),

  puntosMantenedor: (mantenedorId: number) =>
    apiFetch<PuntoReciclaje[]>(`/api/puntos/mantenedor/${mantenedorId}`),

  crearPuntoAdmin: (body: PuntoReciclajeRequest) =>
    apiFetch<PuntoReciclaje>("/api/puntos/admin", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  actualizarPuntoAdmin: (id: number, body: PuntoReciclajeRequest) =>
    apiFetch<PuntoReciclaje>(`/api/puntos/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  desactivarPuntoAdmin: (id: number) =>
    apiFetch<PuntoReciclaje>(`/api/puntos/admin/${id}/desactivar`, {
      method: "PUT",
    }),

  activarPuntoAdmin: (id: number) =>
    apiFetch<PuntoReciclaje>(`/api/puntos/admin/${id}/activar`, {
      method: "PUT",
    }),

  actualizarEstadoPuntoMantenedor: (
    mantenedorId: number,
    puntoId: number,
    body: PuntoEstadoRequest
  ) =>
    apiFetch<PuntoReciclaje>(`/api/puntos/mantenedor/${mantenedorId}/${puntoId}/estado`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  actualizarMaterialesPuntoMantenedor: (
    mantenedorId: number,
    puntoId: number,
    body: PuntoMaterialUpdateRequest[]
  ) =>
    apiFetch<PuntoReciclaje>(`/api/puntos/mantenedor/${mantenedorId}/${puntoId}/materiales`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  materiales: () => apiFetch<Material[]>("/api/materiales"),

  guias: () => apiFetch<Guia[]>("/api/guias"),

  premios: () => apiFetch<Premio[]>("/api/premios"),

  premiosAdmin: () => apiFetch<Premio[]>("/api/premios/admin"),
  
  canjesAdmin: () => apiFetch<CanjeAdmin[]>("/api/premios/admin/canjes"),

  canjesPendientesAdmin: () =>
    apiFetch<CanjeAdmin[]>("/api/premios/admin/canjes/pendientes"),

  actualizarEstadoCanjeAdmin: (canjeId: number, body: CanjeEstadoRequest) =>
    apiFetch<CanjeAdmin>(`/api/premios/admin/canjes/${canjeId}/estado`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  crearPremioAdmin: (body: PremioAdminRequest) =>
    apiFetch<Premio>("/api/premios/admin", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  actualizarPremioAdmin: (id: number, body: PremioAdminRequest) =>
    apiFetch<Premio>(`/api/premios/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  activarPremioAdmin: (id: number) =>
    apiFetch<Premio>(`/api/premios/admin/${id}/activar`, {
      method: "PUT",
    }),

  desactivarPremioAdmin: (id: number) =>
    apiFetch<Premio>(`/api/premios/admin/${id}/desactivar`, {
      method: "PUT",
    }),

  canjearPremio: (premioId: number, usuarioId: number) =>
    apiFetch<CanjeResponse>(`/api/premios/${premioId}/canjear?usuarioId=${usuarioId}`, {
      method: "POST",
    }),

  usuarios: () => apiFetch<BdRow[]>("/api/bd/usuarios"),

  usuariosActivosAdmin: () => apiFetch<UsuarioAdmin[]>("/api/usuarios/admin/activos"),

  actualizarUsuarioAdmin: (id: number, body: UsuarioAdminUpdateRequest) =>
    apiFetch<UsuarioAdmin>(`/api/usuarios/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  regiones: () => apiFetch<RegionRow[]>("/api/bd/regiones"),

  comunas: () => apiFetch<ComunaRow[]>("/api/bd/comunas"),

  estadosPunto: () => apiFetch<BdRow[]>("/api/bd/estado-punto"),

  formularios: () => apiFetch<BdRow[]>("/api/bd/formularios-reciclaje"),

  detalleFormularios: () => apiFetch<BdRow[]>("/api/bd/detalle-formulario-materiales"),

  reportesAdmin: () => apiFetch<ReportePuntoResponse[]>("/api/reportes/admin"),

  reportesMantenedor: (mantenedorId: number) =>
    apiFetch<ReportePuntoResponse[]>(`/api/reportes/mantenedor/${mantenedorId}`),

  tiposReporte: () => apiFetch<TipoReporte[]>("/api/reportes/tipos"),

  crearReportePunto: (body: ReportePuntoRequest) =>
    apiFetch<ReportePuntoResponse>("/api/reportes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  crearFormulario: (usuarioId: number, body: FormularioRequest) =>
    apiFetch(`/api/formularios/usuario/${usuarioId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  aprobarFormulario: (id: number) =>
    apiFetch(`/api/formularios/${id}/aprobar`, {
      method: "PUT",
    }),

  rechazarFormulario: (id: number, observacion: string) =>
    apiFetch(`/api/formularios/${id}/rechazar`, {
      method: "PUT",
      body: JSON.stringify({ observacion }),
    }),

  registrarUsuario: (body: unknown) =>
    apiFetch<UsuarioResumen>("/api/usuarios", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export async function findUsuarioByEmail(correo: string) {
  const usuarios = await api.usuarios();
  const found = usuarios.find((item) => asString(item.correo).toLowerCase() === correo.toLowerCase());
  return found ? normalizeUsuario(found as Record<string, unknown>) : null;
}

export async function refreshCurrentUserFromBackend() {
  const current = getCurrentUser();
  if (!current?.correo) return current;
  const updated = await findUsuarioByEmail(current.correo);
  if (!updated) return current;
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export const getDemoUserId = getCurrentUserId;
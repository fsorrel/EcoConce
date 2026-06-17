export type UserLocation = {
  latitud: number;
  longitud: number;
  precisionM: number;
  timestamp: number;
};

const GPS_CACHE_KEY = "ecoconce_gps_location";
const GPS_PROMPT_DISMISSED_KEY = "ecoconce_gps_prompt_dismissed";
export const GPS_UPDATED_EVENT = "ecoconce:gps-updated";

const toRad = (value: number) => (value * Math.PI) / 180;

export const tieneCoordenadasValidas = (point: { latitud?: number; longitud?: number }) => {
  return Number.isFinite(Number(point.latitud)) && Number.isFinite(Number(point.longitud));
};

export const calcularDistanciaMetros = (
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

export const formatDistance = (meters?: number) => {
  if (meters === undefined || meters === null || !Number.isFinite(meters)) return "GPS no calculado";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
};

export function saveStoredLocation(location: UserLocation) {
  localStorage.setItem(GPS_CACHE_KEY, JSON.stringify(location));
  localStorage.removeItem(GPS_PROMPT_DISMISSED_KEY);
  window.dispatchEvent(new CustomEvent(GPS_UPDATED_EVENT, { detail: location }));
}

export function getStoredLocation(): UserLocation | null {
  const stored = localStorage.getItem(GPS_CACHE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<UserLocation>;
    if (!Number.isFinite(Number(parsed.latitud)) || !Number.isFinite(Number(parsed.longitud))) {
      localStorage.removeItem(GPS_CACHE_KEY);
      return null;
    }
    return {
      latitud: Number(parsed.latitud),
      longitud: Number(parsed.longitud),
      precisionM: Number(parsed.precisionM ?? 0),
      timestamp: Number(parsed.timestamp ?? Date.now()),
    };
  } catch {
    localStorage.removeItem(GPS_CACHE_KEY);
    return null;
  }
}

export function markGpsPromptDismissed() {
  localStorage.setItem(GPS_PROMPT_DISMISSED_KEY, "S");
}

export function wasGpsPromptDismissed() {
  return localStorage.getItem(GPS_PROMPT_DISMISSED_KEY) === "S";
}

export async function getGeoPermissionState(): Promise<PermissionState | "unsupported"> {
  if (!navigator.permissions?.query) return "unsupported";
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return permission.state;
  } catch {
    return "unsupported";
  }
}

export async function shouldShowGpsPrompt() {
  const permissionState = await getGeoPermissionState();
  const storedLocation = getStoredLocation();

  if (permissionState === "granted" && storedLocation) return false;
  if (permissionState === "denied") return true;
  if (wasGpsPromptDismissed() && storedLocation) return false;
  if (wasGpsPromptDismissed() && permissionState !== "granted") return false;
  return !storedLocation;
}

export function requestUserLocation(): Promise<UserLocation> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Tu navegador no permite usar GPS o ubicación."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precisionM: Math.round(position.coords.accuracy),
          timestamp: Date.now(),
        };
        saveStoredLocation(location);
        resolve(location);
      },
      (geoError) => {
        const mensajes: Record<number, string> = {
          1: "Permiso de ubicación denegado. Activa el permiso del navegador para usar el GPS.",
          2: "No se pudo obtener tu ubicación actual. Revisa que el GPS esté activo.",
          3: "La ubicación tardó demasiado en responder. Intenta nuevamente.",
        };
        reject(new Error(mensajes[geoError.code] ?? "No se pudo activar la ubicación."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

export async function refreshLocationIfAllowed() {
  const permissionState = await getGeoPermissionState();
  if (permissionState === "granted") {
    return requestUserLocation();
  }
  return getStoredLocation();
}

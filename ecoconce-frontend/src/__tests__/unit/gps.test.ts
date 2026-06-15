import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  tieneCoordenadasValidas,
  calcularDistanciaMetros,
  formatDistance,
  saveStoredLocation,
  getStoredLocation,
  markGpsPromptDismissed,
  wasGpsPromptDismissed,
  shouldShowGpsPrompt,
} from '../../app/lib/gps';

describe('gps Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Test 11: tieneCoordenadasValidas con valores válidos
  it('tieneCoordenadasValidas debe retornar true para coordenadas válidas', () => {
    expect(tieneCoordenadasValidas({ latitud: -36.82, longitud: -73.03 })).toBe(true);
    expect(tieneCoordenadasValidas({ latitud: 0, longitud: 0 })).toBe(true);
  });

  // Test 12: tieneCoordenadasValidas con valores inválidos
  it('tieneCoordenadasValidas debe retornar false para coordenadas inválidas', () => {
    expect(tieneCoordenadasValidas({ latitud: NaN, longitud: -73.03 })).toBe(false);
    expect(tieneCoordenadasValidas({ latitud: undefined, longitud: -73.03 })).toBe(false);
    expect(tieneCoordenadasValidas({})).toBe(false);
  });

  // Test 13: calcularDistanciaMetros para puntos conocidos
  it('calcularDistanciaMetros debe calcular la distancia usando la fórmula de Haversine', () => {
    // Puntos aproximados en Concepción
    const lat1 = -36.8268;
    const lng1 = -73.0498;
    const lat2 = -36.8201;
    const lng2 = -73.0443;
    const distancia = calcularDistanciaMetros(lat1, lng1, lat2, lng2);
    expect(distancia).toBeGreaterThan(500);
    expect(distancia).toBeLessThan(1500);
  });

  // Test 14: calcularDistanciaMetros con el mismo punto
  it('calcularDistanciaMetros debe retornar 0 si el origen y el destino son idénticos', () => {
    const lat = -36.8268;
    const lng = -73.0498;
    expect(calcularDistanciaMetros(lat, lng, lat, lng)).toBe(0);
  });

  // Test 15: formatDistance para distancias menores a 1 km
  it('formatDistance debe mostrar metros para distancias < 1000m', () => {
    expect(formatDistance(550)).toBe('550 m');
    expect(formatDistance(0)).toBe('0 m');
  });

  // Test 16: formatDistance para distancias mayores o iguales a 1 km
  it('formatDistance debe mostrar kilómetros con coma decimal para distancias >= 1000m', () => {
    expect(formatDistance(1500)).toBe('1,5 km');
    expect(formatDistance(12340)).toBe('12,3 km');
  });

  // Test 17: formatDistance para valores nulos o inválidos
  it('formatDistance debe retornar "GPS no calculado" para valores nulos o inválidos', () => {
    expect(formatDistance(undefined)).toBe('GPS no calculado');
    expect(formatDistance(NaN)).toBe('GPS no calculado');
  });

  // Test 18: saveStoredLocation y getStoredLocation
  it('saveStoredLocation debe almacenar la ubicación y getStoredLocation debe recuperarla', () => {
    const ubicacion = {
      latitud: -36.8,
      longitud: -73.0,
      precisionM: 10,
      timestamp: Date.now(),
    };

    const spyEvent = vi.fn();
    window.addEventListener('ecoconce:gps-updated', spyEvent);

    saveStoredLocation(ubicacion);

    const recuperada = getStoredLocation();
    expect(recuperada).not.toBeNull();
    expect(recuperada?.latitud).toBe(-36.8);
    expect(recuperada?.longitud).toBe(-73.0);
    expect(spyEvent).toHaveBeenCalledTimes(1);

    window.removeEventListener('ecoconce:gps-updated', spyEvent);
  });

  // Test 19: markGpsPromptDismissed y wasGpsPromptDismissed
  it('markGpsPromptDismissed debe guardar el descarte y wasGpsPromptDismissed debe confirmarlo', () => {
    expect(wasGpsPromptDismissed()).toBe(false);
    markGpsPromptDismissed();
    expect(wasGpsPromptDismissed()).toBe(true);
  });

  // Test 20: shouldShowGpsPrompt bajo varias condiciones
  it('shouldShowGpsPrompt debe retornar el booleano correcto según permisos y caché', async () => {
    // Si no hay permisos ni caché, debería mostrarse
    // Mock navigator.permissions.query
    const queryMock = vi.fn().mockResolvedValue({ state: 'prompt' });
    vi.stubGlobal('navigator', {
      permissions: {
        query: queryMock,
      },
    });

    const show = await shouldShowGpsPrompt();
    expect(show).toBe(true);
  });
});

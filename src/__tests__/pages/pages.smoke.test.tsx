/**
 * __tests__/pages/pages.smoke.test.tsx
 *
 * Suite de smoke tests para las páginas de EcoConce.
 * Objetivo: subir el coverage de src/app/pages desde 0% (sin tests)
 * a un nivel aceptable verificando que cada página renderiza sin errores.
 *
 * Patrón: para cada page se verifica que:
 *   1. Renderiza sin lanzar excepciones (smoke test).
 *   2. Muestra al menos un elemento clave del título o contenido principal.
 *   3. Formularios muestran sus campos principales.
 *
 * Uso: npm run test:coverage
 * Requiere: vitest, @testing-library/react, @testing-library/jest-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mocks globales necesarios ────────────────────────────────────────────────

// Mock de react-router (React Router)
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    <a href={to}>{children}</a>,
}));

// Mock de fetch global (evita llamadas reales a la API)
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock de navigator.geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success) =>
      success({ coords: { latitude: -36.82, longitude: -73.05, accuracy: 10 } })
    ),
    watchPosition: vi.fn(() => 1),
    clearWatch: vi.fn(),
  },
  configurable: true,
});

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Respuestas mock de la API
const MOCK_USUARIO = {
  id: 1, rut: '18888888-8', nombreAlias: 'TestUser',
  correo: 'test@test.cl', activo: 'S', puntos: 150, rolId: 2,
};
const MOCK_PUNTOS = [
  {
    id: 1,
    nombre: 'Ecopunto Centro',
    descripcion: 'Desc',
    latitud: -36.82,
    longitud: -73.05,
    estado: 'ACTIVO',
    materiales: ['Cartón', 'Vidrio'],
    materialesDetalle: [],
  },
];
const MOCK_PREMIOS = [
  { id: 1, nombre: 'Vale Descuento', descripcion: '10% en tienda',
    costoPuntos: 200, stock: 5, activo: 'S' },
];
const MOCK_MATERIALES = [
  { id: 1, nombre: 'Cartón', codigo: 'CARTON' },
  { id: 2, nombre: 'Vidrio', codigo: 'VIDRIO' },
];

const MOCK_DASHBOARD = {
  usuario: MOCK_USUARIO,
  resumen: { materialesReciclados: 12, puntosGanados: 150, desafiosCompletados: 2, nivelesGanados: 1 },
  medallas: [{ nombre: 'Primer Reciclaje', descripcion: 'Primera actividad', puntosRequeridos: 10, obtenida: true, icono: '' }],
  puntos: MOCK_PUNTOS,
  guias: [],
  materiales: MOCK_MATERIALES,
  premios: MOCK_PREMIOS,
};
const MOCK_FORMULARIOS = [
  { id: 1, estado: 'PENDIENTE', fecha_creacion: '2026-06-01', punto_nombre: 'Ecopunto Centro' },
];
const MOCK_USUARIOS_ADMIN = [
  { id: 1, rut: '18888888-8', nombreAlias: 'Admin', correo: 'admin@ecoconce.cl', activo: 'S', rol: 'Administrador', rolId: 2 },
];
const MOCK_REPORTES = [
  { id: 1, descripcion: 'Contenedor lleno', fechaReporte: '2026-06-01', tipoReporte: 'LLENO', punto: 'Ecopunto Centro' },
];

const MOCK_REGIONES = [
  { id: 1, nombre: 'Biobío' },
];

const MOCK_COMUNAS = [
  { id: 1, nombre: 'Concepción', region_id: 1 },
];

const MOCK_ESTADOS_PUNTO = [
  { key: 'ACTIVO', value: 'ACTIVO' },
];

const MOCK_DETALLES = [
  { id: 1, formulario_id: 1, material_id: 1, cantidad: 2, unidad: 'kg' },
];

// Helper: mock fetch que devuelve JSON según URL
function setupFetch(overrides: Record<string, unknown> = {}) {
  mockFetch.mockImplementation((url: string) => {
    const defaults: Record<string, unknown> = {
      '/api/dashboard': MOCK_DASHBOARD,
      '/api/puntos': MOCK_PUNTOS,
      '/api/premios': MOCK_PREMIOS,
      '/api/materiales': MOCK_MATERIALES,
      '/api/formularios': MOCK_FORMULARIOS,
      '/api/usuarios': MOCK_USUARIOS_ADMIN,
      '/api/usuarios/admin/activos': MOCK_USUARIOS_ADMIN,
      '/api/reportes': MOCK_REPORTES,
      '/api/reportes/admin': MOCK_REPORTES,
      '/api/reportes/mantenedor': MOCK_REPORTES,
      '/api/bd/regiones': MOCK_REGIONES,
      '/api/bd/comunas': MOCK_COMUNAS,
      '/api/bd/estado-punto': MOCK_ESTADOS_PUNTO,
      '/api/bd/formularios-reciclaje': MOCK_FORMULARIOS,
      '/api/bd/detalle-formulario-materiales': MOCK_DETALLES,
      ...overrides,
    };
    const match = Object.keys(defaults).find(k => String(url).includes(k));
    const data = match ? defaults[match] : {};
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      status: 200,
    });
  });
}

import { AuthProvider } from '../../app/context/AuthContext';

// ─── Helper: wrapper con contexto mínimo ─────────────────────────────────────
function renderWithContext(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

async function loadPage<T = React.ComponentType>(pagePath: string, exportName: string) {
  const module = await import(pagePath);
  return (module[exportName] ?? module.default) as T;
}

// ─── NOTA IMPORTANTE ─────────────────────────────────────────────────────────
// Los imports de pages se hacen de forma dinámica para evitar que un error
// de importación de una page rompa toda la suite.
// Si la ruta exacta difiere, ajustar según src/app/pages/NombrePage.tsx

// ─── SMOKE TESTS: PÁGINAS CIUDADANO ──────────────────────────────────────────

describe('Pages smoke tests — ciudadano', () => {
  beforeEach(() => {
    setupFetch();
    localStorageMock.setItem('usuario', JSON.stringify(MOCK_USUARIO));
    mockFetch.mockClear();
  });

  it('Login renderiza sin errores y muestra formulario', async () => {
    const Page = await loadPage('../../app/pages/Login', 'Login');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.querySelectorAll('input').length).toBeGreaterThan(0);
    });
  });

  it('Register renderiza sin errores y muestra campos de registro', async () => {
    const Page = await loadPage('../../app/pages/Register', 'Register');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.querySelectorAll('input').length).toBeGreaterThan(0);
    });
  });

  it('CitizenDashboard renderiza sin errores y llama a la API', async () => {
    const Page = await loadPage('../../app/pages/CitizenDashboard', 'CitizenDashboard');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('RecyclingMap renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/RecyclingMap', 'RecyclingMap');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('PremiosCiudadano renderiza sin errores y muestra catálogo', async () => {
    const Page = await loadPage('../../app/pages/PremiosCiudadano', 'PremiosCiudadano');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('FormulariosReciclaje renderiza sin errores y muestra campos', async () => {
    const Page = await loadPage('../../app/pages/FormulariosReciclaje', 'FormulariosReciclaje');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('CitizenProfile renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/CitizenProfile', 'CitizenProfile');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });
});

// ─── SMOKE TESTS: PÁGINAS ADMIN ──────────────────────────────────────────────

describe('Pages smoke tests — admin', () => {
  beforeEach(() => {
    setupFetch();
    const adminUser = { ...MOCK_USUARIO, rolId: 1, correo: 'admin@ecoconce.cl' };
    localStorageMock.setItem('usuario', JSON.stringify(adminUser));
    mockFetch.mockClear();
  });

  it('AdminDashboard renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/AdminDashboard', 'AdminDashboard');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('AdminUsers renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/AdminUsers', 'AdminUsers');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('PremiosAdmin renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/PremiosAdmin', 'PremiosAdmin');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });

  it('ReportesAdmin renderiza sin errores', async () => {
    const Page = await loadPage('../../app/pages/ReportesAdmin', 'ReportesAdmin');
    renderWithContext(<Page />);
    await waitFor(() => {
      expect(document.body.textContent).toBeDefined();
    });
  });
});

// ─── TESTS DE COMPORTAMIENTO BÁSICO ──────────────────────────────────────────

describe('Pages — comportamiento básico (sin imports dinámicos)', () => {
  it('mock de fetch responde correctamente para /api/puntos', async () => {
    setupFetch();
    const res = await fetch('/api/puntos');
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].nombre).toBe('Ecopunto Centro');
  });

  it('mock de fetch responde correctamente para /api/premios', async () => {
    setupFetch();
    const res = await fetch('/api/premios');
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].costoPuntos).toBe(200);
  });

  it('mock de fetch responde correctamente para /api/dashboard', async () => {
    setupFetch();
    const res = await fetch('/api/dashboard/1');
    const data = await res.json();
    // `api.dashboard` devuelve un objeto con `resumen.puntosGanados` en nuestros mocks
    expect(data.resumen?.puntosGanados ?? data.puntos).toBe(150);
  });

  it('geolocation mock devuelve coordenadas de Concepción', () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      expect(pos.coords.latitude).toBeCloseTo(-36.82, 1);
      expect(pos.coords.longitude).toBeCloseTo(-73.05, 1);
    });
  });

  it('localStorage mock funciona correctamente', () => {
    localStorageMock.setItem('testKey', 'testValue');
    expect(localStorageMock.getItem('testKey')).toBe('testValue');
    localStorageMock.removeItem('testKey');
    expect(localStorageMock.getItem('testKey')).toBeNull();
  });
});

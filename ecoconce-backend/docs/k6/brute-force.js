import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 20,
  rampUp: '0s',
};

export default function () {
  const url = 'http://localhost:8081/api/usuarios/login';
  const attempt = __ITER + 1;

  const payload = JSON.stringify({
    correo: 'admin@ecoconce.cl',
    contrasena: `wrong_password_attempt_${attempt}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Validar que cada intento fallido devuelva 401
  const result = check(res, {
    [`Intento ${attempt}: Status es 401`]: (r) => r.status === 401,
    [`Intento ${attempt}: No devuelve token`]: (r) => !r.body.includes('token') || r.status !== 200,
  });

  if (!result) {
    console.log(
      `❌ ALERTA - Intento ${attempt}: Status ${res.status} (esperado 401)`
    );
  } else {
    console.log(`✅ Intento ${attempt}: 401 OK`);
  }

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'ecoconce-backend/docs/k6/brute-force-results.json': JSON.stringify(data),
  };
}

// Función para imprimir resumen formateado
function textSummary(data, options) {
  const { passes, fails } = data.metrics.checks.values || { passes: 0, fails: 0 };
  const summary = `
  ╔═══════════════════════════════════════════════════╗
  ║         RESULTADO DE PRUEBA DE FUERZA BRUTA      ║
  ╠═══════════════════════════════════════════════════╣
  ║ Total de iteraciones: 20                          ║
  ║ Intentos con status 401: ${passes}                 ║
  ║ Intentos con status diferente: ${fails}           ║
  ║ Resultado: ${fails === 0 ? '✅ SEGURO - Sin vulnerabilidades de fuerza bruta detectadas' : '🚨 ALERTA - Posible vulnerabilidad'} ║
  ╚═══════════════════════════════════════════════════╝
  `;
  return summary;
}

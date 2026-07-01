// load-test.js — carga normal sostenida (RNF02: p95 < 2s)
//
// Ejecutar (con backend en localhost:8080 y tokens válidos):
//   k6 run -e TOKEN_CIUDADANO=<jwt> -e TOKEN_ADMIN=<jwt> docs/k6/load-test.js
//
// Mide el tiempo de respuesta de los flujos más usados (mapa, guías, premios,
// listado de usuarios admin) bajo 20 usuarios concurrentes durante 5 minutos.

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const TOKEN_CIUDADANO = __ENV.TOKEN_CIUDADANO || "REEMPLAZAR";
const TOKEN_ADMIN = __ENV.TOKEN_ADMIN || "REEMPLAZAR";

const responseTime = new Trend("response_time_ms");

export const options = {
  stages: [
    { duration: "1m", target: 20 }, // rampa de subida
    { duration: "3m", target: 20 }, // carga sostenida
    { duration: "1m", target: 0 },  // bajada
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // RNF02: 95% de peticiones < 2s
    http_req_failed: ["rate<0.01"],    // menos del 1% de errores
  },
};

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export default function () {
  // Flujo ciudadano: ver mapa (público), ver guías, ver premios
  const puntos = http.get(`${BASE_URL}/api/puntos`);
  check(puntos, { "puntos 200": (r) => r.status === 200 });
  responseTime.add(puntos.timings.duration);
  sleep(1);

  const guias = http.get(`${BASE_URL}/api/guias`, { headers: headers(TOKEN_CIUDADANO) });
  check(guias, { "guias 200": (r) => r.status === 200 });
  responseTime.add(guias.timings.duration);
  sleep(1);

  const premios = http.get(`${BASE_URL}/api/premios`, { headers: headers(TOKEN_CIUDADANO) });
  check(premios, { "premios 200": (r) => r.status === 200 });
  responseTime.add(premios.timings.duration);
  sleep(1);

  // Flujo admin: ver usuarios activos
  const usuarios = http.get(`${BASE_URL}/api/usuarios/admin/activos`, { headers: headers(TOKEN_ADMIN) });
  check(usuarios, { "usuarios 200": (r) => r.status === 200 });
  responseTime.add(usuarios.timings.duration);
  sleep(2);
}

// stress-test.js — encontrar el punto de saturación del sistema
//
// Ejecutar:
//   k6 run docs/k6/stress-test.js
//
// Sube la carga por escalones (50 → 300 VUs) sobre el endpoint público del mapa.
// El punto de saturación es el escalón donde p95 cruza 2s o http_req_failed > 5%.
// Reportar ese número de VUs en el informe como "capacidad máxima observada".

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  stages: [
    { duration: "2m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 300 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"], // toleramos 5s bajo stress
    http_req_failed: ["rate<0.10"],    // alertamos si supera 10% de errores
  },
};

export default function () {
  const r = http.get(`${BASE_URL}/api/puntos`);
  check(r, { "status 200": (res) => res.status === 200 });
  sleep(0.5);
}

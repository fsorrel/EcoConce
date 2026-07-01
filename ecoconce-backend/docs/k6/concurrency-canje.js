// concurrency-canje.js — canjes simultáneos del mismo premio (Optimistic Locking)
//
// Ejecutar (PREMIO_ID debe tener stock = 1 para forzar el conflicto):
//   k6 run -e TOKEN_CIUDADANO=<jwt> -e PREMIO_ID=1 -e USUARIO_ID=2 docs/k6/concurrency-canje.js
//
// 10 VUs intentan canjear el mismo premio a la vez. Con @Version en Premio,
// solo 1 debe tener éxito (200); el resto debe recibir 409 (conflicto de
// concurrencia) o 400 (stock agotado). Nunca debe haber un 500 inesperado
// ni stock negativo.
//
// Nota: NO se envía Idempotency-Key a propósito — aquí queremos que las
// peticiones compitan de verdad por el stock. La idempotencia se prueba por
// separado repitiendo la MISMA Idempotency-Key (debe devolver el mismo canje).

import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const TOKEN = __ENV.TOKEN_CIUDADANO || "REEMPLAZAR";
const PREMIO_ID = __ENV.PREMIO_ID || "1";
const USUARIO_ID = __ENV.USUARIO_ID || "1";

export const options = {
  vus: 10,
  iterations: 10, // 10 intentos simultáneos sobre el mismo premio
};

export default function () {
  const r = http.post(
    `${BASE_URL}/api/premios/${PREMIO_ID}/canjear?usuarioId=${USUARIO_ID}`,
    null,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );

  check(r, {
    "canje exitoso o stock agotado": (res) =>
      res.status === 200 || res.status === 409 || res.status === 400,
    "no hay 500 inesperado": (res) => res.status !== 500,
  });
}

# Resultados de ejecución k6 — 3 de julio de 2026

Ejecución de los 4 scripts de `docs/k6/` contra el backend real (HTTP), registrando
la evidencia cuantitativa pendiente de **RNF02** (tiempo de respuesta), **RNF05**
(integridad ante concurrencia) y **RNF14** (resistencia a fuerza bruta).

## Ambiente de ejecución

| Ítem | Valor |
|---|---|
| Fecha | 2026-07-03 |
| Backend | Spring Boot 3.3.5, puerto 8081, perfil por defecto (H2 in-memory modo Oracle + DataSeeder) |
| Herramienta | k6 v0.57.0 (windows/amd64) |
| Autenticación | Tokens JWT reales obtenidos vía `POST /api/usuarios/login` |
| Hardware | Equipo local de desarrollo (Windows 11) |

## 1. load-test.js — RNF02 (p95 < 2 s) ✅ PASS

20 VUs sostenidos durante 5 minutos sobre los flujos más usados
(mapa de puntos, guías, premios, usuarios admin).

| Métrica | Resultado | Umbral |
|---|---|---|
| Requests totales | 3.884 (12,9 req/s) | — |
| Checks | **100% (3.884/3.884)** | — |
| `http_req_failed` | **0,00%** | < 1% ✅ |
| `http_req_duration` p95 | **12,27 ms** | < 2.000 ms ✅ |
| p90 / med / max | 10,15 ms / 5,01 ms / 32,4 ms | — |

**Conclusión:** RNF02 verificado con holgura de ~160× sobre el umbral.

## 2. stress-test.js — punto de saturación ✅ PASS

Rampa 50 → 100 → 200 → 300 VUs durante 10 minutos sobre `GET /api/puntos`.

| Métrica | Resultado | Umbral |
|---|---|---|
| Requests totales | **153.397 (255,6 req/s)** | — |
| Checks (status 200) | **100% (153.397/153.397)** | — |
| `http_req_failed` | **0,00%** | < 10% ✅ |
| `http_req_duration` p95 | **17,84 ms** | < 5.000 ms ✅ |

**Conclusión:** no se alcanzó el punto de saturación ni con 300 usuarios
concurrentes; el backend se mantuvo estable sin errores. Para la escala objetivo
del proyecto, el rendimiento es más que suficiente.

## 3. concurrency-canje.js — RNF05 (Optimistic Locking bajo tráfico real) ✅ PASS

10 VUs canjean **simultáneamente** el mismo premio con `stock = 1`
(premio creado ad-hoc: id 4, costo 10, stock 1). Sin Idempotency-Key,
para que las solicitudes compitan de verdad por el stock.

| Verificación | Resultado |
|---|---|
| Canjes exitosos (HTTP 200) | **1** |
| Rechazos controlados (HTTP 409/400) | **9** |
| Errores 500 inesperados | **0** |
| Checks | 100% (20/20) |
| **Stock final en BD** | **0** (nunca negativo, sin sobreventa) |

**Conclusión:** `@Version` (bloqueo optimista) funciona bajo tráfico HTTP
concurrente real: exactamente un canje ganó, el resto recibió rechazo controlado.

## 4. brute-force.js — RNF14 (fuerza bruta en login) ✅ PASS

20 intentos consecutivos de login con contraseñas incorrectas sobre la
cuenta admin.

| Verificación | Resultado |
|---|---|
| Intentos rechazados con HTTP 401 | **20/20** |
| Tokens emitidos | **0** |

**Conclusión:** ninguna combinación incorrecta autentica; no se filtra token.

## Verificaciones manuales adicionales (misma sesión)

| Caso | Resultado |
|---|---|
| P-08: `actualCompactado > capacidadCompactado` → | **HTTP 400** «La cantidad actual no puede superar la capacidad compactada» (antes 500; corregido con el handler de `HandlerMethodValidationException`) |
| U-08: modificar administrador original → | **HTTP 400** «No se puede modificar el administrador original» |
| PR-07: canje con stock 0 → | **HTTP 400** «El premio no tiene stock» |

## Comandos utilizados

```bash
k6 run docs/k6/brute-force.js
k6 run -e BASE_URL=http://localhost:8081 -e TOKEN_CIUDADANO=<jwt> \
       -e PREMIO_ID=4 -e USUARIO_ID=1 docs/k6/concurrency-canje.js
k6 run -e BASE_URL=http://localhost:8081 -e TOKEN_CIUDADANO=<jwt> \
       -e TOKEN_ADMIN=<jwt> docs/k6/load-test.js
k6 run -e BASE_URL=http://localhost:8081 docs/k6/stress-test.js
```

> Nota: la ejecución se realizó sobre H2 in-memory (perfil de pruebas, mismo
> esquema que Oracle). Los tiempos absolutos sobre Oracle 21c local pueden variar
> levemente, pero el margen respecto a los umbrales (160×) hace la conclusión
> robusta para RNF02/RNF05.

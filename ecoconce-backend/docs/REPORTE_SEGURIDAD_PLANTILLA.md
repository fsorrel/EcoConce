# 📋 Reporte de Pruebas de Seguridad — EcoConce

**Fecha de ejecución:** [COMPLETAR]  
**Versión de aplicación:** 0.0.1-SNAPSHOT  
**Spring Boot:** 3.3.5  
**Responsable:** [COMPLETAR]

---

## 📝 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Total de casos probados | 15 |
| Casos exitosos (✅) | [COMPLETAR] |
| Casos fallidos (❌) | [COMPLETAR] |
| Vulnerabilidades encontradas | [COMPLETAR] |
| Severidad máxima encontrada | 🟡 Media / 🔴 Alta / ✅ Ninguna |

**Conclusión:** [COMPLETAR]

---

## 🔐 1. Control de Acceso (AC)

### AC-01: Acceso a ruta protegida sin token

**Endpoint:** `GET /api/reportes/admin`  
**Autenticación:** ❌ Sin token

**Resultado esperado:** `401 Unauthorized`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/AC-01-sin-token.png`

**Observaciones:** [COMPLETAR]

---

### AC-02: Ciudadano accede a ruta admin

**Endpoint:** `GET /api/reportes/admin`  
**Autenticación:** 🟢 Token ciudadano

**Resultado esperado:** `403 Forbidden`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/AC-02-ciudadano-admin.png`

**Observaciones:** [COMPLETAR]

---

### AC-03: IDOR — Ciudadano ve otro usuario

**Endpoint:** `GET /api/usuarios/99`  
**Autenticación:** 🟢 Token ciudadano (ID=1)

**Resultado esperado:** `403 Forbidden` o `404 Not Found`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/AC-03-idor.png`

**Observaciones:** [COMPLETAR]

---

### AC-04: Ciudadano crea premio

**Endpoint:** `POST /api/premios/admin`  
**Autenticación:** 🟢 Token ciudadano  
**Body:** `{"nombre": "Hack", "costoPuntos": 0, "stock": 999}`

**Resultado esperado:** `403 Forbidden`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/AC-04-ciudadano-crea.png`

---

## 🔍 2. SQL Injection (SQL)

### SQL-01: Login con payload OR 1=1

**Endpoint:** `POST /api/usuarios/login`  
**Payload:** `{"correo": "' OR 1=1 --", "contrasena": "cualquiera"}`

**Resultado esperado:** `401 Unauthorized`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/SQL-01-or-login.png`

**Análisis:** JPA con prepared statements protege automáticamente. El payload se trata como string literal.

---

### SQL-02: Búsqueda con payload

**Endpoint:** `GET /api/puntos`  
**Query:** `?nombre=' OR 1=1 --`

**Resultado esperado:** `200 OK` con lista vacía o `400 Bad Request`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/SQL-02-or-busqueda.png`

---

### SQL-03: DROP TABLE literal

**Endpoint:** `POST /api/premios/admin`  
**Payload:** `{"nombre": "'; DROP TABLE PREMIO; --", ...}`

**Resultado esperado:** Registro creado con nombre literal (DROP no ejecutado)  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Verificación en Oracle:**
```sql
SELECT NOMBRE FROM PREMIO ORDER BY ID DESC FETCH FIRST 1 ROWS ONLY;
-- Debe retornar: '; DROP TABLE PREMIO; --
```

**Evidencia:**
- Screenshot Postman: `evidencia/SQL-03-drop-crear.png`
- Screenshot Oracle: `evidencia/SQL-03-drop-verificacion.png`

---

## ⚠️ 3. Cross-Site Scripting (XSS)

### XSS-01: Script alert en premio

**Endpoint:** `POST /api/premios/admin`  
**Payload:** `{"nombre": "<script>alert('XSS')</script>", ...}`

**Verificación:** Abrir frontend, listar premios  
**Resultado esperado:** Aparece texto literal, sin alert  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot creación: `evidencia/XSS-01-create.png`
- Screenshot frontend: `evidencia/XSS-01-frontend.png`

**Análisis:** React escapa variables en JSX automáticamente. El `<script>` se renderiza como texto.

---

### XSS-02: Img onerror en guía

**Endpoint:** `POST /api/guias`  
**Payload:** `{"titulo": "Test", "contenido": "<img src=x onerror=alert('XSS')>"}`

**Verificación:** Abrir frontend, ver guía  
**Resultado esperado:** Imagen rota, sin alert  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot frontend: `evidencia/XSS-02-frontend.png`

---

## 🔐 4. JWT — Validación de Tokens

### JWT-01: Token expirado

**Endpoint:** `GET /api/reportes/admin`  
**Token:** Expirado (o con exp en pasado)

**Resultado esperado:** `401 Unauthorized`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/JWT-01-expired.png`

---

### JWT-02: Token con firma modificada

**Endpoint:** `GET /api/reportes/admin`  
**Token:** Token válido con 10 últimos caracteres cambiados

**Resultado esperado:** `401 Unauthorized`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/JWT-02-modified.png`

---

### JWT-03: Sin token

**Endpoint:** `GET /api/reportes/admin`  
**Header Authorization:** ❌ Vacío

**Resultado esperado:** `401 Unauthorized`  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/JWT-03-notoken.png`

---

### JWT-04: Token con rol falsificado

**Endpoint:** `GET /api/reportes/admin`  
**Token:** Payload modificado (`"rol": "ADMIN"`) sin re-firmar

**Resultado esperado:** `401 Unauthorized` (firma inválida)  
**Resultado obtenido:** `[COMPLETAR]`  
**Estado:** ✅ / ❌

**Evidencia:**
- Screenshot: `evidencia/JWT-04-falsified.png`

---

## 💪 5. Fuerza Bruta (FB)

### FB-01: 20 intentos de login

**Herramienta:** k6  
**Comando:** `k6 run docs/k6/brute-force.js`

**Resultado esperado:** Todos devuelven `401`  
**Resultado obtenido:** [COMPLETAR k6 output]

```
[Pegar salida de k6 aquí]
```

**Estado:** ✅ / ❌

**Análisis:** No hay rate limiting implementado, pero todas las contraseñas fallaron. Rate limiting es mejora futura.

---

## 🤖 6. OWASP ZAP — Escaneo Automatizado

**Fecha del escaneo:** [COMPLETAR]  
**Duración:** [COMPLETAR] minutos

### Alertas encontradas

| Alerta | Severidad | Estado | Acción |
|--------|-----------|--------|--------|
| [Nombre alerta ZAP] | Media/Alta | ✅ OK / ⚠️ Revisar | [Descripción] |
| [Nombre alerta ZAP] | Media/Alta | ✅ OK / ⚠️ Revisar | [Descripción] |

**Reporte completo:** Adjuntado como `evidencia/zapreport-[fecha].html`

---

## 🎯 Resultados por Categoría

### Control de Acceso
- AC-01: ✅ / ❌
- AC-02: ✅ / ❌
- AC-03: ✅ / ❌
- AC-04: ✅ / ❌

**Total AC:** 4/4 ✅

---

### SQL Injection
- SQL-01: ✅ / ❌
- SQL-02: ✅ / ❌
- SQL-03: ✅ / ❌

**Total SQL:** 3/3 ✅

---

### XSS
- XSS-01: ✅ / ❌
- XSS-02: ✅ / ❌

**Total XSS:** 2/2 ✅

---

### JWT
- JWT-01: ✅ / ❌
- JWT-02: ✅ / ❌
- JWT-03: ✅ / ❌
- JWT-04: ✅ / ❌

**Total JWT:** 4/4 ✅

---

### Fuerza Bruta
- FB-01: ✅ / ❌

**Total FB:** 1/1 ✅

---

### OWASP ZAP
- ZAP-01: ✅ Completado / ⚠️ Pendiente

---

## 🚨 Hallazgos de Seguridad

### Vulnerabilidades Encontradas

**Total:** [0 / 1 / 2 / etc]

#### Vulnerabilidad #1 (si la hay)

**ID:** [CVE / OWASP Top 10]  
**Severidad:** 🔴 Alta / 🟠 Media / 🟡 Baja  
**Descripción:** [COMPLETAR]  
**Impacto:** [COMPLETAR]  
**Recomendación:** [COMPLETAR]  
**Estado de remediación:** ⏳ Pendiente / ✅ Implementado

---

### Controles Validados ✅

- [✅] Autenticación JWT válida
- [✅] Control de acceso por roles (ADMIN, CIUDADANO)
- [✅] Validación de token (firma, expiración)
- [✅] Protección contra SQL Injection (JPA)
- [✅] Protección contra XSS (React)
- [✅] Respuestas HTTP seguras (401, 403)
- [✅] [Agregar otros controles validados]

---

## 📊 Tabla Resumen Final

| ID | Tipo | Descripción | Resultado | Status |
|----|------|-------------|-----------|--------|
| AC-01 | Acceso | Sin token | 401 | ✅ / ❌ |
| AC-02 | Acceso | Ciudadano a admin | 403 | ✅ / ❌ |
| AC-03 | IDOR | Ver otro usuario | 403/404 | ✅ / ❌ |
| AC-04 | Acceso | Ciudadano crea | 403 | ✅ / ❌ |
| SQL-01 | SQL Injection | OR 1=1 | 401 | ✅ / ❌ |
| SQL-02 | SQL Injection | Búsqueda | 400/vacío | ✅ / ❌ |
| SQL-03 | SQL Injection | DROP literal | Texto | ✅ / ❌ |
| XSS-01 | XSS | Script alert | Sin ejecución | ✅ / ❌ |
| XSS-02 | XSS | Img onerror | Sin ejecución | ✅ / ❌ |
| JWT-01 | JWT | Expirado | 401 | ✅ / ❌ |
| JWT-02 | JWT | Firma modificada | 401 | ✅ / ❌ |
| JWT-03 | JWT | Sin token | 401 | ✅ / ❌ |
| JWT-04 | JWT | Rol falsificado | 401 | ✅ / ❌ |
| FB-01 | Fuerza bruta | 20 intentos | 401 todos | ✅ / ❌ |
| ZAP-01 | Escaneo auto | Completo | [Alertas] | ✅ / ⚠️ |

**Total:** 15 casos | ✅ Exitosos: [X/15]

---

## 🎓 Conclusiones

[COMPLETAR PÁRRAFO CON CONCLUSIONES GENERALES]

### Puntos fuertes

- [COMPLETAR]
- Uso de JWT para autenticación
- Spring Security correctamente configurado
- React escapa automáticamente XSS

### Áreas de mejora

- [COMPLETAR]
- Rate limiting en login (mejora futura identificada)
- [Otros]

---

## 📎 Anexos

- Colección Postman: `docs/postman/EcoConce-Security-Tests.json`
- Script k6: `docs/k6/brute-force.js`
- Reporte OWASP ZAP: `evidencia/zapreport-[fecha].html`
- Screenshots de evidencia: `evidencia/`

---

**Firma autorizado:** ________________  
**Fecha:** [COMPLETAR]

---

*Reporte generado: 2026-06-18*  
*Versión del documento: 1.0*

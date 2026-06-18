# EcoConce — Pruebas de Seguridad (OWASP)

**Prioridad:** 🔴 Alta — ejecutar después de implementar JWT  
**Fecha creación:** 2026-06-18  
**Estado:** Listo para ejecutar

---

## 🚀 Inicio rápido

### 1. Importar colección Postman

1. Abrir Postman
2. Click en "Import"
3. Cargar archivo: `ecoconce-backend/docs/postman/EcoConce-Security-Tests.json`
4. Click "Import"

### 2. Configurar variables de entorno en Postman

En Postman, crear un nuevo Environment "EcoConce Security" con estas variables:

```
base_url = http://localhost:8081
token_admin = (se genera en la primera llamada a login)
token_ciudadano = (se genera en la segunda llamada)
```

**Importante:** Las primeras dos peticiones de la colección actualizan estos tokens automáticamente.

### 3. Ejecutar pruebas

- **Manuales (AC, SQL, XSS, JWT):** Ejecutar cada request en Postman y capturar screenshot
- **Fuerza bruta (FB-01):** Ejecutar script k6: `k6 run docs/k6/brute-force.js`
- **Escaneo automatizado (ZAP):** Descargar OWASP ZAP y ejecutar Automated Scan

---

## 📋 Pruebas por categoría

### 1. Control de Acceso (IDOR + Broken Access Control)

| ID | Descripción | Método | URL | Auth | Resultado esperado |
|----|---|---|---|---|---|
| AC-01 | Admin sin token | GET | `/api/reportes/admin` | ❌ | 401 Unauthorized |
| AC-02 | Ciudadano a ruta admin | GET | `/api/reportes/admin` | Ciudadano | 403 Forbidden |
| AC-03 | IDOR: ver otro usuario | GET | `/api/dashboard/99` | Ciudadano (ID=1) | 403 o 404 |
| AC-04 | Ciudadano crea premio | POST | `/api/premios/admin` | Ciudadano | 403 Forbidden |

**Documentación:** Captura de Postman con URL, headers y status code para cada caso.

---

### 2. SQL Injection

| ID | Descripción | Payload | Resultado esperado |
|----|---|---|---|
| SQL-01 | Login con OR 1=1 | `"correo": "' OR 1=1 --"` | 401 Unauthorized |
| SQL-02 | Búsqueda con payload | URL: `?nombre=' OR 1=1 --` | 200 vacío o 400 |
| SQL-03 | Crear registro con DROP | `"nombre": "'; DROP TABLE PREMIO; --"` | Guardado como texto literal |

**Verificación SQL-03 en Oracle:**
```sql
SELECT NOMBRE FROM PREMIO ORDER BY ID DESC FETCH FIRST 1 ROWS ONLY;
-- Debe mostrar el string completo, no ejecutar el DROP
```

**Herramienta:** Postman + Oracle SQL Developer

---

### 3. Cross-Site Scripting (XSS)

| ID | Descripción | Payload | Verificación | Resultado esperado |
|----|---|---|---|---|
| XSS-01 | Script en nombre | `"<script>alert('XSS')</script>"` | Listar premios en UI | Sin alert (React escapa) |
| XSS-02 | Img onerror en guía | `"<img src=x onerror=alert('XSS')>"` | Ver guía en UI | Sin alert (React escapa) |

**Cómo React protege:**
- Variables en JSX se escapan automáticamente
- ✅ `<p>{nombre}</p>` → escapa
- ❌ `<p dangerouslySetInnerHTML={{__html: nombre}} />` → NO escapar (nunca usar)

**Herramienta:** Postman + navegador Firefox/Chrome

---

### 4. JWT — Validación de tokens

| ID | Descripción | Setup | Resultado esperado |
|----|---|---|---|
| JWT-01 | Token expirado | Generar token, esperar 31 min (o modificar exp en código) | 401 Unauthorized |
| JWT-02 | Firma modificada | Cambiar 1 carácter del payload (parte central del JWT) | 401 Unauthorized |
| JWT-03 | Sin token | Omitir header Authorization | 401 Unauthorized |
| JWT-04 | Rol falsificado | Cambiar payload sin re-firmar | 401 Unauthorized |

**Herramienta:** Postman + jwt.io (para decodificar)

---

### 5. Fuerza Bruta en Login

**Caso FB-01:** Ejecutar 20 intentos de login con contraseñas inválidas

```bash
cd ecoconce-backend
k6 run docs/k6/brute-force.js
```

**Resultado esperado:** Todos devuelven 401  
**Nota:** Sin rate limiting actual (mejora futura identificada)

---

### 6. OWASP ZAP — Escaneo Automatizado

1. Descargar: https://www.zaproxy.org/download/
2. Abrir ZAP
3. Click "Automated Scan"
4. URL: `http://localhost:8081`
5. Click "Attack" (esperar 5-10 min)
6. Revisar pestaña "Alerts"
7. Exportar reporte: Report → Generate Report → HTML

**Alertas esperadas y respuestas:**

| Alerta | Severidad | Estado | Acciones |
|--------|-----------|--------|----------|
| Missing Anti-clickjacking Header | Media | ✅ Implementado | `headers.frameOptions(frame -> frame.deny())` |
| X-Content-Type-Options Header Missing | Baja | ⚠️ Agregar | Ver instrucciones abajo |
| SQL Injection | Alta | ✅ Protegido | JPA usa prepared statements |
| XSS | Alta | ✅ Protegido | React escapa por defecto |
| Application Error Disclosure | Media | ✅ Implementado | ApiExceptionHandler maneja errores |

**Agregar header X-Content-Type-Options:**

En `src/main/java/cl/ecoconce/config/SecurityConfig.java`:

```java
.headers(headers -> headers
    .frameOptions(frame -> frame.deny())
    .contentTypeOptions(Customizer.withDefaults())  // Agregar esta línea
)
```

---

## 📊 Tabla resumen de todos los casos

| ID | Tipo | Descripción | Resultado esperado | Herramienta | Severidad |
|----|------|-------------|-------------------|-------------|-----------|
| AC-01 | Acceso | Admin sin token | 401 | Postman | 🔴 Alta |
| AC-02 | Acceso | Ciudadano a admin | 403 | Postman | 🔴 Alta |
| AC-03 | IDOR | Ver otro usuario | 403/404 | Postman | 🔴 Alta |
| AC-04 | Acceso | Ciudadano crea | 403 | Postman | 🔴 Alta |
| SQL-01 | Inyección | OR 1=1 en login | 401 | Postman | 🟡 Media |
| SQL-02 | Inyección | OR 1=1 en búsqueda | 400/vacío | Postman | 🟡 Media |
| SQL-03 | Inyección | DROP TABLE literal | Texto, no ejecutado | Postman+Oracle | 🟡 Media |
| XSS-01 | XSS | Script en premio | Sin ejecución | Postman+Browser | 🔴 Alta |
| XSS-02 | XSS | onerror en guía | Sin ejecución | Postman+Browser | 🔴 Alta |
| JWT-01 | Token | Expirado | 401 | Postman | 🔴 Alta |
| JWT-02 | Token | Firma inválida | 401 | Postman | 🔴 Alta |
| JWT-03 | Token | Sin token | 401 | Postman | 🔴 Alta |
| JWT-04 | Token | Rol falsificado | 401 | Postman | 🔴 Alta |
| FB-01 | Fuerza bruta | 20 intentos | 401 todos | k6 | 🟠 Baja |
| ZAP-01 | Escaneo auto | Full scan | Reporte HTML | OWASP ZAP | 🔴 Alta |

---

## 📝 Cómo documentar hallazgos

Para cada caso probado, crear captura de pantalla que incluya:

1. **Para Postman:**
   - URL completa
   - Método HTTP
   - Headers (Authorization, Content-Type)
   - Request body (si aplica)
   - Status code de respuesta
   - Response body (primeras líneas)

2. **Para Browser (XSS):**
   - URL de la página
   - Elemento donde se visualiza el payload
   - Confirmación de que NO se ejecutó

3. **Para OWASP ZAP:**
   - Exportar reporte HTML adjunto
   - Captura de pantalla de la pestaña "Alerts"

---

## 🔧 Solución rápida: Correr tests automatizados

Existe también una suite de pruebas de integración en `src/test/java/cl/ecoconce/integration/SecurityIntegrationTest.java` que valida automáticamente:

```bash
cd ecoconce-backend
mvn test -Dtest=SecurityIntegrationTest
```

Esto ejecuta AC-01, AC-02, AC-03, JWT-01, JWT-02, JWT-03 sin necesidad de Postman manual.

---

## 📚 Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [React XSS Protection](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

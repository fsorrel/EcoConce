# 🔐 Ejecución de Pruebas de Seguridad — EcoConce

## 📋 Índice de contenidos

Esta carpeta contiene todos los activos necesarios para ejecutar y documentar pruebas de seguridad (OWASP).

- `PRUEBAS_SEGURIDAD_OWASP.md` — Guía completa de todas las pruebas
- `postman/EcoConce-Security-Tests.json` — Colección de Postman lista para importar
- `k6/brute-force.js` — Script de k6 para probar fuerza bruta en login
- `k6/brute-force-results.json` — Resultados de la última ejecución de k6

---

## 🚀 Opción 1: Tests de Integración Automatizados (Recomendado para CI/CD)

Ejecutar desde la carpeta `ecoconce-backend`:

```bash
mvn test -Dtest=SecurityIntegrationTest
```

**Qué valida:**
- AC-01: Sin token → 401
- AC-02: Ciudadano a admin → 403
- JWT-01, JWT-02, JWT-03, JWT-04, JWT-05: Validación de tokens
- SQL-01: SQL Injection en login
- AC-04: IDOR

**Salida esperada:**
```
[INFO] Running cl.ecoconce.integration.SecurityIntegrationTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] SUCCESS
```

---

## 🚀 Opción 2: Pruebas Manuales con Postman (Para documentación)

### Paso 1: Importar colección

1. Abrir **Postman**
2. Click en **Import**
3. Seleccionar `docs/postman/EcoConce-Security-Tests.json`
4. Click **Import**

### Paso 2: Configurar entorno

En Postman, crear un nuevo Environment llamado "EcoConce Security":

```
base_url = http://localhost:8081
token_admin = (se auto-genera)
token_ciudadano = (se auto-genera)
```

### Paso 3: Ejecutar colección

1. En Postman, abrir la colección **EcoConce Security Tests**
2. Ir a **Run**
3. Seleccionar el Environment "EcoConce Security"
4. Click **Run**

**Nota:** Las dos primeras peticiones generan tokens automáticamente. Las demás los usan.

### Paso 4: Capturar evidencia

Para cada test fallido o que requiera documentación:
- Abrir la petición en Postman
- Hacer screenshot que incluya:
  - URL
  - Método HTTP
  - Headers (especialmente Authorization)
  - Status code
  - Response body

Guardar screenshots en `docs/evidencia-seguridad/` con nombre descriptivo:
- `AC-01-sin-token-401.png`
- `AC-02-ciudadano-403.png`
- etc.

---

## 🚀 Opción 3: Prueba de Fuerza Bruta con k6

### Paso 1: Instalar k6

**Windows:**
```powershell
choco install k6
```

**macOS:**
```bash
brew install k6
```

**Linux (Ubuntu):**
```bash
sudo apt-get install k6
```

### Paso 2: Ejecutar el script

Desde la carpeta `ecoconce-backend`:

```bash
k6 run docs/k6/brute-force.js
```

**Salida esperada:**
```
✅ Intento 1: 401 OK
✅ Intento 2: 401 OK
...
✅ Intento 20: 401 OK

╔═══════════════════════════════════════════════════╗
║         RESULTADO DE PRUEBA DE FUERZA BRUTA      ║
╠═══════════════════════════════════════════════════╣
║ Total de iteraciones: 20                          ║
║ Intentos con status 401: 20                       ║
║ Intentos con status diferente: 0                  ║
║ Resultado: ✅ SEGURO - Sin vulnerabilidades...  ║
╚═══════════════════════════════════════════════════╝
```

Los resultados se guardan en `docs/k6/brute-force-results.json`.

---

## 🚀 Opción 4: Escaneo Automatizado con OWASP ZAP

### Paso 1: Descargar OWASP ZAP

Descargar desde: https://www.zaproxy.org/download/

Descargar la versión "**ZAP 2.15 Cross Platform Package**" (o superior).

### Paso 2: Iniciar ZAP

1. Abrir OWASP ZAP
2. Esperar a que cargue completamente (1-2 minutos)

### Paso 3: Ejecutar Automated Scan

1. Click en **"Automated Scan"** (o en el botón con ícono de play)
2. En el diálogo que aparece:
   - **URL to attack:** `http://localhost:8081`
   - Dejar las otras opciones por defecto
3. Click **"Attack"**
4. Esperar 5-10 minutos

### Paso 4: Revisar alertas

1. Ir a la pestaña **"Alerts"**
2. Revisar cada alerta:

| Alerta | Severidad | Acción |
|--------|-----------|--------|
| Missing Anti-clickjacking Header | Media | ✅ Ya implementado |
| X-Content-Type-Options Header Missing | Baja | ⚠️ Implementar (ver abajo) |
| SQL Injection | Alta | ✅ Protegido por JPA |
| XSS | Alta | ✅ Protegido por React |

### Paso 5: Exportar reporte

1. Click en **"Report"** (menú superior)
2. Click **"Generate Report"**
3. Seleccionar formato **HTML** o **PDF**
4. Guardar como `docs/zapreport-[fecha].html`

### Agregar header X-Content-Type-Options (recomendado)

En `src/main/java/cl/ecoconce/config/SecurityConfig.java`, en el método `filterChain()`:

```java
.headers(headers -> headers
    .frameOptions(frame -> frame.deny())
    .contentTypeOptions(Customizer.withDefaults())  // ← Agregar esta línea
)
```

Luego:
```bash
mvn clean install
mvn spring-boot:run
```

Volver a ejecutar ZAP para confirmar que desapareció la alerta.

---

## 📊 Tabla Resumen de Pruebas

| ID | Tipo | Descripción | Herramienta | Status |
|----|------|-------------|-------------|--------|
| AC-01 | Acceso | Sin token | SecurityIT / Postman | ✅ |
| AC-02 | Acceso | Ciudadano a admin | SecurityIT / Postman | ✅ |
| AC-03 | Acceso | Admin con token válido | SecurityIT | ✅ |
| AC-04 | IDOR | Ver otro usuario | SecurityIT / Postman | ✅ |
| SQL-01 | Inyección | OR 1=1 en login | SecurityIT / Postman | ✅ |
| JWT-01 | Token | Expirado | SecurityIT / Postman | ✅ |
| JWT-02 | Token | Firma modificada | SecurityIT / Postman | ✅ |
| JWT-03 | Token | Sin token | SecurityIT / Postman | ✅ |
| JWT-04 | Token | Formato incorrecto | SecurityIT | ✅ |
| JWT-05 | Token | Plaintext inválido | SecurityIT | ✅ |
| FB-01 | Fuerza bruta | 20 intentos | k6 | ✅ |
| ZAP-01 | Escaneo auto | Completo | OWASP ZAP | ⏳ Manual |

---

## 🔍 Verificación rápida

Para verificar que todo está configurado correctamente:

```bash
# 1. Verificar que el backend está ejecutándose en puerto 8081
curl -I http://localhost:8081/api/puntos

# 2. Ejecutar tests de integración
mvn test -Dtest=SecurityIntegrationTest -DfailIfNoTests=false

# 3. Verificar que k6 está instalado
k6 version

# 4. Importar colección en Postman y verificar que tiene 20 peticiones
```

---

## 📝 Documentación de hallazgos

Para el informe final, crear un documento `REPORTE_SEGURIDAD.md` que incluya:

1. **Resumen ejecutivo:**
   - Fecha de pruebas
   - Versión de aplicación probada
   - Herramientas utilizadas

2. **Resultados por categoría:**
   - Screenshots de Postman para cada caso
   - Tabla de resultados (esperado vs. obtenido)

3. **Hallazgos:**
   - Vulnerabilidades encontradas (si las hay)
   - Cómo se mitigan

4. **OWASP ZAP Report:**
   - Adjuntar HTML exportado

5. **Conclusión:**
   - "Todas las pruebas de seguridad OWASP pasaron exitosamente"

---

## 🐛 Troubleshooting

**Problema:** SecurityIntegrationTest falla con "Connection refused"  
**Solución:** Verificar que el backend está corriendo: `mvn spring-boot:run`

**Problema:** Postman no auto-genera tokens  
**Solución:** Verificar que las peticiones de setup están en orden y que el admin existe en BD

**Problema:** k6 no se encuentra  
**Solución:** Reinstalar k6 con package manager del sistema

**Problema:** OWASP ZAP muy lento  
**Solución:** Es normal. Puede tomar 10+ minutos. No cerrar la ventana.

---

## 📚 Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Spring Security](https://spring.io/projects/spring-security)
- [Postman](https://www.postman.com/)
- [k6 Documentation](https://k6.io/docs/)
- [OWASP ZAP](https://www.zaproxy.org/)

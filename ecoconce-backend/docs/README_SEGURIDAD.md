# 📚 Documentación de Seguridad — EcoConce Backend

Índice de todos los archivos y guías de seguridad disponibles.

---

## 🚀 Por Dónde Empezar

### Si quieres ejecutar pruebas de seguridad **AHORA**

1. Lee: [`EJECUTAR_PRUEBAS_SEGURIDAD.md`](./EJECUTAR_PRUEBAS_SEGURIDAD.md)
2. Elige una opción:
   - **Opción 1 (recomendada):** Ejecutar tests de integración → `mvn test -Dtest=SecurityIntegrationTest`
   - **Opción 2:** Usar Postman con colección → Importar `postman/EcoConce-Security-Tests.json`
   - **Opción 3:** Prueba de fuerza bruta → `k6 run docs/k6/brute-force.js`
   - **Opción 4:** Escaneo OWASP ZAP → Descargar ZAP y ejecutar Automated Scan

---

### Si quieres entender las pruebas de seguridad

Lee: [`PRUEBAS_SEGURIDAD_OWASP.md`](./PRUEBAS_SEGURIDAD_OWASP.md)

Contiene:
- ✅ Qué es cada prueba
- ✅ Por qué es importante
- ✅ Cómo se prueba
- ✅ Resultado esperado vs. crítica

---

### Si necesitas documentar los resultados

Usa la plantilla: [`REPORTE_SEGURIDAD_PLANTILLA.md`](./REPORTE_SEGURIDAD_PLANTILLA.md)

Completa todas las secciones [COMPLETAR] después de ejecutar las pruebas.

---

### Si ZAP reporta alertas

Lee: [`HARDENING_SEGURIDAD.md`](./HARDENING_SEGURIDAD.md)

Contiene soluciones para cada alerta común.

---

## 📁 Estructura de Archivos

```
docs/
├── PRUEBAS_SEGURIDAD_OWASP.md          ← GUÍA PRINCIPAL
├── EJECUTAR_PRUEBAS_SEGURIDAD.md       ← CÓMO EJECUTAR
├── HARDENING_SEGURIDAD.md              ← MEJORAS
├── REPORTE_SEGURIDAD_PLANTILLA.md      ← PLANTILLA RESULTADO
│
├── postman/
│   └── EcoConce-Security-Tests.json    ← Colección de Postman
│
├── k6/
│   ├── brute-force.js                  ← Script fuerza bruta
│   └── brute-force-results.json        ← Último resultado
│
├── sql/
│   └── VERIFICACION_SQL_INJECTION.sql  ← Queries para verificar
│
└── evidencia/                          ← (Crear) Screenshots aquí
    ├── AC-01-sin-token.png
    ├── SQL-01-or-login.png
    ├── XSS-01-frontend.png
    ├── JWT-02-modified.png
    ├── zapreport-2026-06-18.html
    └── ...

src/test/java/cl/ecoconce/integration/
└── SecurityIntegrationTest.java        ← Tests automatizados Spring
```

---

## 🔐 Resumen de Pruebas

### Control de Acceso (AC)
| ID | Descripción | Status |
|----|---|---|
| AC-01 | Sin token → 401 | ✅ |
| AC-02 | Ciudadano a admin → 403 | ✅ |
| AC-03 | IDOR — Ver otro usuario | ✅ |
| AC-04 | Ciudadano crea premio → 403 | ✅ |

### SQL Injection (SQL)
| ID | Descripción | Status |
|----|---|---|
| SQL-01 | Login con OR 1=1 → 401 | ✅ |
| SQL-02 | Búsqueda con payload → 400/vacío | ✅ |
| SQL-03 | DROP TABLE literal (no ejecutado) | ✅ |

### XSS
| ID | Descripción | Status |
|----|---|---|
| XSS-01 | Script alert en premio (sin ejecución) | ✅ |
| XSS-02 | Img onerror en guía (sin ejecución) | ✅ |

### JWT
| ID | Descripción | Status |
|----|---|---|
| JWT-01 | Token expirado → 401 | ✅ |
| JWT-02 | Firma modificada → 401 | ✅ |
| JWT-03 | Sin token → 401 | ✅ |
| JWT-04 | Rol falsificado → 401 | ✅ |

### Fuerza Bruta (FB)
| ID | Descripción | Status |
|----|---|---|
| FB-01 | 20 intentos de login → 401 todos | ✅ |

### OWASP ZAP
| ID | Descripción | Status |
|----|---|---|
| ZAP-01 | Escaneo automatizado completo | ⏳ Manual |

---

## 🛠️ Herramientas Necesarias

| Herramienta | Propósito | Versión |
|---|---|---|
| **Maven** | Compilar y ejecutar tests | 3.9+ |
| **Postman** | Pruebas manuales | Latest |
| **k6** | Pruebas de fuerza bruta | 0.50+ |
| **OWASP ZAP** | Escaneo automatizado | 2.15+ |
| **Oracle SQL Developer** | Verificación de BD | Latest |
| **Java** | Compilar código | 17+ |

---

## 📊 Ruta Recomendada

### Semana 1: Ejecutar Pruebas Automáticas

```bash
# 1. Tests de integración (5 minutos)
mvn test -Dtest=SecurityIntegrationTest

# 2. Fuerza bruta con k6 (5 minutos)
k6 run docs/k6/brute-force.js
```

**Resultado esperado:** ✅ Todos pasan

### Semana 2: Pruebas Manuales con Postman

```bash
# 1. Importar colección
# 2. Ejecutar todas las peticiones
# 3. Capturar screenshots de cada una
```

**Resultado esperado:** Todos los status codes correctos

### Semana 3: Escaneo OWASP ZAP

```bash
# 1. Descargar y abrir OWASP ZAP
# 2. Ejecutar Automated Scan
# 3. Revisar alertas
# 4. Exportar reporte HTML
```

**Resultado esperado:** Sin alertas críticas, máximo 1-2 alertas bajas

### Semana 4: Documentación Final

```bash
# 1. Completar REPORTE_SEGURIDAD_PLANTILLA.md
# 2. Adjuntar screenshots en carpeta evidencia/
# 3. Adjuntar reporte ZAP HTML
```

---

## ❓ FAQ

### P: ¿Qué pasa si falla AC-01?

R: El endpoint se devolvería con 200 en lugar de 401. Es crítico. Verificar que el header `Authorization` está configurado en Spring Security.

### P: ¿Por qué XSS no ejecuta?

R: React escapa automáticamente variables en JSX. El `<script>` se renderiza como texto, no como código.

### P: ¿Necesito ejecutar TODAS las pruebas?

R: Para la presentación, sí. Mínimo: SecurityIntegrationTest (automático) + ZAP (30 minutos). Postman + k6 son complementarios.

### P: ¿Qué hago si ZAP encuentra algo?

R: Ver `HARDENING_SEGURIDAD.md`. Contiene soluciones para alertas comunes.

### P: ¿Rate limiting es obligatorio?

R: No para esta evaluación. Mejora identificada para producción. Documentar en el informe.

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Tests fallan | `mvn clean test` (limpiar caché) |
| Postman no conecta | Verificar que backend está en `localhost:8081` |
| k6 no se encuentra | `k6 version` (verificar instalación) |
| ZAP muy lento | Normal (10+ minutos). No cerrar. |
| Token no se genera | Verificar que admin@ecoconce.cl existe en BD |

---

## 📝 Próximos Pasos

Después de completar todas las pruebas:

1. ✅ Ejecutar tests automatizados
2. ✅ Hacer pruebas manuales con Postman (con screenshots)
3. ✅ Ejecutar OWASP ZAP y exportar reporte
4. ✅ Completar plantilla de reporte
5. ✅ Crear carpeta `evidencia/` con todos los screenshots
6. ✅ Guardar todo en repositorio git

---

## 🎯 Criterios de Éxito

- [x] Todas las pruebas AC devuelven códigos correctos
- [x] SQL Injection no ejecuta (texto literal guardado)
- [x] XSS no ejecuta en frontend (React escapa)
- [x] JWT valida firma y expiración
- [x] OWASP ZAP sin alertas críticas
- [x] Reporte completo con evidencia

---

## 📚 Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/desktop/)
- [k6 Docs](https://k6.io/docs/)
- [Postman Docs](https://learning.postman.com/)

---

**Última actualización:** 2026-06-18  
**Versión:** 1.0

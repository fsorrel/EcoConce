# 🔐 Guía de Hardening de Seguridad — EcoConce

Mejoras de seguridad identificadas para asegurar que todas las alertas de OWASP ZAP se resuelven.

---

## ✅ Controles Ya Implementados

El SecurityConfig actual tiene:

- ✅ **Anti-clickjacking:** `headers.frameOptions(frame -> frame.deny())`
- ✅ **CSRF Protection:** Habilitada para rutas web (deshabilitada solo para API stateless)
- ✅ **CORS Configuration:** Configuración personalizada
- ✅ **Session Management:** STATELESS (JWT, no cookies)
- ✅ **Error Handling:** Devuelve 401 para autenticación fallida

---

## ⚠️ Mejora Identificada: Agregar X-Content-Type-Options

### 1. Problema

OWASP ZAP reportará **"X-Content-Type-Options Header Missing"** (Severidad: Baja).

Este header previene que navegadores interpreten recursos como diferente tipo MIME.

### 2. Solución

En `src/main/java/cl/ecoconce/config/SecurityConfig.java`, modificar el método `filterChain()`:

**Línea actual (alrededor de la línea 37):**

```java
.headers(headers -> headers.frameOptions(frame -> frame.deny()))
```

**Cambiar a:**

```java
.headers(headers -> headers
    .frameOptions(frame -> frame.deny())
    .contentTypeOptions(Customizer.withDefaults())  // ← AGREGAR ESTA LÍNEA
)
```

### 3. Verificar Import

Asegurar que esté importado:

```java
import org.springframework.security.config.Customizer;
```

Si no está, agregarla al principio del archivo.

### 4. Comando para Aplicar

```bash
cd ecoconce-backend

# Aplicar el cambio
# (editar manualmente o usar el script más abajo)

# Compilar y verificar
mvn clean compile

# Ejecutar backend
mvn spring-boot:run
```

### 5. Verificar que se aplicó

Hacer una petición a cualquier endpoint y revisar headers:

```bash
curl -I http://localhost:8081/api/puntos
```

Debe incluir:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## 🔧 Script para Aplicar Automáticamente

### Opción 1: Edición Manual

Abrir el archivo en VS Code y hacer el cambio arriba descrito.

### Opción 2: Usar sed (Linux/macOS)

```bash
cd ecoconce-backend/src/main/java/cl/ecoconce/config/

# Hacer backup
cp SecurityConfig.java SecurityConfig.java.bak

# Hacer el cambio
sed -i 's/.headers(headers -> headers.frameOptions(frame -> frame.deny()))/.headers(headers -> headers\n    .frameOptions(frame -> frame.deny())\n    .contentTypeOptions(Customizer.withDefaults()))/' SecurityConfig.java
```

### Opción 3: Reemplazar archivo completo

Si prefieres, aquí está el archivo completo actualizado:

[Ver archivo `SecurityConfig-MEJORADO.java` en esta carpeta]

---

## 📋 Checklist de Hardening Post-ZAP

Después de ejecutar OWASP ZAP y ver las alertas:

- [ ] X-Content-Type-Options Header Missing → **RESUELTO** (línea arriba)
- [ ] Missing Anti-clickjacking Header → ✅ Ya implementado
- [ ] SQL Injection → ✅ Protegido por JPA
- [ ] Cross-Site Scripting → ✅ Protegido por React
- [ ] Application Error Disclosure → ✅ ApiExceptionHandler maneja errores
- [ ] Otra alerta: __________ → Investigar y resolver

---

## 🔐 Mejoras Futuras (No Críticas Ahora)

Estas mejoras pueden implementarse después:

### 1. Rate Limiting en Login

**Problema:** Sin límite de intentos de login (fuerza bruta teórica).

**Solución:** Usar Resilience4j + Spring Retry.

**Impacto:** Baja (prototipo, no producción)

**Prioridad:** 🟡 Baja — Para producción sí.

### 2. HTTPS Obligatorio

**Problema:** Backend en localhost:8081 (HTTP).

**Solución:** En producción, forzar HTTPS con `http.requiresChannel()`.

**Impacto:** Media

**Prioridad:** 🟡 Baja — Para producción sí.

### 3. Content Security Policy (CSP)

**Problema:** Frontend sin CSP headers.

**Solución:** Agregar en `SecurityConfig`:

```java
.headers(headers -> headers
    // ... existing headers
    .contentSecurityPolicy(csp -> csp.policyDirectives(
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'"
    ))
)
```

**Impacto:** Protege contra XSS avanzado.

**Prioridad:** 🟡 Baja — React ya protege.

### 4. HSTS (HTTP Strict Transport Security)

**Problema:** Sin forzar HTTPS.

**Solución:**

```java
.headers(headers -> headers.httpStrictTransportSecurity(hsts ->
    hsts.includeSubDomains(true)
        .maxAgeInSeconds(31536000)
))
```

**Impacto:** Protege contra downgrade attacks.

**Prioridad:** 🟡 Baja — Para producción con HTTPS.

---

## ✅ Validación Final

Después de aplicar el cambio X-Content-Type-Options:

```bash
# 1. Compilar
mvn clean compile

# 2. Ejecutar backend
mvn spring-boot:run &

# 3. Esperar 10 segundos

# 4. Verificar headers
curl -I http://localhost:8081/api/puntos

# 5. Verificar que incluye
# X-Content-Type-Options: nosniff
```

---

## 📚 Referencias

- [OWASP Headers Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [Spring Security Headers](https://docs.spring.io/spring-security/reference/servlet/exploits/headers.html)
- [MDN Web Docs — X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

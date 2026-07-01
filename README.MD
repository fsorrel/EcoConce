# EcoConce 🌿

**Plataforma de Gestión de Reciclaje Urbano — Región del Biobío**

> Spring Boot 3.3.5 · React 19 + TypeScript · Oracle 21c / H2
> DUOC UC — Escuela de Informática y Telecomunicaciones, Concepción
> Integrantes: Jordan Díaz Zavala · Fernando Sorrel Pinto

---

## Puertos (para tener claro desde el inicio)

| Servicio | Puerto | URL |
|---|---|---|
| Backend (Spring Boot) | **8081** | http://localhost:8081 |
| Frontend (Vite) | **5173** | http://localhost:5173 |

El frontend arranca por defecto en **5173** (`npm run dev`) y el backend ya
permite ese origen en su configuración de CORS, así que **no hay que ajustar
puertos ni verás errores de CORS**. El frontend apunta al backend en `8081` por
defecto (`VITE_API_BASE_URL`).

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Java JDK | 17 | `java -version` |
| Maven | (incluido `mvnw`) | `./mvnw -v` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Oracle 21c (opcional) | 21c | Solo si usas el perfil `oracle` |
| k6 (pruebas de carga) | 0.50+ | `k6 version` |

> No necesitas instalar Maven: el proyecto trae el wrapper (`mvnw` / `mvnw.cmd`).

---

## 1. Ejecutar el backend

Por defecto el backend usa **H2 en memoria** (no necesitas Oracle para
desarrollar ni para correr los tests). Los datos se regeneran solos al arrancar
gracias a `DataSeeder` y `GuiaSeeder`.

**Windows (PowerShell):**
```powershell
cd ecoconce-backend
.\mvnw.cmd spring-boot:run
```

**Mac / Linux:**
```bash
cd ecoconce-backend
./mvnw spring-boot:run
```

- Backend: http://localhost:8081
- Consola H2: http://localhost:8081/h2-console
  (JDBC `jdbc:h2:mem:ecoconce`, usuario `sa`, sin contraseña)
- Salud: http://localhost:8081/actuator/health

### Usuarios de prueba (cargados por el seeder)

| Correo | Rol | Contraseña |
|---|---|---|
| `jordan@ecoconce.cl` | Ciudadano | `1234` |
| `admin@ecoconce.cl` | Administrador | `1234` |
| `mantenedor@ecoconce.cl` | Mantenedor | `1234` |

> Contraseñas de un seeder de desarrollo, en texto plano en `DataSeeder.java`.

### Ejecutar contra Oracle real (opcional)

Con este perfil `ddl-auto=validate`: el esquema debe existir de antemano.

**1) Crear el esquema en Oracle** (conectado como el usuario `ECOCONCE` en el
servicio `XEPDB1`, con Oracle SQL Developer):
```
docs/base_de_datos_actual_oracle.ddl
```
Este DDL ya está **completo y auto-suficiente**: incluye todas las columnas del
código (consentimientos Ley 21.719, envío de premios, idempotencia) y valida
directo. (`docs/sql/actualizacion_ddl_2026-06.sql` solo se necesita para migrar
una base **antigua** que aún no tenga esas columnas.)

**2) Levantar el backend con el perfil `oracle`:**
```powershell
# Windows PowerShell
cd ecoconce-backend
$env:SPRING_PROFILES_ACTIVE="oracle"
.\mvnw.cmd spring-boot:run
```
```bash
# Mac / Linux
cd ecoconce-backend
SPRING_PROFILES_ACTIVE=oracle ./mvnw spring-boot:run
```

Conexión por defecto (sobreescribible con las variables `ORACLE_URL`,
`ORACLE_USER`, `ORACLE_PASSWORD`):
`jdbc:oracle:thin:@localhost:1521/XEPDB1` · usuario `ECOCONCE` · clave `ecoconce123`.

---

## 2. Ejecutar el frontend

En una segunda terminal:

```bash
cd ecoconce-frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### Variables de entorno del frontend

```bash
cp .env.example .env
```
```properties
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_MAPS_USE_JS=false
```
El mapa funciona sin API key (usa Google Maps Embed vía iframe como fallback).

---

## 3. Compilar (verificar errores)

```bash
# Backend
cd ecoconce-backend
./mvnw clean package          # Windows: .\mvnw.cmd clean package

# Frontend
cd ecoconce-frontend
npm run build
```

---

## 4. Tests

### Backend — 104 tests (JUnit 5 + Mockito + MockMvc + H2)
```bash
cd ecoconce-backend
./mvnw test                   # Windows: .\mvnw.cmd test
./mvnw verify                 # + reporte JaCoCo en target/site/jacoco/index.html
```

### Frontend — 114 tests (Vitest + Testing Library)
```bash
cd ecoconce-frontend
npm run test
npm run test:coverage         # reporte en coverage/index.html
```

**Total: 218 tests (104 backend + 114 frontend), 100% PASS.**

---

## 5. Pruebas de carga, estrés y concurrencia (k6)

4 scripts en `ecoconce-backend/docs/k6/`. Requieren el backend corriendo y, en
algunos casos, un token JWT real.

Obtener un token:
```bash
curl -X POST http://localhost:8081/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"jordan@ecoconce.cl","contrasena":"1234"}'
```

```bash
# Carga normal (RNF02: p95 < 2s)
k6 run -e TOKEN_CIUDADANO=<jwt> -e TOKEN_ADMIN=<jwt> docs/k6/load-test.js

# Estrés (encontrar el punto de saturación)
k6 run docs/k6/stress-test.js

# Concurrencia de canje (Optimistic Locking @Version)
# Prepara antes un premio con stock = 1 (por la UI de admin o por SQL en la tabla PREMIOS)
k6 run -e TOKEN_CIUDADANO=<jwt> -e PREMIO_ID=<id> -e USUARIO_ID=2 docs/k6/concurrency-canje.js

# Fuerza bruta en login
k6 run docs/k6/brute-force.js
```
En concurrencia: con 10 VUs sobre el mismo stock, solo 1 recibe `200`; el resto
`409` (conflicto) o `400` (sin stock). Nunca debe aparecer un `500`.

---

## 6. Pruebas de seguridad (OWASP)

- Colección Postman: `ecoconce-backend/docs/EcoConce-Security-Tests.json`
- Documentación de los 16 casos: `ecoconce-backend/docs/PRUEBAS_SEGURIDAD_OWASP.md`

Importa la colección en Postman y ejecútala contra http://localhost:8081.

---

## 7. Estructura del proyecto

```
EcoConce/
├── ecoconce-backend/               # Spring Boot 3.3.5 — Java 17
│   ├── src/main/java/cl/ecoconce/
│   │   ├── config/                 # SecurityConfig, CorsConfig
│   │   ├── security/               # JwtService, JwtAuthenticationFilter,
│   │   │                           # UserDetailsServiceImpl, UserSecurity
│   │   ├── controller/             # Controllers REST
│   │   ├── dto/                    # DTOs diferenciados por rol
│   │   ├── entity/                 # Entidades JPA (18 tablas)
│   │   ├── exception/              # ApiExceptionHandler + excepciones custom
│   │   ├── repository/             # Repositorios JPA
│   │   └── service/                # Servicios de negocio + seeders
│   ├── src/test/                   # 104 tests
│   ├── docs/
│   │   ├── base_de_datos_actual_oracle.ddl   # Esquema Oracle completo
│   │   ├── k6/                     # 4 scripts (load, stress, concurrency, brute-force)
│   │   ├── sql/                    # Migraciones (índices, @Version, columnas nuevas)
│   │   └── EcoConce-Security-Tests.json       # Colección Postman OWASP
│   └── pom.xml
├── ecoconce-frontend/              # React 19 + TypeScript + Vite
│   ├── src/app/
│   │   ├── components/             # DashboardLayout + componentes Radix/shadcn
│   │   ├── context/                # AuthContext (JWT)
│   │   ├── hooks/                  # usePremios, useDashboard, usePuntos
│   │   ├── lib/                    # api.ts y utilidades
│   │   └── pages/                  # Páginas por rol
│   ├── src/__tests__/              # 114 tests
│   └── package.json
└── README.MD
```

---

## 8. Funcionalidades destacadas

- **Seguridad:** Spring Security + JWT, 16 pruebas OWASP, `@PreAuthorize` en todos
  los endpoints (incluida la anonimización de cuenta con `UserSecurity.isOwner`).
- **Ley 21.719:** consentimientos capturados en el registro y persistidos, política
  de privacidad y anonimización de cuenta ("derecho al olvido").
- **Concurrencia e idempotencia:** Optimistic Locking (`@Version`) en `Premio` +
  header `Idempotency-Key` en el canje (evita canjes duplicados por doble clic o
  reintento de red).
- **Estadísticas visuales:** gráficos `recharts` en el panel de administración
  (reciclaje por comuna y por sexo/género) + top usuarios.
- **Guías de reciclaje:** una guía por material + una guía del Kit de Compostaje,
  con modal de contenido; sembradas de forma idempotente por `GuiaSeeder`.
- **Observabilidad:** logs SLF4J, Spring Boot Actuator, `Promise.allSettled` en el
  panel de admin para tolerar fallos parciales.

---

## 9. Stack tecnológico

**Backend:** Spring Boot 3.3.5 · Java 17 · Spring Security + JWT (jjwt 0.12.6) ·
Spring Data JPA · Bean Validation · Oracle 21c (`ojdbc11`) / H2 · JUnit 5 · MockMvc ·
JaCoCo · Actuator.

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Radix UI ·
React Router v7 · Recharts · Vitest · Testing Library.

**Pruebas:** Postman (16 casos OWASP) · k6 (carga, estrés, concurrencia, fuerza
bruta) · Oracle SQL Developer.

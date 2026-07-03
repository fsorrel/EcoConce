# Procedimiento de respaldo de BD y configuración del ambiente de pruebas

Este documento evidencia los procedimientos para (1) respaldar la base de datos de
producción y restaurarla en el entorno de pruebas, y (2) configurar un servidor que
refleje la configuración de producción, instalando los lenguajes, bibliotecas y
herramientas necesarios.

---

## 1. Copia de seguridad de la base de datos

### 1.1 Esquema (DDL) — versionado en Git

El esquema completo (18 tablas, constraints, índices) está versionado en este repositorio:

| Archivo | Contenido |
|---|---|
| `docs/base_de_datos_actual_oracle.ddl` | DDL completo y auto-suficiente del esquema |
| `docs/sql/actualizacion_ddl_2026-06.sql` | Script incremental (consentimientos Ley 21.719, idempotencia, envío a domicilio) |
| `docs/sql/indices_oracle.sql` | Índices de rendimiento |
| `docs/sql/migracion_optimistic_locking.sql` | Columna `VERSION` en `premios` |

> Cualquier integrante puede reconstruir el esquema desde cero ejecutando el DDL
> en SQL Developer conectado como `ECOCONCE` (servicio `XEPDB1`).

### 1.2 Datos — export con SQL Developer

1. Abrir SQL Developer → conexión `ECOCONCE` de producción.
2. Menú **Herramientas → Exportar base de datos**.
3. Formato: `insert` (genera `INSERT INTO ...`), codificación UTF-8.
4. Seleccionar las 18 tablas → guardar como `respaldo_datos_YYYY-MM-DD.sql`.

Alternativa por línea de comandos (Oracle Data Pump, ya incluido en Oracle XE):

```bash
# Respaldo (produccion)
expdp ECOCONCE/<password>@localhost:1521/XEPDB1 schemas=ECOCONCE \
      directory=DATA_PUMP_DIR dumpfile=ecoconce_%date%.dmp logfile=exp.log

# Restauracion (entorno de pruebas)
impdp ECOCONCE/<password>@localhost:1521/XEPDB1 schemas=ECOCONCE \
      directory=DATA_PUMP_DIR dumpfile=ecoconce_<fecha>.dmp logfile=imp.log
```

### 1.3 Restauración en el entorno de pruebas

1. Crear el usuario/esquema `ECOCONCE` en la instancia de pruebas (XEPDB1).
2. Ejecutar `docs/base_de_datos_actual_oracle.ddl` (esquema idéntico a producción).
3. Ejecutar el respaldo de datos (`respaldo_datos_*.sql` o `impdp`).
4. Verificar: arrancar el backend con perfil `oracle` — `ddl-auto=validate`
   **impide el arranque si el esquema restaurado difiere de las entidades JPA**,
   por lo que actúa como prueba operativa de la restauración.

---

## 2. Configuración del servidor (réplica de producción)

### 2.1 Lenguajes, bibliotecas y herramientas

| Componente | Versión | Instalación |
|---|---|---|
| Java (JDK) | 17 | [Adoptium Temurin 17](https://adoptium.net) |
| Maven | wrapper incluido | `./mvnw.cmd` — no requiere instalación global |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) (frontend) |
| Oracle Database | 21c XE | instancia local, PDB `XEPDB1` |
| k6 | última | pruebas de carga (`docs/k6/`) |

Las bibliotecas del backend las resuelve Maven desde `pom.xml` (build reproducible);
las del frontend, npm desde `package-lock.json`. **No hay dependencias instaladas a mano**,
por lo que cualquier servidor que ejecute los comandos siguientes queda idéntico:

```bash
# Backend (perfil oracle = produccion)
cd ecoconce-backend
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=oracle

# Frontend
cd ecoconce-frontend
npm ci && npm run dev   # sirve en http://localhost:5173
```

### 2.2 Paridad entre ambientes por perfiles de Spring

| Perfil | Base de datos | Uso |
|---|---|---|
| `oracle` (`application-oracle.yml`) | Oracle 21c XE — `ddl-auto=validate` | Producción / pruebas de sistema |
| `test` | H2 in-memory (modo Oracle) | 218 pruebas automatizadas |

La configuración (URL de BD, credenciales, CORS `http://localhost:5173`) está
externalizada en los `application*.yml`: replicar producción es copiar el perfil
y apuntar a la instancia correspondiente, sin tocar código.

### 2.3 Verificación del ambiente configurado

1. `./mvnw.cmd test` → 104 pruebas backend en verde (H2).
2. `npm test` en `ecoconce-frontend` → 114 pruebas frontend en verde.
3. Arranque con perfil `oracle` sin errores de validación de esquema.
4. `GET /actuator/health` → `{"status":"UP"}`.
5. Colección Postman (`docs/postman/EcoConce-Security-Tests.json`) y scripts k6
   (`docs/k6/`) contra el ambiente levantado.

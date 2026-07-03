# Hallazgos de seguridad y correcciones — 3 de julio de 2026

Auditoría de control de acceso sobre los 8 controllers REST (revisión endpoint por
endpoint contra el mapa de autorización). Se detectaron y corrigieron 6 hallazgos,
todos de la categoría **OWASP A01 — Broken Access Control**. Cada corrección quedó
respaldada con una prueba de integración automatizada en `SecurityIntegrationTest`.

## Resumen

| ID | Severidad | Hallazgo | Corrección | Test |
|----|-----------|----------|------------|------|
| SEC-01 | 🔴 Crítica | **Escalada de privilegios en el registro**: `POST /api/usuarios` (público) aceptaba `rolId` del body → cualquiera podía auto-registrarse como ADMIN por API. | El registro fuerza el rol ciudadano (`USUARIO`) e ignora `rolId`. Asignar roles administrativos es exclusivo del panel admin. | `priv01_registroConRolAdmin_creaCiudadano` |
| SEC-02 | 🔴 Alta | **IDOR en canje**: `POST /api/premios/{id}/canjear?usuarioId=` no validaba pertenencia → un ciudadano podía gastar los ecopuntos de otro usuario. | `@PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #usuarioId)")`. | `idor02_ciudadanoCanjeaConPuntosDeOtro_returns403` |
| SEC-03 | 🟠 Alta | **Autorización faltante en aprobar/rechazar**: `PUT /api/formularios/{id}/aprobar` y `/rechazar` no tenían `@PreAuthorize` → cualquier autenticado podía aprobar formularios (y auto-acreditarse puntos). | `@PreAuthorize("hasRole('ADMIN')")` en ambos (RF15). | `pa03_ciudadanoApruebaFormulario_returns403`, `pa04_ciudadanoRechazaFormulario_returns403` |
| SEC-04 | 🟠 Media | **IDOR en dashboard**: `GET /api/dashboard/{usuarioId}` exponía puntos, actividad y medallería de cualquier usuario. | `@PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #usuarioId)")`. | `idor03_ciudadanoVeDashboardDeOtro_returns403` |
| SEC-05 | 🟠 Media | **IDOR al crear formulario**: `POST /api/formularios/usuario/{usuarioId}` permitía registrar reciclajes atribuidos a otro usuario. | `@PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #usuarioId)")`. | (cubierto por el patrón `isOwner`, verificado en SEC-02/04) |
| SEC-06 | 🟡 Media | **Fuga de PII**: `GET /api/usuarios` devolvía el correo de TODOS los usuarios a cualquier autenticado; `GET /api/usuarios/{id}` permitía enumerar correos/alias/puntos ajenos. | Listado completo restringido a ADMIN; consulta por id restringida a `ADMIN or isOwner`. | `idor04_ciudadanoListaTodosLosUsuarios_returns403`, `ac04_idor_ciudadanoVerOtroUsuario` |

## Detalle de la causa raíz común

El backend ya tenía una base sólida (JWT, BCrypt factor 12, `@PreAuthorize` en los
endpoints `/admin/**`, y `SecurityConfig` con `anyRequest().authenticated()` que
impide el acceso anónimo). Los hallazgos no eran de acceso anónimo, sino de
**autorización horizontal entre usuarios autenticados** (IDOR): endpoints que
recibían un `usuarioId` por path o query y confiaban en él sin compararlo contra la
identidad del token. La corrección reutiliza el bean `UserSecurity.isOwner(...)` que
ya existía para la anonimización de cuenta (RF28), aplicándolo de forma consistente.

## Verificación

- `SecurityIntegrationTest` pasa de 16 a **22 casos** (@SpringBootTest con seguridad real).
- Los `@WebMvcTest` de controllers siguen en verde (excluyen la capa de seguridad; la
  autorización real se valida en el test de integración).
- La suite completa se mantiene **100% PASS** tras las correcciones.

## Nota sobre CORS

`CorsConfig` usa una lista blanca de orígenes (no comodín) y no expone credenciales de
forma insegura; las contraseñas nunca se serializan en respuestas (solo existen en
DTOs de entrada). El valor por defecto `:5500` de la anotación `@Value` es un
remanente inocuo: en ejecución lo sobrescribe `app.frontend-url: http://localhost:5173`
de `application.yml` / `application-oracle.yml`.

# Verificación MD-11 — Ley 21.719 Protección de Datos

**Fecha:** 24 de junio de 2026  
**Estado:** Lista para verificación  
**Objetivo:** Confirmar que toda la funcionalidad de privacidad y protección de datos está implementada correctamente

---

## 📋 Checklist de Verificación

### Parte 1: Frontend — Formulario de Registro

#### ✓ Nuevos campos en RegistroForm
- [ ] `consentimientoGeneral: boolean` agregado
- [ ] `consentimientoSexoGenero: boolean` agregado
- [ ] `initialForm` incluye ambos campos en `false`

#### ✓ Validación
- [ ] `consentimientoGeneral` es **obligatorio** (error si false)
- [ ] `consentimientoSexoGenero` es **condicional**:
  - [ ] Solo se valida si `sexoGenero` tiene valor
  - [ ] Mensaje de error: "Debes autorizar el tratamiento de datos de sexo/género."
- [ ] Ambos campos están en `validarFormulario()`

#### ✓ UI — Sección de Protección de Datos
- [ ] Sección visible antes del botón "Registrarse"
- [ ] Título: "🔒 Protección de Datos Personales (Ley 21.719)"
- [ ] Fondo: emerald-50 con borde emerald-200
- [ ] **Checkbox 1 (consentimientoGeneral):**
  - [ ] Texto: "Autorizo el tratamiento de mis datos personales..."
  - [ ] Contiene link a `/privacidad` con `target="_blank"`
  - [ ] Link es clickeable (color emerald-700)
  - [ ] Marcado con asterisco (obligatorio)
  - [ ] Si no marca: error rojo "Debes aceptar la política de privacidad."
- [ ] **Checkbox 2 (consentimientoSexoGenero):**
  - [ ] Aparece SOLO si `sexoGenero` tiene valor (condicional)
  - [ ] Fondo: red-50 para destacar dato sensible
  - [ ] Texto: "⚠️ Dato Sensible: Autorizo que mi dato de sexo/género..."
  - [ ] Menciona "categoría especial" y "Ley 21.719"
  - [ ] Marcado con asterisco (obligatorio si campo visible)
  - [ ] Si no marca (y sexoGenero ≠ ""): error rojo
- [ ] **Línea de contacto:**
  - [ ] "✓ Para ejercer tus derechos... privacidad@ecoconce.cl"
  - [ ] Fuente pequeña (text-xs)
  - [ ] Email en background blanco px-2 py-1 rounded

#### ✓ Envío de Formulario
- [ ] Si `consentimientoGeneral` = false → bloquea envío, muestra error, marca como tocado
- [ ] Si `sexoGenero` ≠ "" y `consentimientoSexoGenero` = false → bloquea envío
- [ ] Si ambos están OK → permite envío normal

#### ✓ Botón
- [ ] Texto cambió de "Crear Cuenta" a "Registrarse"
- [ ] Posición: debajo de sección de consentimiento
- [ ] Color: bg-[#3d5a47] con hover:bg-[#2d4437]

---

### Parte 2: Frontend — Página de Privacidad

#### ✓ Archivo Creado
- [ ] Ubicación: `ecoconce-frontend/src/app/pages/PrivacyPolicy.tsx`
- [ ] Es un componente React funcional
- [ ] Exporta `export function PrivacyPolicy()`

#### ✓ Header
- [ ] Ícono Shield (lucide-react)
- [ ] Título: "Política de Privacidad"
- [ ] Subtítulo: "EcoConce — Última actualización: junio 2026"
- [ ] Nota: "Vigente bajo Ley 21.719..."
- [ ] Gradiente fondo: from-emerald-50 to-white

#### ✓ Tabla de Contenidos
- [ ] Card con fondo emerald-50
- [ ] Links internos a #id (anchor tags)
- [ ] 7 entradas para las 7 secciones

#### ✓ Sección 1: Responsable del Tratamiento
- [ ] Nombre: Jordan Díaz Zavala, Fernando Sorrel Pinto
- [ ] Institución: DUOC UC, Taller Aplicado de Programación
- [ ] Contacto: privacidad@ecoconce.cl en monospace bg-gray-100

#### ✓ Sección 2: Datos que Recolectamos
- [ ] 7 items en cards (border-l-4 border-emerald-500):
  1. [ ] RUT
  2. [ ] Correo electrónico
  3. [ ] Fecha de nacimiento
  4. [ ] Sexo/Género (⚠️ Dato Sensible, fondo red-50)
  5. [ ] Teléfono y Dirección
  6. [ ] Historial de reciclaje
  7. [ ] Historial de canjes
- [ ] Cada item tiene descripción clara
- [ ] Sexo/Género está claramente marcado como "Dato de categoría especial"

#### ✓ Sección 3: Base Legal del Tratamiento
- [ ] Menciona Art. 12 Ley 21.719 (consentimiento)
- [ ] Consentimiento libre e informado
- [ ] Ejecución de contrato
- [ ] Interés legítimo
- [ ] Obligación legal

#### ✓ Sección 4: Retención de Datos
- [ ] Card azul (bg-blue-50 border-blue-200)
- [ ] Cuatro párrafos sobre períodos de retención:
  1. [ ] Datos de cuenta: 1 año post-baja
  2. [ ] Historial de reciclaje: 2 años post-baja
  3. [ ] Historial de canjes: 3 años
  4. [ ] Metadatos de acceso: 1 año
- [ ] Texto sobre derecho de cancelación anticipada

#### ✓ Sección 5: Tus Derechos (ARCO)
- [ ] 4 tarjetas grid (md:grid-cols-2):
  1. [ ] Acceso (A)
  2. [ ] Rectificación (R)
  3. [ ] Cancelación (C)
  4. [ ] Oposición (O)
- [ ] Cada tarjeta es Card con bg-emerald-50 border-emerald-300
- [ ] Card amarilla (yellow-50) con instrucciones:
  - [ ] Email: privacidad@ecoconce.cl
  - [ ] Asunto: "Derechos ARCO"
  - [ ] Plazo: 15 días hábiles máximo

#### ✓ Sección 6: Medidas de Seguridad
- [ ] 6 items (lista con bullet points):
  1. [ ] Contraseñas: hash BCrypt
  2. [ ] Comunicaciones: HTTPS/TLS
  3. [ ] Autenticación: JWT
  4. [ ] Almacenamiento: servidores locales en Chile
  5. [ ] Integridad referencial: Oracle constraints
  6. [ ] Auditoría: timestamps y usuario responsable

#### ✓ Sección 7: Terceros y Transferencias
- [ ] Afirmación: "NO comparte datos con terceros"
- [ ] Mención de Google Maps:
  - [ ] Solo recibe coordenadas de puntos públicos
  - [ ] NO información personal de usuarios
  - [ ] Sin API key identificable
- [ ] Datos almacenados en Chile

#### ✓ Footer
- [ ] Card verde (emerald-50) con borde emerald-300
- [ ] Ícono Mail (lucide-react)
- [ ] "¿Tienes preguntas?"
- [ ] Email destacado: privacidad@ecoconce.cl
- [ ] Referencia a Ley 21.719

#### ✓ Estilo
- [ ] Tailwind CSS usado para diseño
- [ ] Colores coherentes (emerald para privacidad, rojo para datos sensibles)
- [ ] Responsive: works en mobile y desktop
- [ ] Fuentes: text-sm para párrafos, text-xs para detalles

---

### Parte 3: Frontend — Rutas

#### ✓ routes.tsx
- [ ] `PrivacyPolicy` importado: `import { PrivacyPolicy } from "./pages/PrivacyPolicy";`
- [ ] Ruta agregada:
  ```javascript
  {
    path: "/privacidad",
    Component: PrivacyPolicy,
  }
  ```
- [ ] Posición: después de `/registro`, antes de otras rutas
- [ ] NO requiere autenticación (ProtectedRoute)

#### ✓ Navegación Funcional
- [ ] Navegar a `http://localhost:5500/privacidad` → carga PrivacyPolicy
- [ ] Link desde Register.tsx va a `/privacidad` en nueva pestaña (`target="_blank"`)

---

### Parte 4: Backend — Endpoint de Eliminación

#### ✓ Imports en UsuarioController.java
- [ ] `import org.springframework.http.ResponseEntity;`
- [ ] `import java.util.Map;` (ya existía)

#### ✓ Método deleteMapping
```java
@DeleteMapping("/{id}/cuenta")
@PreAuthorize("hasRole('ADMIN') or authentication.principal.username == #id.toString()")
@Transactional
public ResponseEntity<Map<String, String>> solicitarBajaCuenta(@PathVariable Long id)
```

Verificar:
- [ ] HTTP Method: DELETE
- [ ] URL: `/api/usuarios/{id}/cuenta`
- [ ] Annotations:
  - [ ] `@DeleteMapping("/{id}/cuenta")`
  - [ ] `@PreAuthorize(...)` con condición: ADMIN O usuario propietario
  - [ ] `@Transactional`
- [ ] Parámetro: `@PathVariable Long id`
- [ ] Return type: `ResponseEntity<Map<String, String>>`
- [ ] Llama a `anonimizarCuenta(id)`
- [ ] Response JSON:
  ```json
  {
    "mensaje": "Tu cuenta ha sido anonimizada. Los datos de auditoría se eliminarán en 30 días conforme a la Ley 21.719.",
    "estado": "cuenta_anonimizada"
  }
  ```

#### ✓ Método Privado anonimizarCuenta()
```java
private void anonimizarCuenta(Long usuarioId)
```

Verificar:
- [ ] Busca usuario: `usuarioRepository.findById(usuarioId)`
- [ ] Lanza excepción si no existe: `RecursoNoEncontradoException`
- [ ] Anonimiza 8 campos:
  1. [ ] `nombreAlias = "ANONIMO_" + usuarioId`
  2. [ ] `correo = "ANONIMO_" + usuarioId + "@eliminado.ecoconce.cl"`
  3. [ ] `rut = "00000000-0"`
  4. [ ] `telefono = null`
  5. [ ] `direccion = null`
  6. [ ] `sexoGenero = null`
  7. [ ] `fechaNacimiento = null`
  8. [ ] `contrasena = "[CUENTA_ELIMINADA]"`
  9. [ ] `activo = "N"` (BONUS: desactiva la cuenta)
- [ ] Guarda en repositorio: `usuarioRepository.save(usuario)`
- [ ] NO intenta eliminar, preserva FK integrity

#### ✓ Compilación
- [ ] `mvnw clean compile -q` ejecuta sin errores
- [ ] No hay warnings de imports no utilizados

---

### Parte 5: Backend — Compilación y Tests

#### ✓ Compilación
```bash
cd ecoconce-backend
mvnw clean compile -q
```
- [ ] Resultado: BUILD SUCCESS
- [ ] Sin errores de sintaxis
- [ ] Sin warnings de tipos

#### ✓ Tests
```bash
mvnw test -q
```
- [ ] Todos los tests pasan (84/84 esperados)
- [ ] Ningún test fallido
- [ ] Ningún error de integración

---

### Parte 6: Testing Manual — Registro

#### ✓ Escenario 1: Registro sin consentimiento general
1. [ ] Navegar a `http://localhost:5500/registro`
2. [ ] Completar todos los campos EXCEPTO:
   - [ ] NO marcar "Autorizo el tratamiento de mis datos personales"
3. [ ] Intentar hacer click en "Registrarse"
4. [ ] **Esperado:**
   - [ ] Aparece error rojo: "Debes aceptar la política de privacidad."
   - [ ] Formulario NO se envía
   - [ ] Botón permanece activo para reintentar

#### ✓ Escenario 2: Registro con sexo/género pero sin consentimiento
1. [ ] Navegar a `http://localhost:5500/registro`
2. [ ] Completar formulario:
   - [ ] Marcar checkbox "Autorizo el tratamiento de mis datos personales"
   - [ ] Seleccionar valor en "Sexo / Género" (ej: Masculino)
   - [ ] NO marcar "Dato Sensible: Autorizo que mi sexo/género..."
3. [ ] Intentar "Registrarse"
4. [ ] **Esperado:**
   - [ ] Aparece error rojo: "Debes autorizar el tratamiento de datos de sexo/género."
   - [ ] Formulario NO se envía

#### ✓ Escenario 3: Registro sin especificar sexo/género (OK)
1. [ ] Navegar a `http://localhost:5500/registro`
2. [ ] Completar formulario:
   - [ ] Marcar "Autorizo el tratamiento de mis datos personales"
   - [ ] NO seleccionar sexo/género (dejar vacío)
   - [ ] Checkbox de sexo/género NO debe verse
3. [ ] Click en "Registrarse"
4. [ ] **Esperado:**
   - [ ] Registro exitoso
   - [ ] Redirige a `/ciudadano`

#### ✓ Escenario 4: Registro completo (TODO OK)
1. [ ] Navegar a `http://localhost:5500/registro`
2. [ ] Llenar TODOS los campos:
   - [ ] Nombre, RUT, fecha nac, correo, teléfono, región, comuna
   - [ ] Seleccionar sexo/género
   - [ ] Contrasena y confirmación
   - [ ] ✓ "Acepto los términos y condiciones de EcoConce"
   - [ ] ✓ "Autorizo el tratamiento de mis datos personales" (con link a /privacidad funcional)
   - [ ] ✓ "Dato Sensible: Autorizo que mi sexo/género..." (visible, marcado)
3. [ ] Click en "Registrarse"
4. [ ] **Esperado:**
   - [ ] Loading animation aparece
   - [ ] 2-3 segundos de espera
   - [ ] Redirige a `/ciudadano` (dashboard)
   - [ ] Usuario está logueado

---

### Parte 7: Testing Manual — Página de Privacidad

#### ✓ Navegación
1. [ ] Escribir URL: `http://localhost:5500/privacidad`
2. [ ] **Esperado:** Carga página (sin necesidad de estar logueado)
3. [ ] Estructura visible:
   - [ ] Header con logo Shield + título
   - [ ] Tabla de contenidos
   - [ ] 7 secciones principales
   - [ ] Footer con contacto

#### ✓ Contenido Específico
- [ ] Sección 1 menciona "Jordan Díaz Zavala", "Fernando Sorrel Pinto", "DUOC UC"
- [ ] Sección 2 lista: RUT, Correo, Fecha nac, Sexo/Género (⚠️), Teléfono, etc.
- [ ] Sección 4 menciona períodos: "1 año", "2 años", "3 años"
- [ ] Sección 5 tiene 4 cards ARCO
- [ ] Todos los puntos tienen email: privacidad@ecoconce.cl

#### ✓ Links
- [ ] Links internos en tabla de contenidos funcionan (scroll a secciones)
- [ ] Link en footer: privacidad@ecoconce.cl no es clickeable (es display, no mailto)

---

### Parte 8: Testing Manual — Backend DELETE

#### ✓ Preparación
```bash
# Iniciar servidor
cd ecoconce-backend
mvnw spring-boot:run
```
- [ ] Servidor arranca en puerto 8081
- [ ] Logs muestran "Started EcoConce..."

#### ✓ Crear Usuario de Prueba
```bash
curl -X POST http://localhost:8081/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "21.000.000-0",
    "nombreAlias": "TestDelete",
    "correo": "testdelete@ecoconce.cl",
    "contrasena": "Password123",
    "sexoGenero": "Femenino",
    "fechaNacimiento": "2000-05-20",
    "telefono": "+56987654321",
    "comunaId": 1,
    "direccion": "Test Ave 456",
    "rolId": 1
  }'
```
- [ ] Response: HTTP 200 OK
- [ ] Copiar `"id"` de la respuesta (ej: 23)

#### ✓ Login y Obtener Token
```bash
curl -X POST http://localhost:8081/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "testdelete@ecoconce.cl",
    "contrasena": "Password123"
  }'
```
- [ ] Response contiene `"token": "eyJ..."`
- [ ] Copiar token completo

#### ✓ Eliminar Cuenta (DELETE)
```bash
curl -X DELETE http://localhost:8081/api/usuarios/23/cuenta \
  -H "Authorization: Bearer eyJ..."
```
- [ ] HTTP 200 OK
- [ ] Response:
  ```json
  {
    "mensaje": "Tu cuenta ha sido anonimizada. Los datos de auditoría se eliminarán en 30 días conforme a la Ley 21.719.",
    "estado": "cuenta_anonimizada"
  }
  ```

#### ✓ Verificar Anonimización
```bash
curl http://localhost:8081/api/usuarios/23
```
- [ ] `nombreAlias`: "ANONIMO_23"
- [ ] `correo`: "ANONIMO_23@eliminado.ecoconce.cl"
- [ ] `rut`: "00000000-0"
- [ ] `telefono`: null
- [ ] `direccion`: null
- [ ] `sexoGenero`: null
- [ ] `fechaNacimiento`: null
- [ ] `activo`: "N"

#### ✓ Intentar Login con Cuenta Anonimizada
```bash
curl -X POST http://localhost:8081/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "ANONIMO_23@eliminado.ecoconce.cl",
    "contrasena": "cualquiercontraseña"
  }'
```
- [ ] HTTP 401 (Unauthorized)
- [ ] Error: "Credenciales inválidas"

---

### Parte 9: Documentación

#### ✓ Archivos Creados
- [ ] `ecoconce-backend/docs/MD_11_LEY_21719_PROTECCION_DATOS.md` (completo)
- [ ] `RESUMEN_MD11_IMPLEMENTACION.md` (nivel raíz)
- [ ] `VERIFICACION_MD11.md` (este archivo)

#### ✓ Contenido MD_11_LEY_21719
- [ ] RAT con 12 categorías de datos
- [ ] Flujo de datos (CIUDADANO → Oracle → Google Maps)
- [ ] Base legal de cada categoría
- [ ] Períodos de retención
- [ ] Protocolo de 72 horas para brechas
- [ ] SQL queries para auditoría
- [ ] Argumentos de defensa (5 preguntas frecuentes)

---

## 🎯 Resultado Final

**Todos los puntos pasados: ✅ MD-11 COMPLETADO Y VERIFICADO**

Marca todos los checkboxes antes de dar por terminado MD-11.

---

**Fecha de Verificación:** _______________  
**Verificado Por:** _______________  
**Observaciones Adicionales:**
_____________________________________________________________________________


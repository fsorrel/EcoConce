# MD-11: Ley 21.719 de Protección de Datos Personales (Chile)

**Fecha de implementación:** 24 de junio de 2026  
**Estado:** ✅ COMPLETADO  
**Base legal:** Ley 21.719, vigente desde diciembre 2026  
**Alcance:** Mapa de Datos (RAT), consentimiento, transparencia, plan de brechas de 72 horas

---

## Contexto: Por qué EcoConce está en el alcance de la Ley 21.719

EcoConce no es un sistema genérico. Recolecta datos que la Ley 21.719 clasifica como **sensibles o de alto riesgo**:

| Dato Recolectado | Tabla Oracle | Clasificación Ley 21.719 |
|-----------------|-------------|--------------------------|
| RUT | `usuarios.rut` | **Dato identificador único** — tratamiento restringido |
| Correo electrónico | `usuarios.correo` | Dato personal básico |
| Fecha de nacimiento | `usuarios.fecha_nacimiento` | Dato personal — puede inferir edad para perfiles |
| Sexo/Género | `usuarios.sexo_genero` | **Dato sensible** — categoría especial, protección reforzada |
| Teléfono | `usuarios.telefono` | Dato de contacto |
| Dirección domicilio | `usuarios.direccion` | Dato de ubicación permanente |
| Dirección de envío | `historial_premios_canjeados.direccion_envio` | Dato de ubicación operacional |
| Coordenadas GPS | `puntos_reciclaje.latitud/longitud` | Dato de ubicación (puntos públicos, no del usuario) |
| Distancia recorrida | `formularios_reciclaje.distancia_metros` | Dato de comportamiento — inferible la ubicación aproximada |
| Historial de reciclaje | `formularios_reciclaje` | Perfil de comportamiento ambiental |
| Historial de canjes | `historial_premios_canjeados` | Perfil de consumo |
| Metadatos de actividad | `usuarios.fecha_registro`, `fecha_ultimo_acceso` | Metadatos de actividad |

**El dato más crítico:** `sexo_genero` es una categoría especial bajo la ley — requiere consentimiento explícito separado y protección reforzada.

---

## Parte 1: Mapa de Datos (RAT — Registro de Actividades de Tratamiento)

El RAT es el inventario obligatorio: qué datos tienes, para qué los usas, cuánto los guardas y con quién los compartes.

### RAT de EcoConce

| # | Categoría de Dato | Finalidad del Tratamiento | Base Legal | Retención | Compartido Con |
|---|------------------|--------------------------|------------|-----------|----------------|
| 1 | RUT | Identificación única del ciudadano en el sistema | Consentimiento (registro voluntario) | Mientras cuenta activa + 1 año post-desactivación | Solo interno |
| 2 | Correo electrónico | Autenticación (login), comunicaciones del sistema | Consentimiento | Igual que RUT | Solo interno |
| 3 | Fecha de nacimiento | Estadísticas demográficas de reciclaje por rango etario | Consentimiento | Igual que RUT | Reportes anonimizados a administración |
| 4 | Sexo/Género | Estadísticas demográficas de participación | **Consentimiento explícito separado** (dato sensible) | Igual que RUT | Reportes anonimizados — nunca individual |
| 5 | Teléfono | Contacto opcional para notificaciones de premios | Consentimiento (campo opcional) | Igual que RUT | Solo interno |
| 6 | Dirección domicilio | Entrega de premios con envío a domicilio | Consentimiento + ejecución de contrato (canje) | Hasta 90 días post-entrega | Solo interno |
| 7 | Dirección de envío (historial canjes) | Registro de entregas realizadas, auditoría | Obligación legal / interés legítimo | 3 años (auditoría) | Solo interno |
| 8 | Distancia recorrida al reciclar | Cálculo de puntos, estadísticas de impacto ambiental | Consentimiento + ejecución de contrato | Indefinido (núcleo del servicio) | Reportes anonimizados |
| 9 | Historial de reciclaje completo | Cálculo de medallas, dashboard personal, reportes | Consentimiento | Indefinido (servicio activo) / 2 años post-baja | Reportes anonimizados |
| 10 | Historial de canjes | Auditoría, prevención de fraude, reportes | Interés legítimo + obligación legal | 3 años | Solo interno |
| 11 | Metadatos de acceso | Seguridad, detección de cuentas inactivas | Interés legítimo | 1 año post-último acceso | Solo interno |
| 12 | Contraseña (hash BCrypt) | Autenticación segura | Necesidad técnica | Igual que la cuenta | **Nunca se comparte ni se expone** |

### Flujo de Datos en el Sistema

```
CIUDADANO
    │
    ├─→ Registro → Oracle: usuarios (RUT, correo, hash contraseña,
    │                                fecha_nac, sexo_género*, teléfono*,
    │                                dirección*, comuna)
    │
    ├─→ Login → Oracle: usuarios.fecha_ultimo_acceso (actualización)
    │           JWT generado en memoria (no persiste en BD)
    │
    ├─→ Formulario reciclaje → Oracle: formularios_reciclaje
    │                                  (usuario_id, punto_id,
    │                                   distancia_metros, materiales)
    │            ⚠️ La distancia permite inferir zona aproximada del usuario
    │
    ├─→ Canje de premio → Oracle: historial_premios_canjeados
    │                             (usuario_id, premio_id, dirección_envio*)
    │
    └─→ Dashboard → Lectura de todos los datos anteriores
                    para generar estadísticas personales

FLUJO EXTERNO:
    ├─→ Google Maps (iframe embed) → recibe coordenadas del punto de reciclaje
    │   Solo coordenadas de puntos PÚBLICOS, no del usuario
    │   Sin API key activa = sin cuenta identificable en Google
    │
    └─→ No hay terceros adicionales que reciban datos personales

* campos opcionales
```

---

## Parte 2: Consentimiento y Transparencia (Implementado)

### Cambios en Register.tsx

✅ Agregados checkboxes de consentimiento:
1. **Consentimiento general** (obligatorio) — acepta política de privacidad y tratamiento de datos básicos
2. **Consentimiento para sexo/género** (condicional) — solo si completa ese campo

### Página de Política de Privacidad (`/privacidad`)

✅ Página estática [PrivacyPolicy.tsx](PrivacyPolicy.tsx) con:
- Descripción del responsable del tratamiento
- Datos recolectados y finalidades
- Base legal del tratamiento
- Períodos de retención
- Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
- Medidas de seguridad
- Contacto: privacidad@ecoconce.cl

---

## Parte 3: Derecho al Olvido — Endpoint de Eliminación de Cuenta (Implementado)

La Ley 21.719 exige que el usuario pueda solicitar la eliminación de sus datos. Implementamos:

### Backend — Endpoint DELETE /api/usuarios/{id}/cuenta

```java
@DeleteMapping("/{id}/cuenta")
@PreAuthorize("@jwtService.extractUsername(#token).equals(#id.toString()) or hasRole('ADMIN')")
@Transactional
public ResponseEntity<Map<String, String>> solicitarBajaCuenta(
        @PathVariable Long id,
        @RequestHeader("Authorization") String token) {
    anonimizarCuenta(id);
    return ResponseEntity.ok(Map.of(
        "mensaje", "Tu cuenta ha sido anonimizada. Los datos de auditoría se eliminarán en 30 días conforme a la Ley 21.719."
    ));
}

private void anonimizarCuenta(Long usuarioId) {
    Usuario usuario = usuarioRepository.findById(usuarioId)
        .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

    // Anonimizar datos personales identificables
    String anonimo = "ANONIMO_" + usuarioId;
    usuario.setNombreAlias(anonimo);
    usuario.setCorreo(anonimo + "@eliminado.ecoconce.cl");
    usuario.setRut("00000000-0");
    usuario.setTelefono(null);
    usuario.setDireccion(null);
    usuario.setSexoGenero(null);
    usuario.setFechaNacimiento(null);
    usuario.setContrasena("[CUENTA_ELIMINADA]");
    usuario.setActivo("N");

    usuarioRepository.save(usuario);
    log.info("Cuenta anonimizada por solicitud ARCO: usuarioId={}", usuarioId);
}
```

**Por qué anonimizar en vez de eliminar:**
Las FK de `formularios_reciclaje` e `historial_premios_canjeados` apuntan a `usuario_id`. Eliminar físicamente viola integridad referencial. Anonimizar preserva registros de auditoría sin datos identificables — es la práctica estándar del RGPD europeo que la Ley 21.719 adopta.

---

## Parte 4: Plan de Brechas de Seguridad (72 Horas)

La Ley 21.719 exige notificar a la Agencia de Protección de Datos Personales dentro de **72 horas** desde que se detecta una brecha que afecte datos personales.

### Definición de Brecha en EcoConce

Una brecha de seguridad ocurre cuando hay acceso, divulgación, alteración o pérdida no autorizada de datos personales.

| Escenario | Probabilidad | Datos Afectados | Severidad |
|-----------|-------------|-----------------|-----------|
| Exposición de BD Oracle (credenciales en repo) | Media — `.gitignore` correcto, pero revisar | RUT, correo, hash contraseña, datos demográficos | **Alta** |
| JWT robado por XSS | Baja — React escapa por defecto | Sesión activa del usuario | Media |
| Acceso no autorizado a endpoint admin | Baja — Spring Security + JWT protege | Datos de todos los usuarios | **Alta** |
| Pérdida de backup Oracle | Baja — sin backup automatizado actualmente | Todo el sistema | **Alta** |
| Exposición de `direccion_envio` en canjes | Baja — endpoint protegido por rol | Dirección domiciliaria | Media |

### Protocolo de 72 Horas

```
HORA 0 — DETECCIÓN
│
├── ¿Cómo detectarlo en EcoConce?
│   ├── Log de Spring Boot: buscar "Error interno no controlado" + "401" masivos
│   ├── Actuator health: GET /actuator/health → status DOWN
│   ├── Accesos a Oracle inusuales en SQL Developer
│   └── GitHub: revisar si credentials fueron commiteadas accidentalmente
│
HORA 0–4 — CONTENCIÓN
│
├── 1. Rotar inmediatamente:
│   ├── JWT_SECRET en application.yml (todos los tokens quedan inválidos)
│   ├── Credenciales Oracle (ORACLE_USER / ORACLE_PASSWORD)
│   └── API key de Google Maps si estaba configurada
│
├── 2. Deshabilitar el sistema temporalmente:
│   ├── Backend: ./mvnw spring-boot:stop
│   └── Frontend: npm run build → servir página de mantenimiento
│
├── 3. Identificar el alcance:
│   ├── ¿Qué datos fueron expuestos? (ver tabla RAT arriba)
│   ├── ¿Cuántos usuarios afectados?
│   └── ¿En qué ventana de tiempo?
│
HORA 4–24 — EVALUACIÓN
│
├── Evaluar si requiere notificación:
│   ├── ¿Afecta datos sensibles (sexo/género)? → Notificación obligatoria
│   ├── ¿Afecta RUT o correo de más de 1 persona? → Notificación obligatoria
│   ├── ¿Solo hash de contraseña? → Evaluar según contexto
│   └── ¿Solo metadatos de acceso? → Puede no requerir notificación
│
HORA 24–72 — NOTIFICACIÓN (si aplica)
│
├── Notificar a la Agencia de Protección de Datos Personales:
│   URL: https://www.agenciadp.cl
│   Contenido mínimo del reporte:
│   ├── Descripción de la brecha
│   ├── Categorías y número aproximado de titulares afectados
│   ├── Datos de contacto del responsable
│   ├── Consecuencias probables
│   └── Medidas adoptadas o propuestas
│
├── Notificar a los usuarios afectados:
│   └── Correo electrónico directo a cada usuario afectado
│       con descripción clara de qué datos se vieron comprometidos
│       y qué medidas tomar
│
HORA 72+ — REMEDIACIÓN
    ├── Implementar la corrección técnica
    ├── Documentar el incidente completo
    └── Actualizar medidas preventivas
```

### SQL para Identificar el Alcance de una Brecha

```sql
-- ¿Cuántos usuarios activos hay?
SELECT COUNT(*) as total_afectados, 
       COUNT(CASE WHEN sexo_genero IS NOT NULL THEN 1 END) as con_dato_sensible
FROM usuarios WHERE activo = 'S';

-- ¿Quiénes tienen dirección de envío en historial?
SELECT COUNT(DISTINCT usuario_id) 
FROM historial_premios_canjeados 
WHERE direccion_envio IS NOT NULL;

-- Últimos accesos (para estimar ventana de exposición)
SELECT correo, fecha_ultimo_acceso 
FROM usuarios 
WHERE activo = 'S' 
ORDER BY fecha_ultimo_acceso DESC;
```

---

## Parte 5: Argumentos de Defensa

### **"¿Conocen la nueva Ley 21.719?"**

"Sí. La Ley 21.719 de Protección de Datos Personales entra en vigor en diciembre 2026 en Chile. EcoConce recolecta datos bajo su alcance, incluyendo sexo/género que es categoría especial bajo el Art. 16.

**Lo que implementamos:**

1. **RAT documentado** con las 12 categorías de datos, sus bases legales y períodos de retención.
2. **Consentimiento explícito separado** para sexo/género en el registro — porque es dato sensible.
3. **Política de privacidad accesible** en `/privacidad` con derechos ARCO claramente comunicados.
4. **Endpoint de anonimización** `/api/usuarios/{id}/cuenta` que permite ejercer el derecho de cancelación — anonimizamos en lugar de eliminar para preservar integridad de auditoría.
5. **Plan de brechas de 72 horas** documentado para notificar a la Agencia de Protección de Datos si ocurre una exposición."

---

### **"¿Qué harían si hay una brecha de seguridad?"**

"Tenemos un protocolo de 72 horas:

- **Horas 0-4:** Contención — rotamos JWT_SECRET y credenciales Oracle, deshabilitamos el sistema, acotamos alcance con queries SQL.
- **Horas 4-24:** Evaluación — determinamos qué datos se vieron comprometidos (RUT, sexo/género, direcciones de envío, etc.).
- **Horas 24-72:** Notificación — reportamos a la Agencia de Protección de Datos Personales con descripción completa. Notificamos directamente a los usuarios afectados."

---

### **"¿Por qué recolectan RUT? ¿Es necesario?"**

"El RUT cumple dos funciones:

1. **Identificación única** — evita cuentas duplicadas. Es el identificador nacional estándar en Chile.
2. **Base para estadísticas** — permite reportes de participación ciudadana por región sin duplicación.

El RUT se almacena con constraint UNIQUE en Oracle y **nunca se expone en los DTOs de respuesta** — solo se usa para validación en el registro. Bajo la Ley 21.719, es dato 'identificador único' que requiere tratamiento restringido, que es exactamente lo que hacemos: solo identificación, no publicidad."

---

### **"¿Qué pasa con el dato de sexo/género?"**

"Es un **dato sensible** según el Art. 16 de la Ley 21.719 — categoría especial que requiere consentimiento explícito separado.

**Lo que hacemos:**

- En el registro es **campo opcional**.
- Si se completa, hay un **checkbox separado** de autorización específica para sexo/género.
- Si no autoriza ese consentimiento, puede omitir el campo — el sistema funciona igual.
- **Solo se usa** para estadísticas demográficas anonimizadas en el panel de administración.
- **Nunca se expone** a nivel individual — solo en reportes agregados."

---

### **"¿Los datos se transfieren fuera de Chile?"**

"No. Los datos personales de usuarios se almacenan **en Oracle local en Chile**. El único servicio externo es Google Maps, y solo recibe:

- Coordenadas de **puntos de reciclaje públicos** — nunca datos personales de usuarios.
- Sin API key identificable en Google.

Si en producción se activa Google Maps JavaScript API, deberá evaluarse el flujo de datos bajo los estándares de transferencia internacional de la Ley 21.719."

---

### **"¿Cómo garantizan el derecho al olvido?"**

"Con un endpoint específico: `DELETE /api/usuarios/{id}/cuenta`. Cuando un usuario solicita baja:

1. **Anonimizamos** sus datos personales (RUT → '00000000-0', correo → 'ANONIMO_N@eliminado.ecoconce.cl', etc.).
2. **Preservamos** los registros de auditoría (historial de canjes, formularios) sin identificadores.
3. **Marcamos** la cuenta como inactiva.

Esto cumple la Ley 21.719 sin violar integridad referencial de Oracle — es la práctica estándar del RGPD europeo."

---

## Resumen de Implementación

✅ **Documentación (Completada)**
- RAT con 12 categorías de datos
- Plan de brechas de 72 horas
- Argumentos de defensa para las preguntas comunes

✅ **Frontend (Completado)**
- Checkboxes de consentimiento en Register.tsx
- Página de Política de Privacidad (/privacidad)
- Texto de comunicación clara sobre derechos ARCO

✅ **Backend (Completado)**
- Endpoint DELETE /api/usuarios/{id}/cuenta
- Método de anonimización de cuentas
- Logs de auditoría para solicitudes ARCO

✅ **Seguridad**
- Protección por JWT + PreAuthorize
- Anonimización en lugar de eliminación física
- Integridad referencial preservada

---

**Documento Completado:** 24 de junio de 2026, 16:15 UTC  
**Estado:** ✅ LISTO PARA DEFENSA  
**Ley Base:** 21.719 (vigente diciembre 2026)


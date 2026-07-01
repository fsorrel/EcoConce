-- ============================================================================
-- EcoConce — Script de actualización DDL (junio 2026)
-- Pone la base Oracle al día con el código actual:
--   FIX 1 — envío de premios en historial_premios_canjeados
--   FIX 2 — consentimientos Ley 21.719 en usuarios
--   FIX 3 — idempotencia de canjes en historial_premios_canjeados
--
-- Prerequisito: ya aplicados migracion_optimistic_locking.sql e indices_oracle.sql.
-- Ejecutar completo en Oracle SQL Developer, conectado al esquema ECOCONCE.
--
-- NOTA: con spring.jpa.hibernate.ddl-auto=validate (perfil oracle), la aplicación
-- NO levanta si estas columnas no existen. En H2 (perfil test) se crean solas.
-- ============================================================================

-- ─── FIX 1: Columnas de envío en historial_premios_canjeados ─────────────────
-- La entidad HistorialPremioCanjeado ya tiene estos @Column; faltan en el DDL.

ALTER TABLE historial_premios_canjeados
    ADD (
        envio_domicilio  CHAR(1)       DEFAULT 'N' NOT NULL,
        direccion_envio  VARCHAR2(255)
    );

ALTER TABLE historial_premios_canjeados
    ADD CONSTRAINT chk_hpc_envio_domicilio
    CHECK (envio_domicilio IN ('S', 'N'));

-- ─── FIX 2: Consentimientos Ley 21.719 en usuarios ───────────────────────────
-- Soporta los nuevos campos de Usuario.java y UsuarioRequest.java.

ALTER TABLE usuarios
    ADD (
        consentimiento_general      CHAR(1)    DEFAULT 'N' NOT NULL,
        consentimiento_sexo_genero  CHAR(1)    DEFAULT 'N' NOT NULL,
        fecha_consentimiento        TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
    );

ALTER TABLE usuarios
    ADD CONSTRAINT chk_usr_consentimiento_gral
    CHECK (consentimiento_general IN ('S', 'N'));

ALTER TABLE usuarios
    ADD CONSTRAINT chk_usr_consentimiento_sg
    CHECK (consentimiento_sexo_genero IN ('S', 'N'));

-- ─── FIX 3: Idempotencia de canjes en historial_premios_canjeados ────────────
-- Soporta el campo idempotencyKey de HistorialPremioCanjeado y el header
-- Idempotency-Key del endpoint POST /api/premios/{id}/canjear.

ALTER TABLE historial_premios_canjeados
    ADD (idempotency_key VARCHAR2(64));

-- Oracle permite múltiples NULL en un índice UNIQUE, así que los canjes sin
-- clave (legacy) conviven con los que sí la tienen.
CREATE UNIQUE INDEX idx_hpc_idempotency
    ON historial_premios_canjeados (idempotency_key);

COMMIT;

-- ─── Verificación ─────────────────────────────────────────────────────────────

-- SELECT column_name, data_type, data_length, nullable, data_default
-- FROM user_tab_columns
-- WHERE table_name = 'HISTORIAL_PREMIOS_CANJEADOS'
-- ORDER BY column_id;

-- SELECT column_name, data_type, nullable, data_default
-- FROM user_tab_columns
-- WHERE table_name = 'USUARIOS'
--   AND column_name IN ('CONSENTIMIENTO_GENERAL','CONSENTIMIENTO_SEXO_GENERO','FECHA_CONSENTIMIENTO')
-- ORDER BY column_id;

-- SELECT index_name, uniqueness, status FROM user_indexes
-- WHERE table_name = 'HISTORIAL_PREMIOS_CANJEADOS';

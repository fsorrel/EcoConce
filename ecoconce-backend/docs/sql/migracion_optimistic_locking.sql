-- ============================================================================
-- Migración: control de concurrencia optimista en PREMIOS (@Version)
-- ----------------------------------------------------------------------------
-- El perfil Oracle del backend usa spring.jpa.hibernate.ddl-auto=validate, por
-- lo que la columna VERSION debe existir ANTES de arrancar la aplicación.
-- En H2 (perfiles dev/test con create-drop) la columna se crea automáticamente.
--
-- Ejecutar UNA vez en Oracle SQL Developer conectado al esquema ECOCONCE.
-- ============================================================================

ALTER TABLE PREMIOS ADD (VERSION NUMBER(19) DEFAULT 0 NOT NULL);

-- Asegura que las filas existentes queden con versión 0 (por si el DEFAULT no
-- se aplicó retroactivamente en alguna versión de Oracle).
UPDATE PREMIOS SET VERSION = 0 WHERE VERSION IS NULL;
COMMIT;

-- Verificación:
--   SELECT id, nombre, stock, version FROM PREMIOS ORDER BY id;

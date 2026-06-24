-- ============================================================================
-- Índices de rendimiento sobre columnas FK / de búsqueda frecuente
-- ----------------------------------------------------------------------------
-- Oracle NO crea índice automático sobre claves foráneas (a diferencia de MySQL).
-- Estos índices aceleran los JOIN/WHERE más comunes del sistema.
-- Nombres de tabla reales del esquema (Hibernate los crea en plural/minúscula).
-- Ejecutar UNA vez en Oracle SQL Developer conectado al esquema ECOCONCE.
-- ============================================================================

CREATE INDEX idx_formulario_usuario ON formularios_reciclaje (usuario_id);
CREATE INDEX idx_formulario_punto   ON formularios_reciclaje (punto_id);
CREATE INDEX idx_canje_usuario      ON historial_premios_canjeados (usuario_id);
CREATE INDEX idx_canje_premio       ON historial_premios_canjeados (premio_id);
CREATE INDEX idx_usuario_correo     ON usuarios (correo);   -- el login busca por correo
COMMIT;

-- Verificar el plan de ejecución (debería usar INDEX RANGE SCAN, no FULL TABLE SCAN):
--   EXPLAIN PLAN FOR
--   SELECT * FROM formularios_reciclaje WHERE usuario_id = 1;
--   SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

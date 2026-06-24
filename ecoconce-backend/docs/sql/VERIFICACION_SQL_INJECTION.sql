-- Verificación SQL para pruebas de SQL Injection
-- Usar en Oracle SQL Developer después de ejecutar SQL-03

-- 1. Verificar que el registro se guardó correctamente (texto literal, no ejecutado)
SELECT ID, NOMBRE, DESCRIPCION, COSTO_PUNTOS, STOCK, ACTIVO 
FROM PREMIO 
ORDER BY ID DESC 
FETCH FIRST 1 ROWS ONLY;

-- Resultado esperado:
-- ID | NOMBRE                          | DESCRIPCION | COSTO_PUNTOS | STOCK | ACTIVO
-- XX | '; DROP TABLE PREMIO; --        | Test SQL... | 100          | 10    | S

-- 2. Verificar que la tabla PREMIO sigue existiendo (DROP no se ejecutó)
SELECT COUNT(*) AS total_registros FROM PREMIO;
-- Resultado esperado: COUNT(*) > 0

-- 3. Verificar los últimos 3 registros creados (para confirmar que más allá del injection, todo funciona)
SELECT ID, NOMBRE, COSTO_PUNTOS FROM PREMIO ORDER BY ID DESC FETCH FIRST 3 ROWS ONLY;

-- 4. Búsqueda con parámetro SQL injection (verificar que devuelve lista vacía, no TODOS los registros)
-- Nota: Esta es una prueba de comportamiento, no un query real de la BD
-- Se ejecuta desde Postman con: GET /api/puntos?nombre=' OR 1=1 --
-- Resultado esperado: [] (lista vacía) o error 400

-- 5. Limpiar registros de prueba (opcional, después de completar las pruebas)
-- DELETE FROM PREMIO WHERE NOMBRE LIKE '%XSS%' OR NOMBRE LIKE '%DROP%' OR NOMBRE LIKE '%script%';
-- COMMIT;

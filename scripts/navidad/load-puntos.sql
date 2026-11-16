-- Carga puntos_navidad.csv (generado por puntos-a-csv.cjs) en punto_encuentro_navidad.
-- Uso:
--   psql -h localhost -U postgres -d undood_test -f scripts/navidad/load-puntos.sql < ../puntos_navidad.csv
--
-- Reemplaza todos los puntos (nada referencia a esta tabla), así se puede volver a correr cuando cambie el Excel.

\set ON_ERROR_STOP on
BEGIN;

TRUNCATE punto_encuentro_navidad RESTART IDENTITY;

-- El CSV entra por stdin (ver "Uso" arriba). El orden del Excel se mantiene en los ids.
\copy punto_encuentro_navidad (nombre, direccion, latitud, longitud, google_maps, availability_time, notas, status) FROM pstdin WITH (FORMAT csv, HEADER true)

SELECT count(*) AS puntos, count(*) FILTER (WHERE status = 1) AS visibles FROM punto_encuentro_navidad;

COMMIT;

-- Carga cartas_navidad.csv (generado por unificar-cartas.cjs) en niño_navidad y regalo_navidad.
-- Uso:
--   psql -h localhost -U postgres -d undood_test -f scripts/navidad/load-cartas.sql < "../cartas navidad/cartas_navidad.csv"
--
-- El CSV tiene una fila por regalo, con los datos del chico/a repetidos. id_niño del CSV se usa como id real.
-- Por seguridad sólo carga si niño_navidad está vacía (para no pisar cartas ya elegidas).

\set ON_ERROR_STOP on
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "niño_navidad") THEN
    RAISE EXCEPTION 'niño_navidad ya tiene datos: no se carga nada.';
  END IF;
END $$;

CREATE TEMP TABLE cartas_csv (
  "id_niño"     integer NOT NULL,
  nombre        text    NOT NULL,
  hogar         text    NOT NULL,
  edad          integer NOT NULL,
  observaciones text,
  regalo        text    NOT NULL,
  talle         text,
  link_ref      text
) ON COMMIT DROP;

-- El CSV entra por stdin (ver "Uso" arriba).
\copy cartas_csv FROM pstdin WITH (FORMAT csv, HEADER true)

INSERT INTO "niño_navidad" (id, nombre, hogar, edad, observaciones)
OVERRIDING SYSTEM VALUE
SELECT DISTINCT "id_niño", nombre, hogar, edad, NULLIF(observaciones, '')
FROM cartas_csv
ORDER BY "id_niño";

INSERT INTO regalo_navidad (regalo, talle, link_ref, "id_niño")
SELECT regalo, NULLIF(talle, ''), NULLIF(link_ref, ''), "id_niño"
FROM cartas_csv;

-- Como pusimos los ids a mano, la secuencia tiene que seguir desde el último.
SELECT setval(pg_get_serial_sequence('"niño_navidad"', 'id'), (SELECT max(id) FROM "niño_navidad"));

SELECT
  (SELECT count(*) FROM "niño_navidad") AS ninos,
  (SELECT count(*) FROM regalo_navidad) AS regalos;

COMMIT;

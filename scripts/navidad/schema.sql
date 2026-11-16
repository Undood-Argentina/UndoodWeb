-- Cambios de esquema para la campaña de Navidad (se puede correr más de una vez).
-- Uso: psql -h localhost -U postgres -d undood_test -f scripts/navidad/schema.sql

BEGIN;

-- Info extra de la carta que no es un regalo: "Además le gusta...", edad original, talles sin regalo, etc.
ALTER TABLE "niño_navidad" ADD COLUMN IF NOT EXISTS observaciones text;

-- Quien elige cartas desde la web (formulario de #datos).
CREATE TABLE IF NOT EXISTS padrino_navidad (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre         text        NOT NULL,
  email          text        NOT NULL,
  celular        text        NOT NULL,
  fecha_registro timestamptz NOT NULL DEFAULT now()
);

-- Código postal del padrino (para ordenar los puntos de encuentro por cercanía y armar el link del mail).
ALTER TABLE padrino_navidad ADD COLUMN IF NOT EXISTS codigo_postal text;

-- Caché de la ubicación de cada código postal (4 dígitos), sacada de OpenStreetMap (Nominatim).
-- Nominatim pide no consultar lo mismo dos veces: se busca una sola vez por código postal.
-- latitud/longitud NULL = Nominatim no lo encontró (también se guarda, para no volver a preguntar).
CREATE TABLE IF NOT EXISTS codigo_postal_navidad (
  codigo_postal text PRIMARY KEY CHECK (codigo_postal ~ '^[0-9]{4}$'),
  latitud       double precision,
  longitud      double precision,
  zona          text,
  fecha_consulta timestamptz NOT NULL DEFAULT now()
);

-- Cada carta la elige como mucho una persona: NULL = disponible.
ALTER TABLE "niño_navidad" ADD COLUMN IF NOT EXISTS id_padrino integer REFERENCES padrino_navidad(id);

CREATE INDEX IF NOT EXISTS "niño_navidad_id_padrino_idx" ON "niño_navidad" (id_padrino);

-- Puntos de recepción de regalos. Mismas columnas que Puntos_Recepcion_Navidad_Undood-v2.xlsx:
--   Coordenadas       -> latitud / longitud
--   availability_time -> jsonb: { "0": "8:00-20:00", ..., "6": "..." } con 0 = lunes ... 6 = domingo.
--                        Un día que no está = cerrado. Puede haber dos turnos: "9:00-13:00 / 17:00-20:00".
--   STATUS            -> status: 1 = se muestra en la web, 0 = oculto ("Ocultar hasta aviso").
CREATE TABLE IF NOT EXISTS punto_encuentro_navidad (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre            text             NOT NULL,
  direccion         text             NOT NULL,
  latitud           double precision NOT NULL,
  longitud          double precision NOT NULL,
  google_maps       text,
  availability_time jsonb            NOT NULL DEFAULT '{}',
  notas             text,
  status            smallint         NOT NULL DEFAULT 1 CHECK (status IN (0, 1))
);

CREATE INDEX IF NOT EXISTS "regalo_navidad_id_niño_idx" ON regalo_navidad ("id_niño");

COMMIT;

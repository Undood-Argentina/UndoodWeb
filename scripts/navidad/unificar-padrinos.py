"""
Junta los padrinos duplicados de padrino_navidad: los que tienen los mismos datos
(nombre, mail, celular y código postal) quedan con un solo id, el más chico.
Las cartas de los duplicados pasan a ese id y los duplicados se borran.

Compara igual que la web (app/api/navidad/queries.ts -> buscarOCrearPadrino):
nombre y mail sin distinguir mayúsculas ni espacios de más, celular sólo por sus dígitos.

La conexión sale de .env.local (DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT),
con los mismos valores por defecto que app/api/config.

Uso:
    pip install psycopg2-binary
    python scripts/navidad/unificar-padrinos.py            # sólo muestra qué haría
    python scripts/navidad/unificar-padrinos.py --aplicar  # lo hace (en una transacción)
"""

import argparse
import os
from pathlib import Path

import psycopg2

RAIZ = Path(__file__).resolve().parents[2]

# Grupos de padrinos con los mismos datos (normalizados), con más de un id.
GRUPOS_SQL = r"""
SELECT array_agg(id ORDER BY id)      AS ids,
       min(nombre)                    AS nombre,
       min(email)                     AS email
FROM padrino_navidad
GROUP BY lower(trim(email)),
         lower(regexp_replace(trim(nombre), '\s+', ' ', 'g')),
         regexp_replace(celular, '\D', '', 'g'),
         codigo_postal
HAVING count(*) > 1
ORDER BY min(id)
"""


def leer_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for linea in path.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, valor = linea.split("=", 1)
        env[clave.strip()] = valor.strip().strip("'\"")
    return env


def conectar():
    env = {**leer_env(RAIZ / ".env.local"), **os.environ}
    return psycopg2.connect(
        dbname=env.get("DB_NAME", "undood_temp"),
        user=env.get("DB_USER", "postgres"),
        password=env.get("DB_PASS", "postgres"),
        host=env.get("DB_HOST", "localhost"),
        port=int(env.get("DB_PORT", "5432")),
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--aplicar", action="store_true", help="guardar los cambios (si no, sólo los muestra)")
    args = parser.parse_args()

    conn = conectar()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("SELECT current_database()")
            print(f"Base: {cur.fetchone()[0]}")

            # Que nadie cree ni cambie padrinos mientras unificamos.
            cur.execute('LOCK TABLE padrino_navidad, "niño_navidad" IN SHARE ROW EXCLUSIVE MODE')

            cur.execute(GRUPOS_SQL)
            grupos = cur.fetchall()
            if not grupos:
                print("No hay padrinos duplicados.")
                return

            total_borrados = total_cartas = 0
            for ids, nombre, email in grupos:
                queda, *duplicados = ids
                cur.execute(
                    'UPDATE "niño_navidad" SET id_padrino = %s WHERE id_padrino = ANY(%s)',
                    (queda, duplicados),
                )
                cartas = cur.rowcount
                cur.execute("DELETE FROM padrino_navidad WHERE id = ANY(%s)", (duplicados,))
                total_borrados += cur.rowcount
                total_cartas += cartas
                print(f"  {nombre} <{email}>: queda id {queda}, se juntan {duplicados} ({cartas} cartas movidas)")

            print(f"\n{len(grupos)} padrinos con duplicados, {total_borrados} ids borrados, {total_cartas} cartas movidas.")

            if not args.aplicar:
                conn.rollback()
                print("Simulación: no se guardó nada. Correlo con --aplicar para hacerlo.")
            else:
                print("Cambios guardados.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

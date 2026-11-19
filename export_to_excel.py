"""
Exporta los padrinos con sus niños asignados a un archivo Excel.

Requisitos:
    pip install pandas sqlalchemy openpyxl pymysql        # MySQL / MariaDB
    pip install pandas sqlalchemy openpyxl psycopg2-binary # PostgreSQL
"""

import pandas as pd
from sqlalchemy import create_engine
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter

# --- Configuración -----------------------------------------------------------
# MySQL:      "mysql+pymysql://usuario:clave@localhost:3306/mi_base?charset=utf8mb4"
# PostgreSQL: "postgresql+psycopg2://usuario:clave@localhost:5432/mi_base"
URL_DB = "postgresql+psycopg2://Demian@/undood_temp"
ARCHIVO_SALIDA = "padrinos_navidad.xlsx"

# --- Consultas ---------------------------------------------------------------
QUERY_MYSQL = """
SELECT p.nombre                AS Padrino,
       p.email                 AS Email,
       p.celular               AS Celular,
       p.codigo_postal         AS `Código postal`,
       GROUP_CONCAT(CONCAT_WS(' ', n.nombre, n.hogar)
                    ORDER BY n.nombre SEPARATOR ', ') AS `Niños`,
       COUNT(n.id)             AS `Cantidad de niños`
FROM padrino_navidad p
INNER JOIN `niño_navidad` n ON n.id_padrino = p.id
GROUP BY p.id, p.nombre, p.email, p.celular, p.codigo_postal
ORDER BY p.nombre
"""

QUERY_POSTGRES = """
SELECT p.nombre                AS "Padrino",
       p.email                 AS "Email",
       p.celular               AS "Celular",
       p.codigo_postal         AS "Código postal",
       STRING_AGG(n.nombre || ' ' || COALESCE(n.hogar, ''), ', '
                  ORDER BY n.nombre) AS "Niños",
       COUNT(n.id)             AS "Cantidad de niños"
FROM padrino_navidad p
INNER JOIN niño_navidad n ON n.id_padrino = p.id
GROUP BY p.id, p.nombre, p.email, p.celular, p.codigo_postal
ORDER BY p.nombre
"""


def main():
    engine = create_engine(URL_DB)
    query = QUERY_POSTGRES if URL_DB.startswith("postgresql") else QUERY_MYSQL

    df = pd.read_sql(query, engine)

    with pd.ExcelWriter(ARCHIVO_SALIDA, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Padrinos")
        hoja = writer.sheets["Padrinos"]

        # Encabezado en negrita y fijo al hacer scroll
        for celda in hoja[1]:
            celda.font = Font(bold=True)
        hoja.freeze_panes = "A2"

        # Ancho de columnas según el contenido (con un tope para "Niños")
        for i, columna in enumerate(df.columns, start=1):
            largo = max([len(str(columna))] + [len(str(v)) for v in df[columna]])
            hoja.column_dimensions[get_column_letter(i)].width = min(largo + 2, 80)

    print(f"Listo: {len(df)} padrinos exportados a {ARCHIVO_SALIDA}")


if __name__ == "__main__":
    main()

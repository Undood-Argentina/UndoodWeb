"""
Arma cartas/mapeo.csv: qué imagen de cartas/ corresponde a cada chico de "niño_navidad".
Columnas: id, nombre, hogar, edad, archivo (ruta relativa a la raíz del repo).

Los archivos vienen con dos formatos según el hogar:
    NOMBRE_HOGAR.jpeg          (Juanito, Soles, Creciendo, Vivencia) -> se cruza por hogar + nombre
    Hogar_Nombre_Edad.jpeg     (Liguen, Marcelino)                   -> se cruza por hogar + nombre + edad
El nombre se compara sin mayúsculas, tildes ni puntos.

Si alguna imagen no corresponde a exactamente un chico, o algún chico de esos hogares
queda sin imagen, lo muestra y no escribe el mapeo.

Uso:
    bin/python scripts/navidad/mapear-cartas.py
"""

import csv
import sys
import unicodedata
from pathlib import Path

from importlib import import_module

sys.path.insert(0, str(Path(__file__).parent))
conectar = import_module("unificar-padrinos").conectar  # misma conexión (.env.local)

RAIZ = Path(__file__).resolve().parents[2]
CARTAS = RAIZ / "cartas"
SALIDA = CARTAS / "mapeo.csv"

# Carpeta de cartas/ -> hogar en la base
HOGARES = {
    "JUANITO": "Juanito",
    "LIGUEN": "Liguen",
    "MARCELINO": "Marcelino",
    "SOLES": "Soles en el Camino",
    "CRECIENDO": "Creciendo",
    "VIVENCIA": "Vivencia",
}
EXTENSIONES = {".jpeg", ".jpg", ".png", ".webp"}


def norm(texto: str) -> str:
    """Sin tildes, mayúsculas ni puntos: "Agus L." == "AGUS L"."""
    sin_tildes = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    return " ".join(sin_tildes.replace(".", " ").split())


def parsear(archivo: Path, carpeta: str) -> tuple[str, int | None]:
    """Devuelve (nombre, edad) sacados del nombre del archivo. Edad None si no la tiene."""
    partes = [p for p in archivo.stem.split("_") if norm(p) != norm(carpeta)]
    edad = int(partes.pop()) if partes and partes[-1].isdigit() else None
    return " ".join(partes), edad


def main():
    conn = conectar()
    with conn, conn.cursor() as cur:
        cur.execute(
            'SELECT id, nombre, hogar, edad FROM "niño_navidad" WHERE hogar = ANY(%s) ORDER BY hogar, nombre, edad',
            (list(HOGARES.values()),),
        )
        ninos = cur.fetchall()
    conn.close()

    errores = []
    archivo_de: dict[int, Path] = {}
    for carpeta, hogar in HOGARES.items():
        for archivo in sorted((CARTAS / carpeta).rglob("*")):
            if "__MACOSX" in archivo.parts or archivo.suffix.lower() not in EXTENSIONES:
                continue
            nombre, edad = parsear(archivo, carpeta)
            candidatos = [
                n for n in ninos
                if n[2] == hogar and norm(n[1]) == norm(nombre) and (edad is None or n[3] == edad)
            ]
            ruta = archivo.relative_to(RAIZ)
            if len(candidatos) != 1:
                errores.append(f"{ruta}: {len(candidatos)} chicos coinciden (nombre={nombre!r}, edad={edad})")
            elif candidatos[0][0] in archivo_de:
                errores.append(f"{ruta}: id {candidatos[0][0]} ya tiene imagen ({archivo_de[candidatos[0][0]]})")
            else:
                archivo_de[candidatos[0][0]] = ruta

    for id_, nombre, hogar, edad in ninos:
        if id_ not in archivo_de:
            errores.append(f"id {id_} {nombre} ({edad}, {hogar}): sin imagen")

    if errores:
        print("No se escribió el mapeo:\n  " + "\n  ".join(errores))
        sys.exit(1)

    with SALIDA.open("w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["id", "nombre", "hogar", "edad", "archivo"])
        for id_, nombre, hogar, edad in sorted(ninos):
            escritor.writerow([id_, nombre, hogar, edad, archivo_de[id_].as_posix()])
    print(f"Listo: {len(archivo_de)} cartas en {SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()

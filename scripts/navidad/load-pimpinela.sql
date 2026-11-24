-- Cartas del hogar Pimpinela (PIMPINELA.pdf): 20 chicos, 3 opciones de regalo cada uno.
-- Una sola sentencia: carga todo o nada. Si ya hay chicos de Pimpinela, no hace nada.
WITH datos (nombre, edad, regalos) AS (VALUES
  ('Muriel',    11, ARRAY['Mascarillas y crema (apto niños)', 'Reloj', 'Set de mostacillas (bijouterie infantil) para armar pulseras, collares, etc.']),
  ('Abril',     12, ARRAY['Cocinita miniatura', 'Muñeca', 'Caja de pelotitas - mostacillas']),
  ('Samanta',    9, ARRAY['Mostacillas para pulseras', 'Kit de dibujo (hojas y lápices)', 'Set de sellos o stickers para decorar']),
  ('Nahir',      8, ARRAY['Cocinita miniatura', 'Peluche con ropa', 'Set de comiditas de juguete (frutas/verduras/etc)']),
  ('Mia',       11, ARRAY['Mostacillas', 'Cosas para pintar', 'Cuaderno de dibujo / mandalas para colorear']),
  ('Naira',      9, ARRAY['Muñeca Barbie', 'Acuarelas y hojas lisas', 'Ropita o accesorios para muñeca Barbie']),
  ('Lara',       6, ARRAY['Muñeca', 'Ropita o accesorios para muñeca', 'Set de muebles / casa miniatura para muñeca']),
  ('Ellen',      6, ARRAY['Pulseras y collares', 'Peluche de perrito', 'Cartera y/o accesorios para el pelo']),
  ('Leyna',      8, ARRAY['Cuaderno rayado con tapa de peluche', 'Lápices y marcadores', 'Cartuchera y/o set de stickers']),
  ('Cataleya',   6, ARRAY['Slime', 'Squishy', 'Masa para modelar y/o pop-it']),
  ('Jazmin',     5, ARRAY['Muñeco de vaquita de San Antonio', 'Juego de bloques didácticos de encastre', 'Libro para colorear con crayones']),
  ('Luana',      4, ARRAY['Muñeca', 'Ropa o accesorios para muñeca', 'Set de té o comida miniatura de juguete']),
  ('Bruno',      3, ARRAY['Autitos', 'Camión o variante de autos grandes', 'Bloques encastrables grandes']),
  ('Julian',     9, ARRAY['Camión de bomberos', 'Auto a control remoto', 'Pista de autos o set de autos (accesorios)']),
  ('Carolina',   6, ARRAY['Cocinita', 'Cuaderno', 'Lápices de colores y/o marcadores']),
  ('Dante',      5, ARRAY['Autos', 'Pista de autos', 'Set de autos (accesorios)']),
  ('Owen',       3, ARRAY['Algo de Spider-Man', 'Muñeco articulado de superhéroe (apto +3) de Spider-Man o variante', 'Auto o pelota temática de superhéroe (Spider-Man o variante)']),
  ('Esperanza',  6, ARRAY['Cartera', 'Peine', 'Muñeco']),
  ('Eluney',     8, ARRAY['Bebota muñeca', 'Cochecito', 'Set, ropa o accesorios para bebota muñeca']),
  ('Fabian',     7, ARRAY['Avión a control remoto', 'Tren', 'Auto a control remoto o pista de tren'])
),
nuevos AS (
  INSERT INTO "niño_navidad" (nombre, hogar, edad)
  SELECT nombre, 'Pimpinela', edad FROM datos
  WHERE NOT EXISTS (SELECT 1 FROM "niño_navidad" WHERE hogar = 'Pimpinela')
  RETURNING id, nombre, edad
)
INSERT INTO regalo_navidad (regalo, "id_niño")
SELECT r.regalo, n.id
FROM nuevos n
JOIN datos d USING (nombre, edad)
CROSS JOIN LATERAL unnest(d.regalos) WITH ORDINALITY AS r(regalo, orden)
ORDER BY n.id, r.orden;

SELECT count(DISTINCT n.id) AS chicos, count(r.id) AS regalos
FROM "niño_navidad" n LEFT JOIN regalo_navidad r ON r."id_niño" = n.id
WHERE n.hogar = 'Pimpinela';

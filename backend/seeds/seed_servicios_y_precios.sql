-- Seed: Servicios y Planes con Precios Reales
-- Fecha: 2025-10-24
-- Descripción: Datos iniciales de servicios de streaming y productividad con precios

-- Limpiar datos existentes (opcional - comentar si se desea preservar datos)
-- TRUNCATE TABLE combo_items CASCADE;
-- TRUNCATE TABLE combos CASCADE;
-- TRUNCATE TABLE order_items CASCADE;
-- TRUNCATE TABLE service_plans CASCADE;
-- TRUNCATE TABLE servicios CASCADE;

-- =============================================================================
-- SERVICIOS DE STREAMING DE VIDEO
-- =============================================================================

-- Netflix
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Netflix',
    'El servicio de streaming líder mundial con películas, series y contenido original',
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    'streaming'
) ON CONFLICT DO NOTHING
RETURNING id_servicio;

-- Obtener ID de Netflix y crear planes
WITH netflix AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Netflix' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Netflix Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    70.00,
    50.00,
    20.00,
    '1 perfil individual por 30 días',
    true
FROM netflix
UNION ALL
SELECT 
    id_servicio,
    'Netflix Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    261.00,
    200.00,
    61.00,
    'Cuenta completa de 4-5 perfiles por 30 días',
    true
FROM netflix;

-- Prime Video
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Prime Video',
    'Servicio de streaming de Amazon con películas, series y contenido exclusivo',
    'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH prime AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Prime Video' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Prime Video Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    34.00,
    25.00,
    9.00,
    '1 perfil individual por 30 días',
    true
FROM prime
UNION ALL
SELECT 
    id_servicio,
    'Prime Video Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    78.00,
    60.00,
    18.00,
    'Cuenta completa por 30 días',
    true
FROM prime;

-- Disney+
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Disney+',
    'Todo el contenido de Disney, Pixar, Marvel, Star Wars y National Geographic',
    'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH disney AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Disney+' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Disney+ Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    55.00,
    40.00,
    15.00,
    '1 perfil individual por 30 días',
    true
FROM disney
UNION ALL
SELECT 
    id_servicio,
    'Disney+ Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    187.00,
    150.00,
    37.00,
    'Cuenta completa por 30 días',
    true
FROM disney;

-- HBO Max
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'HBO Max',
    'Lo mejor de HBO, Warner Bros y DC con películas y series premium',
    'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH hbo AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'HBO Max' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'HBO Max Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    34.00,
    25.00,
    9.00,
    '1 perfil individual por 30 días',
    true
FROM hbo
UNION ALL
SELECT 
    id_servicio,
    'HBO Max Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    70.00,
    55.00,
    15.00,
    'Cuenta completa por 30 días',
    true
FROM hbo;

-- Paramount+
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Paramount+',
    'Películas, series y deportes de Paramount Pictures y CBS',
    'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH paramount AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Paramount+' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Paramount+ Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    35.00,
    25.00,
    10.00,
    '1 perfil individual por 30 días',
    true
FROM paramount
UNION ALL
SELECT 
    id_servicio,
    'Paramount+ Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    67.00,
    50.00,
    17.00,
    'Cuenta completa por 30 días',
    true
FROM paramount;

-- Vix
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Vix',
    'Contenido en español con telenovelas, deportes y películas',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/ViX_Logo.svg/2560px-ViX_Logo.svg.png',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH vix AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Vix' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Vix Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    28.00,
    20.00,
    8.00,
    '1 perfil individual por 30 días',
    true
FROM vix
UNION ALL
SELECT 
    id_servicio,
    'Vix Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    47.00,
    35.00,
    12.00,
    'Cuenta completa por 30 días',
    true
FROM vix;

-- Crunchyroll
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Crunchyroll',
    'La mejor plataforma de anime y manga del mundo',
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH crunchyroll AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Crunchyroll' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Crunchyroll Perfil (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    31.00,
    20.00,
    11.00,
    '1 perfil individual por 30 días',
    true
FROM crunchyroll
UNION ALL
SELECT 
    id_servicio,
    'Crunchyroll Completa (1 Mes)',
    'COMPLETA',
    1,
    30,
    59.00,
    45.00,
    14.00,
    'Cuenta completa por 30 días',
    true
FROM crunchyroll;

-- Apple TV+
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Apple TV+',
    'Series y películas originales de Apple',
    'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    'streaming'
) ON CONFLICT DO NOTHING;

WITH appletv AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Apple TV+' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Apple TV+ (1 Mes)',
    'COMPLETA',
    1,
    30,
    109.00,
    85.00,
    24.00,
    'Cuenta completa por 30 días',
    true
FROM appletv;

-- =============================================================================
-- SERVICIOS DE MÚSICA
-- =============================================================================

-- Spotify
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Spotify',
    'Millones de canciones y podcasts en streaming',
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    'música'
) ON CONFLICT DO NOTHING;

WITH spotify AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Spotify' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Spotify Premium (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    63.00,
    45.00,
    18.00,
    'Premium individual por 30 días',
    true
FROM spotify
UNION ALL
SELECT 
    id_servicio,
    'Spotify Premium (2 Meses)',
    'INDIVIDUAL',
    2,
    60,
    102.00,
    80.00,
    22.00,
    'Premium individual por 60 días',
    true
FROM spotify
UNION ALL
SELECT 
    id_servicio,
    'Spotify Premium (3 Meses)',
    'INDIVIDUAL',
    3,
    90,
    133.00,
    110.00,
    23.00,
    'Premium individual por 90 días',
    true
FROM spotify;

-- YouTube Premium
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'YouTube Premium',
    'YouTube sin anuncios, con reproducción en segundo plano',
    'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
    'música'
) ON CONFLICT DO NOTHING;

WITH youtube AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'YouTube Premium' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'YouTube Premium (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    63.00,
    45.00,
    18.00,
    'Premium individual por 30 días',
    true
FROM youtube;

-- =============================================================================
-- SERVICIOS DE PRODUCTIVIDAD
-- =============================================================================

-- Canva PRO
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Canva PRO',
    'Diseño gráfico profesional al alcance de todos',
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFrGT2LWx-qq3dO11A-LF00GarfBKQrN4TXEXMbHkPMJsj07dArWl1tCT8kHCpAE11G0Fkl23c71DLzNiQKHOUVzUuIENXm1bW5osOtE5BZJd-ns8amKhuGd89np3z1ovpjVf6yICwaNfu9PsgkM98TZvoeqgF9tp-kJZ83nIQXqgX0Yb_EXIOBCjZT7Cs/s16000-rw/What%20is%20Canva.webp',
    'productividad'
) ON CONFLICT DO NOTHING;

WITH canva AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Canva PRO' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Canva PRO (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    39.00,
    28.00,
    11.00,
    'Cuenta individual por 30 días',
    true
FROM canva
UNION ALL
SELECT 
    id_servicio,
    'Canva PRO (12 Meses)',
    'INDIVIDUAL',
    12,
    365,
    211.00,
    180.00,
    31.00,
    'Cuenta individual por 12 meses',
    true
FROM canva;

-- Office 365
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Office 365',
    'Suite completa de Microsoft Office en la nube',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Microsoft_Office_Word_%282019%E2%80%932025%29.svg/516px-Microsoft_Office_Word_%282019%E2%80%932025%29.svg.png',
    'productividad'
) ON CONFLICT DO NOTHING;

WITH office AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Office 365' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Office 365 (12 Meses)',
    'INDIVIDUAL',
    12,
    365,
    156.00,
    130.00,
    26.00,
    'Licencia individual por 12 meses',
    true
FROM office;

-- CapCut
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'CapCut',
    'Editor de video profesional para creadores de contenido',
    'https://i.pinimg.com/474x/62/4c/32/624c322c82f47a24d5cdfb6b7b3fcffd.jpg',
    'productividad'
) ON CONFLICT DO NOTHING;

WITH capcut AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'CapCut' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'CapCut Pro (30 Días)',
    'INDIVIDUAL',
    1,
    30,
    111.00,
    90.00,
    21.00,
    'Pro individual por 30 días',
    true
FROM capcut;

-- Duolingo
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Duolingo',
    'Aprende idiomas de forma divertida y efectiva',
    'https://i.ytimg.com/vi/PzomGOEZFqo/maxresdefault.jpg',
    'educación'
) ON CONFLICT DO NOTHING;

WITH duolingo AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Duolingo' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Duolingo Plus (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    47.00,
    35.00,
    12.00,
    'Plus individual por 30 días',
    true
FROM duolingo;

-- =============================================================================
-- SERVICIOS DE IA
-- =============================================================================

-- ChatGPT Plus
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'ChatGPT Plus',
    'Acceso a GPT-4 y las últimas características de OpenAI',
    'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'ia'
) ON CONFLICT DO NOTHING;

WITH chatgpt AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'ChatGPT Plus' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'ChatGPT Plus (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    82.00,
    65.00,
    17.00,
    'Suscripción individual por 30 días',
    true
FROM chatgpt;

-- ChatON AI
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'ChatON AI',
    'Asistente de IA para conversaciones y productividad',
    'https://img.icons8.com/color/512/chat.png',
    'ia'
) ON CONFLICT DO NOTHING;

WITH chaton AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'ChatON AI' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'ChatON AI Premium (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    82.00,
    65.00,
    17.00,
    'Premium individual por 30 días',
    true
FROM chaton;

-- =============================================================================
-- SERVICIOS DE IPTV
-- =============================================================================

-- DirecTV GO
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'DirecTV GO',
    'TV en vivo y on-demand con canales premium',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/SATELITE_DTV.jpg/1200px-SATELITE_DTV.jpg',
    'iptv'
) ON CONFLICT DO NOTHING;

WITH directv AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'DirecTV GO' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'DirecTV GO Básico (1 Mes)',
    'COMPLETA',
    1,
    30,
    156.00,
    130.00,
    26.00,
    'Paquete básico por 30 días',
    true
FROM directv;

-- Metegol TV
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Metegol TV',
    'IPTV con deportes y entretenimiento',
    'https://img.icons8.com/color/512/tv.png',
    'iptv'
) ON CONFLICT DO NOTHING;

WITH metegol AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Metegol TV' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Metegol TV (1 Mes)',
    'COMPLETA',
    1,
    30,
    70.00,
    55.00,
    15.00,
    'Suscripción completa por 30 días',
    true
FROM metegol;

-- Plex / Jellyfin / IPTV Genérico
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'IPTV Premium',
    'Acceso a servidor IPTV con múltiples canales',
    'https://img.icons8.com/color/512/streaming.png',
    'iptv'
) ON CONFLICT DO NOTHING;

WITH iptv AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'IPTV Premium' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'IPTV Premium (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    31.00,
    20.00,
    11.00,
    'Acceso individual por 30 días',
    true
FROM iptv;

-- Pornhub Premium (Adultos)
INSERT INTO servicios (nombre, descripcion, logo_url, categoria) 
VALUES (
    'Pornhub Premium',
    'Contenido premium para adultos',
    'https://thumbs.dreamstime.com/b/sign-warning-symbol-isolated-white-background-over-plus-censored-eighteen-age-older-forbidden-adult-content-sign-warning-144828426.jpg',
    'adulto'
) ON CONFLICT DO NOTHING;

WITH pornhub AS (
    SELECT id_servicio FROM servicios WHERE nombre = 'Pornhub Premium' LIMIT 1
)
INSERT INTO service_plans (id_servicio, nombre_plan, tipo_plan, duracion_meses, duracion_dias, precio_venta, costo, margen_ganancia, descripcion, activo)
SELECT 
    id_servicio,
    'Pornhub Premium (1 Mes)',
    'INDIVIDUAL',
    1,
    30,
    51.00,
    38.00,
    13.00,
    'Premium individual por 30 días',
    true
FROM pornhub;

-- =============================================================================
-- CREAR COMBOS PREDEFINIDOS
-- =============================================================================

-- COMBO 1: Prime Video + Netflix
WITH combo1 AS (
    INSERT INTO combos (nombre, descripcion, precio_total, costo_total, activo)
    VALUES (
        'COMBO 1: Prime Video + Netflix',
        'Combo individual de Prime Video y Netflix (1 perfil c/u)',
        84.00,
        75.00,
        true
    )
    RETURNING id_combo
),
planes AS (
    SELECT sp.id_plan 
    FROM service_plans sp
    JOIN servicios s ON sp.id_servicio = s.id_servicio
    WHERE (s.nombre = 'Prime Video' OR s.nombre = 'Netflix')
    AND sp.tipo_plan = 'INDIVIDUAL'
    AND sp.duracion_meses = 1
)
INSERT INTO combo_items (id_combo, id_plan, cantidad)
SELECT combo1.id_combo, planes.id_plan, 1
FROM combo1, planes;

-- COMBO 2: Disney + Netflix
WITH combo2 AS (
    INSERT INTO combos (nombre, descripcion, precio_total, costo_total, activo)
    VALUES (
        'COMBO 2: Disney+ + Netflix',
        'Combo individual de Disney+ y Netflix (1 perfil c/u)',
        105.00,
        90.00,
        true
    )
    RETURNING id_combo
),
planes AS (
    SELECT sp.id_plan 
    FROM service_plans sp
    JOIN servicios s ON sp.id_servicio = s.id_servicio
    WHERE (s.nombre = 'Disney+' OR s.nombre = 'Netflix')
    AND sp.tipo_plan = 'INDIVIDUAL'
    AND sp.duracion_meses = 1
)
INSERT INTO combo_items (id_combo, id_plan, cantidad)
SELECT combo2.id_combo, planes.id_plan, 1
FROM combo2, planes;

-- COMBO 3: Max + Netflix
WITH combo3 AS (
    INSERT INTO combos (nombre, descripcion, precio_total, costo_total, activo)
    VALUES (
        'COMBO 3: HBO Max + Netflix',
        'Combo individual de HBO Max y Netflix (1 perfil c/u)',
        84.00,
        75.00,
        true
    )
    RETURNING id_combo
),
planes AS (
    SELECT sp.id_plan 
    FROM service_plans sp
    JOIN servicios s ON sp.id_servicio = s.id_servicio
    WHERE (s.nombre = 'HBO Max' OR s.nombre = 'Netflix')
    AND sp.tipo_plan = 'INDIVIDUAL'
    AND sp.duracion_meses = 1
)
INSERT INTO combo_items (id_combo, id_plan, cantidad)
SELECT combo3.id_combo, planes.id_plan, 1
FROM combo3, planes;

-- COMBO 4: Disney + Max
WITH combo4 AS (
    INSERT INTO combos (nombre, descripcion, precio_total, costo_total, activo)
    VALUES (
        'COMBO 4: Disney+ + HBO Max',
        'Combo individual de Disney+ y HBO Max (1 perfil c/u)',
        69.00,
        65.00,
        true
    )
    RETURNING id_combo
),
planes AS (
    SELECT sp.id_plan 
    FROM service_plans sp
    JOIN servicios s ON sp.id_servicio = s.id_servicio
    WHERE (s.nombre = 'Disney+' OR s.nombre = 'HBO Max')
    AND sp.tipo_plan = 'INDIVIDUAL'
    AND sp.duracion_meses = 1
)
INSERT INTO combo_items (id_combo, id_plan, cantidad)
SELECT combo4.id_combo, planes.id_plan, 1
FROM combo4, planes;

-- Mensaje de confirmación
DO $$ BEGIN
    RAISE NOTICE 'Seed completado exitosamente!';
    RAISE NOTICE 'Se han insertado servicios, planes y combos iniciales';
END $$;

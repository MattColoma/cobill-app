-- backend/sql/create_tables_postgresql.sql

-- Eliminar tablas existentes si ya existen para un inicio limpio (opcional, pero útil para desarrollo)
DROP TABLE IF EXISTS "ItemGasto";
DROP TABLE IF EXISTS "ParticipanteSesion";
DROP TABLE IF EXISTS "SesionGasto";
DROP TABLE IF EXISTS "usuario"; -- Asegúrate de eliminar en el orden correcto debido a las dependencias de FK

-- Tabla de Usuarios
CREATE TABLE "usuario" (
    id SERIAL PRIMARY KEY, -- CAMBIO: SERIAL para auto-incremento en PostgreSQL
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- CAMBIO: TIMESTAMP WITH TIME ZONE y CURRENT_TIMESTAMP
);

-- Tabla de Sesiones de Gasto
CREATE TABLE "SesionGasto" (
    id SERIAL PRIMARY KEY,
    codigo_gasto VARCHAR(10) UNIQUE NOT NULL,
    nombre_sesion VARCHAR(255),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'activa',
    id_usuario_creador INTEGER, -- CAMBIO: INTEGER para FK
    porcentaje_propina DECIMAL(5,2) DEFAULT 10.00,

    CONSTRAINT FK_SesionGasto_Usuario FOREIGN KEY (id_usuario_creador) REFERENCES "usuario"(id)
    -- ON DELETE CASCADE o SET NULL si el usuario creador puede ser eliminado
);

-- Tabla de Participantes de Sesión
CREATE TABLE "ParticipanteSesion" (
    id SERIAL PRIMARY KEY,
    id_sesion_gasto INTEGER NOT NULL, -- CAMBIO: INTEGER para FK
    id_usuario INTEGER,               -- CAMBIO: INTEGER para FK (NULL si es un invitado sin cuenta)
    nombre_invitado VARCHAR(100),
    fecha_union TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_ParticipanteSesion_SesionGasto FOREIGN KEY (id_sesion_gasto) REFERENCES "SesionGasto"(id) ON DELETE CASCADE,
    CONSTRAINT FK_ParticipanteSesion_Usuario FOREIGN KEY (id_usuario) REFERENCES "usuario"(id) ON DELETE SET NULL
);

-- Tabla de Ítems de Gasto
CREATE TABLE "ItemGasto" (
    id SERIAL PRIMARY KEY,
    id_participante_sesion INTEGER NOT NULL, -- CAMBIO: INTEGER para FK
    descripcion_item VARCHAR(255) NOT NULL,
    costo_item DECIMAL(10,2) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_ItemGasto_ParticipanteSesion FOREIGN KEY (id_participante_sesion) REFERENCES "ParticipanteSesion"(id) ON DELETE CASCADE
);

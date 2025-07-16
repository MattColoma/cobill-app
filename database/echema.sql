CREATE DATABASE cobill;
USE cobill;

CREATE TABLE usuario(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--TABLA SERVICIOS
CREATE TABLE servicios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    costo DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opcional: Tabla pivote para usuarios y servicios si un usuario puede tener muchos servicios y un servicio puede ser asignado a muchos usuarios
CREATE TABLE usuario_servicio (
    id_usuario INT,
    id_servicio INT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_servicio),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicio(id) ON DELETE CASCADE
);
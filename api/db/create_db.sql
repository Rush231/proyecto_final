CREATE DATABASE IF NOT EXISTS Sistema_Turnos
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE Sistema_Turnos;

-- 1. Negocio (La 'tienda' o 'consultorio')
CREATE TABLE Negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tipo VARCHAR(100)
);

-- 2. Usuario (Dueño/Admin del Negocio)
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);

-- 3. Profesional (El que atiende)
CREATE TABLE Profesional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    especialidad VARCHAR(100),
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);

-- 4. Disponibilidad 
CREATE TABLE Disponibilidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesional_id INT,
    dia_semana INT NOT NULL, -- 0=Lunes, 1=Martes, ..., 6=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id)
);

--  Servicio (Lo que ofrece el negocio)
CREATE TABLE Servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duracion INT NOT NULL, -- Duración en minutos
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);

--  Cliente (Quien saca el turno)
CREATE TABLE Cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Turno (La reserva que une todo)
CREATE TABLE Turno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('reservado', 'cancelado', 'pospuesto') DEFAULT 'reservado',
    cliente_id INT,
    profesional_id INT,
    servicio_id INT,
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id),
    FOREIGN KEY (servicio_id) REFERENCES Servicio(id)
);
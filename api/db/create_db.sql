CREATE DATABASE IF NOT EXISTS Sistema_Turnos
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE Sistema_Turnos; 


CREATE TABLE Negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    telefono VARCHAR(50),
    hora_apertura TIME,
    hora_cierre TIME
);


CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);


CREATE TABLE Profesional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    especialidad VARCHAR(100),
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);


CREATE TABLE Disponibilidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesional_id INT,
    dia_semana INT NOT NULL, -- 0=Lunes, 1=Martes, ..., 6=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id)
);


CREATE TABLE Servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duracion INT NOT NULL,
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id));

CREATE TABLE Profesional_Servicio (
    profesional_id INT NOT NULL,
    servicio_id INT NOT NULL,
    PRIMARY KEY (profesional_id, servicio_id),
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES Servicio(id) ON DELETE CASCADE);

CREATE TABLE Cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    negocio_id INT,
    FOREIGN KEY (negocio_id) REFERENCES Negocio(id)
);

-- Turno (La reserva que une todo)
CREATE TABLE Turno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    cliente_id INT,
    profesional_id INT,
    servicio_id INT,
    negocio_id INT,
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id),
    FOREIGN KEY (servicio_id) REFERENCES Servicio(id)
);

CREATE TABLE BloqueoAgenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesional_id INT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    motivo VARCHAR(255),
    FOREIGN KEY (profesional_id) REFERENCES Profesional(id)
);
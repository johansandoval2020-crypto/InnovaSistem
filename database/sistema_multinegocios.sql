CREATE DATABASE sistema_multinegocios;
USE sistema_multinegocios;

CREATE TABLE negocios (
    id_negocio      INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    tipo            VARCHAR(50)  NOT NULL,
    direccion       VARCHAR(150),
    telefono        VARCHAR(20)
);

CREATE TABLE roles (
    id_rol          INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol      VARCHAR(50) NOT NULL
);

CREATE TABLE usuarios (
    id_usuario      INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    usuario_login   VARCHAR(50)  NOT NULL UNIQUE,
    contrasena      VARCHAR(100) NOT NULL,
    id_rol          INT NOT NULL,
    id_negocio      INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

CREATE TABLE categorias (
    id_categoria    INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL,
    id_negocio      INT NOT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

CREATE TABLE proveedores (
    id_proveedor    INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20),
    id_negocio      INT NOT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

CREATE TABLE productos (
    id_producto     INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    precio          DECIMAL(10,2) NOT NULL,
    stock           INT DEFAULT 0,
    id_categoria    INT NOT NULL,
    id_proveedor    INT,
    id_negocio      INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

CREATE TABLE clientes (
    id_cliente      INT PRIMARY KEY AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20),
    direccion       VARCHAR(150)
);

CREATE TABLE ventas (
    id_venta        INT PRIMARY KEY AUTO_INCREMENT,
    fecha           DATE NOT NULL,
    id_cliente      INT NOT NULL,
    id_usuario      INT NOT NULL,
    id_negocio      INT NOT NULL,
    total           DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

CREATE TABLE detalle_venta (
    id_detalle      INT PRIMARY KEY AUTO_INCREMENT,
    id_venta        INT NOT NULL,
    id_producto     INT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE facturas (
    id_factura      INT PRIMARY KEY AUTO_INCREMENT,
    id_venta        INT NOT NULL,
    fecha_emision   DATE NOT NULL,
    total_factura   DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
);

CREATE TABLE inventario_movimientos (
    id_movimiento   INT PRIMARY KEY AUTO_INCREMENT,
    id_producto     INT NOT NULL,
    tipo_movimiento VARCHAR(10) NOT NULL,
    cantidad        INT NOT NULL,
    fecha           DATE NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

INSERT INTO negocios (nombre, tipo, direccion, telefono) VALUES
('Pupuseria Doña Chayo - Centro', 'Comida', 'Local 1, Centro Comercial', '7000-1111'),
('Pupuseria Doña Chayo - Norte', 'Comida', 'Local 7, Plaza Norte', '7000-1112'),
('Pupuseria Doña Chayo - Oeste', 'Comida', 'Local 12, Plaza Oeste', '7000-1113'),
('Taller Don Natalio - Centro', 'Taller Mecanico', 'Local 2, Centro Comercial', '7000-2222'),
('Taller Don Natalio - Sur', 'Taller Mecanico', 'Local 9, Plaza Sur', '7000-2223'),
('Taller Don Natalio - Este', 'Taller Mecanico', 'Local 15, Plaza Este', '7000-2224'),
('Clinica El Pirilin - Centro', 'Salud', 'Local 3, Centro Comercial', '7000-3333'),
('Clinica El Pirilin - Norte', 'Salud', 'Local 8, Plaza Norte', '7000-3334'),
('Clinica El Pirilin - Sur', 'Salud', 'Local 11, Plaza Sur', '7000-3335'),
('Clinica El Pirilin - Este', 'Salud', 'Local 16, Plaza Este', '7000-3336');

INSERT INTO roles (nombre_rol) VALUES
('Administrador'),
('Cajero'),
('Cocinero'),
('Mecanico'),
('Doctor'),
('Enfermera'),
('Recepcionista'),
('Ayudante de Cocina'),
('Supervisor'),
('Contador');

INSERT INTO usuarios (nombre, usuario_login, contrasena, id_rol, id_negocio) VALUES
('Maria Chayo', 'mchayo', '1234', 1, 1),
('Juan Perez', 'jperez', '1234', 3, 1),
('Sofia Reyes', 'sreyes', '1234', 2, 2),
('Miguel Angel Cruz', 'mcruz', '1234', 8, 3),
('Natalio Gomez', 'ngomez', '1234', 1, 4),
('Pedro Lopez', 'plopez', '1234', 4, 4),
('Oscar Martinez', 'omartinez', '1234', 4, 5),
('Ricardo Aguilar', 'raguilar', '1234', 9, 6),
('Dr. Pirilin', 'dpirilin', '1234', 1, 7),
('Ana Torres', 'atorres', '1234', 6, 7),
('Karla Menjivar', 'kmenjivar', '1234', 7, 8),
('Fernando Castro', 'fcastro', '1234', 5, 9),
('Patricia Alvarado', 'palvarado', '1234', 10, 10);

INSERT INTO categorias (nombre_categoria, id_negocio) VALUES
('Pupusas', 1),
('Bebidas', 1),
('Postres', 1),
('Repuestos', 4),
('Servicios Mecanicos', 4),
('Llantas', 4),
('Consultas', 7),
('Medicamentos', 7),
('Laboratorio', 7),
('Emergencias', 7);

INSERT INTO proveedores (nombre, telefono, id_negocio) VALUES
('Distribuidora Maiz SA', '2222-1111', 1),
('Lacteos San Julian', '2222-1112', 1),
('Bebidas del Valle', '2222-1113', 1),
('AutoRepuestos El Salvador', '2222-2222', 4),
('Llantas Continental', '2222-2223', 4),
('Lubricantes Total', '2222-2224', 4),
('Farmacia Central', '2222-3333', 7),
('Laboratorios Vida', '2222-3334', 7),
('Insumos Medicos SA', '2222-3335', 7),
('Distribuidora Salud Plus', '2222-3336', 7);

INSERT INTO productos (nombre, precio, stock, id_categoria, id_proveedor, id_negocio) VALUES
('Pupusa de Queso', 0.75, 100, 1, 1, 1),
('Pupusa Revuelta', 1.00, 100, 1, 1, 1),
('Pupusa de Frijol', 0.75, 90, 1, 1, 1),
('Horchata', 1.00, 50, 2, 3, 1),
('Cafe con Leche', 0.80, 60, 2, 2, 1),
('Semita', 1.25, 30, 3, 2, 1),
('Filtro de Aceite', 8.50, 20, 4, 4, 4),
('Bateria 12V', 65.00, 10, 4, 4, 4),
('Cambio de Aceite (servicio)', 25.00, 999, 5, 6, 4),
('Alineado y Balanceo (servicio)', 20.00, 999, 5, 5, 4),
('Llanta 175/65 R14', 55.00, 16, 6, 5, 4),
('Consulta General', 15.00, 999, 7, NULL, 7),
('Consulta Pediatrica', 18.00, 999, 7, NULL, 7),
('Acetaminofen', 3.50, 40, 8, 7, 7),
('Amoxicilina', 6.00, 25, 8, 7, 7),
('Examen de Sangre', 12.00, 999, 9, 8, 7);

INSERT INTO clientes (nombre, telefono, direccion) VALUES
('Carlos Ramirez', '7111-1111', 'Col. San Jose'),
('Lucia Fernandez', '7222-2222', 'Col. Escalon'),
('Roberto Diaz', '7333-3333', 'Col. Miramonte'),
('Andrea Solano', '7444-4444', 'Col. Layco'),
('Jose Hernandez', '7555-5555', 'Col. Flor Blanca'),
('Marta Villalobos', '7666-6666', 'Col. Centroamerica'),
('Diego Portillo', '7777-7777', 'Col. San Benito'),
('Gabriela Rivas', '7888-8888', 'Col. Universitaria'),
('Manuel Bonilla', '7999-9999', 'Col. Satelite'),
('Elena Guardado', '7100-1010', 'Col. Zacamil');

INSERT INTO ventas (fecha, id_cliente, id_usuario, id_negocio, total) VALUES
('2026-08-10', 1, 2, 1, 2.75),
('2026-08-11', 2, 6, 4, 33.50),
('2026-08-12', 3, 10, 7, 18.50),
('2026-08-13', 4, 2, 1, 3.55),
('2026-08-14', 5, 6, 4, 65.00),
('2026-08-15', 6, 10, 7, 9.50),
('2026-08-16', 7, 3, 2, 1.75),
('2026-08-17', 8, 7, 5, 20.00),
('2026-08-18', 9, 11, 8, 15.00),
('2026-08-19', 10, 6, 4, 55.00);

INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 2, 0.75, 1.50),
(1, 4, 1, 1.00, 1.25),
(2, 7, 1, 8.50, 8.50),
(2, 9, 1, 25.00, 25.00),
(3, 12, 1, 15.00, 15.00),
(3, 14, 1, 3.50, 3.50),
(4, 2, 2, 1.00, 2.00),
(4, 5, 2, 0.80, 1.60),
(5, 8, 1, 65.00, 65.00),
(6, 15, 1, 6.00, 6.00),
(6, 16, 1, 12.00, 12.00),
(7, 3, 1, 0.75, 0.75),
(8, 10, 1, 20.00, 20.00),
(9, 13, 1, 18.00, 18.00),
(10, 11, 1, 55.00, 55.00);

INSERT INTO facturas (id_venta, fecha_emision, total_factura) VALUES
(1, '2026-08-10', 2.75),
(2, '2026-08-11', 33.50),
(3, '2026-08-12', 18.50),
(4, '2026-08-13', 3.55),
(5, '2026-08-14', 65.00),
(6, '2026-08-15', 9.50),
(7, '2026-08-16', 1.75),
(8, '2026-08-17', 20.00),
(9, '2026-08-18', 15.00),
(10, '2026-08-19', 55.00);

INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, fecha) VALUES
(1, 'ENTRADA', 100, '2026-08-01'),
(1, 'SALIDA', 2, '2026-08-10'),
(4, 'ENTRADA', 50, '2026-08-01'),
(4, 'SALIDA', 1, '2026-08-10'),
(7, 'ENTRADA', 20, '2026-08-01'),
(7, 'SALIDA', 1, '2026-08-11'),
(8, 'ENTRADA', 10, '2026-08-01'),
(8, 'SALIDA', 1, '2026-08-14'),
(15, 'ENTRADA', 25, '2026-08-01'),
(15, 'SALIDA', 1, '2026-08-15'),
(11, 'ENTRADA', 16, '2026-08-01'),
(11, 'SALIDA', 1, '2026-08-19');

SELECT p.nombre AS producto, c.nombre_categoria AS categoria, n.nombre AS negocio, p.precio, p.stock
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN negocios n ON p.id_negocio = n.id_negocio;

SELECT v.id_venta, cl.nombre AS cliente, u.nombre AS atendido_por, n.nombre AS negocio,
       pr.nombre AS producto, dv.cantidad, dv.subtotal
FROM ventas v
JOIN clientes cl ON v.id_cliente = cl.id_cliente
JOIN usuarios u ON v.id_usuario = u.id_usuario
JOIN negocios n ON v.id_negocio = n.id_negocio
JOIN detalle_venta dv ON v.id_venta = dv.id_venta
JOIN productos pr ON dv.id_producto = pr.id_producto;

SELECT n.nombre AS negocio, SUM(v.total) AS total_vendido
FROM ventas v
JOIN negocios n ON v.id_negocio = n.id_negocio
GROUP BY n.nombre;

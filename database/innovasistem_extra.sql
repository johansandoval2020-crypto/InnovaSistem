-- ==========================================================================
-- InnovaSistem — ampliación de sistema_multinegocios para la web
--
-- Se corre DESPUÉS de sistema_multinegocios.sql. No borra ni cambia los
-- datos existentes: solo agrega columnas y tablas que la web necesita.
-- Se puede correr más de una vez (usa IF NOT EXISTS).
-- ==========================================================================
USE sistema_multinegocios;

-- negocios.tipo guarda el id del oficio elegido en el registro
-- (ej. 'barberia', 'ferreteria', o 'otro:Reparación de drones').
ALTER TABLE negocios
  MODIFY tipo VARCHAR(100) NOT NULL,
  ADD COLUMN IF NOT EXISTS fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;

-- usuario_login guarda el correo de los usuarios nuevos; se agranda para
-- que quepan correos largos y la contraseña encriptada (password_hash).
ALTER TABLE usuarios
  MODIFY usuario_login VARCHAR(100) NOT NULL,
  MODIFY contrasena VARCHAR(255) NOT NULL;

-- Descripción del proveedor (viene del directorio de la web).
-- activo = 0 cuando el negocio lo quita de "mis proveedores" (no se borra
-- porque puede tener pedidos y productos asociados).
ALTER TABLE proveedores
  ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1;

-- Producto eliminado desde la web: si ya tiene ventas o pedidos no se puede
-- borrar (llaves foráneas), así que se oculta con activo = 0.
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1;

-- Cada negocio tiene sus propios clientes. correo sirve para que el cliente
-- pueda tener su propia vista de compras más adelante; activo = 0 igual que
-- en productos.
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS id_negocio INT NULL,
  ADD COLUMN IF NOT EXISTS correo VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_negocio FOREIGN KEY IF NOT EXISTS (id_negocio) REFERENCES negocios(id_negocio);
-- Los clientes de ejemplo se asignan al negocio donde compraron.
UPDATE clientes c
  JOIN (SELECT id_cliente, MIN(id_negocio) AS id_negocio FROM ventas GROUP BY id_cliente) v
    ON v.id_cliente = c.id_cliente
  SET c.id_negocio = v.id_negocio
  WHERE c.id_negocio IS NULL;

-- Método y estado de pago de cada venta.
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20) NOT NULL DEFAULT 'Efectivo',
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'Pagado';

-- Pagos (abonos y cobros) de los clientes.
CREATE TABLE IF NOT EXISTS pagos (
    id_pago         INT PRIMARY KEY AUTO_INCREMENT,
    id_negocio      INT NOT NULL,
    id_cliente      INT NULL,
    id_venta        INT NULL,
    monto           DECIMAL(10,2) NOT NULL,
    metodo_pago     VARCHAR(20) NOT NULL DEFAULT 'Efectivo',
    estado          VARCHAR(20) NOT NULL DEFAULT 'Pagado',
    fecha           DATE NOT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
);

-- Pedidos de un negocio a sus proveedores (los ve el administrador general).
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido       INT PRIMARY KEY AUTO_INCREMENT,
    id_negocio      INT NOT NULL,
    id_proveedor    INT NOT NULL,
    fecha           DATE NOT NULL,
    fecha_llegada   DATE NOT NULL,
    total           DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle      INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido       INT NOT NULL,
    id_producto     INT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Las ventas de ejemplo también quedan como pagos.
INSERT INTO pagos (id_negocio, id_cliente, id_venta, monto, metodo_pago, estado, fecha)
SELECT v.id_negocio, v.id_cliente, v.id_venta, v.total, v.metodo_pago, v.estado, v.fecha
FROM ventas v
WHERE NOT EXISTS (SELECT 1 FROM pagos p WHERE p.id_venta = v.id_venta);

-- Correo del administrador general (admin24): avisos de negocios nuevos,
-- consultas de los negocios, avisos de proveedores y pedidos.
--   tipo: 'negocio' | 'consulta' | 'proveedor' | 'pedido'
--   respuesta: solo en consultas; el negocio la ve en su panel (Soporte).
CREATE TABLE IF NOT EXISTS correos (
    id_correo        INT PRIMARY KEY AUTO_INCREMENT,
    tipo             VARCHAR(20) NOT NULL,
    remitente        VARCHAR(150) NOT NULL,
    asunto           VARCHAR(200) NOT NULL,
    cuerpo           TEXT NOT NULL,
    id_negocio       INT NULL,
    proveedor        VARCHAR(100) NULL,
    leido            TINYINT(1) NOT NULL DEFAULT 0,
    fecha            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    respuesta        TEXT NULL,
    fecha_respuesta  DATETIME NULL,
    respuesta_vista  TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

-- Bandeja (tipo Gmail) de cada negocio: avisos de InnovaSistem, respuestas
-- a sus consultas y avisos automáticos de sus pedidos.
--   tipo: 'aviso' | 'respuesta' | 'pedido'
CREATE TABLE IF NOT EXISTS buzon_negocio (
    id_mensaje   INT PRIMARY KEY AUTO_INCREMENT,
    id_negocio   INT NOT NULL,
    tipo         VARCHAR(20) NOT NULL,
    remitente    VARCHAR(150) NOT NULL,
    asunto       VARCHAR(200) NOT NULL,
    cuerpo       TEXT NOT NULL,
    leido        TINYINT(1) NOT NULL DEFAULT 0,
    fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_correo    INT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio)
);

-- Para avisar una sola vez que un pedido llegó.
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS aviso_llegada TINYINT(1) NOT NULL DEFAULT 0;

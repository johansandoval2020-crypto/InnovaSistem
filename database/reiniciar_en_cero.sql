-- ==========================================================================
-- InnovaSistem — reiniciar los movimientos en cero
--
-- CONSERVA: negocios, usuarios, roles, clientes, categorías, productos y
--           proveedores.
-- BORRA:    ventas, detalle de ventas, facturas, pagos, pedidos a
--           proveedores y movimientos de inventario.
-- PONE EN 0: el stock de todos los productos.
--
-- Se puede correr cuantas veces se quiera (por ejemplo antes de presentar).
-- ==========================================================================
USE sistema_multinegocios;

START TRANSACTION;

DELETE FROM detalle_pedido;
DELETE FROM pedidos;
DELETE FROM pagos;
DELETE FROM facturas;
DELETE FROM detalle_venta;
DELETE FROM ventas;
DELETE FROM inventario_movimientos;

UPDATE productos SET stock = 0;

COMMIT;

-- Los números de venta, factura, pedido, etc. vuelven a empezar desde 1.
ALTER TABLE detalle_pedido AUTO_INCREMENT = 1;
ALTER TABLE pedidos AUTO_INCREMENT = 1;
ALTER TABLE pagos AUTO_INCREMENT = 1;
ALTER TABLE facturas AUTO_INCREMENT = 1;
ALTER TABLE detalle_venta AUTO_INCREMENT = 1;
ALTER TABLE ventas AUTO_INCREMENT = 1;
ALTER TABLE inventario_movimientos AUTO_INCREMENT = 1;

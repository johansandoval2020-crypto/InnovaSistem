<?php
/* Datos de la factura de una venta del negocio.
   GET ?venta=ID */
require __DIR__ . '/conexion.php';
$s = requerir_negocio();
$pdo = db();

$st = $pdo->prepare(
    'SELECT f.id_factura, f.fecha_emision, f.total_factura, v.id_venta, v.metodo_pago, v.estado,
            c.nombre AS cliente, c.telefono AS cliente_tel, c.direccion AS cliente_dir,
            u.nombre AS atendio, n.nombre AS negocio, n.telefono AS negocio_tel, n.direccion AS negocio_dir
     FROM ventas v
     JOIN facturas f ON f.id_venta = v.id_venta
     JOIN clientes c ON c.id_cliente = v.id_cliente
     JOIN usuarios u ON u.id_usuario = v.id_usuario
     JOIN negocios n ON n.id_negocio = v.id_negocio
     WHERE v.id_venta = ? AND v.id_negocio = ?'
);
$st->execute([(int)($_GET['venta'] ?? 0), $s['id_negocio']]);
$f = $st->fetch();
if (!$f) {
    responder(['error' => 'No se encontró la factura.'], 404);
}

$st = $pdo->prepare(
    'SELECT p.nombre, dv.cantidad, dv.precio_unitario, dv.subtotal
     FROM detalle_venta dv JOIN productos p ON p.id_producto = dv.id_producto
     WHERE dv.id_venta = ? ORDER BY dv.id_detalle'
);
$st->execute([$f['id_venta']]);

responder([
    'number' => (int)$f['id_factura'],
    'saleId' => (int)$f['id_venta'],
    'date' => $f['fecha_emision'],
    'total' => (float)$f['total_factura'],
    'method' => $f['metodo_pago'],
    'status' => $f['estado'],
    'servedBy' => $f['atendio'],
    'business' => ['name' => $f['negocio'], 'phone' => $f['negocio_tel'], 'address' => $f['negocio_dir']],
    'client' => ['name' => $f['cliente'], 'phone' => $f['cliente_tel'], 'address' => $f['cliente_dir']],
    'items' => array_map(fn($r) => [
        'name' => $r['nombre'],
        'qty' => (int)$r['cantidad'],
        'price' => (float)$r['precio_unitario'],
        'subtotal' => (float)$r['subtotal'],
    ], $st->fetchAll()),
]);

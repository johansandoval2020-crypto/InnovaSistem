<?php
/* Estado completo del negocio con sesión activa, en el formato que usa
   admin.js (inventario, proveedores, clientes, ventas y pagos).

   GET  → devuelve el estado.
   POST {action:'seed', categoria, products:[{name,price}]}
        → carga el inventario inicial del oficio (stock 0) si el negocio
          todavía no tiene productos. */
require __DIR__ . '/conexion.php';
$s = requerir_negocio();
$pdo = db();
$idNegocio = $s['id_negocio'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = entrada();
    if (($d['action'] ?? '') !== 'seed') {
        responder(['error' => 'Acción no válida'], 422);
    }
    $hay = $pdo->prepare('SELECT COUNT(*) FROM productos WHERE id_negocio = ?');
    $hay->execute([$idNegocio]);
    if ((int)$hay->fetchColumn() === 0 && !empty($d['products']) && is_array($d['products'])) {
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO categorias (nombre_categoria, id_negocio) VALUES (?, ?)')
            ->execute([mb_substr(texto($d, 'categoria') ?: 'General', 0, 50), $idNegocio]);
        $idCategoria = (int)$pdo->lastInsertId();
        $ins = $pdo->prepare('INSERT INTO productos (nombre, precio, stock, id_categoria, id_negocio) VALUES (?, ?, 0, ?, ?)');
        foreach ($d['products'] as $p) {
            $nombre = mb_substr(trim((string)($p['name'] ?? '')), 0, 100);
            $precio = round((float)($p['price'] ?? 0), 2);
            if ($nombre !== '' && $precio >= 0) {
                $ins->execute([$nombre, $precio, $idCategoria, $idNegocio]);
            }
        }
        $pdo->commit();
    }
    responder(['ok' => true]);
}

// ---------------- GET: estado del negocio ----------------
$st = $pdo->prepare('SELECT nombre, tipo, direccion, telefono FROM negocios WHERE id_negocio = ?');
$st->execute([$idNegocio]);
$negocio = $st->fetch();
if (!$negocio) {
    $_SESSION = [];
    responder(['error' => 'El negocio ya no existe'], 401);
}

$st = $pdo->prepare('SELECT id_producto, nombre, precio, stock FROM productos WHERE id_negocio = ? AND activo = 1 ORDER BY id_producto');
$st->execute([$idNegocio]);
$inventario = array_map(fn($p) => [
    'id' => (string)$p['id_producto'],
    'name' => $p['nombre'],
    'price' => (float)$p['precio'],
    'stock' => (int)$p['stock'],
], $st->fetchAll());

$st = $pdo->prepare('SELECT id_proveedor, nombre, telefono, descripcion FROM proveedores WHERE id_negocio = ? AND activo = 1 ORDER BY id_proveedor');
$st->execute([$idNegocio]);
$proveedores = array_map(fn($p) => [
    'id' => (string)$p['id_proveedor'],
    'name' => $p['nombre'],
    'desc' => $p['descripcion'] ?: ($p['telefono'] ? 'Tel. ' . $p['telefono'] : 'Proveedor'),
], $st->fetchAll());

// Una fila por producto vendido (detalle_venta), la más reciente primero.
$st = $pdo->prepare(
    'SELECT v.id_venta, dv.id_detalle, v.fecha, v.metodo_pago, v.estado, v.id_cliente,
            c.nombre AS cliente, p.nombre AS producto, dv.cantidad, dv.subtotal
     FROM ventas v
     JOIN detalle_venta dv ON dv.id_venta = v.id_venta
     JOIN productos p ON p.id_producto = dv.id_producto
     JOIN clientes c ON c.id_cliente = v.id_cliente
     WHERE v.id_negocio = ?
     ORDER BY v.fecha DESC, v.id_venta DESC, dv.id_detalle'
);
$st->execute([$idNegocio]);
$filasVenta = $st->fetchAll();
$ventas = array_map(fn($r) => [
    'id' => (string)$r['id_detalle'],
    'saleId' => (string)$r['id_venta'],
    'client' => $r['cliente'],
    'item' => $r['producto'],
    'qty' => (int)$r['cantidad'],
    'amount' => (float)$r['subtotal'],
    'date' => $r['fecha'],
    'method' => $r['metodo_pago'],
    'status' => $r['estado'],
], $filasVenta);

$st = $pdo->prepare('SELECT id_cliente, nombre, telefono, direccion, correo FROM clientes WHERE id_negocio = ? AND activo = 1 ORDER BY nombre');
$st->execute([$idNegocio]);
$clientes = [];
foreach ($st->fetchAll() as $c) {
    $compras = [];
    $total = 0;
    foreach ($filasVenta as $r) {
        if ((int)$r['id_cliente'] === (int)$c['id_cliente']) {
            $compras[] = ['item' => $r['producto'], 'qty' => (int)$r['cantidad'], 'amount' => (float)$r['subtotal'], 'date' => $r['fecha']];
            $total += (float)$r['subtotal'];
        }
    }
    $clientes[] = [
        'id' => (string)$c['id_cliente'],
        'name' => $c['nombre'],
        'phone' => $c['telefono'] ?: '—',
        'address' => $c['direccion'] ?? '',
        'email' => $c['correo'] ?? '',
        'purchases' => $compras,
        'total' => round($total, 2),
    ];
}

$st = $pdo->prepare(
    'SELECT pg.id_pago, pg.monto, pg.metodo_pago, pg.estado, pg.fecha, c.nombre AS cliente
     FROM pagos pg LEFT JOIN clientes c ON c.id_cliente = pg.id_cliente
     WHERE pg.id_negocio = ?
     ORDER BY pg.fecha DESC, pg.id_pago DESC'
);
$st->execute([$idNegocio]);
$pagos = array_map(fn($p) => [
    'id' => (string)$p['id_pago'],
    'client' => $p['cliente'] ?? '—',
    'amount' => (float)$p['monto'],
    'method' => $p['metodo_pago'],
    'status' => $p['estado'],
    'date' => $p['fecha'],
], $st->fetchAll());

$esDueno = (int)($_SESSION['id_rol'] ?? 0) === ROL_ADMINISTRADOR;

responder([
    'me' => [
        'id' => (string)$s['id_usuario'],
        'name' => $_SESSION['nombre'] ?? '',
        'isOwner' => $esDueno,
    ],
    'name' => $negocio['nombre'],
    'type' => $negocio['tipo'],
    'phone' => $negocio['telefono'] ?? '',
    'address' => $negocio['direccion'] ?? '',
    'ownerName' => $_SESSION['nombre'] ?? '',
    'inventory' => $inventario,
    'providersAdded' => $proveedores,
    'clients' => $clientes,
    'sales' => $ventas,
    'payments' => $pagos,
]);

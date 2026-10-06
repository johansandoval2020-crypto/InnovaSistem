<?php
/* Compra a un proveedor: suma stock al inventario y registra el pedido
   (pedidos + detalle_pedido + inventario_movimientos de ENTRADA).
   POST {providerId, items:[{id, qty}]} */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_correo.php';
requerir_post();
$s = requerir_negocio();
$pdo = db();
$d = entrada();

$st = $pdo->prepare('SELECT id_proveedor, nombre FROM proveedores WHERE id_proveedor = ? AND id_negocio = ?');
$st->execute([(int)($d['providerId'] ?? 0), $s['id_negocio']]);
$prov = $st->fetch();
$idProveedor = $prov ? (int)$prov['id_proveedor'] : 0;
if (!$idProveedor || empty($d['items']) || !is_array($d['items'])) {
    responder(['error' => 'Pedido no válido.'], 422);
}

$buscar = $pdo->prepare('SELECT id_producto, nombre, precio FROM productos WHERE id_producto = ? AND id_negocio = ?');
$lineas = [];
$detalleTexto = [];
$total = 0;
foreach ($d['items'] as $it) {
    $cantidad = max(1, (int)($it['qty'] ?? 0));
    $buscar->execute([(int)($it['id'] ?? 0), $s['id_negocio']]);
    $prod = $buscar->fetch();
    if ($prod) {
        $subtotal = round($prod['precio'] * $cantidad, 2);
        $lineas[] = [$prod['id_producto'], $cantidad, $prod['precio'], $subtotal];
        $detalleTexto[] = '• ' . $prod['nombre'] . ' x' . $cantidad . ' — $' . number_format($subtotal, 2);
        $total += $subtotal;
    }
}
if (!$lineas) {
    responder(['error' => 'Pedido sin productos.'], 422);
}

$hoy = date('Y-m-d');
$llegada = date('Y-m-d', strtotime('+' . random_int(2, 6) . ' days'));

$pdo->beginTransaction();
$pdo->prepare('INSERT INTO pedidos (id_negocio, id_proveedor, fecha, fecha_llegada, total) VALUES (?, ?, ?, ?, ?)')
    ->execute([$s['id_negocio'], $idProveedor, $hoy, $llegada, round($total, 2)]);
$idPedido = (int)$pdo->lastInsertId();

$insDetalle = $pdo->prepare('INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
$insMov = $pdo->prepare("INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, fecha) VALUES (?, 'ENTRADA', ?, ?)");
$sumar = $pdo->prepare('UPDATE productos SET stock = stock + ? WHERE id_producto = ?');
foreach ($lineas as [$idProducto, $cantidad, $precio, $subtotal]) {
    $insDetalle->execute([$idPedido, $idProducto, $cantidad, $precio, $subtotal]);
    $insMov->execute([$idProducto, $cantidad, $hoy]);
    $sumar->execute([$cantidad, $idProducto]);
}
avisar_negocio($pdo, $s['id_negocio'], 'pedido', $prov['nombre'], 'Pedido confirmado: ' . $prov['nombre'],
    "Tu pedido #$idPedido a {$prov['nombre']} quedó confirmado.

" . implode("
", $detalleTexto) .
    "

Total: $" . number_format($total, 2) . "
Llegada estimada: $llegada

Te avisamos acá cuando llegue.");
$negocio = nombre_negocio($pdo, $s['id_negocio']);
enviar_correo($pdo, 'pedido', $negocio, "Pedido de $negocio a {$prov['nombre']}",
    "$negocio le hizo un pedido a {$prov['nombre']}.

" . implode("
", $detalleTexto) .
    "

Total: $" . number_format($total, 2) . "
Fecha: $hoy
Llegada estimada: $llegada",
    $s['id_negocio'], $prov['nombre']);
$pdo->commit();

responder(['ok' => true]);

<?php
/* Compra a un proveedor: suma stock al inventario y registra el pedido
   (pedidos + detalle_pedido + inventario_movimientos de ENTRADA).
   POST {providerId, items:[{id, qty}]} */
require __DIR__ . '/conexion.php';
requerir_post();
$s = requerir_negocio();
$pdo = db();
$d = entrada();

$st = $pdo->prepare('SELECT id_proveedor FROM proveedores WHERE id_proveedor = ? AND id_negocio = ?');
$st->execute([(int)($d['providerId'] ?? 0), $s['id_negocio']]);
$idProveedor = (int)$st->fetchColumn();
if (!$idProveedor || empty($d['items']) || !is_array($d['items'])) {
    responder(['error' => 'Pedido no válido.'], 422);
}

$buscar = $pdo->prepare('SELECT id_producto, precio FROM productos WHERE id_producto = ? AND id_negocio = ?');
$lineas = [];
$total = 0;
foreach ($d['items'] as $it) {
    $cantidad = max(1, (int)($it['qty'] ?? 0));
    $buscar->execute([(int)($it['id'] ?? 0), $s['id_negocio']]);
    $prod = $buscar->fetch();
    if ($prod) {
        $subtotal = round($prod['precio'] * $cantidad, 2);
        $lineas[] = [$prod['id_producto'], $cantidad, $prod['precio'], $subtotal];
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
$pdo->commit();

responder(['ok' => true]);

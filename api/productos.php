<?php
/* Productos del inventario. Solo el dueño del negocio.
   POST {action:'update', id, name, price, stock}
        → si cambia el stock se registra un movimiento de ENTRADA o SALIDA.
   POST {action:'delete', id}
        → si no tiene ventas ni pedidos se borra; si tiene, se oculta. */
require __DIR__ . '/conexion.php';
requerir_post();
$s = requerir_dueno();
$pdo = db();
$d = entrada();
$accion = $d['action'] ?? '';

function datos_producto(array $d): array {
    $nombre = mb_substr(texto($d, 'name'), 0, 100);
    $precio = round((float)($d['price'] ?? -1), 2);
    $stock = (int)($d['stock'] ?? 0);
    if ($nombre === '') responder(['error' => 'Falta el nombre del producto.'], 422);
    if ($precio < 0) responder(['error' => 'El precio no puede ser negativo.'], 422);
    if ($stock < 0) responder(['error' => 'El stock no puede ser negativo.'], 422);
    return [$nombre, $precio, $stock];
}

function movimiento_ajuste(PDO $pdo, int $idProducto, int $antes, int $despues): void {
    if ($antes === $despues) return;
    // tipo_movimiento es VARCHAR(10): ENTRADA / SALIDA como en el .sql original.
    $tipo = $despues > $antes ? 'ENTRADA' : 'SALIDA';
    $pdo->prepare('INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, fecha) VALUES (?, ?, ?, ?)')
        ->execute([$idProducto, $tipo, abs($despues - $antes), date('Y-m-d')]);
}

function producto_del_negocio(PDO $pdo, int $id, int $idNegocio): array {
    $st = $pdo->prepare('SELECT stock FROM productos WHERE id_producto = ? AND id_negocio = ? AND activo = 1');
    $st->execute([$id, $idNegocio]);
    $p = $st->fetch();
    if (!$p) responder(['error' => 'Ese producto no existe.'], 404);
    return $p;
}

if ($accion === 'update') {
    $id = (int)($d['id'] ?? 0);
    $actual = producto_del_negocio($pdo, $id, $s['id_negocio']);
    [$nombre, $precio, $stock] = datos_producto($d);
    $pdo->beginTransaction();
    $pdo->prepare('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id_producto = ?')
        ->execute([$nombre, $precio, $stock, $id]);
    movimiento_ajuste($pdo, $id, (int)$actual['stock'], $stock);
    $pdo->commit();
    responder(['ok' => true]);
}

if ($accion === 'delete') {
    $id = (int)($d['id'] ?? 0);
    producto_del_negocio($pdo, $id, $s['id_negocio']);
    $st = $pdo->prepare('SELECT (SELECT COUNT(*) FROM detalle_venta WHERE id_producto = ?) + (SELECT COUNT(*) FROM detalle_pedido WHERE id_producto = ?)');
    $st->execute([$id, $id]);
    if ((int)$st->fetchColumn() === 0) {
        $pdo->beginTransaction();
        $pdo->prepare('DELETE FROM inventario_movimientos WHERE id_producto = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM productos WHERE id_producto = ?')->execute([$id]);
        $pdo->commit();
    } else {
        $pdo->prepare('UPDATE productos SET activo = 0 WHERE id_producto = ?')->execute([$id]);
    }
    responder(['ok' => true]);
}

responder(['error' => 'Acción no válida'], 422);

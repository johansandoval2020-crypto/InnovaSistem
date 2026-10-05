<?php
/* Registra una venta (uno o varios productos) con todo lo que implica en la
   base: ventas, detalle_venta (una fila por producto), facturas, pagos,
   inventario_movimientos (SALIDA) y descuento de stock.
   $items = [['id' => id_producto, 'qty' => cantidad], ...]
   Lo usan ventas.php y clientes.php. Devuelve el id de la venta. */

function registrar_venta(PDO $pdo, array $sesion, int $idCliente, array $items, string $metodo, string $estado): int {
    $metodo = in_array($metodo, ['Efectivo', 'Tarjeta', 'Transferencia'], true) ? $metodo : 'Efectivo';
    $estado = in_array($estado, ['Pagado', 'Pendiente'], true) ? $estado : 'Pagado';

    $st = $pdo->prepare('SELECT 1 FROM clientes WHERE id_cliente = ? AND id_negocio = ? AND activo = 1');
    $st->execute([$idCliente, $sesion['id_negocio']]);
    if (!$st->fetch()) {
        responder(['error' => 'Elegí un cliente válido.'], 422);
    }

    // Junta cantidades del mismo producto y valida precio y stock.
    $cantidades = [];
    foreach ($items as $it) {
        $id = (int)($it['id'] ?? 0);
        $qty = (int)($it['qty'] ?? 0);
        if ($id > 0 && $qty > 0) {
            $cantidades[$id] = ($cantidades[$id] ?? 0) + $qty;
        }
    }
    if (!$cantidades) {
        responder(['error' => 'Agregá al menos un producto a la venta.'], 422);
    }

    $buscar = $pdo->prepare('SELECT nombre, precio, stock FROM productos WHERE id_producto = ? AND id_negocio = ? AND activo = 1');
    $lineas = [];
    $total = 0;
    foreach ($cantidades as $idProducto => $cantidad) {
        $buscar->execute([$idProducto, $sesion['id_negocio']]);
        $p = $buscar->fetch();
        if (!$p) {
            responder(['error' => 'Uno de los productos ya no existe.'], 422);
        }
        if ((int)$p['stock'] < $cantidad) {
            responder(['error' => 'No hay suficiente stock de "' . $p['nombre'] . '" (quedan ' . (int)$p['stock'] . ').'], 422);
        }
        $subtotal = round($p['precio'] * $cantidad, 2);
        $lineas[] = [$idProducto, $cantidad, $p['precio'], $subtotal];
        $total += $subtotal;
    }
    $total = round($total, 2);
    $hoy = date('Y-m-d');

    $pdo->beginTransaction();
    $pdo->prepare('INSERT INTO ventas (fecha, id_cliente, id_usuario, id_negocio, total, metodo_pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([$hoy, $idCliente, $sesion['id_usuario'], $sesion['id_negocio'], $total, $metodo, $estado]);
    $idVenta = (int)$pdo->lastInsertId();

    $insDetalle = $pdo->prepare('INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
    $insMov = $pdo->prepare("INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, fecha) VALUES (?, 'SALIDA', ?, ?)");
    $restar = $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id_producto = ?');
    foreach ($lineas as [$idProducto, $cantidad, $precio, $subtotal]) {
        $insDetalle->execute([$idVenta, $idProducto, $cantidad, $precio, $subtotal]);
        $insMov->execute([$idProducto, $cantidad, $hoy]);
        $restar->execute([$cantidad, $idProducto]);
    }

    $pdo->prepare('INSERT INTO facturas (id_venta, fecha_emision, total_factura) VALUES (?, ?, ?)')
        ->execute([$idVenta, $hoy, $total]);
    $pdo->prepare('INSERT INTO pagos (id_negocio, id_cliente, id_venta, monto, metodo_pago, estado, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([$sesion['id_negocio'], $idCliente, $idVenta, $total, $metodo, $estado, $hoy]);
    $pdo->commit();

    return $idVenta;
}

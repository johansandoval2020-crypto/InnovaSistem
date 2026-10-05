<?php
/* Clientes del negocio (CRUD).
   POST {action:'create', name, phone, address, email, item?, qty?}
        → lo agrega; si viene item, registra también su primera compra.
   POST {action:'update', id, name, phone, address, email}
   POST {action:'delete', id}
        → si no tiene compras se borra; si tiene, se oculta (activo = 0)
          para no perder el historial de ventas. */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_venta.php';
requerir_post();
$s = requerir_negocio();
$pdo = db();
$d = entrada();
$accion = $d['action'] ?? 'create';

function datos_cliente(array $d): array {
    $nombre = mb_substr(texto($d, 'name'), 0, 100);
    if ($nombre === '') {
        responder(['error' => 'Falta el nombre del cliente.'], 422);
    }
    $correo = mb_substr(strtolower(texto($d, 'email')), 0, 100);
    if ($correo !== '' && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder(['error' => 'El correo del cliente no es válido.'], 422);
    }
    return [$nombre, mb_substr(texto($d, 'phone'), 0, 20), mb_substr(texto($d, 'address'), 0, 150), $correo ?: null];
}

function cliente_del_negocio(PDO $pdo, int $id, int $idNegocio): void {
    $st = $pdo->prepare('SELECT 1 FROM clientes WHERE id_cliente = ? AND id_negocio = ? AND activo = 1');
    $st->execute([$id, $idNegocio]);
    if (!$st->fetch()) {
        responder(['error' => 'Ese cliente no existe.'], 404);
    }
}

if ($accion === 'create') {
    [$nombre, $tel, $dir, $correo] = datos_cliente($d);
    // Se valida el stock de la primera compra ANTES de crear el cliente,
    // para no dejar un cliente a medias si la venta no se puede hacer.
    if (!empty($d['item'])) {
        $st = $pdo->prepare('SELECT nombre, stock FROM productos WHERE id_producto = ? AND id_negocio = ? AND activo = 1');
        $st->execute([(int)$d['item'], $s['id_negocio']]);
        $p = $st->fetch();
        if (!$p || (int)$p['stock'] < max(1, (int)($d['qty'] ?? 1))) {
            responder(['error' => 'No hay suficiente stock' . ($p ? ' de "' . $p['nombre'] . '" (quedan ' . (int)$p['stock'] . ')' : '') . ' para la primera compra.'], 422);
        }
    }
    $pdo->prepare('INSERT INTO clientes (nombre, telefono, direccion, correo, id_negocio) VALUES (?, ?, ?, ?, ?)')
        ->execute([$nombre, $tel, $dir, $correo, $s['id_negocio']]);
    $idCliente = (int)$pdo->lastInsertId();
    if (!empty($d['item'])) {
        registrar_venta($pdo, $s, $idCliente, [['id' => $d['item'], 'qty' => $d['qty'] ?? 1]], 'Efectivo', 'Pagado');
    }
    responder(['ok' => true, 'id' => $idCliente]);
}

if ($accion === 'update') {
    $id = (int)($d['id'] ?? 0);
    cliente_del_negocio($pdo, $id, $s['id_negocio']);
    [$nombre, $tel, $dir, $correo] = datos_cliente($d);
    $pdo->prepare('UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, correo = ? WHERE id_cliente = ?')
        ->execute([$nombre, $tel, $dir, $correo, $id]);
    responder(['ok' => true]);
}

if ($accion === 'delete') {
    $id = (int)($d['id'] ?? 0);
    cliente_del_negocio($pdo, $id, $s['id_negocio']);
    $st = $pdo->prepare('SELECT (SELECT COUNT(*) FROM ventas WHERE id_cliente = ?) + (SELECT COUNT(*) FROM pagos WHERE id_cliente = ?)');
    $st->execute([$id, $id]);
    if ((int)$st->fetchColumn() === 0) {
        $pdo->prepare('DELETE FROM clientes WHERE id_cliente = ?')->execute([$id]);
    } else {
        $pdo->prepare('UPDATE clientes SET activo = 0 WHERE id_cliente = ?')->execute([$id]);
    }
    responder(['ok' => true]);
}

responder(['error' => 'Acción no válida'], 422);

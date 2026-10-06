<?php
/* Datos del panel de administración general (superadmin.html).
   GET                        → negocios, ventas y pedidos de toda la plataforma.
   POST {action:'delete', id} → elimina un negocio con todos sus datos. */
require __DIR__ . '/conexion.php';
requerir_admin();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = entrada();
    if (($d['action'] ?? '') !== 'delete') {
        responder(['error' => 'Acción no válida'], 422);
    }
    eliminar_negocio($pdo, (int)($d['id'] ?? 0));
    responder(['ok' => true]);
}

// ---------------- GET ----------------
// Dueño = primer usuario con rol Administrador del negocio (o el primero que haya).
$negocios = $pdo->query(
    'SELECT n.id_negocio, n.nombre, n.tipo, n.fecha_registro,
            (SELECT u.nombre FROM usuarios u WHERE u.id_negocio = n.id_negocio
              ORDER BY (u.id_rol = ' . ROL_ADMINISTRADOR . ') DESC, u.id_usuario LIMIT 1) AS dueno,
            (SELECT u.usuario_login FROM usuarios u WHERE u.id_negocio = n.id_negocio
              ORDER BY (u.id_rol = ' . ROL_ADMINISTRADOR . ') DESC, u.id_usuario LIMIT 1) AS correo,
            (SELECT COALESCE(SUM(v.total), 0) FROM ventas v WHERE v.id_negocio = n.id_negocio) AS ingresos
     FROM negocios n
     ORDER BY n.id_negocio DESC'
)->fetchAll();

$ventas = $pdo->query(
    'SELECT v.fecha, n.nombre AS negocio, c.nombre AS cliente, p.nombre AS producto,
            dv.cantidad, dv.subtotal, v.estado
     FROM ventas v
     JOIN negocios n ON n.id_negocio = v.id_negocio
     JOIN clientes c ON c.id_cliente = v.id_cliente
     JOIN detalle_venta dv ON dv.id_venta = v.id_venta
     JOIN productos p ON p.id_producto = dv.id_producto
     ORDER BY v.fecha DESC, v.id_venta DESC'
)->fetchAll();

$pedidos = $pdo->query(
    "SELECT pe.id_pedido, n.nombre AS negocio, pr.nombre AS proveedor, pe.total, pe.fecha, pe.fecha_llegada,
            GROUP_CONCAT(CONCAT(p.nombre, ' x', dp.cantidad) SEPARATOR ', ') AS productos
     FROM pedidos pe
     JOIN negocios n ON n.id_negocio = pe.id_negocio
     JOIN proveedores pr ON pr.id_proveedor = pe.id_proveedor
     JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
     JOIN productos p ON p.id_producto = dp.id_producto
     GROUP BY pe.id_pedido
     ORDER BY pe.fecha DESC, pe.id_pedido DESC"
)->fetchAll();

responder([
    'businesses' => array_map(fn($n) => [
        'id' => (string)$n['id_negocio'],
        'businessName' => $n['nombre'],
        'ownerName' => $n['dueno'] ?? '—',
        'email' => $n['correo'] ?? '—',
        'type' => $n['tipo'],
        'createdAt' => $n['fecha_registro'] ?? '',
        'revenue' => (float)$n['ingresos'],
    ], $negocios),
    'sales' => array_map(fn($v) => [
        'date' => $v['fecha'],
        'businessName' => $v['negocio'],
        'client' => $v['cliente'],
        'item' => $v['producto'],
        'qty' => (int)$v['cantidad'],
        'amount' => (float)$v['subtotal'],
        'status' => $v['estado'],
    ], $ventas),
    'orders' => array_map(fn($o) => [
        'businessName' => $o['negocio'],
        'provider' => $o['proveedor'],
        'itemsText' => $o['productos'],
        'total' => (float)$o['total'],
        'date' => $o['fecha'],
        'arrivalDate' => $o['fecha_llegada'],
    ], $pedidos),
]);

/* Borra un negocio y todo lo que depende de él, en orden para respetar las
   llaves foráneas. Incluye ventas/pedidos de otros negocios que apunten a sus
   productos, usuarios o clientes (pasa con los datos de ejemplo del .sql). */
function eliminar_negocio(PDO $pdo, int $id): void {
    $existe = $pdo->prepare('SELECT 1 FROM negocios WHERE id_negocio = ?');
    $existe->execute([$id]);
    if (!$existe->fetch()) {
        responder(['error' => 'Ese negocio no existe.'], 404);
    }

    $ids = function (string $sql) use ($pdo, $id): string {
        $st = $pdo->prepare($sql);
        $st->execute([$id]);
        $lista = array_map('intval', $st->fetchAll(PDO::FETCH_COLUMN));
        return $lista ? implode(',', $lista) : '0';
    };

    $pdo->beginTransaction();
    $productos   = $ids('SELECT id_producto FROM productos WHERE id_negocio = ?');
    $usuarios    = $ids('SELECT id_usuario FROM usuarios WHERE id_negocio = ?');
    $clientes    = $ids('SELECT id_cliente FROM clientes WHERE id_negocio = ?');
    $proveedores = $ids('SELECT id_proveedor FROM proveedores WHERE id_negocio = ?');
    $ventas      = $ids("SELECT id_venta FROM ventas WHERE id_negocio = ?
                         OR id_usuario IN ($usuarios) OR id_cliente IN ($clientes)
                         OR id_venta IN (SELECT id_venta FROM detalle_venta WHERE id_producto IN ($productos))");
    $pedidos     = $ids("SELECT id_pedido FROM pedidos WHERE id_negocio = ?
                         OR id_proveedor IN ($proveedores)
                         OR id_pedido IN (SELECT id_pedido FROM detalle_pedido WHERE id_producto IN ($productos))");

    $pdo->exec("DELETE FROM correos WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM buzon_negocio WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM pagos WHERE id_venta IN ($ventas) OR id_cliente IN ($clientes) OR id_negocio = $id");
    $pdo->exec("DELETE FROM facturas WHERE id_venta IN ($ventas)");
    $pdo->exec("DELETE FROM detalle_venta WHERE id_venta IN ($ventas) OR id_producto IN ($productos)");
    $pdo->exec("DELETE FROM ventas WHERE id_venta IN ($ventas)");
    $pdo->exec("DELETE FROM detalle_pedido WHERE id_pedido IN ($pedidos) OR id_producto IN ($productos)");
    $pdo->exec("DELETE FROM pedidos WHERE id_pedido IN ($pedidos)");
    $pdo->exec("DELETE FROM inventario_movimientos WHERE id_producto IN ($productos)");
    $pdo->exec("DELETE FROM productos WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM categorias WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM proveedores WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM clientes WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM usuarios WHERE id_negocio = $id");
    $pdo->exec("DELETE FROM negocios WHERE id_negocio = $id");
    $pdo->commit();
}

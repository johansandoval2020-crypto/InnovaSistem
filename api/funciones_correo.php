<?php
/* Deja un correo en la bandeja del administrador general (admin24).
   Lo usan registro.php (negocio nuevo), proveedores.php (aviso de
   proveedor), comprar.php (pedido) y buzon.php (consulta). */

function enviar_correo(PDO $pdo, string $tipo, string $remitente, string $asunto, string $cuerpo, ?int $idNegocio = null, ?string $proveedor = null): void {
    $pdo->prepare('INSERT INTO correos (tipo, remitente, asunto, cuerpo, id_negocio, proveedor) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$tipo, mb_substr($remitente, 0, 150), mb_substr($asunto, 0, 200), $cuerpo, $idNegocio, $proveedor !== null ? mb_substr($proveedor, 0, 100) : null]);
}

function nombre_negocio(PDO $pdo, int $idNegocio): string {
    $st = $pdo->prepare('SELECT nombre FROM negocios WHERE id_negocio = ?');
    $st->execute([$idNegocio]);
    return (string)($st->fetchColumn() ?: 'Negocio');
}

/* Deja un mensaje en la bandeja (tipo Gmail) de un negocio.
   tipo: 'aviso' (de InnovaSistem), 'respuesta' (a una consulta) o 'pedido'. */
function avisar_negocio(PDO $pdo, int $idNegocio, string $tipo, string $remitente, string $asunto, string $cuerpo, ?int $idCorreo = null): void {
    $pdo->prepare('INSERT INTO buzon_negocio (id_negocio, tipo, remitente, asunto, cuerpo, id_correo) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$idNegocio, $tipo, mb_substr($remitente, 0, 150), mb_substr($asunto, 0, 200), $cuerpo, $idCorreo]);
}

/* Avisos de pedidos que ya llegaron (se crean una sola vez, al abrir la bandeja). */
function avisar_pedidos_llegados(PDO $pdo, int $idNegocio): void {
    $st = $pdo->prepare(
        'SELECT pe.id_pedido, pe.fecha_llegada, pe.total, pr.nombre AS proveedor
         FROM pedidos pe JOIN proveedores pr ON pr.id_proveedor = pe.id_proveedor
         WHERE pe.id_negocio = ? AND pe.aviso_llegada = 0 AND pe.fecha_llegada <= CURDATE()'
    );
    $st->execute([$idNegocio]);
    foreach ($st->fetchAll() as $p) {
        avisar_negocio($pdo, $idNegocio, 'pedido', $p['proveedor'], 'Tu pedido a ' . $p['proveedor'] . ' llegó',
            'El pedido #' . $p['id_pedido'] . ' a ' . $p['proveedor'] . ' (total $' . number_format((float)$p['total'], 2) . ') ' .
            'figura como entregado el ' . $p['fecha_llegada'] . ".\n\nEl stock ya está sumado en tu inventario.");
        $pdo->prepare('UPDATE pedidos SET aviso_llegada = 1 WHERE id_pedido = ?')->execute([$p['id_pedido']]);
    }
}

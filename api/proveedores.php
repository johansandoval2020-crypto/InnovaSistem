<?php
/* Proveedores del negocio.
   POST {action:'add', name, desc}  → lo agrega (o lo reactiva si ya estaba).
   POST {action:'remove', id}       → lo quita de "mis proveedores". */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_correo.php';
requerir_post();
$s = requerir_negocio();
$pdo = db();
$d = entrada();

if (($d['action'] ?? '') === 'add') {
    $nombre = mb_substr(texto($d, 'name'), 0, 100);
    $desc = mb_substr(texto($d, 'desc'), 0, 255);
    if ($nombre === '') {
        responder(['error' => 'Falta el nombre del proveedor.'], 422);
    }
    $st = $pdo->prepare('SELECT id_proveedor FROM proveedores WHERE id_negocio = ? AND nombre = ?');
    $st->execute([$s['id_negocio'], $nombre]);
    $id = $st->fetchColumn();
    $negocio = nombre_negocio($pdo, $s['id_negocio']);
    // Aviso automático para admin24: este proveedor ahora atiende a un negocio más.
    enviar_correo($pdo, 'proveedor', $nombre, $nombre . ': nuevo negocio conectado',
        "$negocio agregó a $nombre como proveedor.

" .
        ($desc !== '' ? "Sobre el proveedor: $desc

" : '') .
        "Desde ahora puede ver su catálogo y hacerle pedidos desde el panel.

" .
        "Aviso generado automáticamente por InnovaSistem (no es un mensaje enviado por la empresa).",
        $s['id_negocio'], $nombre);
    if ($id) {
        $pdo->prepare('UPDATE proveedores SET activo = 1, descripcion = ? WHERE id_proveedor = ?')->execute([$desc, $id]);
    } else {
        $pdo->prepare('INSERT INTO proveedores (nombre, descripcion, id_negocio) VALUES (?, ?, ?)')
            ->execute([$nombre, $desc, $s['id_negocio']]);
    }
    responder(['ok' => true]);
}

if (($d['action'] ?? '') === 'remove') {
    $pdo->prepare('UPDATE proveedores SET activo = 0 WHERE id_proveedor = ? AND id_negocio = ?')
        ->execute([(int)($d['id'] ?? 0), $s['id_negocio']]);
    responder(['ok' => true]);
}

responder(['error' => 'Acción no válida'], 422);

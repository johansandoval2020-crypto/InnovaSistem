<?php
/* Proveedores del negocio.
   POST {action:'add', name, desc}  → lo agrega (o lo reactiva si ya estaba).
   POST {action:'remove', id}       → lo quita de "mis proveedores". */
require __DIR__ . '/conexion.php';
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

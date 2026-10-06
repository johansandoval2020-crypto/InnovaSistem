<?php
/* Correo del negocio (tipo Gmail): recibidos y enviados.
   GET                                → recibidos (buzon_negocio), enviados (sus
                                        consultas) y no leídos. Antes crea los
                                        avisos de pedidos que ya llegaron.
   POST {action:'send', subject, message}  → consulta a InnovaSistem (llega al Correo de admin24).
   POST {action:'read', id, read}          → marca leído / no leído.
   POST {action:'read_all'}
   POST {action:'delete', id}              → borra un mensaje recibido. */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_correo.php';
$s = requerir_negocio();
$pdo = db();
$idNegocio = $s['id_negocio'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = entrada();
    $id = (int)($d['id'] ?? 0);
    switch ($d['action'] ?? '') {
        case 'send':
            $asunto = mb_substr(texto($d, 'subject'), 0, 200);
            $mensaje = mb_substr(trim((string)($d['message'] ?? '')), 0, 3000);
            if ($asunto === '' || $mensaje === '') responder(['error' => 'Completá el asunto y el mensaje.'], 422);
            enviar_correo($pdo, 'consulta', nombre_negocio($pdo, $idNegocio) . ' · ' . ($_SESSION['nombre'] ?? ''), $asunto, $mensaje, $idNegocio);
            break;
        case 'read':
            $pdo->prepare('UPDATE buzon_negocio SET leido = ? WHERE id_mensaje = ? AND id_negocio = ?')
                ->execute([empty($d['read']) ? 0 : 1, $id, $idNegocio]);
            break;
        case 'read_all':
            $pdo->prepare('UPDATE buzon_negocio SET leido = 1 WHERE id_negocio = ?')->execute([$idNegocio]);
            break;
        case 'delete':
            $pdo->prepare('DELETE FROM buzon_negocio WHERE id_mensaje = ? AND id_negocio = ?')->execute([$id, $idNegocio]);
            break;
        default:
            responder(['error' => 'Acción no válida'], 422);
    }
    responder(['ok' => true]);
}

avisar_pedidos_llegados($pdo, $idNegocio);

$st = $pdo->prepare('SELECT * FROM buzon_negocio WHERE id_negocio = ? ORDER BY fecha DESC, id_mensaje DESC');
$st->execute([$idNegocio]);
$recibidos = $st->fetchAll();

$st = $pdo->prepare("SELECT id_correo, asunto, cuerpo, fecha, respuesta, fecha_respuesta FROM correos WHERE tipo = 'consulta' AND id_negocio = ? ORDER BY fecha DESC, id_correo DESC");
$st->execute([$idNegocio]);

responder([
    'unread' => count(array_filter($recibidos, fn($m) => !(int)$m['leido'])),
    'inbox' => array_map(fn($m) => [
        'id' => (string)$m['id_mensaje'],
        'type' => $m['tipo'],
        'from' => $m['remitente'],
        'subject' => $m['asunto'],
        'body' => $m['cuerpo'],
        'read' => (bool)$m['leido'],
        'date' => $m['fecha'],
    ], $recibidos),
    'sent' => array_map(fn($c) => [
        'id' => (string)$c['id_correo'],
        'subject' => $c['asunto'],
        'body' => $c['cuerpo'],
        'date' => $c['fecha'],
        'reply' => $c['respuesta'],
        'replyDate' => $c['fecha_respuesta'],
    ], $st->fetchAll()),
]);

<?php
/* Bandeja de correo del administrador general (solo admin24).
   GET                                → correos (más nuevos primero) + no leídos.
   POST {action:'read', id, read}     → marca leído / no leído.
   POST {action:'read_all'}           → marca todos como leídos.
   POST {action:'reply', id, text}    → responde una consulta (le llega al Correo del negocio).
   POST {action:'notice', target, provider?, business?, subject, text}
        → aviso para los negocios. target: 'all' | 'provider' (los que usan
          ese proveedor) | 'business' (uno solo). Devuelve a cuántos llegó.
   POST {action:'delete', id}         → borra el correo. */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_correo.php';
requerir_admin();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = entrada();
    $id = (int)($d['id'] ?? 0);
    switch ($d['action'] ?? '') {
        case 'read':
            $pdo->prepare('UPDATE correos SET leido = ? WHERE id_correo = ?')->execute([empty($d['read']) ? 0 : 1, $id]);
            break;
        case 'read_all':
            $pdo->exec('UPDATE correos SET leido = 1');
            break;
        case 'reply':
            $texto = trim((string)($d['text'] ?? ''));
            if ($texto === '') responder(['error' => 'Escribí una respuesta.'], 422);
            $st = $pdo->prepare("SELECT asunto, id_negocio FROM correos WHERE id_correo = ? AND tipo = 'consulta'");
            $st->execute([$id]);
            $consulta = $st->fetch();
            if (!$consulta) responder(['error' => 'Solo se pueden responder las consultas.'], 422);
            $texto = mb_substr($texto, 0, 3000);
            $pdo->prepare('UPDATE correos SET respuesta = ?, fecha_respuesta = NOW(), leido = 1 WHERE id_correo = ?')->execute([$texto, $id]);
            if ($consulta['id_negocio']) {
                avisar_negocio($pdo, (int)$consulta['id_negocio'], 'respuesta', 'InnovaSistem', 'Re: ' . $consulta['asunto'], $texto, $id);
            }
            break;
        case 'notice':
            $asunto = mb_substr(texto($d, 'subject'), 0, 200);
            $texto = mb_substr(trim((string)($d['text'] ?? '')), 0, 3000);
            if ($asunto === '' || $texto === '') responder(['error' => 'Completá el asunto y el mensaje.'], 422);
            $target = $d['target'] ?? 'all';
            if ($target === 'provider') {
                $st = $pdo->prepare('SELECT DISTINCT id_negocio FROM proveedores WHERE nombre = ? AND activo = 1');
                $st->execute([texto($d, 'provider')]);
            } elseif ($target === 'business') {
                $st = $pdo->prepare('SELECT id_negocio FROM negocios WHERE id_negocio = ?');
                $st->execute([(int)($d['business'] ?? 0)]);
            } else {
                $st = $pdo->query('SELECT id_negocio FROM negocios');
            }
            $ids = $st->fetchAll(PDO::FETCH_COLUMN);
            if (!$ids) responder(['error' => 'Ningún negocio recibe este aviso.'], 422);
            foreach ($ids as $idNeg) {
                avisar_negocio($pdo, (int)$idNeg, 'aviso', 'InnovaSistem', $asunto, $texto);
            }
            responder(['ok' => true, 'sent' => count($ids)]);
        case 'delete':
            $pdo->prepare('DELETE FROM correos WHERE id_correo = ?')->execute([$id]);
            break;
        default:
            responder(['error' => 'Acción no válida'], 422);
    }
    responder(['ok' => true]);
}

$correos = $pdo->query(
    'SELECT c.*, n.nombre AS negocio
     FROM correos c LEFT JOIN negocios n ON n.id_negocio = c.id_negocio
     ORDER BY c.fecha DESC, c.id_correo DESC'
)->fetchAll();

// Para los avisos de proveedor: qué negocios tienen hoy a ese proveedor.
$usan = [];
foreach ($pdo->query('SELECT p.nombre AS proveedor, n.nombre AS negocio FROM proveedores p JOIN negocios n ON n.id_negocio = p.id_negocio WHERE p.activo = 1 ORDER BY n.nombre') as $r) {
    $usan[$r['proveedor']][] = $r['negocio'];
}

responder([
    'providers' => array_keys($usan),
    'unread' => count(array_filter($correos, fn($c) => !(int)$c['leido'])),
    'mails' => array_map(fn($c) => [
        'id' => (string)$c['id_correo'],
        'type' => $c['tipo'],
        'from' => $c['remitente'],
        'subject' => $c['asunto'],
        'body' => $c['cuerpo'],
        'business' => $c['negocio'],
        'provider' => $c['proveedor'],
        'usedBy' => $c['proveedor'] !== null ? ($usan[$c['proveedor']] ?? []) : [],
        'read' => (bool)$c['leido'],
        'date' => $c['fecha'],
        'reply' => $c['respuesta'],
        'replyDate' => $c['fecha_respuesta'],
    ], $correos),
]);

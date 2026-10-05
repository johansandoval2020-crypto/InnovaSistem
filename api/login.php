<?php
/* Inicio de sesión de un usuario de negocio (correo o usuario + contraseña). */
require __DIR__ . '/conexion.php';
requerir_post();

$d = entrada();
$login = strtolower(texto($d, 'email'));
$contrasena = (string)($d['password'] ?? '');

$pdo = db();
$st = $pdo->prepare('SELECT id_usuario, nombre, contrasena, id_rol, id_negocio FROM usuarios WHERE usuario_login = ?');
$st->execute([$login]);
$usuario = $st->fetch();

$valida = false;
if ($usuario) {
    if (password_get_info($usuario['contrasena'])['algo']) {
        $valida = password_verify($contrasena, $usuario['contrasena']);
    } elseif (hash_equals($usuario['contrasena'], $contrasena)) {
        // Usuarios de ejemplo del .sql con contraseña en texto plano:
        // se acepta una vez y se guarda encriptada.
        $valida = true;
        $pdo->prepare('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?')
            ->execute([password_hash($contrasena, PASSWORD_DEFAULT), $usuario['id_usuario']]);
    }
}
if (!$valida) {
    responder(['error' => 'Correo o contraseña incorrectos, o todavía no creaste tu cuenta.'], 401);
}

session_regenerate_id(true);
$_SESSION = [
    'id_usuario' => (int)$usuario['id_usuario'],
    'id_negocio' => (int)$usuario['id_negocio'],
    'nombre'     => $usuario['nombre'],
    'id_rol'     => (int)$usuario['id_rol'],
];
responder(['ok' => true]);

<?php
/* Registro de un negocio nuevo: crea el negocio y su usuario dueño
   (rol Administrador). No inicia sesión — el usuario entra después. */
require __DIR__ . '/conexion.php';
requerir_post();

$d = entrada();
$nombreNegocio = texto($d, 'businessName');
$nombreDueno   = texto($d, 'ownerName');
$correo        = strtolower(texto($d, 'email'));
$contrasena    = (string)($d['password'] ?? '');
$tipo          = mb_substr(texto($d, 'type'), 0, 100);

if ($nombreNegocio === '' || $nombreDueno === '' || $tipo === '') {
    responder(['error' => 'Completá todos los campos.'], 422);
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(['error' => 'El correo no es válido.'], 422);
}
if (strlen($contrasena) < 4) {
    responder(['error' => 'La contraseña debe tener al menos 4 caracteres.'], 422);
}

$pdo = db();
$existe = $pdo->prepare('SELECT 1 FROM usuarios WHERE usuario_login = ?');
$existe->execute([$correo]);
if ($existe->fetch()) {
    responder(['error' => 'Ya existe una cuenta con ese correo. Iniciá sesión.'], 409);
}

$pdo->beginTransaction();
$pdo->prepare('INSERT INTO negocios (nombre, tipo) VALUES (?, ?)')
    ->execute([$nombreNegocio, $tipo]);
$idNegocio = (int)$pdo->lastInsertId();

$pdo->prepare('INSERT INTO usuarios (nombre, usuario_login, contrasena, id_rol, id_negocio) VALUES (?, ?, ?, ?, ?)')
    ->execute([$nombreDueno, $correo, password_hash($contrasena, PASSWORD_DEFAULT), ROL_ADMINISTRADOR, $idNegocio]);
$pdo->commit();

responder(['ok' => true]);

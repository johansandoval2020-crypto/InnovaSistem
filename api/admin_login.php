<?php
/* Inicio de sesión del administrador general de la plataforma.
   Igual que antes, solo se valida el correo (ADMIN_EMAIL en conexion.php). */
require __DIR__ . '/conexion.php';
requerir_post();

$d = entrada();
if (strtolower(texto($d, 'email')) !== ADMIN_EMAIL) {
    responder(['error' => 'Ese correo no tiene acceso de administrador.'], 403);
}

session_regenerate_id(true);
$_SESSION = ['es_admin' => true];
responder(['ok' => true]);

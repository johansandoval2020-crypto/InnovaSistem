<?php
/* Cierra la sesión (negocio o administrador). */
require __DIR__ . '/conexion.php';

$_SESSION = [];
session_destroy();
responder(['ok' => true]);

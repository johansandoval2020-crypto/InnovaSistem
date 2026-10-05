<?php
/* Registra una venta con uno o varios productos.
   POST {client, items:[{id, qty}], method, status} */
require __DIR__ . '/conexion.php';
require __DIR__ . '/funciones_venta.php';
requerir_post();
$s = requerir_negocio();
$d = entrada();

$idVenta = registrar_venta(db(), $s, (int)($d['client'] ?? 0), is_array($d['items'] ?? null) ? $d['items'] : [],
    texto($d, 'method'), texto($d, 'status'));
responder(['ok' => true, 'saleId' => $idVenta]);

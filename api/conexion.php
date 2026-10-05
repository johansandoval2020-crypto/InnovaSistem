<?php
/* ==========================================================================
   InnovaSistem — conexión a MySQL (XAMPP) y funciones comunes de la API.
   Todos los archivos de /api incluyen este archivo.
   ========================================================================== */

// Datos de conexión. En el hosting van en api/config.php (copiar
// config.example.php); ese archivo no se sube a GitHub. Sin config.php se
// usan los de XAMPP (usuario root sin contraseña).
$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
define('DB_HOST', $config['host'] ?? '127.0.0.1');
define('DB_NAME', $config['name'] ?? 'sistema_multinegocios');
define('DB_USER', $config['user'] ?? 'root');
define('DB_PASS', $config['pass'] ?? '');
unset($config);

// Correo del administrador general de la plataforma (ver superadmin.html).
const ADMIN_EMAIL = 'admin24@gmail.com';

// Rol con el que se crea el dueño de un negocio nuevo (tabla roles).
const ROL_ADMINISTRADOR = 1;

date_default_timezone_set('America/El_Salvador');
session_start();
header('Content-Type: application/json; charset=utf-8');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            responder(['error' => 'No se pudo conectar a la base de datos. ¿Está encendido MySQL en XAMPP?'], 500);
        }
    }
    return $pdo;
}

function responder(array $datos, int $codigo = 200): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Cuerpo JSON de la petición (fetch con JSON.stringify).
function entrada(): array {
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}

function texto(array $datos, string $clave): string {
    return trim((string)($datos[$clave] ?? ''));
}

function requerir_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['error' => 'Método no permitido'], 405);
    }
}

// Negocio con sesión activa; corta con 401 si no hay sesión.
function requerir_negocio(): array {
    if (empty($_SESSION['id_usuario']) || empty($_SESSION['id_negocio'])) {
        responder(['error' => 'Sesión no iniciada'], 401);
    }
    return ['id_usuario' => (int)$_SESSION['id_usuario'], 'id_negocio' => (int)$_SESSION['id_negocio']];
}

// Solo el dueño (rol Administrador) puede editar productos, usuarios y datos del negocio.
function requerir_dueno(): array {
    $s = requerir_negocio();
    if ((int)($_SESSION['id_rol'] ?? 0) !== ROL_ADMINISTRADOR) {
        responder(['error' => 'Solo el administrador del negocio puede hacer esto.'], 403);
    }
    return $s;
}

function requerir_admin(): void {
    if (empty($_SESSION['es_admin'])) {
        responder(['error' => 'Sesión de administrador no iniciada'], 401);
    }
}

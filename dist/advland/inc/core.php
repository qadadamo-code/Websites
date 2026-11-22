<?php
/**
 * Adventure Land — shared PHP core (storage, sessions, helpers).
 * Live data is kept in /storage as JSON (seeded from data/seed.json on first run).
 * /storage and /uploads are never shipped by the deploy, so bookings and admin edits survive updates.
 */
declare(strict_types=1);

const AL_VERSION = '1.0.0';
define('AL_ROOT', dirname(__DIR__));
define('AL_STORAGE', AL_ROOT . '/storage');
define('AL_UPLOADS', AL_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Asia/Dubai');
mb_internal_encoding('UTF-8');

function al_boot(): void {
    foreach ([AL_STORAGE, AL_UPLOADS] as $d) if (!is_dir($d)) @mkdir($d, 0755, true);
    if (!is_file(AL_STORAGE . '/.htaccess')) @file_put_contents(AL_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file(AL_UPLOADS . '/.htaccess')) @file_put_contents(AL_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!is_file(AL_STORAGE . '/content.json')) {
        $seed = json_decode((string)file_get_contents(AL_ROOT . '/data/seed.json'), true);
        al_save('content', $seed);
        al_save('bookings', []);
    }
}

function al_load(string $name): array {
    $f = AL_STORAGE . "/$name.json";
    return is_file($f) ? (json_decode((string)file_get_contents($f), true) ?? []) : [];
}

function al_save(string $name, $data): void {
    $f = AL_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $f);
}

/** Read-modify-write one store under an exclusive lock. */
function al_tx(string $name, callable $fn) {
    $lock = fopen(AL_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    $data = al_load($name);
    $out = $fn($data);
    al_save($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $out;
}

function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'); }

/** Simple per-IP rate limit: $max hits per $window seconds for $key. */
function rate_ok(string $key, int $max, int $window): bool {
    $f = AL_STORAGE . '/rl_' . $key . '_' . md5(client_ip()) . '.json';
    $hits = array_values(array_filter(json_decode((string)@file_get_contents($f), true) ?: [], fn($t) => $t > time() - $window));
    if (count($hits) >= $max) return false;
    $hits[] = time();
    @file_put_contents($f, json_encode($hits));
    return true;
}

function clean_str($v, int $max = 200): string {
    $v = is_string($v) ? $v : '';
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
    return mb_substr($v, 0, $max);
}

/** Normalise a phone to digits only (keeps a leading +). */
function clean_phone($v): string {
    $v = clean_str($v, 30);
    $plus = str_starts_with($v, '+');
    $d = preg_replace('/\D+/', '', strtr($v, ['٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9']));
    return ($plus ? '+' : '') . $d;
}

function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('al_sess');
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']), 'path' => '/']);
        session_start();
    }
}

function csrf(): string {
    start_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}
function csrf_ok(): bool {
    start_session();
    return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']);
}

al_boot();

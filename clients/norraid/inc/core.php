<?php
/**
 * NORRAID AFRICA — shared core: storage, security headers, paths, helpers.
 * PHP 8.1+, no database. Live data is JSON in /storage (created on first run from data/seed.json).
 * Deploys never overwrite storage/ or uploads/, so dashboard edits survive updates.
 * Every path is relative to this site's root, so it runs in a sub-folder or on its own domain.
 */
declare(strict_types=1);

const NR_VERSION = '1.0.0';
define('NR_ROOT', dirname(__DIR__));
define('NR_STORAGE', NR_ROOT . '/storage');
define('NR_UPLOADS', NR_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Europe/Stockholm');
mb_internal_encoding('UTF-8');

/* ---------- security headers (every PHP response) ---------- */
function nr_security_headers(bool $admin = false): void {
    if (headers_sent()) return;
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
    header('Cross-Origin-Opener-Policy: same-origin');
    header('X-Frame-Options: ' . ($admin ? 'DENY' : 'SAMEORIGIN'));
    $img = "'self' data: https://upload.wikimedia.org https://thumb.wikimedia.org";
    header("Content-Security-Policy: default-src 'self'; img-src $img; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self' https://www.paypal.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'");
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') header('Strict-Transport-Security: max-age=31536000');
}

/* ---------- storage ---------- */
function nr_boot(): void {
    foreach ([NR_STORAGE, NR_UPLOADS, NR_UPLOADS . '/media', NR_UPLOADS . '/docs', NR_STORAGE . '/backups'] as $d) {
        if (!is_dir($d)) @mkdir($d, 0755, true);
    }
    if (!is_file(NR_STORAGE . '/.htaccess')) @file_put_contents(NR_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file(NR_UPLOADS . '/.htaccess')) @file_put_contents(NR_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|htaccess|svg|html?)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!is_file(NR_STORAGE . '/settings.json')) {
        $seed = json_decode((string)file_get_contents(NR_ROOT . '/data/seed.json'), true) ?: [];
        foreach ($seed as $k => $v) nr_write($k, $v);
        foreach (['subscribers', 'messages', 'donations', 'audit', 'i18n_overrides', 'ratelimit'] as $k) if (!is_file(NR_STORAGE . "/$k.json")) nr_write($k, []);
    }
    nr_migrate();
    if (!is_file(NR_STORAGE . '/users.json') && is_file(NR_ROOT . '/data/admin.seed.json')) {
        @copy(NR_ROOT . '/data/admin.seed.json', NR_STORAGE . '/users.json');
    }
    nr_backup_auto();
}

/** One-time additions to live data. data/migrations/*.json: {"id":"...", "<collection>":[rows]} — only rows whose id is missing are added. */
function nr_migrate(): void {
    $done = nr_load('migrations');
    foreach (glob(NR_ROOT . '/data/migrations/*.json') ?: [] as $f) {
        $m = json_decode((string)file_get_contents($f), true);
        if (!is_array($m) || empty($m['id']) || in_array($m['id'], $done, true)) continue;
        foreach ($m as $k => $rows) {
            if ($k === 'id' || !is_array($rows)) continue;
            $cur = nr_load($k);
            $ids = array_column($cur, 'id');
            foreach ($rows as $row) if (!in_array($row['id'] ?? null, $ids, true)) $cur[] = $row;
            nr_write($k, $cur);
        }
        $done[] = $m['id'];
        nr_write('migrations', $done);
    }
}

function nr_load(string $name): array {
    static $cache = [];
    $f = NR_STORAGE . "/$name.json";
    $mt = is_file($f) ? filemtime($f) . ':' . filesize($f) : '';
    if (isset($cache[$name]) && $cache[$name][0] === $mt) return $cache[$name][1];
    $data = $mt ? json_decode((string)file_get_contents($f), true) : null;
    $data = is_array($data) ? $data : [];
    $cache[$name] = [$mt, $data];
    return $data;
}

function nr_write(string $name, $data): void {
    if (!preg_match('/^[a-z0-9_]+$/', $name)) throw new RuntimeException('bad store');
    $f = NR_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($tmp, $f);
    clearstatcache(true, $f);
}

/** Read-modify-write one file under an exclusive lock. */
function nr_tx(string $name, callable $fn) {
    $lock = fopen(NR_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    clearstatcache(true, NR_STORAGE . "/$name.json");
    $f = NR_STORAGE . "/$name.json";
    $data = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    $result = $fn($data);
    nr_write($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
}

/* ---------- automatic backups (every 6 hours, on the first request after that) ---------- */
function nr_backup_make(string $type = 'auto'): ?string {
    $files = [];
    foreach (glob(NR_STORAGE . '/*.json') ?: [] as $f) {
        $k = basename($f, '.json');
        if ($k === 'ratelimit') continue;
        $files[$k] = json_decode((string)file_get_contents($f), true);
    }
    $json = json_encode(['site' => 'norraid', 'version' => NR_VERSION, 'created' => date('c'), 'type' => $type, 'files' => $files], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $gz = function_exists('gzencode');
    $name = 'bk-' . date('Ymd-His') . "-$type-" . bin2hex(random_bytes(3)) . '.json' . ($gz ? '.gz' : '');
    if (@file_put_contents(NR_STORAGE . '/backups/' . $name, $gz ? gzencode($json, 6) : $json, LOCK_EX) === false) return null;
    $all = glob(NR_STORAGE . "/backups/bk-*-$type-*") ?: [];
    rsort($all);
    foreach (array_slice($all, $type === 'auto' ? 40 : 20) as $old) @unlink($old);
    return $name;
}
function nr_backup_auto(): void {
    $stamp = NR_STORAGE . '/backups/.last';
    if (is_file($stamp) && time() - (int)@filemtime($stamp) < 6 * 3600) return;
    @touch($stamp);
    nr_backup_make('auto');
}

/* ---------- paths & urls ---------- */
/** Web path of the site root, e.g. "/norraid/" or "/". Works for index.php, admin/*.php and api/*.php. */
function nr_base(): string {
    static $b = null;
    if ($b !== null) return $b;
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
    $dir = rtrim(dirname($script), '/');
    if (preg_match('~/(admin|api)$~', $dir)) $dir = dirname($dir);
    return $b = rtrim($dir, '/') . '/';
}
function nr_origin(): string {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $host = preg_replace('/[^a-z0-9.\-:]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
    return ($https ? 'https' : 'http') . '://' . $host;
}
function asset(string $p): string {
    $f = NR_ROOT . '/' . ltrim($p, '/');
    return nr_base() . ltrim($p, '/') . (is_file($f) ? '?v=' . substr(md5((string)filemtime($f)), 0, 8) : '');
}

/* ---------- helpers ---------- */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function now_iso(): string { return date('c'); }
function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'); }
function ip_hash(): string { return substr(hash('sha256', client_ip() . '|' . date('Y-m')), 0, 16); }

/** Simple fixed-window rate limit per IP hash. */
function rate_limited(string $key, int $max, int $window): bool {
    $id = $key . ':' . ip_hash();
    return nr_tx('ratelimit', function (&$rl) use ($id, $max, $window) {
        $now = time();
        foreach ($rl as $k => $v) if (($v['t'] ?? 0) < $now - 86400) unset($rl[$k]);
        $r = $rl[$id] ?? ['t' => $now, 'n' => 0];
        if ($now - $r['t'] > $window) $r = ['t' => $now, 'n' => 0];
        $r['n']++;
        $rl[$id] = $r;
        return $r['n'] > $max;
    });
}

function json_out(array $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function str_clean($s, int $max = 500): string {
    $s = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$s) ?? '');
    return mb_substr($s, 0, $max);
}

function uid(string $prefix = ''): string { return $prefix . bin2hex(random_bytes(6)); }

/** Public-site CSRF: double-submit token in a cookie + form field (no session needed). */
function form_token(): string {
    $t = $_COOKIE['nr_ft'] ?? '';
    if (!preg_match('/^[a-f0-9]{32}$/', $t)) {
        $t = bin2hex(random_bytes(16));
        if (!headers_sent()) setcookie('nr_ft', $t, ['expires' => 0, 'path' => nr_base(), 'httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
        $_COOKIE['nr_ft'] = $t;
    }
    return $t;
}
function form_token_ok(): bool {
    $c = $_COOKIE['nr_ft'] ?? '';
    $p = (string)($_POST['_t'] ?? '');
    return $c !== '' && hash_equals($c, $p);
}

nr_boot();

<?php
/**
 * لمّة — shared PHP core.
 * Live menu lives in /storage/menu.json (created from data/menu.json on first run).
 * The deploy never ships /storage or /uploads, so the owner's edits survive updates.
 */
declare(strict_types=1);
define('LM_ROOT', dirname(__DIR__));
define('LM_STORAGE', LM_ROOT . '/storage');
define('LM_UPLOADS', LM_ROOT . '/uploads');
ini_set('display_errors', '0');
date_default_timezone_set('Africa/Cairo');
mb_internal_encoding('UTF-8');

function lm_boot(): void {
    foreach ([LM_STORAGE, LM_UPLOADS] as $d) if (!is_dir($d)) @mkdir($d, 0755, true);
    if (!is_file(LM_STORAGE . '/.htaccess')) @file_put_contents(LM_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file(LM_UPLOADS . '/.htaccess')) @file_put_contents(LM_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|htaccess)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!is_file(LM_STORAGE . '/menu.json')) lm_save('menu', json_decode((string)file_get_contents(LM_ROOT . '/data/menu.json'), true));
    if (!is_file(LM_STORAGE . '/orders.json')) lm_save('orders', []);
}
function lm_load(string $n): array { $f = LM_STORAGE . "/$n.json"; return is_file($f) ? (json_decode((string)file_get_contents($f), true) ?? []) : []; }
function lm_save(string $n, $data): void {
    $f = LM_STORAGE . "/$n.json"; $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $f);
}
function lm_tx(string $n, callable $fn) {
    $lock = fopen(LM_STORAGE . "/$n.lock", 'c'); flock($lock, LOCK_EX);
    $data = lm_load($n); $out = $fn($data); lm_save($n, $data);
    flock($lock, LOCK_UN); fclose($lock); return $out;
}
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit;
}
function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'); }
function rate_ok(string $key, int $max, int $window): bool {
    $f = LM_STORAGE . '/rl_' . $key . '_' . md5(client_ip()) . '.json';
    $hits = array_values(array_filter(json_decode((string)@file_get_contents($f), true) ?: [], fn($t) => $t > time() - $window));
    if (count($hits) >= $max) return false;
    $hits[] = time(); @file_put_contents($f, json_encode($hits)); return true;
}
function clean_str($v, int $max = 200): string {
    $v = is_string($v) || is_numeric($v) ? (string)$v : '';
    return mb_substr(trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? ''), 0, $max);
}
function to_num($v): float { return (float)strtr((string)$v, ['٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9',','=>'']); }
lm_boot();

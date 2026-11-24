<?php
declare(strict_types=1);
require dirname(__DIR__) . '/inc/core.php';
require dirname(__DIR__) . '/inc/i18n.php';
require dirname(__DIR__) . '/inc/data.php';
require dirname(__DIR__) . '/inc/mail.php';
nr_security_headers();
$lang = (string)($_POST['lang'] ?? $_GET['lang'] ?? 'en');
set_locale(locale_valid($lang) ? $lang : 'en');
function wants_json(): bool { return str_contains((string)($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json'); }
/** Reply as JSON (fetch) or redirect back with a status (no-JS forms). */
function reply(bool $ok, string $msg, string $back = ''): never {
    if (wants_json()) json_out(['ok' => $ok, 'message' => $msg], $ok ? 200 : 400);
    $to = $back ?: (string)($_SERVER['HTTP_REFERER'] ?? u(''));
    if (!str_starts_with($to, nr_origin()) && !str_starts_with($to, '/')) $to = u('');
    header('Location: ' . strtok($to, '#') . (str_contains($to, '?') ? '&' : '?') . 'msg=' . ($ok ? 'ok' : 'err') . '#main', true, 303);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') { http_response_code(405); exit; }

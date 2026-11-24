<?php
/** NORRAID AFRICA — public site front controller: /{lang}/{page}/{slug}/ */
declare(strict_types=1);
require __DIR__ . '/inc/core.php';
require __DIR__ . '/inc/i18n.php';
require __DIR__ . '/inc/data.php';
require __DIR__ . '/inc/layout.php';
require __DIR__ . '/inc/media.php';

$uri = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$base = nr_base();
$rel = str_starts_with($uri, $base) ? substr($uri, strlen($base)) : ltrim($uri, '/');
$rel = trim(rawurldecode($rel), '/');
if ($rel === 'index.php') $rel = '';
$parts = $rel === '' ? [] : explode('/', $rel);

// No language in the URL: pick one (saved choice > browser > country > English) and redirect.
if (!$parts || !locale_valid($parts[0])) {
    $l = locale_detect();
    header('Vary: Accept-Language, Cookie');
    header('Cache-Control: private, no-store');
    $rest = $parts ? implode('/', array_map('rawurlencode', $parts)) . '/' : '';
    header('Location: ' . $base . $l . '/' . $rest, true, 302);
    exit;
}
set_locale($parts[0]);
locale_remember(L());
$page = $parts[1] ?? '';
$slug = $parts[2] ?? '';
if (!preg_match('/^[a-z0-9\-]*$/', $page) || !preg_match('/^[a-z0-9\-]*$/', $slug) || count($parts) > 3) $page = '404';

$routes = [
    '' => 'home', 'mission' => 'mission', 'countries' => 'countries', 'sudan' => 'country', 'drc' => 'country', 'south-sudan' => 'country',
    'stories' => 'stories', 'impact' => 'impact', 'donate' => 'donate', 'thank-you' => 'return',
    'about' => 'about', 'contact' => 'contact', 'faq' => 'faq', 'sources' => 'sources',
    'privacy' => 'legal', 'cookies' => 'legal', 'terms' => 'legal', 'donation-policy' => 'legal', 'accessibility' => 'legal',
    'newsletter' => 'newsletter',
];
if ($page === 'transparency') { header('Location: ' . u('impact'), true, 301); exit; }
$file = $routes[$page] ?? '404';
if ($slug !== '' && !in_array($file, ['stories', 'newsletter'], true)) $file = '404';
if ($file === '404') http_response_code(404);
require __DIR__ . '/pages/' . $file . '.php';
media_autoimport();

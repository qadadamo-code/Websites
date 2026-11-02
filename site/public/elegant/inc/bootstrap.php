<?php
/**
 * Elegance Boutique — shared core: storage, language, money, helpers.
 * Data lives in /storage (JSON files, created on first run from data/seed.json).
 * /storage and /uploads are never shipped by the deploy, so admin edits and orders survive updates.
 */
declare(strict_types=1);

const EB_VERSION = '1.2.0';
define('EB_ROOT', dirname(__DIR__));
define('EB_STORAGE', EB_ROOT . '/storage');
define('EB_UPLOADS', EB_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Africa/Cairo');
mb_internal_encoding('UTF-8');

if (session_status() === PHP_SESSION_NONE) {
    session_name('eb_sess');
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
    session_start();
}

/* ---------- storage ---------- */
function eb_boot_storage(): void {
    foreach ([EB_STORAGE, EB_STORAGE . '/receipts', EB_UPLOADS, EB_UPLOADS . '/products'] as $d) {
        if (!is_dir($d)) @mkdir($d, 0755, true);
    }
    if (!file_exists(EB_STORAGE . '/.htaccess')) @file_put_contents(EB_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!file_exists(EB_UPLOADS . '/.htaccess')) @file_put_contents(EB_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!file_exists(EB_STORAGE . '/products.json')) {
        $seed = json_decode((string)file_get_contents(EB_ROOT . '/data/seed.json'), true);
        foreach (['settings', 'shipping', 'categories', 'coupons', 'products'] as $k) eb_save($k, $seed[$k]);
        eb_save('orders', []);
    }
}

function eb_load(string $name) {
    static $cache = [];
    if (array_key_exists($name, $cache)) return $cache[$name];
    $f = EB_STORAGE . "/$name.json";
    $data = is_file($f) ? json_decode((string)file_get_contents($f), true) : null;
    return $cache[$name] = ($data ?? []);
}

function eb_save(string $name, $data): void {
    $f = EB_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $f);
}

/** Run a read-modify-write on one file under an exclusive lock (orders, stock). */
function eb_transaction(string $name, callable $fn) {
    $lock = fopen(EB_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    $f = EB_STORAGE . "/$name.json";
    $data = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?? []) : [];
    $result = $fn($data);
    eb_save($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
}

eb_boot_storage();

/* ---------- language ---------- */
if (isset($_GET['lang']) && in_array($_GET['lang'], ['ar', 'en'], true)) {
    setcookie('eb_lang', $_GET['lang'], ['expires' => time() + 31536000, 'path' => '/', 'samesite' => 'Lax']);
    $_COOKIE['eb_lang'] = $_GET['lang'];
}
define('LANG', ($_COOKIE['eb_lang'] ?? 'ar') === 'en' ? 'en' : 'ar');
define('DIR', LANG === 'ar' ? 'rtl' : 'ltr');

$EB_STR = require __DIR__ . '/strings.php';
function t(string $key): string {
    global $EB_STR;
    return $EB_STR[$key][LANG === 'ar' ? 0 : 1] ?? $key;
}
/** Pick the _ar / _en field of a record. */
function L(array $row, string $field): string {
    return (string)($row[$field . '_' . LANG] ?? $row[$field . '_ar'] ?? $row[LANG] ?? $row['ar'] ?? '');
}
function lang_url(string $to): string {
    $q = $_GET; $q['lang'] = $to;
    return strtok($_SERVER['REQUEST_URI'] ?? '', '?') . '?' . http_build_query($q);
}

/* ---------- helpers ---------- */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function setting(string $k, $default = '') { $s = eb_load('settings'); return $s[$k] ?? $default; }
function money($n): string {
    $n = (float)$n;
    $txt = number_format($n, fmod($n, 1.0) ? 2 : 0);
    return LANG === 'ar' ? $txt . ' ' . setting('currency_ar', 'ج.م') : setting('currency_en', 'EGP') . ' ' . $txt;
}
function asset(string $p): string { return $p . (strpos($p, '?') === false ? '?v=' . EB_VERSION : ''); }

function products(bool $onlyVisible = true): array {
    $all = eb_load('products');
    return array_values(array_filter($all, fn($p) => !$onlyVisible || empty($p['hidden'])));
}
function product(string $id): ?array {
    foreach (eb_load('products') as $p) if ($p['id'] === $id) return $p;
    return null;
}
function categories(): array {
    $c = eb_load('categories');
    usort($c, fn($a, $b) => ($a['sort'] ?? 0) <=> ($b['sort'] ?? 0));
    return $c;
}
function category(string $id): ?array {
    foreach (categories() as $c) if ($c['id'] === $id) return $c;
    return null;
}
function category_count(string $id): int {
    return count(array_filter(products(), fn($p) => $p['category'] === $id));
}
function in_stock(array $p): bool { return (int)($p['stock'] ?? 0) > 0; }

function wa_link(string $text = ''): string {
    $n = preg_replace('/\D/', '', (string)setting('whatsapp'));
    if ($n === '') return '';
    if (strpos($n, '0') === 0) $n = '2' . $n;
    return 'https://wa.me/' . $n . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}

function csrf(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}
function csrf_ok(): bool { return hash_equals($_SESSION['csrf'] ?? '', (string)($_POST['csrf'] ?? $_SERVER['HTTP_X_CSRF'] ?? '')); }

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function status_label(string $s): string {
    $map = [
        'new' => ['جديد', 'New'], 'confirmed' => ['تم التأكيد', 'Confirmed'], 'preparing' => ['جاري التجهيز', 'Preparing'],
        'shipped' => ['تم الشحن', 'Shipped'], 'delivered' => ['تم التسليم', 'Delivered'], 'cancelled' => ['ملغي', 'Cancelled'],
    ];
    return $map[$s][LANG === 'ar' ? 0 : 1] ?? $s;
}
function payment_label(string $m): string {
    $map = ['cod' => ['الدفع عند الاستلام', 'Cash on delivery'], 'instapay' => ['إنستاباي', 'InstaPay'], 'vodafone' => ['فودافون كاش', 'Vodafone Cash']];
    return $map[$m][LANG === 'ar' ? 0 : 1] ?? $m;
}

/**
 * Signature colour of a product photo (average of a tiny thumbnail), cached in storage/tones.json.
 * Drives the colour-drenched cards, showcase and product page.
 */
function image_tone(string $rel): string {
    static $cache = null, $dirty = false;
    $file = EB_STORAGE . '/tones.json';
    if ($cache === null) {
        $cache = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
        register_shutdown_function(function () use (&$cache, &$dirty, $file) { if ($dirty) @file_put_contents($file, json_encode($cache)); });
    }
    if (isset($cache[$rel])) return $cache[$rel];
    $tone = '#E9DFD2';
    $path = EB_ROOT . '/' . ltrim($rel, '/');
    if (is_file($path) && function_exists('imagecreatefromstring')) {
        $im = @imagecreatefromstring((string)file_get_contents($path));
        if ($im) {
            $sm = imagescale($im, 12, 16);
            $r = $g = $b = 0; $n = 0;
            for ($x = 0; $x < 12; $x++) for ($y = 0; $y < 16; $y++) {
                $c = imagecolorat($sm, $x, $y);
                $r += ($c >> 16) & 255; $g += ($c >> 8) & 255; $b += $c & 255; $n++;
            }
            imagedestroy($im); imagedestroy($sm);
            $tone = tone_tune($r / $n, $g / $n, $b / $n);
        }
    }
    $cache[$rel] = $tone; $dirty = true;
    return $tone;
}
/** Push the average colour toward a richer, fashion-shoot backdrop: more saturation, mid lightness. */
function tone_tune(float $r, float $g, float $b): string {
    $r /= 255; $g /= 255; $b /= 255;
    $max = max($r, $g, $b); $min = min($r, $g, $b); $l = ($max + $min) / 2; $d = $max - $min;
    $h = 0; $s = 0;
    if ($d > 0) {
        $s = $l > .5 ? $d / (2 - $max - $min) : $d / ($max + $min);
        if ($max === $r) $h = fmod(($g - $b) / $d + 6, 6); elseif ($max === $g) $h = ($b - $r) / $d + 2; else $h = ($r - $g) / $d + 4;
        $h /= 6;
    }
    $s = min(.62, $s * 1.55 + .06); $l = max(.42, min(.74, $l));
    $q = $l < .5 ? $l * (1 + $s) : $l + $s - $l * $s; $p = 2 * $l - $q;
    $f = function ($t) use ($p, $q) { if ($t < 0) $t += 1; if ($t > 1) $t -= 1;
        if ($t < 1 / 6) return $p + ($q - $p) * 6 * $t; if ($t < .5) return $q; if ($t < 2 / 3) return $p + ($q - $p) * (2 / 3 - $t) * 6; return $p; };
    return sprintf('#%02X%02X%02X', round($f($h + 1 / 3) * 255), round($f($h) * 255), round($f($h - 1 / 3) * 255));
}
/** Text colour that reads on top of a tone. */
function tone_ink(string $hex): string {
    [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');
    return (0.299 * $r + 0.587 * $g + 0.114 * $b) > 150 ? '#2B2118' : '#FFFFFF';
}
function tone_style(array $p): string {
    $t = image_tone($p['images'][0] ?? '');
    return '--tone:' . $t . ';--tone-ink:' . tone_ink($t);
}

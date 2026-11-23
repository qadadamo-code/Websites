<?php
/**
 * Ateljé Dantel — shared core: storage, settings, language, catalogue, pricing, helpers.
 * Live data is JSON in /storage, created on the first run from data/seed.json.
 * The deploy never overwrites storage/*.json, so everything edited in the dashboard survives updates.
 * Works in any folder or on any domain: every path is relative to this site's root.
 */
declare(strict_types=1);

const AD_VERSION = '1.0.0';
define('AD_ROOT', dirname(__DIR__));
define('AD_STORAGE', AD_ROOT . '/storage');
define('AD_UPLOADS', AD_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Europe/Stockholm');
mb_internal_encoding('UTF-8');

if (!headers_sent()) {
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    header('X-Frame-Options: SAMEORIGIN');
    header("Content-Security-Policy: object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') header('Strict-Transport-Security: max-age=31536000');
}

/* ---------- storage ---------- */
const AD_FILES_SEED = ['settings', 'content', 'categories', 'products', 'coupons'];
const AD_FILES_EMPTY = ['orders', 'bookings', 'subscribers', 'customers', 'messages'];

function ad_boot(): void {
    foreach ([AD_STORAGE, AD_UPLOADS, AD_UPLOADS . '/products', AD_UPLOADS . '/site'] as $d) if (!is_dir($d)) @mkdir($d, 0755, true);
    if (!is_file(AD_STORAGE . '/.htaccess')) @file_put_contents(AD_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file(AD_UPLOADS . '/.htaccess')) @file_put_contents(AD_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|htaccess|svg|html?)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!is_file(AD_STORAGE . '/products.json')) {
        $seed = json_decode((string)file_get_contents(AD_ROOT . '/data/seed.json'), true);
        foreach (AD_FILES_SEED as $k) ad_write($k, $seed[$k] ?? []);
        foreach (AD_FILES_EMPTY as $k) if (!is_file(AD_STORAGE . "/$k.json")) ad_write($k, []);
    }
    ad_migrate();
    ad_backup_auto();
}

/** One-time additions to live data. Each migration runs once and never removes client edits. */
function ad_migrate(): void {
    $f = AD_ROOT . '/data/migrations.json';
    if (!is_file($f)) return;
    $all = json_decode((string)file_get_contents($f), true);
    if (!is_array($all)) return;
    $done = ad_load('migrations');
    foreach ($all as $m) {
        if (!is_array($m) || empty($m['id']) || in_array($m['id'], $done, true)) continue;
        foreach (['categories', 'products', 'coupons'] as $k) {
            if (empty($m[$k])) continue;
            $cur = ad_load($k); $ids = array_column($cur, 'id');
            foreach ($m[$k] as $row) if (!in_array($row['id'], $ids, true)) $cur[] = $row;
            ad_write($k, $cur);
        }
        foreach (['settings', 'content'] as $k) {
            if (empty($m[$k])) continue;
            $st = ad_load($k);
            foreach ($m[$k] as $kk => $v) if (!array_key_exists($kk, $st)) $st[$kk] = $v;
            ad_write($k, $st);
        }
        $done[] = $m['id'];
        ad_write('migrations', $done);
    }
}

function ad_load(string $name): array {
    static $cache = [];
    $f = AD_STORAGE . "/$name.json";
    $mt = is_file($f) ? filemtime($f) . ':' . filesize($f) : '';
    if (isset($cache[$name]) && $cache[$name][0] === $mt && $mt !== '') return $cache[$name][1];
    $data = $mt !== '' ? json_decode((string)file_get_contents($f), true) : null;
    $data = is_array($data) ? $data : [];
    $cache[$name] = [$mt, $data];
    return $data;
}
function ad_write(string $name, $data): void {
    $f = AD_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($tmp, $f);
    clearstatcache(true, $f);
}
/** Save a whole file. The dashboard hooks ad_on_change() to keep an undo record of every edit. */
function ad_save(string $name, $data): void {
    $hook = function_exists('ad_on_change');
    $old = $hook ? ad_load($name) : null;
    ad_write($name, $data);
    if ($hook) ad_on_change($name, $old, $data);
}
/** Read-modify-write one file under an exclusive lock. */
function ad_tx(string $name, callable $fn) {
    $lock = fopen(AD_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    clearstatcache(true, AD_STORAGE . "/$name.json");
    $data = ad_load($name);
    $old = $data;
    $result = $fn($data);
    if ($data !== $old) ad_write($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    if ($data !== $old && function_exists('ad_on_change')) ad_on_change($name, $old, $data);
    return $result;
}

/* ---------- automatic backups: every 3 hours, on the first visit after that ---------- */
const AD_BACKUP_EVERY = 3 * 3600;
const AD_BACKUP_KEEP = ['auto' => 56, 'manual' => 30, 'pre' => 15];
function ad_backup_dir(): string { $d = AD_STORAGE . '/backups'; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function ad_backup_list(): array {
    $out = [];
    foreach (glob(ad_backup_dir() . '/bk-*.json*') ?: [] as $f) {
        if (!preg_match('~bk-(\d{8}-\d{6})-(auto|manual|pre)-[0-9a-f]+\.json(\.gz)?$~', $f, $m)) continue;
        $out[] = ['file' => basename($f), 'at' => DateTime::createFromFormat('Ymd-His', $m[1])->format('c'), 'type' => $m[2], 'size' => filesize($f)];
    }
    usort($out, fn($a, $b) => strcmp($b['file'], $a['file']));
    return $out;
}
function ad_backup_make(string $type = 'auto', string $by = ''): ?string {
    $files = [];
    foreach (glob(AD_STORAGE . '/*.json') ?: [] as $f) {
        $k = basename($f, '.json');
        if ($k === 'ratelimit') continue;
        $files[$k] = json_decode((string)file_get_contents($f), true);
    }
    $json = json_encode(['site' => 'ateljedantel', 'version' => AD_VERSION, 'created' => date('c'), 'type' => $type, 'by' => $by, 'files' => $files], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $gz = function_exists('gzencode');
    $name = 'bk-' . date('Ymd-His') . "-$type-" . bin2hex(random_bytes(3)) . '.json' . ($gz ? '.gz' : '');
    if (@file_put_contents(ad_backup_dir() . '/' . $name, $gz ? gzencode($json, 6) : $json, LOCK_EX) === false) return null;
    $same = array_values(array_filter(ad_backup_list(), fn($b) => $b['type'] === $type));
    foreach (array_slice($same, AD_BACKUP_KEEP[$type] ?? 30) as $old) @unlink(ad_backup_dir() . '/' . $old['file']);
    return $name;
}
function ad_backup_read(string $path): ?array {
    $raw = (string)@file_get_contents($path);
    if (substr($raw, 0, 2) === "\x1f\x8b") $raw = (string)@gzdecode($raw);
    $d = json_decode($raw, true);
    return (is_array($d) && ($d['site'] ?? '') === 'ateljedantel' && is_array($d['files'] ?? null)) ? $d : null;
}
function ad_backup_auto(): void {
    $stamp = AD_STORAGE . '/backups/.last';
    if (is_file($stamp) && time() - (int)@filemtime($stamp) < AD_BACKUP_EVERY) return;
    ad_backup_dir();
    $fp = @fopen(AD_STORAGE . '/backup.lock', 'c');
    if (!$fp || !flock($fp, LOCK_EX | LOCK_NB)) return;
    if (!is_file($stamp) || time() - (int)@filemtime($stamp) >= AD_BACKUP_EVERY) { @touch($stamp); ad_backup_make('auto'); }
    flock($fp, LOCK_UN); fclose($fp);
}

ad_boot();

/* ---------- helpers ---------- */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function ad_id(string $prefix = ''): string { return $prefix . bin2hex(random_bytes(4)); }
function now_iso(): string { return date('c'); }
function today(): string { return date('Y-m-d'); }
function settings(): array { return ad_load('settings'); }
function content(): array { return ad_load('content'); }
function sort_by_order(array $a): array { usort($a, fn($x, $y) => ((int)($x['order'] ?? 0)) <=> ((int)($y['order'] ?? 0))); return $a; }
function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function clean(string $s, int $max = 300): string { return mb_substr(trim(strip_tags($s)), 0, $max); }
/** Swedish money format: 3 499 kr */
function kr($n): string { $n = (float)$n; return number_format($n, fmod($n, 1.0) ? 2 : 0, ',', "\u{00A0}") . "\u{00A0}kr"; }
function in_window(?string $from, ?string $to): bool { $t = today(); if ($from && $t < $from) return false; if ($to && $t > $to) return false; return true; }

/* ---------- language: Swedish first, English second ---------- */
function lang(): string {
    static $l = null;
    if ($l !== null) return $l;
    $q = $_GET['lang'] ?? '';
    if ($q === 'sv' || $q === 'en') {
        $l = $q;
        if (!headers_sent()) setcookie('ad_lang', $l, ['expires' => time() + 31536000, 'path' => '/', 'samesite' => 'Lax']);
    } else {
        $l = ($_COOKIE['ad_lang'] ?? 'sv') === 'en' ? 'en' : 'sv';
    }
    return $l;
}
/** Pick the current language from a {sv, en} pair, falling back to Swedish. */
function tr($v): string {
    if (!is_array($v)) return (string)$v;
    $l = lang();
    return (string)(($v[$l] ?? '') !== '' ? $v[$l] : ($v['sv'] ?? ''));
}
function t(string $key): string {
    static $dict = null;
    if ($dict === null) $dict = require __DIR__ . '/i18n.php';
    $r = $dict[$key] ?? null;
    if ($r === null) return $key;
    return lang() === 'en' ? $r[1] : $r[0];
}

/* ---------- catalogue ---------- */
function categories(bool $activeOnly = true): array {
    $c = sort_by_order(ad_load('categories'));
    return $activeOnly ? array_values(array_filter($c, fn($x) => !empty($x['active']))) : $c;
}
function category(string $id): ?array { foreach (ad_load('categories') as $c) if ($c['id'] === $id || ($c['slug'] ?? '') === $id) return $c; return null; }
function products(bool $activeOnly = true): array {
    $p = ad_load('products');
    if ($activeOnly) {
        $cats = array_column(categories(), 'id');
        $p = array_values(array_filter($p, fn($x) => !empty($x['active']) && in_array($x['cat'], $cats, true) && !empty($x['variants'])));
    }
    return $p;
}
function product_by_slug(string $slug): ?array { foreach (products() as $p) if ($p['slug'] === $slug || $p['id'] === $slug) return $p; return null; }
/** Final price of a variant: [price, compare|null]. Compare is the crossed-out "was" price. */
function variant_price(array $v): array {
    $p = (float)$v['price']; $c = (float)($v['compare'] ?? 0);
    return [$p, $c > $p ? $c : null];
}
function variant_in_stock(array $v): bool { return (int)($v['stock'] ?? 0) > 0 || !empty($v['order']); }
function product_image(array $p, int $i = 0): string {
    foreach ($p['variants'] as $v) if (!empty($v['images'][$i])) return $v['images'][$i];
    return $p['variants'][0]['images'][0] ?? 'assets/img/store.webp';
}
/** Summary used by grids, search and the cart. */
function product_card(array $p): array {
    $prices = []; $compare = null; $colors = []; $sizes = []; $stock = false; $imgs = [];
    foreach ($p['variants'] as $v) {
        [$pr, $cp] = variant_price($v);
        $prices[] = $pr; if ($cp) $compare = max($compare ?? 0, $cp);
        if (!empty($v['hex']) && !isset($colors[$v['hex']])) $colors[$v['hex']] = lang() === 'en' ? ($v['colorEn'] ?: $v['color']) : $v['color'];
        if (($v['size'] ?? '') !== '' && variant_in_stock($v)) $sizes[$v['size']] = 1;
        if (variant_in_stock($v)) $stock = true;
        foreach ($v['images'] ?? [] as $im) $imgs[$im] = 1;
    }
    $imgs = array_keys($imgs);
    $min = $prices ? min($prices) : 0; $max = $prices ? max($prices) : 0;
    return [
        'id' => $p['id'], 'slug' => $p['slug'], 'cat' => $p['cat'], 'brand' => $p['brand'] ?? '',
        'title' => tr($p['title']), 'img' => $imgs[0] ?? '', 'img2' => $imgs[1] ?? '',
        'price' => $min, 'max' => $max, 'compare' => $compare && $compare > $min ? $compare : null,
        'colors' => $colors, 'sizes' => array_keys($sizes), 'stock' => $stock, 'cond' => $p['cond'] ?? 'new',
        'featured' => !empty($p['featured']), 'created' => (int)($p['created'] ?? 0),
        'order' => (bool)array_filter($p['variants'], fn($v) => !empty($v['order'])),
    ];
}
/** Everything the browser needs for the cart, wishlist and instant search. */
function catalog_json(): array {
    $out = [];
    foreach (products() as $p) {
        $c = product_card($p);
        $c['v'] = array_map(function ($v) {
            [$pr, $cp] = variant_price($v);
            return ['id' => $v['id'], 'size' => $v['size'] ?? '', 'color' => lang() === 'en' ? (($v['colorEn'] ?? '') ?: ($v['color'] ?? '')) : ($v['color'] ?? ''),
                'hex' => $v['hex'] ?? '', 'price' => $pr, 'compare' => $cp, 'stock' => (int)($v['stock'] ?? 0), 'order' => !empty($v['order']), 'img' => $v['images'][0] ?? ''];
        }, $p['variants']);
        $c['q'] = mb_strtolower(implode(' ', [tr($p['title']), $p['title']['sv'] ?? '', $p['title']['en'] ?? '', $p['brand'] ?? '', tr(category($p['cat'])['name'] ?? ''), implode(' ', $p['tags'] ?? []),
            implode(' ', array_map(fn($v) => ($v['color'] ?? '') . ' ' . ($v['colorEn'] ?? '') . ' ' . ($v['sku'] ?? ''), $p['variants']))]));
        $out[] = $c;
    }
    return $out;
}
function find_variant(string $vid): ?array {
    foreach (products() as $p) foreach ($p['variants'] as $v) if ($v['id'] === $vid) return [$p, $v];
    return null;
}

/* ---------- coupons ---------- */
function coupon_check(string $code, float $subtotal): array {
    $code = strtoupper(trim($code));
    if ($code === '') return ['ok' => false, 'msg' => t('coupon.empty')];
    foreach (ad_load('coupons') as $c) {
        if (strtoupper($c['code']) !== $code) continue;
        if (empty($c['active'])) return ['ok' => false, 'msg' => t('coupon.inactive')];
        if (!in_window(($c['from'] ?? '') ?: null, ($c['to'] ?? '') ?: null)) return ['ok' => false, 'msg' => t('coupon.expired')];
        if (!empty($c['limit']) && (int)($c['uses'] ?? 0) >= (int)$c['limit']) return ['ok' => false, 'msg' => t('coupon.used')];
        if (!empty($c['min']) && $subtotal < (float)$c['min']) return ['ok' => false, 'msg' => t('coupon.min') . ' ' . kr($c['min'])];
        $d = ($c['type'] ?? 'percent') === 'fixed' ? (float)$c['value'] : round($subtotal * min(100, (float)$c['value']) / 100);
        $d = min($d, $subtotal);
        $label = ($c['type'] ?? 'percent') === 'fixed' ? kr($c['value']) : ((float)$c['value'] . ' %');
        return ['ok' => true, 'code' => $c['code'], 'discount' => $d, 'label' => $label, 'msg' => t('coupon.ok') . ' ' . $label];
    }
    return ['ok' => false, 'msg' => t('coupon.bad')];
}

/* ---------- shipping ---------- */
function shipping_cost(string $method, float $net): float {
    $s = settings()['shipping'] ?? [];
    if ($method !== 'post') return 0;
    $fee = (float)($s['postnord'] ?? 0);
    if (!empty($s['freeOver']) && $net >= (float)$s['freeOver']) $fee = 0;
    return $fee;
}

/** Payment methods switched on in the dashboard. "Pay in store" only applies to collection; card needs a payment link. */
function pay_methods(string $ship = 'pickup'): array {
    $out = [];
    foreach (['swish', 'bank', 'store', 'stripe'] as $k) {
        $p = settings()['pay'][$k] ?? [];
        if (empty($p['on'])) continue;
        if ($k === 'store' && $ship === 'post') continue;
        if ($k === 'stripe' && trim((string)($p['link'] ?? '')) === '') continue;
        $out[] = $k;
    }
    return $out;
}

/* ---------- abuse protection for public forms ---------- */
function rate_ok(string $bucket, int $max = 8, int $window = 600): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = substr(hash('sha256', $ip . $bucket), 0, 16);
    return ad_tx('ratelimit', function (&$d) use ($key, $max, $window) {
        $now = time();
        foreach ($d as $k => $hits) { $d[$k] = array_values(array_filter($hits, fn($t) => $t > $now - $window)); if (!$d[$k]) unset($d[$k]); }
        $hits = $d[$key] ?? [];
        if (count($hits) >= $max) return false;
        $hits[] = $now; $d[$key] = $hits;
        return true;
    });
}
function read_json_body(): array {
    $raw = (string)file_get_contents('php://input');
    if (strlen($raw) > 30000) json_out(['ok' => false, 'msg' => 'Too large'], 413);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : $_POST;
}
/** Public POST endpoints only accept requests sent from this site. */
function same_origin(): bool {
    $o = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
    if ($o === '') return true;
    $h = parse_url($o, PHP_URL_HOST);
    return $h && strcasecmp($h, (string)($_SERVER['HTTP_HOST'] ?? '')) === 0 || $h && strcasecmp($h, preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? ''))) === 0;
}
function valid_email(string $s): bool { return (bool)filter_var($s, FILTER_VALIDATE_EMAIL); }

/** Plain-text e-mail, sent from the shop's address. Failures never break the page. */
function ad_mail(string $to, string $subject, string $body, string $replyTo = ''): bool {
    if (!valid_email($to)) return false;
    $from = settings()['email'] ?? 'info@ateljedantel.se';
    $host = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $headers = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n"
        . 'From: =?UTF-8?B?' . base64_encode(settings()['brand'] ?? 'Ateljé Dantel') . "?= <no-reply@$host>\r\n"
        . 'Reply-To: ' . (valid_email($replyTo) ? $replyTo : $from) . "\r\n";
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}

/* ---------- customers: one record per e-mail, updated from orders, bookings and the newsletter ---------- */
function customer_touch(string $email, array $data, string $source): void {
    $email = strtolower(trim($email));
    if (!valid_email($email)) return;
    ad_tx('customers', function (&$d) use ($email, $data, $source) {
        foreach ($d as &$c) if ($c['email'] === $email) {
            foreach (['name', 'phone', 'address', 'zip', 'city'] as $k) if (!empty($data[$k])) $c[$k] = $data[$k];
            $c['sources'] = array_values(array_unique(array_merge($c['sources'] ?? [], [$source])));
            $c['last'] = now_iso();
            return;
        }
        unset($c);
        $d[] = ['id' => ad_id('k'), 'email' => $email, 'name' => $data['name'] ?? '', 'phone' => $data['phone'] ?? '', 'address' => $data['address'] ?? '', 'zip' => $data['zip'] ?? '', 'city' => $data['city'] ?? '',
            'sources' => [$source], 'note' => '', 'tags' => [], 'created' => now_iso(), 'last' => now_iso()];
    });
}

/* ---------- fitting appointments ---------- */
function booking_cfg(): array { return settings()['booking'] ?? []; }
/** Free start times for a date and appointment type. */
function booking_slots(string $date, string $type): array {
    $b = booking_cfg();
    if (empty($b['enabled']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) return [];
    $ts = strtotime($date . ' 00:00');
    if ($ts === false || $ts < strtotime('today') || $ts > strtotime('+' . (int)($b['maxDays'] ?? 90) . ' days')) return [];
    if (in_array($date, (array)($b['blocked'] ?? []), true)) return [];
    $dow = (string)date('N', $ts);
    $win = $b['days'][$dow] ?? null;
    if (!$win || count($win) < 2) return [];
    $len = 60; foreach ((array)($b['types'] ?? []) as $ty) if ($ty['id'] === $type) $len = (int)$ty['min'];
    $step = max(15, (int)($b['slot'] ?? 60)); if ($len < $step) $step = max(15, min($step, 30));
    $open = strtotime("$date {$win[0]}"); $close = strtotime("$date {$win[1]}");
    $busy = [];
    foreach (ad_load('bookings') as $bk) {
        if (($bk['date'] ?? '') !== $date || in_array($bk['status'] ?? '', ['cancelled', 'noshow'], true)) continue;
        $s = strtotime("$date {$bk['time']}"); $busy[] = [$s, $s + 60 * (int)($bk['min'] ?? 60)];
    }
    $lead = time() + 3600 * (int)($b['leadHours'] ?? 12);
    $per = max(1, (int)($b['perSlot'] ?? 1));
    $out = [];
    for ($t = $open; $t + $len * 60 <= $close; $t += $step * 60) {
        if ($t < $lead) continue;
        $n = 0; foreach ($busy as [$s, $e2]) if ($t < $e2 && $t + $len * 60 > $s) $n++;
        if ($n < $per) $out[] = date('H:i', $t);
    }
    return $out;
}

/* ---------- inline brand logo (colours follow the theme, the ribbon stays red) ---------- */
function logo_svg(string $class = 'logo', bool $tagline = true): string {
    static $svg = null;
    if ($svg === null) $svg = (string)file_get_contents(AD_ROOT . '/assets/brand/logo.svg');
    $s = preg_replace('/<\?xml.*?\?>/', '', $svg);
    $s = str_replace('fill="#141012"', 'fill="currentColor"', $s);
    if (!$tagline) { $s = preg_replace('~<path id="tg".*?/>~s', '', $s); $s = str_replace('viewBox="80 410 1860 680"', 'viewBox="80 410 1860 560"', $s); }
    return str_replace('<svg ', '<svg class="' . e($class) . '" role="img" aria-label="Ateljé Dantel" ', $s);
}

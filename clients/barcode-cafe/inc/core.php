<?php
/**
 * Barcode Cafe — shared core: storage, settings, pricing, helpers.
 * Live data is JSON in /storage (created on first run from data/seed.json).
 * The deploy never overwrites storage/*.json, so dashboard edits survive updates.
 * Works in any folder or domain: every path is relative to this site's root.
 */
declare(strict_types=1);

const BC_VERSION = '3.3.0';
define('BC_ROOT', dirname(__DIR__));
define('BC_STORAGE', BC_ROOT . '/storage');
define('BC_UPLOADS', BC_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Africa/Cairo');
mb_internal_encoding('UTF-8');

/* ---------- security headers (every PHP response) ---------- */
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
function bc_boot(): void {
    foreach ([BC_STORAGE, BC_UPLOADS, BC_UPLOADS . '/items', BC_UPLOADS . '/events', BC_UPLOADS . '/categories'] as $d) {
        if (!is_dir($d)) @mkdir($d, 0755, true);
    }
    if (!is_file(BC_STORAGE . '/.htaccess')) @file_put_contents(BC_STORAGE . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file(BC_UPLOADS . '/.htaccess')) @file_put_contents(BC_UPLOADS . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|htaccess)$\">\nRequire all denied\nDeny from all\n</FilesMatch>\n");
    if (!is_file(BC_STORAGE . '/items.json')) {
        $seed = json_decode((string)file_get_contents(BC_ROOT . '/data/seed.json'), true);
        foreach (['settings', 'categories', 'items', 'moods', 'coupons', 'events'] as $k) bc_save($k, $seed[$k] ?? []);
        foreach (['orders', 'reservations', 'rsvps'] as $k) bc_save($k, []);
    }
    bc_migrate();
    bc_backup_auto();
    if (!is_file(BC_STORAGE . '/admin.json') && is_file(BC_ROOT . '/data/admin.seed.json')) {
        @copy(BC_ROOT . '/data/admin.seed.json', BC_STORAGE . '/admin.json');
    }
}

/* One-time additions to live data (deploys never touch storage/*.json). Each migration runs once,
   only adds categories/items whose id is missing, so client edits and deletions made later are kept. */
function bc_migrate(): void {
    $f = BC_ROOT . '/data/migrations.json';
    if (!is_file($f)) return;
    $m = json_decode((string)file_get_contents($f), true);
    if (!is_array($m) || empty($m['id'])) return;
    $done = bc_load('migrations');
    if (in_array($m['id'], $done, true)) return;
    foreach (['categories', 'items'] as $k) {
        if (empty($m[$k])) continue;
        $cur = bc_load($k);
        $ids = array_column($cur, 'id');
        foreach ($m[$k] as $row) if (!in_array($row['id'], $ids, true)) $cur[] = $row;
        bc_save($k, $cur);
    }
    $done[] = $m['id'];
    bc_save('migrations', $done);
}

function bc_load(string $name): array {
    $f = BC_STORAGE . "/$name.json";
    $data = is_file($f) ? json_decode((string)file_get_contents($f), true) : null;
    return is_array($data) ? $data : [];
}

function bc_write(string $name, $data): void {
    $f = BC_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($tmp, $f);
}
/** Save a whole file. The dashboard hooks bc_on_change() to keep an undo record of every edit. */
function bc_save(string $name, $data): void {
    $hook = function_exists('bc_on_change');
    $old = $hook ? bc_load($name) : null;
    bc_write($name, $data);
    if ($hook) bc_on_change($name, $old, $data);
}

/** Read-modify-write one file under an exclusive lock. */
function bc_tx(string $name, callable $fn) {
    $lock = fopen(BC_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    $data = bc_load($name);
    $old = $data;
    $result = $fn($data);
    bc_write($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    if (function_exists('bc_on_change')) bc_on_change($name, $old, $data);
    return $result;
}

/* ---------- automatic backups: every 3 hours, on the first visit after that (site or dashboard) ---------- */
const BC_BACKUP_EVERY = 3 * 3600;
const BC_BACKUP_KEEP = ['auto' => 56, 'manual' => 30, 'pre' => 15];
function bc_backup_dir(): string { $d = BC_STORAGE . '/backups'; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function bc_backup_list(): array {
    $out = [];
    foreach (glob(bc_backup_dir() . '/bk-*.json*') ?: [] as $f) {
        if (!preg_match('~bk-(\d{8}-\d{6})-(auto|manual|pre)-[0-9a-f]+\.json(\.gz)?$~', $f, $m)) continue;
        $out[] = ['file' => basename($f), 'at' => DateTime::createFromFormat('Ymd-His', $m[1])->format('c'), 'type' => $m[2], 'size' => filesize($f)];
    }
    usort($out, fn($a, $b) => strcmp($b['file'], $a['file']));
    return $out;
}
function bc_backup_make(string $type = 'auto', string $by = ''): ?string {
    $files = [];
    foreach (glob(BC_STORAGE . '/*.json') ?: [] as $f) {
        $k = basename($f, '.json');
        if (in_array($k, ['ratelimit'], true)) continue;
        $files[$k] = json_decode((string)file_get_contents($f), true);
    }
    $json = json_encode(['site' => 'barcode-cafe', 'version' => BC_VERSION, 'created' => date('c'), 'type' => $type, 'by' => $by, 'files' => $files], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $gz = function_exists('gzencode');
    $name = 'bk-' . date('Ymd-His') . "-$type-" . bin2hex(random_bytes(3)) . '.json' . ($gz ? '.gz' : '');
    if (@file_put_contents(bc_backup_dir() . '/' . $name, $gz ? gzencode($json, 6) : $json, LOCK_EX) === false) return null;
    $same = array_values(array_filter(bc_backup_list(), fn($b) => $b['type'] === $type));
    foreach (array_slice($same, BC_BACKUP_KEEP[$type] ?? 30) as $old) @unlink(bc_backup_dir() . '/' . $old['file']);
    return $name;
}
function bc_backup_read(string $path): ?array {
    $raw = (string)@file_get_contents($path);
    if (substr($raw, 0, 2) === "\x1f\x8b") $raw = (string)@gzdecode($raw);
    $d = json_decode($raw, true);
    return (is_array($d) && ($d['site'] ?? '') === 'barcode-cafe' && is_array($d['files'] ?? null)) ? $d : null;
}
function bc_backup_auto(): void {
    $stamp = BC_STORAGE . '/backups/.last';
    if (is_file($stamp) && time() - (int)@filemtime($stamp) < BC_BACKUP_EVERY) return;
    bc_backup_dir();
    $fp = @fopen(BC_STORAGE . '/backup.lock', 'c');
    if (!$fp || !flock($fp, LOCK_EX | LOCK_NB)) return;      // another request is already doing it
    if (!is_file($stamp) || time() - (int)@filemtime($stamp) >= BC_BACKUP_EVERY) { @touch($stamp); bc_backup_make('auto'); }
    flock($fp, LOCK_UN); fclose($fp);
}

bc_boot();

/* ---------- helpers ---------- */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function bc_id(string $prefix = ''): string { return $prefix . bin2hex(random_bytes(4)); }
function now_iso(): string { return date('c'); }
function today(): string { return date('Y-m-d'); }
function settings(): array {
    static $s = null;
    if ($s === null) $s = bc_load('settings');
    return $s;
}
function wa_link(string $text = ''): string {
    $n = preg_replace('/\D+/', '', settings()['whatsapp'] ?? '');
    return 'https://wa.me/' . $n . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}
function sort_by_order(array $a): array { usort($a, fn($x, $y) => ((int)($x['order'] ?? 0)) <=> ((int)($y['order'] ?? 0))); return $a; }
function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function clean(string $s, int $max = 300): string { return mb_substr(trim(strip_tags($s)), 0, $max); }
function digits_en(string $s): string { return strtr($s, ['٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9']); }

/* ---------- pricing ---------- */
function in_window(?string $from, ?string $to): bool {
    $t = today();
    if ($from && $t < $from) return false;
    if ($to && $t > $to) return false;
    return true;
}
/** Returns [finalPrice, originalPrice|null, label|null] for an item, applying an item sale or a category discount. */
function item_price(array $it, ?array $cat): array {
    $p = (float)$it['price'];
    if (!empty($it['sale']) && (float)$it['sale'] > 0 && (float)$it['sale'] < $p && in_window($it['saleFrom'] ?? null, $it['saleTo'] ?? null)) {
        $s = (float)$it['sale'];
        return [$s, $p, '-' . round((1 - $s / $p) * 100) . '%'];
    }
    if ($cat && !empty($cat['discount']) && (float)$cat['discount'] > 0 && in_window($cat['discountFrom'] ?? null, $cat['discountTo'] ?? null)) {
        $d = min(90, (float)$cat['discount']);
        return [round($p * (1 - $d / 100)), $p, '-' . rtrim(rtrim(number_format($d, 1), '0'), '.') . '%'];
    }
    return [$p, null, null];
}

/** Uploaded photo, else the built-in stock photo shipped in assets/menu/<id>.webp. */
function item_image(array $it): string {
    if (!empty($it['image'])) return $it['image'];
    $f = 'assets/menu/' . preg_replace('/[^A-Za-z0-9_-]/', '', (string)$it['id']) . '.webp';
    return is_file(BC_ROOT . '/' . $f) ? $f : '';
}

/** Everything the public site needs, already filtered and priced. */
function public_data(): array {
    $s = settings();
    $cats = array_values(array_filter(sort_by_order(bc_load('categories')), fn($c) => !empty($c['visible'])));
    $items = sort_by_order(bc_load('items'));
    $menu = []; $offerItems = [];
    foreach ($cats as $c) {
        $list = [];
        foreach ($items as $it) {
            if (($it['cat'] ?? '') !== $c['id'] || empty($it['visible'])) continue;
            [$price, $was, $badge] = item_price($it, $c);
            $row = ['id' => $it['id'], 'group' => $it['group'] ?? '', 'name' => $it['name'], 'price' => $price];
            if ($was) { $row['was'] = $was; $row['badge'] = $badge; }
            if (!empty($it['desc'])) $row['desc'] = $it['desc'];
            if (!empty($it['tag'])) $row['tag'] = $it['tag'];
            if (($img = item_image($it)) !== '') $row['image'] = $img;
            if (empty($it['available'])) $row['soldout'] = true;
            if ($was && empty($row['soldout'])) $offerItems[] = ['id' => $it['id'], 'save' => $was - $price];
            $list[] = $row;
        }
        if (!$list) continue;
        $menu[] = ['id' => $c['id'], 'code' => $c['code'], 'title' => $c['title'], 'titleEn' => $c['titleEn'] ?? '',
            'seq' => $c['seq'] ?? '', 'image' => $c['image'] ?? '', 'line' => $c['line'] ?? '', 'items' => $list]
            + (!empty($c['discount']) && (float)$c['discount'] > 0 && in_window($c['discountFrom'] ?? null, $c['discountTo'] ?? null)
                ? ['off' => rtrim(rtrim(number_format(min(90, (float)$c['discount']), 1), '0'), '.'), 'offTo' => $c['discountTo'] ?? ''] : []);
    }
    usort($offerItems, fn($a, $b) => $b['save'] <=> $a['save']);
    $coupons = [];
    foreach (bc_load('coupons') as $cp) {
        if (empty($cp['public']) || empty($cp['active']) || !in_window($cp['from'] ?: null, $cp['to'] ?: null)) continue;
        if (!empty($cp['limit']) && (int)($cp['uses'] ?? 0) >= (int)$cp['limit']) continue;
        $coupons[] = ['code' => $cp['code'], 'value' => ($cp['type'] ?? '') === 'fixed' ? number_format((float)$cp['value']) : rtrim(rtrim(number_format((float)$cp['value'], 1), '0'), '.'),
            'type' => ($cp['type'] ?? '') === 'fixed' ? 'fixed' : 'percent', 'min' => (float)($cp['min'] ?? 0), 'to' => $cp['to'] ?? '', 'note' => $cp['publicNote'] ?? ''];
    }
    $events = array_values(array_filter(bc_load('events'), fn($ev) => !empty($ev['visible']) && ($ev['date'] ?? '') >= today()));
    usort($events, fn($a, $b) => strcmp($a['date'] . ($a['time'] ?? ''), $b['date'] . ($b['time'] ?? '')));
    $events = array_map(fn($ev) => ['slug' => $ev['slug'], 'title' => $ev['title'], 'subtitle' => $ev['subtitle'] ?? '',
        'date' => $ev['date'], 'time' => $ev['time'] ?? '', 'place' => $ev['place'] ?? '', 'cover' => $ev['cover'] ?? '',
        'price' => $ev['price'] ?? '', 'spots' => event_spots_left($ev)], $events);
    return [
        'config' => [
            'brand' => $s['brand'] ?? 'باركود كافيه', 'whatsapp' => preg_replace('/\D+/', '', $s['whatsapp'] ?? ''),
            'whatsappDisplay' => $s['whatsappDisplay'] ?? '', 'email' => $s['email'] ?? '', 'address' => $s['address'] ?? '',
            'hours' => $s['hours'] ?? '', 'mapUrl' => $s['mapUrl'] ?? '', 'social' => $s['social'] ?? new stdClass(), 'currency' => 'EGP',
            'ribbon' => $s['ribbon'] ?? [], 'orders' => !empty($s['ordersEnabled']), 'delivery' => !empty($s['deliveryEnabled']),
            'reservations' => !empty($s['reservationsEnabled']), 'api' => true,
        ],
        'menu' => $menu,
        'moods' => bc_load('moods'),
        'events' => $events,
        'offers' => ($s['offersSection'] ?? true) ? ['items' => array_slice(array_column($offerItems, 'id'), 0, 12), 'coupons' => $coupons] : ['items' => [], 'coupons' => []],
    ];
}

function event_rsvp_count(string $eventId): int {
    $n = 0;
    foreach (bc_load('rsvps') as $r) if ($r['event'] === $eventId && ($r['status'] ?? '') !== 'cancelled') $n += (int)$r['guests'];
    return $n;
}
function event_spots_left(array $ev): ?int {
    if (empty($ev['capacity'])) return null;
    return max(0, (int)$ev['capacity'] - event_rsvp_count($ev['id']));
}
function find_event(string $slug): ?array {
    foreach (bc_load('events') as $ev) if (($ev['slug'] ?? '') === $slug) return $ev;
    return null;
}

/* ---------- coupons ---------- */
/** Validate a promo code against a subtotal. Returns ['ok'=>bool, 'msg'=>..., 'discount'=>n, 'code'=>...]. */
function coupon_check(string $code, float $subtotal): array {
    $code = strtoupper(trim($code));
    if ($code === '') return ['ok' => false, 'msg' => 'اكتب كود الخصم'];
    foreach (bc_load('coupons') as $c) {
        if (strtoupper($c['code']) !== $code) continue;
        if (empty($c['active'])) return ['ok' => false, 'msg' => 'الكود غير مفعّل حاليًا'];
        if (!in_window($c['from'] ?? null, $c['to'] ?? null)) return ['ok' => false, 'msg' => 'الكود خارج فترة صلاحيته'];
        if (!empty($c['limit']) && (int)($c['uses'] ?? 0) >= (int)$c['limit']) return ['ok' => false, 'msg' => 'انتهت مرات استخدام الكود'];
        if (!empty($c['min']) && $subtotal < (float)$c['min']) return ['ok' => false, 'msg' => 'الحد الأدنى للطلب ' . (int)$c['min'] . ' جنيه'];
        $d = ($c['type'] ?? 'percent') === 'fixed' ? (float)$c['value'] : round($subtotal * min(100, (float)$c['value']) / 100);
        $d = min($d, $subtotal);
        $label = ($c['type'] ?? 'percent') === 'fixed' ? ((int)$c['value'] . ' جنيه') : ((float)$c['value'] . '%');
        return ['ok' => true, 'code' => $c['code'], 'discount' => $d, 'label' => $label, 'msg' => 'تم تطبيق خصم ' . $label];
    }
    return ['ok' => false, 'msg' => 'الكود غير صحيح'];
}

/* ---------- light abuse protection for public forms ---------- */
function rate_ok(string $bucket, int $max = 8, int $window = 600): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = substr(hash('sha256', $ip . $bucket), 0, 16);
    return bc_tx('ratelimit', function (&$d) use ($key, $max, $window) {
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
    if (strlen($raw) > 20000) json_out(['ok' => false, 'msg' => 'طلب كبير جدًا'], 413);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : $_POST;
}

<?php
/**
 * Barcode Cafe — shared core: storage, settings, pricing, helpers.
 * Live data is JSON in /storage (created on first run from data/seed.json).
 * The deploy never overwrites storage/*.json, so dashboard edits survive updates.
 * Works in any folder or domain: every path is relative to this site's root.
 */
declare(strict_types=1);

const BC_VERSION = '3.0.0';
define('BC_ROOT', dirname(__DIR__));
define('BC_STORAGE', BC_ROOT . '/storage');
define('BC_UPLOADS', BC_ROOT . '/uploads');

ini_set('display_errors', '0');
date_default_timezone_set('Africa/Cairo');
mb_internal_encoding('UTF-8');

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
    if (!is_file(BC_STORAGE . '/admin.json') && is_file(BC_ROOT . '/data/admin.seed.json')) {
        @copy(BC_ROOT . '/data/admin.seed.json', BC_STORAGE . '/admin.json');
    }
}

function bc_load(string $name): array {
    $f = BC_STORAGE . "/$name.json";
    $data = is_file($f) ? json_decode((string)file_get_contents($f), true) : null;
    return is_array($data) ? $data : [];
}

function bc_save(string $name, $data): void {
    $f = BC_STORAGE . "/$name.json";
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $f);
}

/** Read-modify-write one file under an exclusive lock. */
function bc_tx(string $name, callable $fn) {
    $lock = fopen(BC_STORAGE . "/$name.lock", 'c');
    flock($lock, LOCK_EX);
    $data = bc_load($name);
    $result = $fn($data);
    bc_save($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
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
    $menu = [];
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
            $list[] = $row;
        }
        if (!$list) continue;
        $menu[] = ['id' => $c['id'], 'code' => $c['code'], 'title' => $c['title'], 'titleEn' => $c['titleEn'] ?? '',
            'seq' => $c['seq'] ?? '', 'image' => $c['image'] ?? '', 'line' => $c['line'] ?? '', 'items' => $list];
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

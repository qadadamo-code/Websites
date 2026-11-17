<?php
/**
 * POST (JSON) → creates a booking / request and returns its reference.
 * type: party | rental | visit | contact
 */
require dirname(__DIR__) . '/inc/core.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false, 'error' => 'method'], 405);
$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) json_out(['ok' => false, 'error' => 'bad_json'], 400);
if (!empty($in['website'])) json_out(['ok' => true, 'ref' => 'AL-00000']); // honeypot: pretend success
if (!rate_ok('book', 8, 3600)) json_out(['ok' => false, 'error' => 'rate'], 429);

$c = al_load('content');
$type = in_array($in['type'] ?? '', ['party', 'rental', 'visit', 'contact'], true) ? $in['type'] : 'contact';
$name = clean_str($in['name'] ?? '', 80);
$phone = clean_phone($in['phone'] ?? '');
if (mb_strlen($name) < 2) json_out(['ok' => false, 'error' => 'name'], 422);
if (strlen(ltrim($phone, '+')) < 8) json_out(['ok' => false, 'error' => 'phone'], 422);

$date = clean_str($in['date'] ?? '', 10);
if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) $date = '';
$time = clean_str($in['time'] ?? '', 5);
if ($time !== '' && !preg_match('/^\d{2}:\d{2}$/', $time)) $time = '';

$ids = fn($k) => array_column($c[$k] ?? [], 'id');
$branch = in_array($in['branch'] ?? '', $ids('branches'), true) ? $in['branch'] : '';
$package = in_array($in['package'] ?? '', $ids('packages'), true) ? $in['package'] : '';
$addons = array_values(array_intersect((array)($in['addons'] ?? []), $ids('addons')));
$items = array_values(array_intersect((array)($in['items'] ?? []), $ids('rentals')));
$kids = max(0, min(200, (int)($in['kids'] ?? 0)));

// Server-side estimate (never trust the browser's number).
$estimate = 0;
$byId = fn($k, $id) => current(array_filter($c[$k] ?? [], fn($x) => $x['id'] === $id)) ?: null;
if ($type === 'party' && $package) {
    $p = $byId('packages', $package);
    $estimate += (int)($p['price'] ?? 0);
    if ($kids > (int)($p['kids'] ?? 0) && (int)($p['kids'] ?? 0) > 0) $estimate += ($kids - (int)$p['kids']) * (int)round(((int)$p['price']) / max(1, (int)$p['kids']) * 0.6);
    foreach ($addons as $a) $estimate += (int)($byId('addons', $a)['price'] ?? 0);
}
if ($type === 'rental') foreach ($items as $it) $estimate += (int)($byId('rentals', $it)['price'] ?? 0);

$ref = 'AL-' . strtoupper(substr(base_convert((string)(time() % 100000000), 10, 36), -4) . bin2hex(random_bytes(1)));
$row = [
    'ref' => $ref, 'type' => $type, 'status' => 'new', 'created' => date('c'),
    'name' => $name, 'phone' => $phone, 'branch' => $branch, 'date' => $date, 'time' => $time,
    'kids' => $kids, 'package' => $package, 'addons' => $addons, 'items' => $items,
    'address' => clean_str($in['address'] ?? '', 200), 'notes' => clean_str($in['notes'] ?? '', 800),
    'lang' => ($in['lang'] ?? '') === 'en' ? 'en' : 'ar', 'estimate' => $estimate, 'log' => [],
];
al_tx('bookings', function (&$all) use ($row) { array_unshift($all, $row); });
json_out(['ok' => true, 'ref' => $ref, 'estimate' => $estimate]);

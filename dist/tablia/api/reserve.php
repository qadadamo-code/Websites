<?php
/** Log an occasion booking (set menu / open buffet / custom gathering) so it shows in the dashboard. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('reserve', 6, 600)) json_out(['ok' => false, 'msg' => 'طلبات كثيرة، جرّب بعد قليل'], 429);
$in = read_json_body();
if (!empty($in['website'])) json_out(['ok' => true]);
$pack = null;
foreach (bc_load('packages') as $p) if ($p['id'] === (string)($in['package'] ?? '') && !empty($p['visible'])) $pack = $p;
$guests = max(1, min(5000, (int)($in['guests'] ?? 1)));
$r = [
    'id' => bc_id('r'), 'at' => now_iso(), 'code' => 'TB-' . random_int(1000, 9999),
    'name' => clean((string)($in['name'] ?? ''), 80), 'phone' => clean(digits_en((string)($in['phone'] ?? '')), 30),
    'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($in['date'] ?? '')) ? $in['date'] : '',
    'time' => preg_match('/^\d{2}:\d{2}$/', (string)($in['time'] ?? '')) ? $in['time'] : '',
    'guests' => $guests, 'occasion' => clean((string)($in['occasion'] ?? ''), 60),
    'package' => $pack['id'] ?? '', 'packageName' => $pack ? (($pack['type'] === 'buffet' ? 'أوبن بوفيه' : 'سِت منيو') . ' · ' . $pack['name']) : 'عزومة حسب الطلب',
    'pp' => $pack ? (float)$pack['price'] : 0, 'estimate' => $pack ? (float)$pack['price'] * $guests : 0,
    'address' => clean((string)($in['address'] ?? ''), 200),
    'notes' => clean((string)($in['notes'] ?? ''), 400), 'status' => 'new', 'deposit' => 0,
];
if ($r['name'] === '' || $r['phone'] === '' || $r['date'] === '') json_out(['ok' => false, 'msg' => 'بيانات ناقصة'], 422);
bc_tx('reservations', function (&$d) use ($r) { array_unshift($d, $r); if (count($d) > 5000) $d = array_slice($d, 0, 5000); });
json_out(['ok' => true, 'code' => $r['code'], 'estimate' => $r['estimate']]);

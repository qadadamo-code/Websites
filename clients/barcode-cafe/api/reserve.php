<?php
/** Log a table reservation request so it shows in the dashboard. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('reserve', 6, 600)) json_out(['ok' => false, 'msg' => 'طلبات كثيرة، جرّب بعد قليل'], 429);
$in = read_json_body();
if (!empty($in['website'])) json_out(['ok' => true]);
$r = [
    'id' => bc_id('r'), 'at' => now_iso(), 'code' => clean((string)($in['code'] ?? ''), 20),
    'name' => clean((string)($in['name'] ?? ''), 80), 'phone' => clean(digits_en((string)($in['phone'] ?? '')), 30),
    'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($in['date'] ?? '')) ? $in['date'] : '',
    'time' => preg_match('/^\d{2}:\d{2}$/', (string)($in['time'] ?? '')) ? $in['time'] : '',
    'guests' => max(1, min(60, (int)($in['guests'] ?? 1))), 'occasion' => clean((string)($in['occasion'] ?? ''), 60),
    'notes' => clean((string)($in['notes'] ?? ''), 300), 'status' => 'new',
];
if ($r['name'] === '' || $r['phone'] === '' || $r['date'] === '') json_out(['ok' => false, 'msg' => 'بيانات ناقصة'], 422);
bc_tx('reservations', function (&$d) use ($r) { array_unshift($d, $r); if (count($d) > 5000) $d = array_slice($d, 0, 5000); });
json_out(['ok' => true]);

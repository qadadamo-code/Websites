<?php
/** Logs a WhatsApp order so the owner sees it in the control panel. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('order', 12, 3600)) json_out(['ok' => false], 429);
$in = json_decode((string)file_get_contents('php://input', false, null, 0, 40000), true);
if (!is_array($in) || empty($in['lines']) || !is_array($in['lines'])) json_out(['ok' => false], 400);
$c = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$lines = [];
foreach (array_slice($in['lines'], 0, 60) as $l) {
    if (!is_array($l)) continue;
    $lines[] = ['name' => clean_str($l['name'] ?? '', 120), 'label' => clean_str($l['label'] ?? '', 160), 'qty' => max(1, min(99, (int)($l['qty'] ?? 1))),
        'price' => isset($l['price']) && $l['price'] !== null ? to_num($l['price']) : null, 'note' => clean_str($l['note'] ?? '', 120)];
}
$order = ['id' => date('ymd-His') . '-' . bin2hex(random_bytes(2)), 'at' => date('c'), 'status' => 'جديد',
    'name' => clean_str($c['name'] ?? '', 80), 'phone' => clean_str($c['phone'] ?? '', 30), 'addr' => clean_str($c['addr'] ?? '', 240),
    'when' => clean_str(($c['day'] ?? '') . ' · ' . ($c['time'] ?? ''), 80), 'pay' => clean_str($c['pay'] ?? '', 40), 'notes' => clean_str($c['notes'] ?? '', 400),
    'lines' => $lines, 'total' => array_sum(array_map(fn($l) => ($l['price'] ?? 0) * $l['qty'], $lines))];
lm_tx('orders', function (&$o) use ($order) { array_unshift($o, $order); $o = array_slice($o, 0, 500); });
json_out(['ok' => true]);

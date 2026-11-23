<?php
/**
 * Log an order the customer is sending on WhatsApp/email, so it shows in the dashboard.
 * Prices are recalculated here from the live menu; the browser's numbers are never trusted.
 */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('order', 10, 600)) json_out(['ok' => false, 'msg' => 'طلبات كثيرة، جرّب بعد قليل'], 429);
$in = read_json_body();
if (!empty($in['website'])) json_out(['ok' => true]); // honeypot

$cats = []; foreach (bc_load('categories') as $c) $cats[$c['id']] = $c;
$byId = []; foreach (bc_load('items') as $it) $byId[$it['id']] = $it;
$lines = []; $subtotal = 0;
foreach ((array)($in['items'] ?? []) as $row) {
    $id = (string)($row['id'] ?? ''); $q = max(0, min(50, (int)($row['qty'] ?? 0)));
    if (!$q || !isset($byId[$id]) || empty($byId[$id]['visible'])) continue;
    $it = $byId[$id];
    [$price] = item_price($it, $cats[$it['cat']] ?? null);
    $lines[] = ['id' => $id, 'name' => $it['name'], 'qty' => $q, 'price' => $price];
    $subtotal += $price * $q;
}
if (!$lines) json_out(['ok' => false, 'msg' => 'الفاتورة فارغة'], 422);
$name = clean((string)($in['name'] ?? ''), 80); $phone = clean(digits_en((string)($in['phone'] ?? '')), 30);
if ($name === '' || $phone === '') json_out(['ok' => false, 'msg' => 'الاسم والموبايل مطلوبين'], 422);

$discount = 0; $coupon = '';
if (!empty($in['coupon'])) {
    $chk = coupon_check((string)$in['coupon'], $subtotal);
    if ($chk['ok']) { $discount = $chk['discount']; $coupon = $chk['code']; }
}
$order = [
    'id' => bc_id('o'), 'no' => clean((string)($in['no'] ?? ''), 10), 'at' => now_iso(),
    'items' => $lines, 'subtotal' => $subtotal, 'discount' => $discount, 'coupon' => $coupon, 'total' => $subtotal - $discount,
    'type' => clean((string)($in['type'] ?? ''), 40), 'name' => $name, 'phone' => $phone,
    'table' => clean((string)($in['table'] ?? ''), 20),
    'address' => clean((string)($in['address'] ?? ''), 300), 'notes' => clean((string)($in['notes'] ?? ''), 300),
    'channel' => ($in['channel'] ?? '') === 'email' ? 'email' : 'whatsapp', 'status' => 'new',
];
bc_tx('orders', function (&$d) use ($order) { array_unshift($d, $order); if (count($d) > 5000) $d = array_slice($d, 0, 5000); });
if ($coupon) bc_tx('coupons', function (&$d) use ($coupon) { foreach ($d as &$c) if ($c['code'] === $coupon) $c['uses'] = (int)($c['uses'] ?? 0) + 1; });
json_out(['ok' => true, 'subtotal' => $subtotal, 'discount' => $discount, 'total' => $subtotal - $discount]);

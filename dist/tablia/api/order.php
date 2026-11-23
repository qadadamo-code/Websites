<?php
/**
 * Log an order the customer is sending on WhatsApp, so it shows in the dashboard.
 * Prices are recalculated here from the live menu; the browser's numbers are never trusted.
 */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('order', 10, 600)) json_out(['ok' => false, 'msg' => 'طلبات كثيرة، جرّب بعد قليل'], 429);
$in = read_json_body();
if (!empty($in['website'])) json_out(['ok' => true]); // honeypot
if (empty(settings()['ordersEnabled'])) json_out(['ok' => false, 'msg' => 'الطلب أونلاين متوقف مؤقتًا، كلّمنا على واتساب'], 403);

$cats = []; foreach (bc_load('categories') as $c) $cats[$c['id']] = $c;
$byId = []; foreach (bc_load('items') as $it) $byId[$it['id']] = $it;
$lines = []; $subtotal = 0;
foreach ((array)($in['items'] ?? []) as $row) {
    $id = (string)($row['id'] ?? ''); $q = max(0, min(200, (int)($row['qty'] ?? 0)));
    if (!$q || !isset($byId[$id]) || empty($byId[$id]['visible']) || empty($byId[$id]['available'])) continue;
    $it = $byId[$id];
    $sizes = item_sizes($it, $cats[$it['cat']] ?? null);
    $si = max(0, min(count($sizes) - 1, (int)($row['size'] ?? 0)));
    [$label, $price] = $sizes[$si];
    $lines[] = ['id' => $id, 'name' => $it['name'], 'size' => $label, 'qty' => $q, 'price' => $price, 'cat' => $it['cat']];
    $subtotal += $price * $q;
}
if (!$lines) json_out(['ok' => false, 'msg' => 'الطبلية فاضية'], 422);
$name = clean((string)($in['name'] ?? ''), 80); $phone = clean(digits_en((string)($in['phone'] ?? '')), 30);
if ($name === '' || $phone === '') json_out(['ok' => false, 'msg' => 'الاسم والموبايل مطلوبين'], 422);

$discount = 0; $coupon = '';
if (!empty($in['coupon'])) {
    $chk = coupon_check((string)$in['coupon'], $subtotal);
    if ($chk['ok']) { $discount = $chk['discount']; $coupon = $chk['code']; }
}
$type = in_array($in['type'] ?? '', ORDER_TYPES_ALL, true) ? $in['type'] : 'توصيل';
$ch = charges();
if ($type === 'توصيل' && $ch['minOrder'] > 0 && $subtotal - $discount < $ch['minOrder']) json_out(['ok' => false, 'msg' => 'أقل طلب للتوصيل ' . number_format($ch['minOrder']) . ' جنيه'], 422);
$tot = order_totals($subtotal, $discount, $type, (string)($in['zone'] ?? ''));
$day = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($in['day'] ?? '')) ? $in['day'] : today();
$order = [
    'id' => bc_id('o'), 'no' => (string)random_int(1000, 9999), 'at' => now_iso(),
    'items' => $lines, 'subtotal' => $subtotal, 'discount' => $discount, 'coupon' => $coupon,
    'service' => $tot['service'], 'vat' => $tot['vat'], 'delivery' => $tot['delivery'], 'zone' => $tot['zone'], 'total' => $tot['total'],
    'type' => $type, 'name' => $name, 'phone' => $phone, 'day' => $day, 'slot' => clean((string)($in['slot'] ?? ''), 40),
    'track' => bin2hex(random_bytes(8)),
    'address' => clean((string)($in['address'] ?? ''), 300), 'notes' => clean((string)($in['notes'] ?? ''), 300),
    'channel' => 'whatsapp', 'status' => 'new',
];
bc_tx('orders', function (&$d) use ($order) { array_unshift($d, $order); if (count($d) > 8000) $d = array_slice($d, 0, 8000); });
if ($coupon) bc_tx('coupons', function (&$d) use ($coupon) { foreach ($d as &$c) if ($c['code'] === $coupon) $c['uses'] = (int)($c['uses'] ?? 0) + 1; });
json_out(['ok' => true, 'id' => $order['id'], 'track' => $order['track'], 'no' => $order['no'], 'subtotal' => $subtotal, 'discount' => $discount, 'service' => $tot['service'], 'vat' => $tot['vat'], 'delivery' => $tot['delivery'], 'total' => $tot['total']]);

<?php
/**
 * Log an order the customer is sending on WhatsApp/email, so it shows in the dashboard.
 * Prices are recalculated here from the live menu; the browser's numbers are never trusted.
 */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
$in = read_json_body();
// customers inside the café share one Wi-Fi IP, so table orders get a roomier limit
$isTable = ($in['channel'] ?? '') === 'table';
if (!rate_ok($isTable ? 'order_t' : 'order', $isTable ? 60 : 10, 600)) json_out(['ok' => false, 'msg' => 'طلبات كثيرة، جرّب بعد قليل'], 429);
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
$dineIn = !empty(settings()['dineIn']);
$table = $dineIn && !empty($in['tableCode']) ? table_by_code((string)$in['tableCode']) : null;
if ($isTable && !$dineIn) json_out(['ok' => false, 'msg' => 'الطلب من داخل الكافيه مش متاح دلوقتي، اطلب من الكاشير'], 422);
if (!$table && ($in['type'] ?? '') === 'داخل الكافيه') {
    if (!$dineIn) json_out(['ok' => false, 'msg' => 'الطلب من داخل الكافيه مش متاح دلوقتي'], 422);
    foreach (tables_all() as $t) if (!empty($t['active']) && $t['id'] === (string)($in['tablePick'] ?? '')) $table = $t;
    if (!$table) json_out(['ok' => false, 'msg' => 'اختار رقم الترابيزة'], 422);
}
if (($in['channel'] ?? '') === 'table' && !$table) json_out(['ok' => false, 'msg' => 'كود الترابيزة مش صحيح، صوّر الـ QR اللي على الترابيزة تاني'], 422);
if ($table && $name === '') $name = 'ترابيزة ' . $table['name'];
if (!$table && ($name === '' || $phone === '')) json_out(['ok' => false, 'msg' => 'الاسم والموبايل مطلوبين'], 422);

$discount = 0; $coupon = '';
if (!empty($in['coupon'])) {
    $chk = coupon_check((string)$in['coupon'], $subtotal);
    if ($chk['ok']) { $discount = $chk['discount']; $coupon = $chk['code']; }
}
$type = $table ? 'داخل الكافيه' : clean((string)($in['type'] ?? ''), 40);
$ch = charges();
if ($type === 'توصيل' && $ch['minOrder'] > 0 && $subtotal - $discount < $ch['minOrder']) json_out(['ok' => false, 'msg' => 'أقل طلب للتوصيل ' . number_format($ch['minOrder']) . ' EGP'], 422);
$tot = order_totals($subtotal, $discount, $type, (string)($in['zone'] ?? ''));
$order = [
    'id' => bc_id('o'), 'no' => $isTable ? (string)random_int(1000, 9999) : clean((string)($in['no'] ?? ''), 10), 'at' => now_iso(),
    'items' => $lines, 'subtotal' => $subtotal, 'discount' => $discount, 'coupon' => $coupon,
    'service' => $tot['service'], 'vat' => $tot['vat'], 'delivery' => $tot['delivery'], 'zone' => $tot['zone'], 'total' => $tot['total'],
    'type' => $type, 'name' => $name, 'phone' => $phone,
    'table' => $table ? $table['name'] : '', 'tableId' => $table['id'] ?? '', 'track' => bin2hex(random_bytes(8)),
    'address' => clean((string)($in['address'] ?? ''), 300), 'notes' => clean((string)($in['notes'] ?? ''), 300),
    'channel' => $isTable ? 'table' : (($in['channel'] ?? '') === 'email' ? 'email' : 'whatsapp'), 'status' => 'new',
];
bc_tx('orders', function (&$d) use ($order) { array_unshift($d, $order); if (count($d) > 5000) $d = array_slice($d, 0, 5000); });
if ($coupon) bc_tx('coupons', function (&$d) use ($coupon) { foreach ($d as &$c) if ($c['code'] === $coupon) $c['uses'] = (int)($c['uses'] ?? 0) + 1; });
json_out(['ok' => true, 'id' => $order['id'], 'track' => $order['track'], 'no' => $order['no'], 'table' => $order['table'], 'subtotal' => $subtotal, 'discount' => $discount, 'service' => $tot['service'], 'vat' => $tot['vat'], 'delivery' => $tot['delivery'], 'total' => $tot['total']]);

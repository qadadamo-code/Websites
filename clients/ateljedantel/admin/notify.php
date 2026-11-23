<?php
/** Lightweight poll for new orders, bookings and messages. */
require __DIR__ . '/inc.php';
header('Content-Type: application/json; charset=utf-8');
if (!me()) { http_response_code(401); echo '{}'; exit; }
$o = can('orders.view') ? ad_load('orders') : []; $b = can('bookings.view') ? ad_load('bookings') : []; $m = can('news.view') ? ad_load('messages') : [];
$lo = 0; foreach ($o as $x) $lo = max($lo, strtotime($x['at'] ?? '') ?: 0);
$lb = 0; foreach ($b as $x) $lb = max($lb, strtotime($x['at'] ?? '') ?: 0);
echo json_encode([
    'orders' => count(array_filter($o, fn($x) => ($x['status'] ?? '') === 'new')),
    'bookings' => count(array_filter($b, fn($x) => ($x['status'] ?? '') === 'new')),
    'messages' => count(array_filter($m, fn($x) => empty($x['read']))),
    'lastOrder' => $lo, 'lastBooking' => $lb,
]);

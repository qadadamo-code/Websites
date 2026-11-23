<?php
/** Live alerts for the dashboard (polled every few seconds): new orders and new occasion bookings. */
require __DIR__ . '/inc.php';
header('Content-Type: application/json; charset=utf-8');
if (!is_admin()) { http_response_code(401); echo '{"ok":false}'; exit; }
session_write_close(); // don't block other tabs while polling
$out = ['ok' => true, 'orders' => 0, 'res' => 0, 'latest' => null, 'latestRes' => null, 'newIds' => [], 'newRes' => [], 'today' => 0];
if (can('orders.view')) {
    $orders = bc_load('orders');
    $new = array_values(array_filter($orders, fn($o) => ($o['status'] ?? '') === 'new'));
    $out['orders'] = count($new);
    if ($new) {
        $o = $new[0];
        $out['latest'] = ['id' => $o['id'], 'no' => $o['no'] ?? '', 'name' => $o['name'], 'day' => $o['day'] ?? '', 'total' => (int)$o['total'], 'at' => $o['at'], 'items' => count($o['items'])];
    }
    $out['newIds'] = array_slice(array_column($new, 'id'), 0, 50);
    $t = today();
    $out['today'] = count(array_filter($orders, fn($o) => ($o['day'] ?? '') === $t && !in_array($o['status'] ?? '', ['cancelled', 'done'], true)));
}
if (can('res.view')) {
    $newR = array_values(array_filter(bc_load('reservations'), fn($r) => ($r['status'] ?? '') === 'new'));
    $out['res'] = count($newR);
    $out['newRes'] = array_slice(array_column($newR, 'id'), 0, 50);
    if ($newR) { $r = $newR[0]; $out['latestRes'] = ['id' => $r['id'], 'name' => $r['name'], 'guests' => (int)($r['guests'] ?? 0), 'date' => $r['date'] ?? '', 'occasion' => $r['occasion'] ?? '']; }
}
echo json_encode($out, JSON_UNESCAPED_UNICODE);

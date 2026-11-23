<?php
/** Live alerts for the dashboard (polled every few seconds): new orders / reservations + table board. */
require __DIR__ . '/inc.php';
header('Content-Type: application/json; charset=utf-8');
if (!is_admin()) { http_response_code(401); echo '{"ok":false}'; exit; }
session_write_close(); // don't block other tabs while polling
$out = ['ok' => true, 'orders' => 0, 'res' => 0, 'latest' => null, 'busy' => 0, 'tables' => []];
if (can('orders.view')) {
    $orders = bc_load('orders');
    $new = array_values(array_filter($orders, fn($o) => ($o['status'] ?? '') === 'new'));
    $out['orders'] = count($new);
    if ($new) {
        $o = $new[0];
        $out['latest'] = ['id' => $o['id'], 'no' => $o['no'] ?? '', 'name' => $o['name'], 'table' => $o['table'] ?? '', 'total' => (int)$o['total'], 'at' => $o['at'], 'items' => count($o['items'])];
    }
    $out['newIds'] = array_slice(array_column($new, 'id'), 0, 50);
    $live = table_live();
    $out['busy'] = count($live);
    foreach ($live as $tid => $l) $out['tables'][$tid] = ['st' => $l['st'], 'n' => count($l['orders']), 'total' => $l['total'], 'at' => $l['at']];
}
if (can('res.view')) {
    $out['res'] = count(array_filter(bc_load('reservations'), fn($r) => ($r['status'] ?? '') === 'new'));
}
echo json_encode($out, JSON_UNESCAPED_UNICODE);

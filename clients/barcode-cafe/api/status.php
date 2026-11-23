<?php
/** Live status of a table order for the customer: GET ?id=…&k=… (k is the order's private tracking token). */
require dirname(__DIR__) . '/inc/core.php';
if (!rate_ok('status', 900, 600)) json_out(['ok' => false], 429);
$id = (string)($_GET['id'] ?? ''); $k = (string)($_GET['k'] ?? '');
$labels = ['new' => 'وصل للكافيه', 'preparing' => 'بيتحضّر دلوقتي', 'ready' => 'جاهز وجاي لك', 'done' => 'اتسلّم، بالهنا والشفا', 'cancelled' => 'اتلغى، كلّم الكاشير'];
foreach (bc_load('orders') as $o) {
    if ($o['id'] === $id && !empty($o['track']) && hash_equals($o['track'], $k)) json_out(['ok' => true, 'status' => $o['status'], 'label' => $labels[$o['status']] ?? $o['status']]);
}
json_out(['ok' => false], 404);

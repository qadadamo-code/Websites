<?php
/**
 * Open / print / WhatsApp the branded invoice of an order.
 * ?id=…            → the invoice page
 * ?id=…&print=1    → the invoice page, print dialog opens
 * ?id=…&wa=1       → WhatsApp chat with the customer, message carries the invoice link
 * Old orders get their private token the first time an invoice is made.
 */
require __DIR__ . '/inc.php';
require_perm('orders.view');
$id = (string)($_GET['id'] ?? '');
$o = null; foreach (bc_load('orders') as $x) if ($x['id'] === $id) $o = $x;
if (!$o) { flash('الطلب غير موجود', 'bad'); go('orders.php'); }
if (empty($o['track'])) {
    $tok = bin2hex(random_bytes(8));
    $GLOBALS['bc_no_undo'] = true; // a token is not something to undo
    bc_tx('orders', function (&$d) use ($id, $tok) { foreach ($d as &$x) if ($x['id'] === $id && empty($x['track'])) $x['track'] = $tok; });
    foreach (bc_load('orders') as $x) if ($x['id'] === $id) $o = $x;
}
$base = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? '') . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/x')), '/') . '/';
$url = $base . 'invoice.php?o=' . rawurlencode($o['id']) . '&k=' . rawurlencode($o['track']);
if (!empty($_GET['wa'])) {
    $phone = wa_phone((string)($o['phone'] ?? ''));
    $lines = array_map(fn($l) => '• ' . $l['qty'] . ' × ' . $l['name'], $o['items']);
    $msg = 'أهلًا ' . $o['name'] . ' 👋' . "\n" . 'دي فاتورة طلبك من ' . (settings()['brand'] ?? 'طبلية') . ' #' . ($o['no'] ?? '') . "\n\n"
        . implode("\n", $lines) . "\n\n" . 'الإجمالي: ' . number_format((float)$o['total']) . ' EGP' . "\n\n"
        . 'الفاتورة كاملة: ' . $url . "\n" . 'بالهنا والشفا ✨ ماما رحاب';
    log_act('إرسال فاتورة واتساب', '#' . ($o['no'] ?? '') . ' · ' . $o['name']);
    header('Location: https://wa.me/' . $phone . '?text=' . rawurlencode($msg)); exit;
}
header('Location: ../invoice.php?o=' . rawurlencode($o['id']) . '&k=' . rawurlencode($o['track']) . (!empty($_GET['print']) ? '&print=1' : '')); exit;

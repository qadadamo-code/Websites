<?php
/** GET ?code=X&subtotal=N → discount preview for the checkout summary. The order API applies it again server-side. */
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/orders.php';
$c = find_coupon((string)($_GET['code'] ?? ''));
$sub = (float)($_GET['subtotal'] ?? 0);
$ar = LANG === 'ar';
if (!$c) json_out(['ok' => false, 'msg' => $ar ? 'الكود غير صالح' : 'Invalid code']);
if ($sub < (float)($c['min'] ?? 0)) json_out(['ok' => false, 'msg' => ($ar ? 'الكود يعمل على طلبات من ' : 'Valid on orders from ') . money($c['min'])]);
json_out(['ok' => true, 'code' => $c['code'], 'discount' => coupon_discount($c, $sub),
    'msg' => $ar ? ('تم تطبيق الخصم ' . ($c['type'] === 'percent' ? $c['value'] . '%' : money($c['value']))) : ('Discount applied ' . ($c['type'] === 'percent' ? $c['value'] . '%' : money($c['value'])))]);

<?php
/** Check a promo code: GET ?code=X&total=Y */
require dirname(__DIR__) . '/inc/core.php';
if (!rate_ok('coupon', 30, 600)) json_out(['ok' => false, 'msg' => 'محاولات كثيرة، جرّب بعد قليل'], 429);
json_out(coupon_check(clean($_GET['code'] ?? '', 40), (float)($_GET['total'] ?? 0)));

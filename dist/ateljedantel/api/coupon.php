<?php
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['ok' => false], 405);
if (!rate_ok('coupon', 20, 600)) json_out(['ok' => false, 'msg' => t('f.rate')], 429);
$d = read_json_body();
json_out(coupon_check((string)($d['code'] ?? ''), max(0, (float)($d['subtotal'] ?? 0))));

<?php
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['ok' => false], 405);
$d = read_json_body();
if (!empty($d['website'])) json_out(['ok' => true]); // bot trap
if (!rate_ok('news', 5, 3600)) json_out(['ok' => false, 'msg' => t('f.rate')], 429);
$email = strtolower(trim((string)($d['email'] ?? '')));
if (!valid_email($email)) json_out(['ok' => false, 'msg' => t('f.email')], 422);
ad_tx('subscribers', function (&$s) use ($email) {
    foreach ($s as $x) if ($x['email'] === $email) return;
    $s[] = ['id' => ad_id('n'), 'email' => $email, 'lang' => lang(), 'at' => now_iso(), 'active' => true];
});
customer_touch($email, [], 'newsletter');
json_out(['ok' => true]);

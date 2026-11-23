<?php
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['ok' => false], 405);
$d = read_json_body();
if (!empty($d['website'])) json_out(['ok' => true]);
if (!rate_ok('contact', 5, 3600)) json_out(['ok' => false, 'msg' => t('f.rate')], 429);
$name = clean((string)($d['name'] ?? ''), 80); $email = strtolower(clean((string)($d['email'] ?? ''), 120)); $msg = clean((string)($d['message'] ?? ''), 3000); $phone = clean((string)($d['phone'] ?? ''), 30);
$err = [];
if ($name === '') $err['name'] = t('f.req');
if (!valid_email($email)) $err['email'] = t('f.email');
if (mb_strlen($msg) < 3) $err['message'] = t('f.req');
if ($err) json_out(['ok' => false, 'errors' => $err, 'msg' => t('co.err')], 422);
$about = clean((string)($d['product'] ?? ''), 160);
ad_tx('messages', function (&$m) use ($name, $email, $phone, $msg, $about) { array_unshift($m, ['id' => ad_id('m'), 'name' => $name, 'email' => $email, 'phone' => $phone, 'message' => $msg, 'product' => $about, 'at' => now_iso(), 'read' => false]); });
customer_touch($email, ['name' => $name, 'phone' => $phone], 'contact');
$s = settings();
ad_mail($s['orderEmail'] ?? $s['email'], 'Meddelande från webbplatsen – ' . $name, "Namn: $name\nE-post: $email\nTelefon: $phone\n" . ($about ? "Gäller: $about\n" : '') . "\n$msg", $email);
json_out(['ok' => true]);

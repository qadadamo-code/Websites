<?php
/** Order request from the checkout. Prices, stock and discounts are recalculated here; the browser's numbers are never trusted. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['ok' => false], 405);
$d = read_json_body();
if (!empty($d['website'])) json_out(['ok' => false, 'msg' => t('f.err')], 400);
if (!rate_ok('order', 6, 3600)) json_out(['ok' => false, 'msg' => t('f.rate')], 429);
$s = settings();
if (empty($s['ordersEnabled'])) json_out(['ok' => false, 'msg' => t('co.closed')], 403);

$c = [];
foreach (['name' => 80, 'email' => 120, 'phone' => 30, 'address' => 120, 'zip' => 12, 'city' => 60, 'note' => 800] as $k => $max) $c[$k] = clean((string)($d[$k] ?? ''), $max);
$c['email'] = strtolower($c['email']);
$ship = ($d['ship'] ?? '') === 'post' ? 'post' : 'pickup';
$pay = (string)($d['pay'] ?? '');
$payOn = pay_methods($ship);
$err = [];
if ($c['name'] === '') $err['name'] = t('f.req');
if (!valid_email($c['email'])) $err['email'] = t('f.email');
if (strlen(preg_replace('/\D/', '', $c['phone'])) < 7) $err['phone'] = t('f.req');
if ($ship === 'post') { foreach (['address', 'zip', 'city'] as $k) if ($c[$k] === '') $err[$k] = t('f.req'); }
if (!in_array($pay, $payOn, true)) $err['pay'] = t('f.req');
if (empty($d['terms'])) $err['terms'] = t('f.req');
$items = array_slice((array)($d['items'] ?? []), 0, 30);
if (!$items) $err['cart'] = t('ui.cartempty');
if ($err) json_out(['ok' => false, 'errors' => $err, 'msg' => t('co.err')], 422);

/* reserve stock under a lock on products.json */
$res = ad_tx('products', function (&$prods) use ($items) {
    $lines = []; $problems = [];
    foreach ($items as $it) {
        $vid = (string)($it['v'] ?? ''); $q = max(1, min(9, (int)($it['q'] ?? 1)));
        $found = false;
        foreach ($prods as &$p) {
            if (empty($p['active'])) continue;
            foreach ($p['variants'] as &$v) {
                if ($v['id'] !== $vid) continue;
                $found = true;
                $order = !empty($v['order']);
                if (!$order && (int)$v['stock'] < $q) { $problems[] = tr($p['title']) . ($v['size'] ? ' (' . $v['size'] . ')' : ''); break 2; }
                if (!$order) $v['stock'] = (int)$v['stock'] - $q;
                [$price] = variant_price($v);
                $lines[] = ['pid' => $p['id'], 'vid' => $v['id'], 'title' => $p['title']['sv'] ?? '', 'titleEn' => $p['title']['en'] ?? '', 'sku' => $v['sku'] ?? '', 'size' => $v['size'] ?? '', 'color' => $v['color'] ?? '',
                    'img' => $v['images'][0] ?? '', 'price' => $price, 'q' => $q, 'order' => $order, 'reserved' => !$order];
                break 2;
            }
            unset($v);
        }
        unset($p);
        if (!$found) $problems[] = $vid;
    }
    if ($problems) return ['ok' => false, 'problems' => $problems];
    return ['ok' => true, 'lines' => $lines];
});
if (!$res['ok']) json_out(['ok' => false, 'msg' => (lang() === 'en' ? 'Sorry, no longer available: ' : 'Tyvärr inte längre tillgänglig: ') . implode(', ', $res['problems']), 'stock' => true], 409);
$lines = $res['lines'];
$sub = array_sum(array_map(fn($l) => $l['price'] * $l['q'], $lines));
$disc = 0; $code = '';
if (!empty($d['coupon'])) {
    $cc = coupon_check((string)$d['coupon'], $sub);
    if ($cc['ok']) {
        $disc = $cc['discount']; $code = $cc['code'];
        ad_tx('coupons', function (&$all) use ($code) { foreach ($all as &$x) if (strtoupper($x['code']) === strtoupper($code)) $x['uses'] = (int)($x['uses'] ?? 0) + 1; });
    }
}
$shipCost = shipping_cost($ship, $sub - $disc);
$total = max(0, $sub - $disc) + $shipCost;

$order = ad_tx('orders', function (&$orders) use ($c, $lines, $sub, $disc, $code, $ship, $shipCost, $total, $pay, $s) {
    $max = 1000; foreach ($orders as $o) $max = max($max, (int)($o['no'] ?? 0));
    $o = ['id' => ad_id('o'), 'no' => $max + 1, 'ref' => ($s['orderPrefix'] ?? 'AD') . '-' . ($max + 1), 'at' => now_iso(), 'lang' => lang(),
        'customer' => $c, 'items' => $lines, 'subtotal' => $sub, 'discount' => $disc, 'coupon' => $code, 'ship' => $ship, 'shipping' => $shipCost, 'total' => $total,
        'pay' => $pay, 'paid' => false, 'status' => 'new', 'history' => [['at' => now_iso(), 'st' => 'new', 'by' => 'web']], 'staffNote' => '', 'token' => bin2hex(random_bytes(12))];
    array_unshift($orders, $o);
    return $o;
});
customer_touch($c['email'], $c, 'order');

/* e-mails */
$payName = ['swish' => 'Swish', 'bank' => 'Banköverföring', 'store' => 'Betala i butiken', 'stripe' => 'Kort online'][$pay] ?? $pay;
$list = implode("\n", array_map(fn($l) => "- {$l['q']} × {$l['title']}" . ($l['color'] ? ", {$l['color']}" : '') . ($l['size'] ? ", strl {$l['size']}" : '') . ' – ' . kr($l['price'] * $l['q']) . ($l['order'] ? ' (beställningsvara)' : ''), $lines));
$sum = "Delsumma: " . kr($sub) . ($disc ? "\nRabatt ($code): -" . kr($disc) : '') . "\nFrakt: " . kr($shipCost) . "\nTotalt: " . kr($total);
$cust = "{$c['name']}\n{$c['email']} · {$c['phone']}" . ($ship === 'post' ? "\n{$c['address']}, {$c['zip']} {$c['city']}" : "\nHämtas i butiken");
ad_mail($s['orderEmail'] ?? $s['email'], "Ny beställning {$order['ref']} – " . kr($total), "Ny beställning från webbutiken\n\n$list\n\n$sum\n\nBetalning: $payName\n\n$cust" . ($c['note'] ? "\n\nMeddelande: {$c['note']}" : ''), $c['email']);
$en = lang() === 'en';
$payInfo = '';
if ($pay === 'swish') $payInfo = ($s['pay']['swish']['number'] ?? '') !== '' ? ($en ? "Swish to {$s['pay']['swish']['number']} and use {$order['ref']} as the message, once we have confirmed your order." : "Swisha till {$s['pay']['swish']['number']} och skriv {$order['ref']} som meddelande, när vi har bekräftat din order.") : ($en ? 'We will send Swish details when we confirm your order.' : 'Vi skickar Swish-uppgifter när vi bekräftar din order.');
if ($pay === 'bank') $payInfo = ($s['pay']['bank']['bankgiro'] ?? '') !== '' ? "Bankgiro {$s['pay']['bank']['bankgiro']}" . (($s['pay']['bank']['iban'] ?? '') ? " · IBAN {$s['pay']['bank']['iban']}" : '') . ($en ? " · reference {$order['ref']}" : " · referens {$order['ref']}") : ($en ? 'We will send bank details when we confirm your order.' : 'Vi skickar bankuppgifter när vi bekräftar din order.');
if ($pay === 'store') $payInfo = $en ? 'Pay by card or cash when you collect in store.' : 'Betala med kort eller kontant när du hämtar i butiken.';
if ($pay === 'stripe') $payInfo = ($en ? 'Pay securely by card: ' : 'Betala säkert med kort: ') . ($s['pay']['stripe']['link'] ?? '');
ad_mail($c['email'], ($en ? 'Your order ' : 'Din beställning ') . $order['ref'] . ' – Ateljé Dantel',
    ($en ? "Hi {$c['name']},\n\nThank you for your order! We will check stock and confirm shortly.\n\n" : "Hej {$c['name']},\n\nTack för din beställning! Vi kontrollerar lagret och bekräftar inom kort.\n\n")
    . "$list\n\n$sum\n\n" . ($en ? 'Payment: ' : 'Betalning: ') . "$payInfo\n\nAteljé Dantel\n{$s['address']}, {$s['city']}\n{$s['phone']} · {$s['email']}");
json_out(['ok' => true, 'ref' => $order['ref'], 'url' => 'tack.php?o=' . rawurlencode($order['ref']) . '&k=' . $order['token']]);

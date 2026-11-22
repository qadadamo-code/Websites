<?php
/** POST: place an order. Prices, stock, coupon and shipping are all recomputed here, never trusted from the browser. */
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/orders.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!csrf_ok()) json_out(['ok' => false, 'error' => LANG === 'ar' ? 'انتهت الجلسة، حدّثي الصفحة وحاولي تاني' : 'Session expired, please refresh'], 400);
if (!empty($_POST['website'])) json_out(['ok' => true, 'number' => 'EB-0', 'token' => '']); // honeypot

// Simple rate limit: 5 orders per IP per 10 minutes.
$ipKey = EB_STORAGE . '/rl_' . md5($_SERVER['REMOTE_ADDR'] ?? 'x') . '.json';
$hits = array_filter(json_decode((string)@file_get_contents($ipKey), true) ?: [], fn($t) => $t > time() - 600);
if (count($hits) >= 5) json_out(['ok' => false, 'error' => LANG === 'ar' ? 'محاولات كتير، استني دقائق' : 'Too many attempts, try again shortly'], 429);
$hits[] = time(); @file_put_contents($ipKey, json_encode(array_values($hits)));

$ar = LANG === 'ar';
$err = fn(string $m) => json_out(['ok' => false, 'error' => $m], 422);
$clean = fn($k, $max = 300) => mb_substr(trim(strip_tags((string)($_POST[$k] ?? ''))), 0, $max);

$name = $clean('name', 80); $phone = normalize_phone($clean('phone', 20)); $phone2 = normalize_phone($clean('phone2', 20));
$email = filter_var($clean('email', 120), FILTER_VALIDATE_EMAIL) ?: '';
$gov = $clean('gov', 30); $city = $clean('city', 80); $address = $clean('address', 400); $notes = $clean('notes', 500);
$payment = in_array($_POST['payment'] ?? '', ['cod', 'instapay', 'vodafone'], true) ? $_POST['payment'] : '';
$s = eb_load('settings');
if ($payment && empty($s['pay_' . $payment])) $payment = '';

if (mb_strlen($name) < 3) $err($ar ? 'اكتبي الاسم بالكامل' : 'Please enter your full name');
if (!valid_eg_phone($phone)) $err(t('phone_invalid'));
if ($city === '' || mb_strlen($address) < 6) $err($ar ? 'اكتبي العنوان بالتفصيل' : 'Please enter your full address');
if (!$payment) $err($ar ? 'اختاري طريقة الدفع' : 'Choose a payment method');

$cart = json_decode((string)($_POST['cart'] ?? '[]'), true);
if (!is_array($cart) || !$cart) $err(t('cart_empty'));

// Receipt (optional) for transfers.
$receipt = '';
if (!empty($_FILES['receipt']['tmp_name']) && is_uploaded_file($_FILES['receipt']['tmp_name'])) {
    $f = $_FILES['receipt'];
    if ($f['size'] > 6 * 1024 * 1024) $err($ar ? 'حجم الإيصال كبير (أقصى 6 ميجا)' : 'Receipt too large (max 6MB)');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/heic' => 'heic', 'application/pdf' => 'pdf'][$mime] ?? null;
    if (!$ext) $err($ar ? 'الإيصال لازم يكون صورة أو PDF' : 'Receipt must be an image or PDF');
    $receipt = date('Ymd-His') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
    move_uploaded_file($f['tmp_name'], EB_STORAGE . '/receipts/' . $receipt);
}

$result = eb_transaction('products', function (array &$products) use ($cart, $ar, $err) {
    $items = []; $subtotal = 0.0;
    $byId = [];
    foreach ($products as $k => $p) $byId[$p['id']] = $k;
    foreach ($cart as $line) {
        $id = (string)($line['id'] ?? ''); $qty = max(1, min(20, (int)($line['qty'] ?? 1)));
        if (!isset($byId[$id])) continue;
        $p = &$products[$byId[$id]];
        if (!empty($p['hidden'])) continue;
        if ((int)$p['stock'] < $qty) {
            return ['error' => ($ar ? 'الكمية المتاحة من "' . $p['name_ar'] . '" هي ' : 'Only this many left of "' . $p['name_en'] . '": ') . (int)$p['stock']];
        }
        $p['stock'] = (int)$p['stock'] - $qty;
        $p['sold'] = (int)($p['sold'] ?? 0) + $qty;
        $items[] = ['id' => $id, 'name' => $p['name_ar'], 'name_en' => $p['name_en'], 'price' => (float)$p['price'], 'qty' => $qty, 'img' => $p['images'][0] ?? ''];
        $subtotal += (float)$p['price'] * $qty;
        unset($p);
    }
    if (!$items) return ['error' => t('cart_empty')];
    return ['items' => $items, 'subtotal' => $subtotal];
});
if (isset($result['error'])) $err($result['error']);

$coupon = find_coupon((string)($_POST['coupon'] ?? ''));
$discount = coupon_discount($coupon, $result['subtotal']);
$shipFee = shipping_fee($gov, $result['subtotal'] - $discount);
if ($shipFee === null) {
    // Put the stock back if the governorate is invalid.
    eb_transaction('products', function (array &$products) use ($result) {
        foreach ($products as &$p) foreach ($result['items'] as $it) if ($p['id'] === $it['id']) { $p['stock'] += $it['qty']; $p['sold'] = max(0, ($p['sold'] ?? 0) - $it['qty']); }
    });
    $err($ar ? 'اختاري المحافظة' : 'Choose your governorate');
}

$order = eb_transaction('orders', function (array &$orders) use ($result, $discount, $shipFee, $coupon, $payment, $receipt, $name, $phone, $phone2, $email, $gov, $city, $address, $notes) {
    $max = 1000;
    foreach ($orders as $o) $max = max($max, (int)substr($o['number'], 3));
    $o = [
        'number' => 'EB-' . ($max + 1),
        'token' => bin2hex(random_bytes(12)),
        'created' => date('c'),
        'status' => 'new',
        'items' => $result['items'],
        'subtotal' => $result['subtotal'],
        'discount' => $discount,
        'coupon' => $coupon['code'] ?? '',
        'shipping' => $shipFee,
        'total' => round($result['subtotal'] - $discount + $shipFee, 2),
        'payment' => $payment,
        'paid' => false,
        'receipt' => $receipt,
        'customer' => compact('name', 'phone', 'phone2', 'email', 'gov', 'city', 'address', 'notes'),
        'lang' => LANG,
        'history' => [['status' => 'new', 'at' => date('c')]],
        'admin_note' => '',
    ];
    $orders[] = $o;
    return $o;
});

if ($coupon) eb_transaction('coupons', function (array &$cs) use ($coupon) {
    foreach ($cs as &$c) if (strtoupper($c['code']) === strtoupper($coupon['code'])) $c['uses'] = (int)($c['uses'] ?? 0) + 1;
});

notify_new_order($order);
$_SESSION['last_order'] = $order['number'];
json_out(['ok' => true, 'number' => $order['number'], 'token' => $order['token']]);

<?php
/** Pricing, coupons, notifications — shared by the storefront API and the dashboard. */

function find_coupon(string $code): ?array {
    $code = strtoupper(trim($code));
    if ($code === '') return null;
    foreach (eb_load('coupons') as $c) {
        if (strtoupper($c['code']) === $code && !empty($c['active'])) {
            if (!empty($c['max_uses']) && (int)$c['uses'] >= (int)$c['max_uses']) return null;
            if (!empty($c['expires']) && strtotime($c['expires'] . ' 23:59:59') < time()) return null;
            return $c;
        }
    }
    return null;
}

function coupon_discount(?array $c, float $subtotal): float {
    if (!$c || $subtotal < (float)($c['min'] ?? 0)) return 0.0;
    $d = $c['type'] === 'percent' ? $subtotal * (float)$c['value'] / 100 : (float)$c['value'];
    return round(min($d, $subtotal), 2);
}

function shipping_fee(string $gov, float $subtotalAfterDiscount): ?float {
    $free = (float)setting('free_shipping_over', 0);
    foreach (eb_load('shipping') as $g) {
        if ($g['id'] === $gov) return ($free > 0 && $subtotalAfterDiscount >= $free) ? 0.0 : (float)$g['fee'];
    }
    return null;
}

function gov_name(string $id, string $lang = 'ar'): string {
    foreach (eb_load('shipping') as $g) if ($g['id'] === $id) return $g[$lang];
    return $id;
}

function normalize_phone(string $p): string {
    $p = strtr($p, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);
    $p = preg_replace('/\D/', '', $p);
    if (strpos($p, '0020') === 0) $p = substr($p, 2);
    if (strpos($p, '20') === 0 && strlen($p) === 12) $p = '0' . substr($p, 2);
    return $p;
}
function valid_eg_phone(string $p): bool { return (bool)preg_match('/^01[0125]\d{8}$/', $p); }

function order_text(array $o, string $lang = 'ar'): string {
    $ar = $lang === 'ar';
    $lines = [($ar ? 'طلب جديد ' : 'New order ') . $o['number']];
    foreach ($o['items'] as $it) $lines[] = '• ' . $it['name'] . ' × ' . $it['qty'] . ' = ' . number_format($it['price'] * $it['qty']) . ' EGP';
    $lines[] = ($ar ? 'الإجمالي: ' : 'Total: ') . number_format($o['total'], 0) . ' EGP' . ($o['discount'] > 0 ? ($ar ? ' (بعد خصم ' : ' (after ') . number_format($o['discount']) . ')' : '');
    $lines[] = ($ar ? 'الدفع: ' : 'Payment: ') . $o['payment'];
    $lines[] = ($ar ? 'العميلة: ' : 'Customer: ') . $o['customer']['name'] . ' — ' . $o['customer']['phone'];
    $lines[] = ($ar ? 'العنوان: ' : 'Address: ') . gov_name($o['customer']['gov'], $lang) . '، ' . $o['customer']['city'] . '، ' . $o['customer']['address'];
    if (!empty($o['customer']['notes'])) $lines[] = ($ar ? 'ملاحظات: ' : 'Notes: ') . $o['customer']['notes'];
    return implode("\n", $lines);
}

/** Email the store (and the customer if they left an email); optional WhatsApp push via CallMeBot. */
function notify_new_order(array $o): void {
    $s = eb_load('settings');
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $from = 'orders@' . preg_replace('/^www\./', '', $host);
    $headers = "From: Elegance Boutique <$from>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $text = order_text($o, 'ar');
    $base = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . '://' . $host . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    $admin = $base . '/admin/order.php?id=' . rawurlencode($o['number']);
    if (!empty($s['order_email'])) {
        @mail($s['order_email'], '=?UTF-8?B?' . base64_encode('🛍️ طلب جديد ' . $o['number'] . ' — ' . number_format($o['total']) . ' ج.م') . '?=', $text . "\n\n" . $admin, $headers);
    }
    if (!empty($o['customer']['email'])) {
        $msg = "أهلاً " . $o['customer']['name'] . "،\nشكراً لطلبك من إليجانس بوتيك 🤍\n\n" . $text . "\n\nتتبعي طلبك: " . $base . '/track.php?n=' . rawurlencode($o['number']);
        @mail($o['customer']['email'], '=?UTF-8?B?' . base64_encode('تم استلام طلبك ' . $o['number']) . '?=', $msg, $headers);
    }
    if (!empty($s['callmebot_phone']) && !empty($s['callmebot_key'])) {
        $url = 'https://api.callmebot.com/whatsapp.php?phone=' . rawurlencode(preg_replace('/\D/', '', $s['callmebot_phone']))
            . '&text=' . rawurlencode($text . "\n" . $admin) . '&apikey=' . rawurlencode($s['callmebot_key']);
        $ctx = stream_context_create(['http' => ['timeout' => 6]]);
        @file_get_contents($url, false, $ctx);
    }
}

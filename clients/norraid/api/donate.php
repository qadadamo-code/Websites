<?php
/**
 * Records an anonymous donation intent (fund, amount, language) and sends the donor to the configured PayPal page.
 * An intent is NOT a donation: only a finance reviewer can mark a donation confirmed, from PayPal records.
 */
require __DIR__ . '/_boot.php';
$pp = trim((string)setting('paypal_url'));
if (!preg_match('~^https://(www\.)?paypal\.com/~', $pp)) { header('Location: ' . u('donate'), true, 303); exit; }
$fund = (string)($_POST['fund'] ?? 'general');
if (!in_array($fund, array_merge(['general'], COUNTRY_IDS), true)) $fund = 'general';
$amount = (string)($_POST['amount'] ?? '');
if ($amount === 'custom') $amount = (string)($_POST['custom'] ?? '');
$amt = is_numeric($amount) ? round((float)$amount, 2) : 0.0;
if ($amt < 1 || $amt > 10000) $amt = 0.0;
if (form_token_ok() && !rate_limited('donate', 30, 3600)) {
    nr_tx('donations', function (&$l) use ($fund, $amt) {
        array_unshift($l, ['id' => uid('d'), 'type' => 'intent', 'status' => 'unconfirmed', 'fund' => $fund, 'amount' => $amt, 'currency' => setting('currency', 'EUR'), 'lang' => L(), 'at' => now_iso()]);
        $l = array_slice($l, 0, 5000);
    });
}
$q = [];
if ($amt > 0 && setting('pass_amount', true)) { $q['amount'] = number_format($amt, 2, '.', ''); $q['currency_code'] = setting('currency', 'EUR'); }
$q['item_name'] = 'NORRAID AFRICA – ' . ($fund === 'general' ? 'General humanitarian fund' : (['sudan' => 'Sudan', 'drc' => 'DR Congo', 'south-sudan' => 'South Sudan'][$fund]) . ' fund');
$q['return'] = nr_origin() . u('thank-you');
$q['cancel_return'] = nr_origin() . u('donate');
$url = $pp . (str_contains($pp, '?') ? '&' : '?') . http_build_query($q);
header('Cache-Control: no-store');
header('Location: ' . $url, true, 303);

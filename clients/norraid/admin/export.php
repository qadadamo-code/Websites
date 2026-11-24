<?php
/** CSV exports (UTF-8 with BOM so Excel opens it correctly). */
require __DIR__ . '/inc.php';
require_login();
if (!hash_equals(csrf(), (string)($_GET['_csrf'] ?? ''))) { http_response_code(400); exit('Expired link. Go back and try again.'); }
$what = (string)($_GET['what'] ?? '');
$map = [
    'donations' => ['donations', ['id', 'type', 'at', 'fund', 'amount', 'currency', 'status', 'paypal_ref', 'note', 'lang']],
    'subscribers' => ['subscribers', ['email', 'lang', 'status', 'requested_at', 'confirmed_at', 'unsubscribed_at']],
    'messages' => ['messages', ['at', 'name', 'email', 'topic', 'lang', 'status', 'message']],
    'achievements' => ['impact', ['country', 'metric', 'value', 'period_start', 'period_end', 'location', 'spent', 'verified', 'status']],
];
if (!isset($map[$what]) || !can($map[$what][0] === 'impact' ? 'impact' : $map[$what][0])) { http_response_code(403); exit('Not allowed.'); }
[$perm, $cols] = $map[$what];
$rows = nr_load($what);
if ($what === 'subscribers' && empty($_GET['all'])) $rows = array_filter($rows, fn($r) => ($r['status'] ?? '') === 'confirmed');
audit('export', $what, count($rows) . ' rows');
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="norraid-' . $what . '-' . date('Y-m-d') . '.csv"');
$out = fopen('php://output', 'w');
fwrite($out, "\xEF\xBB\xBF");
fputcsv($out, $cols);
foreach ($rows as $r) {
    $line = [];
    foreach ($cols as $c) { $v = $r[$c] ?? ''; $v = is_array($v) ? loc($v) : (is_bool($v) ? ($v ? 'yes' : 'no') : (string)$v); $line[] = preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v; }
    fputcsv($out, $line);
}

<?php
require __DIR__ . '/inc.php';
require_admin();
$orders = array_reverse(eb_load('orders'));
$st = (string)($_GET['status'] ?? '');
$q = trim((string)($_GET['q'] ?? ''));
if ($st !== '') $orders = array_filter($orders, fn($o) => $o['status'] === $st);
if (!empty($_GET['unpaid'])) $orders = array_filter($orders, fn($o) => $o['payment'] !== 'cod' && empty($o['paid']) && $o['status'] !== 'cancelled');
if ($q !== '') {
    $nq = normalize_phone($q);
    $orders = array_filter($orders, fn($o) => stripos($o['number'], $q) !== false || mb_stripos($o['customer']['name'], $q) !== false || ($nq !== '' && strpos($o['customer']['phone'], $nq) !== false));
}

if (!empty($_GET['export'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="elegance-orders-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['رقم الطلب', 'التاريخ', 'الحالة', 'الاسم', 'الموبايل', 'موبايل 2', 'المحافظة', 'المدينة', 'العنوان', 'المنتجات', 'المجموع', 'الخصم', 'الشحن', 'الإجمالي', 'الدفع', 'مدفوع', 'ملاحظات']);
    foreach ($orders as $o) {
        $c = $o['customer'];
        fputcsv($out, [$o['number'], $o['created'], status_label($o['status']), $c['name'], $c['phone'], $c['phone2'], gov_name($c['gov']), $c['city'], $c['address'],
            implode(' | ', array_map(fn($i) => $i['name'] . ' ×' . $i['qty'], $o['items'])), $o['subtotal'], $o['discount'], $o['shipping'], $o['total'], payment_label($o['payment']), !empty($o['paid']) ? 'نعم' : 'لا', $c['notes']]);
    }
    exit;
}

$counts = array_count_values(array_map(fn($o) => $o['status'], eb_load('orders')));
admin_head('الطلبات', 'orders');
$statuses = ['new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
?>
<div class="toolbar">
  <div class="tabs">
    <a href="orders.php" class="<?= $st === '' && empty($_GET['unpaid']) ? 'is-on' : '' ?>">الكل <sup><?= count(eb_load('orders')) ?></sup></a>
    <?php foreach ($statuses as $s): ?><a href="?status=<?= $s ?>" class="<?= $st === $s ? 'is-on' : '' ?>"><?= status_label($s) ?> <sup><?= $counts[$s] ?? 0 ?></sup></a><?php endforeach; ?>
  </div>
  <form class="search-f"><input name="q" value="<?= e($q) ?>" placeholder="رقم الطلب، الاسم أو الموبايل"><?php if ($st): ?><input type="hidden" name="status" value="<?= e($st) ?>"><?php endif; ?></form>
  <a class="btn btn--ghost" href="?<?= e(http_build_query(array_merge($_GET, ['export' => 1]))) ?>">⬇ تصدير Excel</a>
</div>
<div class="card card--flush">
<?php if (!$orders): ?><p class="muted pad">مفيش طلبات هنا.</p><?php else: ?>
<table class="tbl tbl--orders">
  <thead><tr><th>الطلب</th><th>العميل</th><th>المحافظة</th><th>المنتجات</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th></tr></thead>
  <tbody>
  <?php foreach ($orders as $o): $c = $o['customer']; ?>
    <tr onclick="location='order.php?id=<?= e($o['number']) ?>'">
      <td><b><?= e($o['number']) ?></b><br><small><?= fmt_date($o['created']) ?></small></td>
      <td><?= e($c['name']) ?><br><small dir="ltr"><?= e($c['phone']) ?></small></td>
      <td><?= e(gov_name($c['gov'])) ?></td>
      <td><?= array_sum(array_map(fn($i) => $i['qty'], $o['items'])) ?> قطعة</td>
      <td><b><?= egp($o['total']) ?></b></td>
      <td><?= payment_label($o['payment']) ?><?php if ($o['payment'] !== 'cod'): ?><br><small class="<?= !empty($o['paid']) ? 'ok' : 'warn' ?>"><?= !empty($o['paid']) ? '✓ تم الدفع' : ($o['receipt'] ? 'إيصال مرفوع' : 'في انتظار التحويل') ?></small><?php endif; ?></td>
      <td><?= status_badge($o['status']) ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<?php endif; ?>
</div>
<?php admin_foot();

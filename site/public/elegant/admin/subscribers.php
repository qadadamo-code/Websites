<?php
require __DIR__ . '/inc.php';
require_admin();
$subs = array_reverse(eb_load('subscribers'));
if (!empty($_GET['export'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="elegance-subscribers.csv"');
    $o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF"); fputcsv($o, ['email', 'date', 'lang']);
    foreach ($subs as $s) fputcsv($o, [$s['email'], $s['at'], $s['lang']]);
    exit;
}
// customers who ordered, for remarketing
$customers = [];
foreach (eb_load('orders') as $o) {
    $ph = $o['customer']['phone'];
    $customers[$ph] = $customers[$ph] ?? ['name' => $o['customer']['name'], 'phone' => $ph, 'orders' => 0, 'spent' => 0];
    $customers[$ph]['orders']++;
    if ($o['status'] !== 'cancelled') $customers[$ph]['spent'] += $o['total'];
}
usort($customers, fn($a, $b) => $b['spent'] <=> $a['spent']);
admin_head('العملاء والمشتركات', 'subscribers');
?>
<div class="grid2">
  <div class="card card--flush">
    <div class="card__head pad"><h2>العملاء (<?= count($customers) ?>)</h2></div>
    <?php if (!$customers): ?><p class="muted pad">هيظهروا هنا بعد أول طلب.</p><?php else: ?>
    <table class="tbl"><thead><tr><th>الاسم</th><th>الموبايل</th><th>الطلبات</th><th>إجمالي الشراء</th></tr></thead><tbody>
      <?php foreach ($customers as $c): ?><tr><td><?= e($c['name']) ?></td><td dir="ltr"><a href="https://wa.me/2<?= e($c['phone']) ?>" target="_blank"><?= e($c['phone']) ?></a></td><td><?= $c['orders'] ?></td><td><?= egp($c['spent']) ?></td></tr><?php endforeach; ?>
    </tbody></table><?php endif; ?>
  </div>
  <div class="card card--flush">
    <div class="card__head pad"><h2>مشتركات النشرة (<?= count($subs) ?>)</h2><?php if ($subs): ?><a href="?export=1">⬇ تصدير</a><?php endif; ?></div>
    <?php if (!$subs): ?><p class="muted pad">لسه مفيش مشتركات.</p><?php else: ?>
    <table class="tbl"><tbody><?php foreach ($subs as $s): ?><tr><td dir="ltr"><?= e($s['email']) ?></td><td><small><?= fmt_date($s['at']) ?></small></td></tr><?php endforeach; ?></tbody></table><?php endif; ?>
  </div>
</div>
<?php admin_foot();

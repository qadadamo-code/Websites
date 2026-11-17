<?php
require __DIR__ . '/inc.php';
require_admin();
$all = al_load('bookings');
$c = al_load('content');
$count = fn($f) => count(array_filter($all, $f));
$today = date('Y-m-d');
$stats = [
    ['طلبات جديدة', $count(fn($b) => $b['status'] === 'new'), 'orange'],
    ['حفلات قادمة', $count(fn($b) => $b['type'] === 'party' && $b['date'] >= $today && !in_array($b['status'], ['cancelled', 'done'])), 'navy'],
    ['طلبات تأجير', $count(fn($b) => $b['type'] === 'rental' && !in_array($b['status'], ['cancelled', 'done'])), 'red'],
    ['قيمة المؤكد (درهم)', number_format(array_sum(array_map(fn($b) => $b['status'] === 'confirmed' ? (int)$b['estimate'] : 0, $all))), 'sky'],
];
admin_head('الرئيسية', 'index');
?>
<section class="stats"><?php foreach ($stats as [$l, $v, $col]): ?><div class="stat stat--<?= $col ?>"><b><?= e($v) ?></b><span><?= e($l) ?></span></div><?php endforeach; ?></section>
<section class="card">
  <div class="card__h"><h2>آخر الطلبات</h2><a class="btn btn--ghost" href="bookings.php">كل الطلبات</a></div>
  <?php if (!$all): ?><p class="muted empty">لا توجد طلبات بعد. أي حجز من الموقع سيظهر هنا فوراً.</p><?php else: ?>
  <table class="tbl"><thead><tr><th>المرجع</th><th>النوع</th><th>العميل</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>
  <?php foreach (array_slice($all, 0, 8) as $b): ?>
    <tr onclick="location='booking.php?ref=<?= e($b['ref']) ?>'"><td><b><?= e($b['ref']) ?></b></td><td><?= e(TYPES[$b['type']] ?? $b['type']) ?></td><td><?= e($b['name']) ?><small><?= e($b['phone']) ?></small></td><td><?= e($b['date'] ?: '—') ?></td><td><?= status_badge($b['status']) ?></td></tr>
  <?php endforeach; ?></tbody></table><?php endif; ?>
</section>
<section class="grid2">
  <a class="tile" href="content.php?c=packages"><b><?= count($c['packages'] ?? []) ?></b> باقات حفلات</a>
  <a class="tile" href="content.php?c=rentals"><b><?= count($c['rentals'] ?? []) ?></b> ألعاب تأجير</a>
  <a class="tile" href="content.php?c=zones"><b><?= count($c['zones'] ?? []) ?></b> مناطق لعب</a>
  <a class="tile" href="content.php?c=branches"><b><?= count($c['branches'] ?? []) ?></b> فروع</a>
</section>
<?php admin_foot();

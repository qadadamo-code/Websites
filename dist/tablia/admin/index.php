<?php
require __DIR__ . '/inc.php';
require_admin();
$orders = bc_load('orders'); $res = bc_load('reservations'); $items = bc_load('items'); $cats = bc_load('categories');
$coupons = bc_load('coupons'); $packs = bc_load('packages'); $s = settings();
$valid = array_filter($orders, fn($o) => ($o['status'] ?? '') !== 'cancelled');
$t = today(); $weekAgo = date('Y-m-d', strtotime('-6 days')); $tomorrow = date('Y-m-d', strtotime('+1 day'));
$todayO = array_filter($valid, fn($o) => substr($o['at'], 0, 10) === $t);
$weekO = array_filter($valid, fn($o) => substr($o['at'], 0, 10) >= $weekAgo);
$weekRev = array_sum(array_column($weekO, 'total'));
$avg = $weekO ? $weekRev / count($weekO) : 0;
$dueToday = array_filter($valid, fn($o) => ($o['day'] ?? '') === $t && ($o['status'] ?? '') !== 'done');
$dueTomorrow = array_filter($valid, fn($o) => ($o['day'] ?? '') === $tomorrow);
$upRes = array_values(array_filter($res, fn($r) => ($r['date'] ?? '') >= $t && ($r['status'] ?? '') !== 'cancelled'));
usort($upRes, fn($a, $b) => strcmp($a['date'] . ($a['time'] ?? ''), $b['date'] . ($b['time'] ?? '')));
$pipeline = array_sum(array_map(fn($r) => (float)($r['estimate'] ?? 0), $upRes));
$guests = array_sum(array_map(fn($r) => (int)($r['guests'] ?? 0), $upRes));
// last 14 days chart
$days = [];
for ($i = 13; $i >= 0; $i--) { $d = date('Y-m-d', strtotime("-$i days")); $days[$d] = ['n' => 0, 'rev' => 0]; }
foreach ($valid as $o) { $d = substr($o['at'], 0, 10); if (isset($days[$d])) { $days[$d]['n']++; $days[$d]['rev'] += $o['total']; } }
$maxRev = max(1, max(array_column($days, 'rev')));
// top items (30 days)
$top = []; $since = date('Y-m-d', strtotime('-30 days'));
foreach ($valid as $o) { if (substr($o['at'], 0, 10) < $since) continue; foreach ($o['items'] as $l) { $top[$l['name']] = ($top[$l['name']] ?? 0) + $l['qty']; } }
arsort($top); $top = array_slice($top, 0, 6, true); $topMax = $top ? max($top) : 1;
$visibleItems = count(array_filter($items, fn($i) => !empty($i['visible'])));
$soldOut = count(array_filter($items, fn($i) => empty($i['available'])));
$onSale = count(array_filter($items, fn($i) => !empty($i['sale']) && in_window($i['saleFrom'] ?? null, $i['saleTo'] ?? null))) + count(array_filter($cats, fn($c) => !empty($c['discount'])));
$activeCoupons = count(array_filter($coupons, fn($c) => !empty($c['active'])));
$months = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
$dows = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
$money = can('orders.view', 'reports.view'); $seeRes = can('res.view'); $seeItems = can('items.edit');
$hour = (int)date('G'); $greet = $hour < 12 ? 'صباح الفل' : 'مساء الفل';
$heads = ''; if (can('orders.edit')) $heads .= '<a class="b" href="order.php">' . icon('plus') . ' طلب يدوي</a>'; if (can('res.edit')) $heads .= '<a class="b b--primary" href="reservation.php">' . icon('plus') . ' عزومة جديدة</a>';
admin_head('الرئيسية', 'index', $heads);
?>
<section class="hello">
  <div class="mama-card">
    <img src="../assets/brand/badge.webp" alt="ماما رحاب">
    <div><h2><?= $greet ?>، <?= e(me()['name'] ?? '') ?></h2>
      <p><?= $dows[(int)date('w')] . ' ' . (int)date('j') . ' ' . $months[(int)date('n')] ?> · <q><?= e($s['mama']['quote'] ?? 'الأكل الحلو بيبدأ من نَفَس حلو') ?></q></p></div>
  </div>
  <div class="hello__quick">
    <?php if (can('kitchen.view')): ?><a class="b" href="kitchen.php"><?= icon('pot') ?> خطة مطبخ النهارده</a><?php endif; ?>
    <?php if (can('pack.edit')): ?><a class="b" href="packages.php"><?= icon('events') ?> الباقات</a><?php endif; ?>
    <?php if (can('disc.edit')): ?><a class="b" href="discounts.php#new"><?= icon('disc') ?> كود خصم</a><?php endif; ?>
    <?php if (can('reports.view')): ?><a class="b" href="reports.php"><?= icon('chart') ?> التقارير</a><?php endif; ?>
    <a class="b" href="../" target="_blank"><?= icon('ext') ?> الموقع</a>
  </div>
</section>

<section class="kpis">
  <?php if ($money): ?>
  <div class="kpi"><span>طلبات اتسجلت النهارده</span><b class="latin"><?= count($todayO) ?></b><small><?= egp(array_sum(array_column($todayO, 'total'))) ?></small></div>
  <div class="kpi"><span>تسليمات النهارده / بكرة</span><b class="latin"><?= count($dueToday) ?> / <?= count($dueTomorrow) ?></b><small>حسب يوم التسليم اللي اختاره العميل</small></div>
  <div class="kpi"><span>مبيعات آخر 7 أيام</span><b class="latin"><?= number_format($weekRev) ?></b><small><?= count($weekO) ?> طلب · متوسط <?= egp($avg) ?></small></div>
  <?php endif; if ($seeRes): ?>
  <div class="kpi"><span>عزايم ومناسبات قادمة</span><b class="latin"><?= count($upRes) ?></b><small><?= number_format($guests) ?> فرد · متوقع <?= egp($pipeline) ?></small></div>
  <?php endif; ?>
  <div class="kpi"><span>المنيو</span><b class="latin"><?= $visibleItems ?></b><small><?= $soldOut ?> خلصان · <?= $onSale ?> خصم · <?= count($packs) ?> باقة</small></div>
</section>

<?php if ($money): ?>
<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>المبيعات · آخر 14 يوم</h3><?php if (can('reports.view')): ?><a href="reports.php">التقارير الكاملة ←</a><?php endif; ?></div>
    <div class="chart">
      <?php foreach ($days as $d => $v): $h = $v['rev'] / $maxRev * 100; ?>
        <div class="chart__col" title="<?= e(date('d/m', strtotime($d)) . ' · ' . $v['n'] . ' طلب · ' . egp($v['rev'])) ?>">
          <i style="height:<?= max(2, round($h)) ?>%"></i><span class="latin"><?= date('d', strtotime($d)) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الأكثر طلبًا · 30 يوم</h3></div>
    <?php if (!$top): ?><p class="empty">لسه مفيش طلبات. أول طلب من الموقع هيظهر هنا.</p><?php endif; ?>
    <ul class="bars"><?php foreach ($top as $n => $q): ?><li><span><?= e($n) ?></span><i style="width:<?= round($q / $topMax * 100) ?>%"></i><b class="latin"><?= $q ?></b></li><?php endforeach; ?></ul>
  </section>
</div>
<?php endif; ?>

<div class="cols">
  <?php if (can('orders.view')): ?>
  <section class="card card--wide">
    <div class="card__head"><h3>أحدث الطلبات</h3><a href="orders.php">عرض الكل ←</a></div>
    <?php if (!$orders): ?><p class="empty">لسه مفيش طلبات. كل طلب العميل يبعته من الموقع على واتساب بيتسجل هنا تلقائيًا.</p><?php endif; ?>
    <div class="list">
      <?php foreach (array_slice($orders, 0, 6) as $o): ?>
      <a class="row" href="orders.php?open=<?= e($o['id']) ?>">
        <div><b><?= e($o['name']) ?></b><small><?= count($o['items']) ?> صنف · <?= e($o['type']) ?><?= !empty($o['day']) ? ' · تسليم ' . e(date('d/m', strtotime($o['day']))) : '' ?> · <?= ago($o['at']) ?></small></div>
        <div class="row__end"><b class="latin"><?= egp($o['total']) ?></b><?= badge($o['status'], ORDER_ST) ?></div>
      </a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; if ($seeRes): ?>

  <section class="card">
    <div class="card__head"><h3>العزايم القادمة</h3><a href="reservations.php">إدارة ←</a></div>
    <?php if (!$upRes): ?><p class="empty">مفيش عزايم قادمة. <?php if (can('res.edit')): ?><a href="reservation.php">سجّل عزومة</a><?php endif; ?></p><?php endif; ?>
    <div class="list">
      <?php foreach (array_slice($upRes, 0, 5) as $r): ?>
      <a class="row" href="reservation.php?id=<?= e($r['id']) ?>">
        <div><b><?= e($r['name']) ?> · <?= e($r['occasion'] ?: 'عزومة') ?></b><small class="latin"><?= e(date('d/m', strtotime($r['date'])) . (!empty($r['time']) ? ' · ' . $r['time'] : '')) ?> · <?= e($r['packageName'] ?? '') ?></small></div>
        <div class="row__end"><b class="latin"><?= (int)$r['guests'] ?></b><small>فرد</small></div>
      </a>
      <?php endforeach; ?>
    </div>
    <div class="mini-stats"><span><?= $activeCoupons ?> كود خصم فعّال</span><span><?= count(array_filter($res, fn($r) => ($r['status'] ?? '') === 'new')) ?> عزومة مستنية رد</span></div>
  </section>
  <?php endif; ?>
</div>
<?php admin_foot();

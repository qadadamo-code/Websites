<?php
require __DIR__ . '/inc.php';
require_admin();
$orders = bc_load('orders'); $res = bc_load('reservations'); $items = bc_load('items'); $cats = bc_load('categories');
$events = bc_load('events'); $rsvps = bc_load('rsvps'); $coupons = bc_load('coupons');
$valid = array_filter($orders, fn($o) => ($o['status'] ?? '') !== 'cancelled');
$t = today(); $weekAgo = date('Y-m-d', strtotime('-6 days'));
$todayO = array_filter($valid, fn($o) => substr($o['at'], 0, 10) === $t);
$weekO = array_filter($valid, fn($o) => substr($o['at'], 0, 10) >= $weekAgo);
$weekRev = array_sum(array_column($weekO, 'total'));
$avg = $weekO ? $weekRev / count($weekO) : 0;
$upRes = array_filter($res, fn($r) => ($r['date'] ?? '') >= $t && ($r['status'] ?? '') !== 'cancelled');
$upEv = array_values(array_filter($events, fn($ev) => ($ev['date'] ?? '') >= $t));
usort($upEv, fn($a, $b) => strcmp($a['date'], $b['date']));
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
$hour = (int)date('G'); $greet = $hour < 12 ? 'صباح الخير' : 'مساء الخير';
admin_head('الرئيسية', 'index', '<a class="b b--primary" href="item.php">' . icon('plus') . ' صنف جديد</a>');
?>
<section class="hello">
  <div><h2><?= $greet ?> ☕</h2><p>هذه نظرة سريعة على باركود اليوم، <?= (int)date('j') . ' ' . $months[(int)date('n')] ?>.</p></div>
  <div class="hello__quick">
    <a class="b" href="event.php"><?= icon('events') ?> فعالية جديدة</a>
    <a class="b" href="discounts.php#new"><?= icon('disc') ?> كود خصم</a>
    <a class="b" href="../" target="_blank"><?= icon('ext') ?> الموقع</a>
  </div>
</section>

<section class="kpis">
  <div class="kpi"><span>طلبات اليوم</span><b class="latin"><?= count($todayO) ?></b><small><?= egp(array_sum(array_column($todayO, 'total'))) ?></small></div>
  <div class="kpi"><span>مبيعات آخر 7 أيام</span><b class="latin"><?= number_format($weekRev) ?></b><small><?= count($weekO) ?> طلب · متوسط <?= egp($avg) ?></small></div>
  <div class="kpi"><span>حجوزات قادمة</span><b class="latin"><?= count($upRes) ?></b><small><?= count(array_filter($res, fn($r) => ($r['status'] ?? '') === 'new')) ?> بانتظار التأكيد</small></div>
  <div class="kpi"><span>المنيو</span><b class="latin"><?= $visibleItems ?></b><small><?= $soldOut ?> نافد · <?= $onSale ?> خصم فعّال</small></div>
</section>

<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>المبيعات · آخر 14 يوم</h3><span class="muted">بالجنيه</span></div>
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
    <?php if (!$top): ?><p class="empty">لا توجد طلبات بعد. أول طلب من الموقع سيظهر هنا.</p><?php endif; ?>
    <ul class="bars"><?php foreach ($top as $n => $q): ?><li><span><?= e($n) ?></span><i style="width:<?= round($q / $topMax * 100) ?>%"></i><b class="latin"><?= $q ?></b></li><?php endforeach; ?></ul>
  </section>
</div>

<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>أحدث الطلبات</h3><a href="orders.php">عرض الكل ←</a></div>
    <?php if (!$orders): ?><p class="empty">لم تصل طلبات بعد. كل طلب يرسله العميل من الموقع على واتساب يُسجَّل هنا تلقائيًا.</p><?php endif; ?>
    <div class="list">
      <?php foreach (array_slice($orders, 0, 6) as $o): ?>
      <a class="row" href="orders.php?open=<?= e($o['id']) ?>">
        <div><b><?= e($o['name']) ?></b><small><?= count($o['items']) ?> صنف · <?= e($o['type']) ?> · <?= ago($o['at']) ?></small></div>
        <div class="row__end"><b class="latin"><?= egp($o['total']) ?></b><?= badge($o['status'], ORDER_ST) ?></div>
      </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الفعاليات القادمة</h3><a href="events.php">إدارة ←</a></div>
    <?php if (!$upEv): ?><p class="empty">لا توجد فعاليات قادمة. <a href="event.php">أنشئ دعوة الآن</a></p><?php endif; ?>
    <div class="list">
      <?php foreach (array_slice($upEv, 0, 4) as $ev): $n = event_rsvp_count($ev['id']); ?>
      <a class="row" href="event.php?id=<?= e($ev['id']) ?>">
        <div><b><?= e($ev['title']) ?></b><small class="latin"><?= e(date('d/m', strtotime($ev['date'])) . ($ev['time'] ? ' · ' . $ev['time'] : '')) ?></small></div>
        <div class="row__end"><b class="latin"><?= $n ?><?= !empty($ev['capacity']) ? '/' . (int)$ev['capacity'] : '' ?></b><small>ضيف</small></div>
      </a>
      <?php endforeach; ?>
    </div>
    <div class="mini-stats"><span><?= $activeCoupons ?> كود خصم فعّال</span><span><?= count($rsvps) ?> دعوة مسجّلة</span></div>
  </section>
</div>
<?php admin_foot();

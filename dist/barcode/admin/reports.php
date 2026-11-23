<?php
/** Sales, menu, discounts, reservations and events reports for any period, with comparison and CSV export. */
require __DIR__ . '/inc.php';
require_perm('reports.view');

/* ---------- period ---------- */
$pre = (string)($_GET['p'] ?? '30');
$t = today();
switch ($pre) {
    case 'today': $from = $to = $t; break;
    case '7': $from = date('Y-m-d', strtotime('-6 days')); $to = $t; break;
    case 'month': $from = date('Y-m-01'); $to = $t; break;
    case 'lastmonth': $from = date('Y-m-01', strtotime('first day of last month')); $to = date('Y-m-t', strtotime('last day of last month')); break;
    case 'year': $from = date('Y-01-01'); $to = $t; break;
    case 'custom':
        $from = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['from'] ?? '') ? $_GET['from'] : date('Y-m-d', strtotime('-29 days'));
        $to = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['to'] ?? '') ? $_GET['to'] : $t;
        if ($from > $to) [$from, $to] = [$to, $from];
        break;
    default: $pre = '30'; $from = date('Y-m-d', strtotime('-29 days')); $to = $t;
}
$span = (int)round((strtotime($to) - strtotime($from)) / 86400) + 1;
$pFrom = date('Y-m-d', strtotime($from . ' -' . $span . ' days')); $pTo = date('Y-m-d', strtotime($from . ' -1 day'));
$inR = fn(string $d, string $a, string $b) => $d >= $a && $d <= $b;

/* ---------- data ---------- */
$orders = bc_load('orders');
$items = bc_load('items'); $itemCat = []; foreach ($items as $it) $itemCat[$it['id']] = $it['cat'];
$catT = []; foreach (sort_by_order(bc_load('categories')) as $c) $catT[$c['id']] = $c['title'];
$all = array_values(array_filter($orders, fn($o) => $inR(substr($o['at'], 0, 10), $from, $to)));
$valid = array_values(array_filter($all, fn($o) => ($o['status'] ?? '') !== 'cancelled'));
$cancel = array_values(array_filter($all, fn($o) => ($o['status'] ?? '') === 'cancelled'));
$prev = array_values(array_filter($orders, fn($o) => ($o['status'] ?? '') !== 'cancelled' && $inR(substr($o['at'], 0, 10), $pFrom, $pTo)));

$sum = fn(array $l, string $k) => array_sum(array_map(fn($o) => (float)($o[$k] ?? 0), $l));
$rev = $sum($valid, 'total'); $pRev = $sum($prev, 'total');
$n = count($valid); $pN = count($prev);
$avg = $n ? $rev / $n : 0; $pAvg = $pN ? $pRev / $pN : 0;
$disc = $sum($valid, 'discount'); $gross = $sum($valid, 'subtotal');
$qty = 0; foreach ($valid as $o) foreach ($o['items'] as $l) $qty += (int)$l['qty'];
$paidRev = $sum(array_filter($valid, fn($o) => !empty($o['paid'])), 'total');
$delta = function ($a, $b): string {
    if (!$b) return $a ? '<em class="up">جديد</em>' : '';
    $d = ($a - $b) / $b * 100;
    return '<em class="' . ($d >= 0 ? 'up' : 'down') . '"><span class="latin">' . ($d >= 0 ? '+' : '') . round($d) . '%</span> عن الفترة السابقة</em>';
};

/* daily (or monthly when the span is long) */
$byMonth = $span > 62; $series = [];
for ($d = $from; $d <= $to; $d = date('Y-m-d', strtotime($d . ' +1 day'))) { $k = $byMonth ? substr($d, 0, 7) : $d; $series[$k] = $series[$k] ?? ['n' => 0, 'rev' => 0]; }
foreach ($valid as $o) { $k = $byMonth ? substr($o['at'], 0, 7) : substr($o['at'], 0, 10); if (isset($series[$k])) { $series[$k]['n']++; $series[$k]['rev'] += $o['total']; } }
$maxS = max(1, max(array_column($series, 'rev') ?: [1]));
$best = $series ? array_search(max(array_column($series, 'rev')), array_column($series, 'rev')) : null;
$bestKey = $best !== null ? array_keys($series)[$best] : '';

/* hour + weekday */
$hours = array_fill(0, 24, 0); $wd = array_fill(0, 7, ['n' => 0, 'rev' => 0]);
foreach ($valid as $o) { $ts = strtotime($o['at']); $hours[(int)date('G', $ts)]++; $w = (int)date('w', $ts); $wd[$w]['n']++; $wd[$w]['rev'] += $o['total']; }
$maxH = max(1, max($hours)); $maxW = max(1, max(array_column($wd, 'rev')));
$peakH = array_search(max($hours), $hours);
$wdNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/* breakdowns */
$group = function (array $list, callable $key): array {
    $g = []; foreach ($list as $o) { $k = $key($o); $g[$k] = $g[$k] ?? ['n' => 0, 'rev' => 0]; $g[$k]['n']++; $g[$k]['rev'] += $o['total']; }
    uasort($g, fn($a, $b) => $b['rev'] <=> $a['rev']); return $g;
};
$byType = $group($valid, fn($o) => $o['type'] ?: 'غير محدد');
$byPay = $group($valid, fn($o) => PAY_METHODS[$o['pay'] ?? ''] ?? 'غير محدد');
$byPay = array_combine(array_map(fn($k) => $k === '' || $k === '—' ? 'لم يُسجَّل' : $k, array_keys($byPay)), array_values($byPay));
$byCh = $group($valid, fn($o) => ($o['channel'] ?? '') === 'manual' ? 'يدوي (تليفون/كاشير)' : 'من الموقع');
$bySt = []; foreach ($all as $o) { $s = ORDER_ST[$o['status'] ?? 'new'] ?? $o['status']; $bySt[$s] = ($bySt[$s] ?? 0) + 1; } arsort($bySt);

/* items + categories */
$top = []; $cats = [];
foreach ($valid as $o) foreach ($o['items'] as $l) {
    $k = $l['name']; $v = $l['price'] * $l['qty'];
    $top[$k] = $top[$k] ?? ['q' => 0, 'rev' => 0, 'cat' => '']; $top[$k]['q'] += $l['qty']; $top[$k]['rev'] += $v;
    $cid = $itemCat[$l['id'] ?? ''] ?? ''; $ct = $catT[$cid] ?? 'خارج المنيو';
    $top[$k]['cat'] = $ct;
    $cats[$ct] = $cats[$ct] ?? ['q' => 0, 'rev' => 0]; $cats[$ct]['q'] += $l['qty']; $cats[$ct]['rev'] += $v;
}
uasort($top, fn($a, $b) => $b['rev'] <=> $a['rev']); uasort($cats, fn($a, $b) => $b['rev'] <=> $a['rev']);
$sold = array_keys($top);
$never = array_values(array_filter($items, fn($it) => !empty($it['visible']) && !in_array($it['name'], $sold, true)));

/* coupons */
$cp = []; foreach ($valid as $o) { $c = strtoupper(trim($o['coupon'] ?? '')); if ($c === '' && empty($o['discount'])) continue; $c = $c ?: 'خصم يدوي'; $cp[$c] = $cp[$c] ?? ['n' => 0, 'd' => 0, 'rev' => 0]; $cp[$c]['n']++; $cp[$c]['d'] += (float)($o['discount'] ?? 0); $cp[$c]['rev'] += $o['total']; }
uasort($cp, fn($a, $b) => $b['n'] <=> $a['n']);

/* reservations */
$res = array_values(array_filter(bc_load('reservations'), fn($r) => $inR($r['date'] ?? '', $from, $to)));
$resSt = []; foreach ($res as $r) { $s = RES_ST[$r['status'] ?? 'new'] ?? $r['status']; $resSt[$s] = ($resSt[$s] ?? 0) + 1; }
$resGuests = array_sum(array_map(fn($r) => (int)$r['guests'], array_filter($res, fn($r) => ($r['status'] ?? '') !== 'cancelled')));
$noshow = count(array_filter($res, fn($r) => ($r['status'] ?? '') === 'noshow'));
$done = count(array_filter($res, fn($r) => in_array($r['status'] ?? '', ['seated', 'noshow'], true)));

/* events */
$rsvps = bc_load('rsvps');
$evs = array_values(array_filter(bc_load('events'), fn($e) => $inR($e['date'] ?? '', $from, $to)));
usort($evs, fn($a, $b) => strcmp($a['date'], $b['date']));
$evRows = array_map(function ($e) use ($rsvps) {
    $g = array_filter($rsvps, fn($r) => $r['event'] === $e['id'] && ($r['status'] ?? '') !== 'cancelled');
    $guests = array_sum(array_map(fn($r) => (int)$r['guests'], $g));
    $in = array_sum(array_map(fn($r) => (int)$r['guests'], array_filter($g, fn($r) => !empty($r['checkedIn']))));
    return ['ev' => $e, 'rsvp' => count($g), 'guests' => $guests, 'in' => $in];
}, $evs);

/* ---------- CSV ---------- */
$x = (string)($_GET['export'] ?? '');
if ($x !== '' && can('export')) {
    if ($x === 'items') csv_download('report-items', ['الصنف', 'القسم', 'الكمية', 'الإيراد'], array_map(fn($k, $v) => [$k, $v['cat'], $v['q'], $v['rev']], array_keys($top), $top));
    if ($x === 'days') csv_download('report-days', ['الفترة', 'الطلبات', 'الإيراد'], array_map(fn($k, $v) => [$k, $v['n'], $v['rev']], array_keys($series), $series));
    if ($x === 'summary') csv_download('report-summary', ['البند', 'القيمة'], [
        ['من', $from], ['إلى', $to], ['صافي المبيعات', $rev], ['قبل الخصم', $gross], ['الخصومات', $disc], ['عدد الطلبات', $n], ['متوسط الفاتورة', round($avg, 2)],
        ['أصناف مباعة', $qty], ['طلبات ملغاة', count($cancel)], ['قيمة الملغي', $sum($cancel, 'total')], ['المدفوع المسجّل', $paidRev],
        ['حجوزات', count($res)], ['أفراد الحجوزات', $resGuests], ['لم يحضر', $noshow],
    ]);
}

$qs = fn(array $a) => '?' . http_build_query(array_merge(['p' => $pre, 'from' => $from, 'to' => $to], $a));
$presets = ['today' => 'اليوم', '7' => '7 أيام', '30' => '30 يوم', 'month' => 'الشهر ده', 'lastmonth' => 'الشهر اللي فات', 'year' => 'السنة دي'];
$bars = function (array $g, string $metric = 'rev') {
    if (!$g) return '<p class="empty">لا توجد بيانات في الفترة دي.</p>';
    $mx = max(1, max(array_column($g, $metric))); $tot = max(1, array_sum(array_column($g, $metric)));
    $h = '<ul class="bars">';
    foreach ($g as $k => $v) $h .= '<li><span>' . e((string)$k) . '</span><i style="width:' . round($v[$metric] / $mx * 100) . '%"></i><b class="latin">' . ($metric === 'rev' ? number_format($v['rev']) : $v[$metric]) . ' <small>' . round($v[$metric] / $tot * 100) . '%</small></b></li>';
    return $h . '</ul>';
};
admin_head('التقارير', 'reports', can('export') ? '<a class="b" href="' . e($qs(['export' => 'summary'])) . '">' . icon('down') . ' ملخص Excel</a>' : '');
?>
<form class="card rp-bar" method="get">
  <div class="seg seg--links">
    <?php foreach ($presets as $k => $l): ?><a href="?p=<?= $k ?>" class="<?= $pre === $k ? 'on' : '' ?>"><?= $l ?></a><?php endforeach; ?>
  </div>
  <div class="rp-bar__custom">
    <input type="hidden" name="p" value="custom">
    <label>من <input type="date" name="from" value="<?= e($from) ?>"></label>
    <label>إلى <input type="date" name="to" value="<?= e($to) ?>"></label>
    <button class="b b--sm">عرض</button>
  </div>
  <p class="muted rp-bar__note">الفترة: <span class="latin"><?= e(date('d/m/Y', strtotime($from))) ?> ← <?= e(date('d/m/Y', strtotime($to))) ?></span> · <?= $span ?> يوم · المقارنة مع <span class="latin"><?= e(date('d/m', strtotime($pFrom)) . ' ← ' . date('d/m', strtotime($pTo))) ?></span></p>
</form>

<section class="kpis kpis--6">
  <div class="kpi"><span>صافي المبيعات</span><b class="latin"><?= number_format($rev) ?></b><small>ج.م <?= $delta($rev, $pRev) ?></small></div>
  <div class="kpi"><span>عدد الطلبات</span><b class="latin"><?= $n ?></b><small><?= $delta($n, $pN) ?></small></div>
  <div class="kpi"><span>متوسط الفاتورة</span><b class="latin"><?= number_format($avg) ?></b><small>ج.م <?= $delta($avg, $pAvg) ?></small></div>
  <div class="kpi"><span>أصناف مباعة</span><b class="latin"><?= $qty ?></b><small><?= $n ? round($qty / $n, 1) : 0 ?> صنف في الطلب</small></div>
  <div class="kpi"><span>الخصومات</span><b class="latin"><?= number_format($disc) ?></b><small><?= $gross ? round($disc / $gross * 100, 1) : 0 ?>% من قبل الخصم</small></div>
  <div class="kpi"><span>ملغي</span><b class="latin"><?= count($cancel) ?></b><small><?= egp($sum($cancel, 'total')) ?> ضاعت</small></div>
</section>

<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>المبيعات <?= $byMonth ? 'بالشهر' : 'باليوم' ?></h3><span class="muted"><?= $bestKey ? 'أعلى ' . ($byMonth ? 'شهر' : 'يوم') . ': <span class="latin">' . e($byMonth ? $bestKey : date('d/m', strtotime($bestKey))) . '</span>' : '' ?><?= can('export') ? ' · <a href="' . e($qs(['export' => 'days'])) . '">Excel</a>' : '' ?></span></div>
    <div class="chart<?= count($series) > 31 ? ' chart--dense' : '' ?>">
      <?php foreach ($series as $d => $v): ?>
        <div class="chart__col" title="<?= e(($byMonth ? $d : date('d/m', strtotime($d))) . ' · ' . $v['n'] . ' طلب · ' . egp($v['rev'])) ?>">
          <i style="height:<?= max(2, round($v['rev'] / $maxS * 100)) ?>%"></i><span class="latin"><?= $byMonth ? e(substr($d, 5)) : date('d', strtotime($d)) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </section>
  <section class="card">
    <div class="card__head"><h3>حالات الطلبات</h3></div>
    <?php if (!$bySt): ?><p class="empty">لا توجد طلبات في الفترة.</p><?php endif; ?>
    <ul class="bars"><?php $mx = max(1, max($bySt ?: [1])); foreach ($bySt as $k => $v): ?><li><span><?= e($k) ?></span><i style="width:<?= round($v / $mx * 100) ?>%"></i><b class="latin"><?= $v ?></b></li><?php endforeach; ?></ul>
    <div class="mini-stats"><span>المدفوع المسجّل <b class="latin"><?= number_format($paidRev) ?></b></span><span>لسه <b class="latin"><?= number_format(max(0, $rev - $paidRev)) ?></b></span></div>
  </section>
</div>

<div class="cols cols--even">
  <section class="card">
    <div class="card__head"><h3>ساعات الذروة</h3><span class="muted"><?= $n ? 'الأكثر: <span class="latin">' . sprintf('%02d:00', $peakH) . '</span>' : '' ?></span></div>
    <div class="chart chart--hours">
      <?php foreach ($hours as $h => $v): ?><div class="chart__col" title="<?= sprintf('%02d:00', $h) . ' · ' . $v . ' طلب' ?>"><i style="height:<?= max(2, round($v / $maxH * 100)) ?>%"></i><span class="latin"><?= $h % 3 === 0 ? $h : '' ?></span></div><?php endforeach; ?>
    </div>
  </section>
  <section class="card">
    <div class="card__head"><h3>أيام الأسبوع</h3></div>
    <ul class="bars"><?php foreach ([6, 0, 1, 2, 3, 4, 5] as $w): ?><li><span><?= $wdNames[$w] ?></span><i style="width:<?= round($wd[$w]['rev'] / $maxW * 100) ?>%"></i><b class="latin"><?= number_format($wd[$w]['rev']) ?> <small><?= $wd[$w]['n'] ?> طلب</small></b></li><?php endforeach; ?></ul>
  </section>
</div>

<div class="cols cols--3">
  <section class="card"><div class="card__head"><h3>نوع الطلب</h3></div><?= $bars($byType) ?></section>
  <section class="card"><div class="card__head"><h3>طرق الدفع</h3></div><?= $bars($byPay) ?></section>
  <section class="card"><div class="card__head"><h3>مصدر الطلب</h3></div><?= $bars($byCh) ?></section>
</div>

<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>الأصناف الأكثر مبيعًا</h3><span class="muted"><?= count($top) ?> صنف اتباع<?= can('export') ? ' · <a href="' . e($qs(['export' => 'items'])) . '">Excel</a>' : '' ?></span></div>
    <?php if (!$top): ?><p class="empty">لا توجد مبيعات في الفترة دي.</p><?php else: ?>
    <div class="table-wrap" style="border:0;background:none"><table class="tbl rp-top">
      <thead><tr><th>#</th><th>الصنف</th><th>القسم</th><th>الكمية</th><th>الإيراد</th><th>النسبة</th></tr></thead>
      <tbody><?php $i = 0; $tr = max(1, array_sum(array_column($top, 'rev'))); foreach (array_slice($top, 0, 15, true) as $k => $v): $i++; ?>
        <tr><td class="latin muted"><?= $i ?></td><td><b><?= e($k) ?></b></td><td><small><?= e($v['cat']) ?></small></td><td class="latin"><?= $v['q'] ?></td><td class="latin nowrap"><?= egp($v['rev']) ?></td><td><span class="meter"><i style="width:<?= round($v['rev'] / $tr * 100) ?>%"></i></span><small class="latin"><?= round($v['rev'] / $tr * 100, 1) ?>%</small></td></tr>
      <?php endforeach; ?></tbody>
    </table></div>
    <?php endif; ?>
  </section>
  <section class="card">
    <div class="card__head"><h3>المبيعات حسب القسم</h3></div>
    <?= $bars($cats) ?>
    <?php if ($never && $top): ?><details class="never"><summary><?= count($never) ?> صنف ظاهر ماتباعش في الفترة</summary><p><?= e(implode('، ', array_slice(array_column($never, 'name'), 0, 40))) ?></p></details><?php endif; ?>
  </section>
</div>

<div class="cols cols--even">
  <section class="card">
    <div class="card__head"><h3>أكواد الخصم المستخدمة</h3><?= can('disc.edit') ? '<a href="discounts.php">إدارة الخصومات ←</a>' : '' ?></div>
    <?php if (!$cp): ?><p class="empty">مفيش خصومات اتستخدمت في الفترة دي.</p><?php else: ?>
    <div class="tscroll"><table class="tbl"><thead><tr><th>الكود</th><th>مرات</th><th>إجمالي الخصم</th><th>مبيعات بالكود</th></tr></thead><tbody>
      <?php foreach ($cp as $k => $v): ?><tr><td><span class="code"><?= e($k) ?></span></td><td class="latin"><?= $v['n'] ?></td><td class="latin nowrap"><?= egp($v['d']) ?></td><td class="latin nowrap"><?= egp($v['rev']) ?></td></tr><?php endforeach; ?>
    </tbody></table></div>
    <?php endif; ?>
  </section>
  <section class="card">
    <div class="card__head"><h3>الحجوزات</h3><?= can('res.view') ? '<a href="reservations.php">كل الحجوزات ←</a>' : '' ?></div>
    <div class="mini-kpis">
      <div><b class="latin"><?= count($res) ?></b><span>حجز</span></div>
      <div><b class="latin"><?= $resGuests ?></b><span>فرد</span></div>
      <div><b class="latin"><?= $done ? round($noshow / $done * 100) : 0 ?>%</b><span>لم يحضر</span></div>
    </div>
    <?php $mx = max(1, max($resSt ?: [1])); ?>
    <ul class="bars"><?php foreach ($resSt as $k => $v): ?><li><span><?= e($k) ?></span><i style="width:<?= round($v / $mx * 100) ?>%"></i><b class="latin"><?= $v ?></b></li><?php endforeach; ?></ul>
  </section>
</div>

<section class="card">
  <div class="card__head"><h3>الفعاليات والدعوات</h3><?= can('events.edit', 'events.guests') ? '<a href="events.php">كل الفعاليات ←</a>' : '' ?></div>
  <?php if (!$evRows): ?><p class="empty">مفيش فعاليات في الفترة دي.</p><?php else: ?>
  <div class="tscroll"><table class="tbl"><thead><tr><th>الفعالية</th><th>التاريخ</th><th>تسجيلات</th><th>ضيوف مؤكدين</th><th>حضروا فعلًا</th><th>الامتلاء</th></tr></thead><tbody>
    <?php foreach ($evRows as $r): $cap = (int)($r['ev']['capacity'] ?? 0); ?>
    <tr><td><b><?= e($r['ev']['title']) ?></b></td><td class="latin nowrap"><?= e(date('d/m', strtotime($r['ev']['date']))) ?></td><td class="latin"><?= $r['rsvp'] ?></td><td class="latin"><?= $r['guests'] ?></td>
      <td class="latin"><?= $r['in'] ?><?= $r['guests'] ? ' <small>(' . round($r['in'] / $r['guests'] * 100) . '%)</small>' : '' ?></td>
      <td><?php if ($cap): ?><span class="meter"><i style="width:<?= min(100, round($r['guests'] / $cap * 100)) ?>%"></i></span><small class="latin"><?= $r['guests'] ?>/<?= $cap ?></small><?php else: ?><small class="muted">بدون حد</small><?php endif; ?></td></tr>
    <?php endforeach; ?>
  </tbody></table></div>
  <?php endif; ?>
</section>
<?php admin_foot();

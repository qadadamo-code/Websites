<?php
/** Kitchen plan: everything to cook for a delivery day, summed by dish and size, plus the occasions that day. Printable. */
require __DIR__ . '/inc.php';
require_perm('kitchen.view');
$day = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($_GET['d'] ?? '')) ? $_GET['d'] : today();
$withDone = !empty($_GET['all']);
$cats = []; foreach (sort_by_order(bc_load('categories')) as $c) $cats[$c['id']] = $c;
$catOrder = array_flip(array_keys($cats));
$items = []; foreach (bc_load('items') as $it) $items[$it['id']] = $it;

$orders = array_values(array_filter(bc_load('orders'), fn($o) => ($o['day'] ?? substr($o['at'], 0, 10)) === $day
    && ($o['status'] ?? '') !== 'cancelled' && ($withDone || ($o['status'] ?? '') !== 'done')));
usort($orders, fn($a, $b) => strcmp((string)($a['slot'] ?? ''), (string)($b['slot'] ?? '')) ?: strcmp($a['at'], $b['at']));

$plan = [];
foreach ($orders as $o) foreach ($o['items'] as $l) {
    $cid = $l['cat'] ?? ($items[$l['id'] ?? '']['cat'] ?? '');
    $key = $cid . '|' . $l['name'];
    $plan[$key] = $plan[$key] ?? ['cat' => $cid, 'name' => $l['name'], 'sizes' => [], 'qty' => 0, 'orders' => []];
    $z = $l['size'] ?? '';
    $plan[$key]['sizes'][$z] = ($plan[$key]['sizes'][$z] ?? 0) + (int)$l['qty'];
    $plan[$key]['qty'] += (int)$l['qty'];
    $plan[$key]['orders'][$o['no'] ?? ''] = true;
}
uasort($plan, fn($a, $b) => [($catOrder[$a['cat']] ?? 99), $a['name']] <=> [($catOrder[$b['cat']] ?? 99), $b['name']]);
$byCat = []; foreach ($plan as $p) $byCat[$p['cat']][] = $p;

$occ = array_values(array_filter(bc_load('reservations'), fn($r) => ($r['date'] ?? '') === $day && in_array($r['status'] ?? '', ['new', 'quoted', 'confirmed'], true)));
usort($occ, fn($a, $b) => strcmp($a['time'] ?? '', $b['time'] ?? ''));
$packs = []; foreach (bc_load('packages') as $p) $packs[$p['id']] = $p;
$guests = array_sum(array_map(fn($r) => (int)$r['guests'], $occ));

$dows = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
$label = $dows[(int)date('w', strtotime($day))] . ' ' . date('d/m/Y', strtotime($day));
$rel = $day === today() ? 'النهارده' : ($day === date('Y-m-d', strtotime('+1 day')) ? 'بكرة' : '');
$sizeTxt = function (array $sz): string {
    $out = []; foreach ($sz as $z => $q) $out[] = ($z !== '' ? $z . ' × ' : '× ') . $q;
    return implode(' · ', $out);
};
admin_head('خطة المطبخ · ' . $label, 'kitchen', '<button class="b" onclick="print()">' . icon('print') . ' طباعة الخطة</button>');
?>
<form class="kitchen-day no-print" method="get">
  <?php for ($i = -1; $i <= 5; $i++): $dd = date('Y-m-d', strtotime("$i day")); ?>
    <a class="b b--sm<?= $dd === $day ? ' b--primary' : '' ?>" href="?d=<?= $dd ?>"><?= $i === 0 ? 'النهارده' : ($i === 1 ? 'بكرة' : ($i === -1 ? 'امبارح' : $dows[(int)date('w', strtotime($dd))])) ?> <span class="latin"><?= date('d/m', strtotime($dd)) ?></span></a>
  <?php endfor; ?>
  <label class="f" style="margin:0"><input type="date" name="d" value="<?= e($day) ?>" onchange="this.form.submit()"></label>
  <label class="check"><input type="checkbox" name="all" value="1" <?= checked($withDone) ?> onchange="this.form.submit()"> اعرض اللي اتسلم كمان</label>
</form>

<section class="kpis">
  <div class="kpi"><span>طلبات <?= $rel ?: 'اليوم ده' ?></span><b class="latin"><?= count($orders) ?></b><small><?= egp(array_sum(array_column($orders, 'total'))) ?></small></div>
  <div class="kpi"><span>أصناف مختلفة</span><b class="latin"><?= count($plan) ?></b><small><?= array_sum(array_column($plan, 'qty')) ?> وحدة</small></div>
  <div class="kpi"><span>عزايم</span><b class="latin"><?= count($occ) ?></b><small><?= number_format($guests) ?> فرد</small></div>
</section>

<div class="cols kplan">
  <section class="card card--wide">
    <div class="card__head"><h3>المطلوب تجهيزه</h3><span class="muted"><?= e($label) ?></span></div>
    <?php if (!$plan): ?><p class="empty">مفيش طلبات تسليم في اليوم ده.</p><?php endif; ?>
    <?php foreach ($byCat as $cid => $rows): ?>
      <h4 style="margin:14px 0 6px;color:var(--glow);font-family:var(--fd)"><?= e($cats[$cid]['title'] ?? 'أصناف خارج المنيو') ?></h4>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th>الصنف</th><th>الأحجام</th><th>الإجمالي</th><th>في طلبات</th></tr></thead>
        <tbody><?php foreach ($rows as $p): ?>
          <tr><td><b><?= e($p['name']) ?></b></td><td><?= e($sizeTxt($p['sizes'])) ?></td><td><span class="kq latin"><?= $p['qty'] ?></span></td><td><small class="latin"><?= e(implode(' ', array_map(fn($n) => '#' . $n, array_keys($p['orders'])))) ?></small></td></tr>
        <?php endforeach; ?></tbody>
      </table></div>
    <?php endforeach; ?>
  </section>

  <section class="card">
    <div class="card__head"><h3>عزايم اليوم</h3><?php if (can('res.view')): ?><a class="no-print" href="reservations.php">الكل ←</a><?php endif; ?></div>
    <?php if (!$occ): ?><p class="empty">مفيش عزايم في اليوم ده.</p><?php endif; ?>
    <div class="list">
      <?php foreach ($occ as $r): $pk = $packs[$r['package'] ?? ''] ?? null; ?>
      <div class="row" style="flex-direction:column;align-items:stretch;gap:6px">
        <div style="display:flex;justify-content:space-between;gap:8px"><b><?= e($r['name']) ?> · <?= e($r['occasion'] ?: 'عزومة') ?></b><span class="kq latin"><?= (int)$r['guests'] ?></span></div>
        <small><?= !empty($r['time']) ? '<span class="latin">' . e($r['time']) . '</span> · ' : '' ?><?= e($r['packageName'] ?? '') ?> · <?= badge($r['status'], RES_ST) ?></small>
        <?php if ($pk): ?><small style="color:var(--taupe)"><?= e(implode(' • ', array_merge($pk['mains'] ?? [], $pk['apps'] ?? [], $pk['salads'] ?? [], $pk['sweets'] ?? []))) ?></small><?php endif; ?>
        <?php if (!empty($r['address'])): ?><small>📍 <?= e($r['address']) ?></small><?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </section>
</div>

<section class="card">
  <div class="card__head"><h3>طلبات التسليم بالترتيب</h3><span class="muted">للسواق والتغليف</span></div>
  <?php if (!$orders): ?><p class="empty">مفيش طلبات.</p><?php else: ?>
  <div class="table-wrap"><table class="tbl">
    <thead><tr><th>#</th><th>الميعاد</th><th>العميل</th><th>الأصناف</th><th>العنوان</th><th>الإجمالي</th><th>الحالة</th></tr></thead>
    <tbody><?php foreach ($orders as $o): ?>
      <tr><td class="latin"><b>#<?= e($o['no'] ?? '') ?></b></td><td><?= e($o['slot'] ?? '') ?: '—' ?></td>
        <td><b><?= e($o['name']) ?></b><small class="latin" dir="ltr"><?= e($o['phone']) ?></small></td>
        <td><small style="color:var(--taupe)"><?= e(implode('، ', array_map(fn($l) => $l['qty'] . '× ' . $l['name'] . (!empty($l['size']) ? ' ' . $l['size'] : ''), $o['items']))) ?></small></td>
        <td><small><?= e($o['type'] === 'توصيل' ? (($o['zone'] ?? '') ? $o['zone'] . ' · ' : '') . ($o['address'] ?? '') : 'استلام من المطبخ') ?></small></td>
        <td class="latin nowrap"><?= egp($o['total']) ?><?= !empty($o['pay']) ? '<small class="paid">✓ مدفوع</small>' : '' ?></td>
        <td><?= badge($o['status'], ORDER_ST) ?></td></tr>
    <?php endforeach; ?></tbody>
  </table></div>
  <?php endif; ?>
</section>
<?php admin_foot();

<?php
/** Customers built from orders and occasion bookings: how often they order, how much, favourite dishes, one-tap WhatsApp. */
require __DIR__ . '/inc.php';
require_perm('customers.view');
$people = [];
$touch = function (array $row, string $kind) use (&$people) {
    $wa = wa_phone((string)($row['phone'] ?? ''));
    if (strlen($wa) < 10) return null;
    $p = $people[$wa] ?? ['wa' => $wa, 'name' => '', 'phone' => $row['phone'], 'orders' => 0, 'res' => 0, 'spent' => 0.0, 'guests' => 0, 'first' => '', 'last' => '', 'dishes' => [], 'addr' => ''];
    $at = (string)($row['at'] ?? '');
    if ($p['first'] === '' || $at < $p['first']) $p['first'] = $at;
    if ($at >= $p['last']) { $p['last'] = $at; if (!empty($row['name'])) $p['name'] = $row['name']; if (!empty($row['address'])) $p['addr'] = $row['address']; }
    $people[$wa] = $p;
    return $wa;
};
foreach (bc_load('orders') as $o) {
    if (($o['status'] ?? '') === 'cancelled') continue;
    $wa = $touch($o, 'o'); if (!$wa) continue;
    $people[$wa]['orders']++; $people[$wa]['spent'] += (float)$o['total'];
    foreach ($o['items'] as $l) $people[$wa]['dishes'][$l['name']] = ($people[$wa]['dishes'][$l['name']] ?? 0) + (int)$l['qty'];
}
foreach (bc_load('reservations') as $r) {
    if (($r['status'] ?? '') === 'cancelled') continue;
    $wa = $touch($r, 'r'); if (!$wa) continue;
    $people[$wa]['res']++; $people[$wa]['guests'] += (int)($r['guests'] ?? 0);
    if (in_array($r['status'] ?? '', ['confirmed', 'done'], true)) $people[$wa]['spent'] += (float)($r['estimate'] ?? 0);
}
foreach ($people as &$p) { arsort($p['dishes']); $p['fav'] = array_slice(array_keys($p['dishes']), 0, 3); } unset($p);

$q = trim((string)($_GET['q'] ?? '')); $seg = (string)($_GET['seg'] ?? ''); $sort = (string)($_GET['sort'] ?? 'last');
$month = date('c', strtotime('-30 days')); $quarter = date('c', strtotime('-60 days'));
$segs = ['' => 'الكل', 'vip' => 'الأوفياء (3 طلبات+)', 'new' => 'جداد (آخر 30 يوم)', 'sleep' => 'وحشونا (من 60 يوم)', 'feast' => 'أصحاب عزايم'];
$match = function ($p) use ($seg, $month, $quarter) {
    return match ($seg) {
        'vip' => $p['orders'] >= 3, 'new' => $p['first'] >= $month, 'sleep' => $p['last'] < $quarter, 'feast' => $p['res'] > 0, default => true,
    };
};
$list = array_values(array_filter($people, fn($p) => $match($p) && ($q === '' || mb_stripos($p['name'] . ' ' . $p['phone'] . ' ' . $p['wa'], $q) !== false)));
usort($list, fn($a, $b) => match ($sort) { 'spent' => $b['spent'] <=> $a['spent'], 'orders' => ($b['orders'] + $b['res']) <=> ($a['orders'] + $a['res']), default => strcmp($b['last'], $a['last']) });

if (($_GET['export'] ?? '') === 'csv' && can('export')) {
    log_act('تنزيل العملاء', count($list) . ' عميل');
    csv_download('tablia-customers', ['الاسم', 'الموبايل', 'واتساب', 'طلبات', 'عزايم', 'أفراد العزايم', 'إجمالي', 'أول تعامل', 'آخر تعامل', 'الأكلات المفضلة', 'العنوان'],
        array_map(fn($p) => [$p['name'], $p['phone'], '+' . $p['wa'], $p['orders'], $p['res'], $p['guests'], round($p['spent']), fdate($p['first']), fdate($p['last']), implode('، ', $p['fav']), $p['addr']], $list));
}
$cnt = []; foreach ($segs as $k => $_) $cnt[$k] = count(array_filter($people, fn($p) => $k === '' || ($k === 'vip' ? $p['orders'] >= 3 : ($k === 'new' ? $p['first'] >= $month : ($k === 'sleep' ? $p['last'] < $quarter : $p['res'] > 0)))));
$total = array_sum(array_column($people, 'spent'));
$qs = fn(array $x) => '?' . http_build_query(array_filter(array_merge(['q' => $q, 'seg' => $seg, 'sort' => $sort], $x)));
$brand = settings()['brand'] ?? 'طبلية';
admin_head('العملاء', 'customers', (can('export') ? '<a class="b" href="' . e($qs(['export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>' : '') . (can('disc.edit', 'customers.view') ? '<a class="b b--primary" href="invite.php">' . icon('send') . ' رسالة لكل العملاء</a>' : ''));
?>
<section class="kpis">
  <div class="kpi"><span>عملاء</span><b class="latin"><?= count($people) ?></b><small>من الطلبات والعزايم، من غير تكرار</small></div>
  <div class="kpi"><span>الأوفياء</span><b class="latin"><?= $cnt['vip'] ?></b><small>طلبوا 3 مرات أو أكتر</small></div>
  <div class="kpi"><span>متوسط قيمة العميل</span><b class="latin"><?= number_format(count($people) ? $total / count($people) : 0) ?></b><small>جنيه</small></div>
  <div class="kpi"><span>وحشونا</span><b class="latin"><?= $cnt['sleep'] ?></b><small>ماطلبوش من 60 يوم، ابعتلهم كود</small></div>
</section>
<nav class="tabs">
  <?php foreach ($segs as $k => $l): ?><a href="<?= e($qs(['seg' => $k])) ?>" class="<?= $seg === $k ? 'is-on' : '' ?>"><?= $l ?> <b><?= $cnt[$k] ?></b></a><?php endforeach; ?>
</nav>
<form class="filters" method="get">
  <input type="hidden" name="seg" value="<?= e($seg) ?>">
  <div class="search"><?= icon('search') ?><input name="q" value="<?= e($q) ?>" placeholder="الاسم أو الموبايل"></div>
  <select name="sort" data-autosubmit><option value="last" <?= sel($sort, 'last') ?>>آخر تعامل</option><option value="spent" <?= sel($sort, 'spent') ?>>الأعلى إنفاقًا</option><option value="orders" <?= sel($sort, 'orders') ?>>الأكثر طلبًا</option></select>
  <button class="b">بحث</button><span class="muted"><?= count($list) ?> عميل</span>
</form>
<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>العميل</th><th>طلبات / عزايم</th><th>الإجمالي</th><th>بيحب</th><th>آخر تعامل</th><th></th></tr></thead>
  <tbody>
  <?php foreach (array_slice($list, 0, 400) as $p): $msg = 'أهلًا ' . ($p['name'] ?: '') . ' ❤️ ماما رحاب بتسلّم عليك من ' . $brand . '.'; ?>
    <tr>
      <td><b><?= e($p['name'] ?: 'عميل') ?></b><?= $p['orders'] >= 3 ? ' <span class="st st--sale">وفي</span>' : '' ?><small class="latin" dir="ltr" style="text-align:end"><?= e($p['phone']) ?></small><?php if ($p['addr']): ?><small><?= e(mb_substr($p['addr'], 0, 60)) ?></small><?php endif; ?></td>
      <td class="latin"><b><?= $p['orders'] ?></b> <span class="muted">/</span> <?= $p['res'] ?><?php if ($p['guests']): ?><small><?= number_format($p['guests']) ?> فرد في العزايم</small><?php endif; ?></td>
      <td class="latin nowrap"><?= egp($p['spent']) ?></td>
      <td><small style="color:var(--taupe)"><?= e(implode('، ', $p['fav'])) ?: '—' ?></small></td>
      <td class="nowrap"><small><?= ago($p['last']) ?></small></td>
      <td class="end nowrap">
        <a class="icon-b" target="_blank" href="https://wa.me/<?= e($p['wa']) ?>?text=<?= rawurlencode($msg) ?>" title="واتساب"><?= icon('wa') ?></a>
        <a class="icon-b" href="tel:+<?= e($p['wa']) ?>" title="اتصال"><?= icon('phone') ?></a>
        <?php if (can('orders.view')): ?><a class="icon-b" href="orders.php?q=<?= e(rawurlencode($p['phone'])) ?>" title="طلباته"><?= icon('orders') ?></a><?php endif; ?>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="6" class="empty"><?= $people ? 'مفيش عملاء مطابقين.' : 'أول ما توصل طلبات أو عزايم، العملاء هيتجمعوا هنا تلقائيًا.' ?></td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

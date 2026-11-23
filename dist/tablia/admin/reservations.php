<?php
require __DIR__ . '/inc.php';
require_perm('res.view');

if (posted()) {
    $id = p('id'); $st = p('status');
    $ref = ''; foreach (bc_load('reservations') as $x) if ($x['id'] === $id) $ref = $x['name'] . ' · ' . $x['date'];
    if (p('act') === 'delete') {
        need('res.delete'); log_act('حذف عزومة', $ref);
        bc_tx('reservations', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($r) => $r['id'] !== $id)); });
        flash('اتحذفت العزومة');
    } elseif (isset(RES_ST[$st])) {
        need('res.edit'); log_act('تغيير حالة عزومة', $ref . ' ← ' . RES_ST[$st]);
        bc_tx('reservations', function (&$d) use ($id, $st) { foreach ($d as &$r) if ($r['id'] === $id) $r['status'] = $st; });
        flash('اتحدثت العزومة: ' . RES_ST[$st]);
    }
    go('reservations.php?' . http_build_query(array_filter(['tab' => $_GET['tab'] ?? '', 'st' => $_GET['st'] ?? ''])));
}

$all = bc_load('reservations');
$t = today(); $wk = date('Y-m-d', strtotime('+7 days'));
$tab = (string)($_GET['tab'] ?? 'up'); $fs = (string)($_GET['st'] ?? '');
$list = array_values(array_filter($all, function ($r) use ($tab, $fs, $t, $wk) {
    if ($tab === 'week' && ($r['date'] < $t || $r['date'] > $wk)) return false;
    if ($tab === 'up' && $r['date'] < $t) return false;
    if ($tab === 'past' && $r['date'] >= $t) return false;
    if ($fs !== '' && $r['status'] !== $fs) return false;
    return true;
}));
usort($list, fn($a, $b) => $tab === 'past' ? strcmp($b['date'] . ($b['time'] ?? ''), $a['date'] . ($a['time'] ?? '')) : strcmp($a['date'] . ($a['time'] ?? ''), $b['date'] . ($b['time'] ?? '')));
if (($_GET['export'] ?? '') === 'csv' && can('export')) {
    csv_download('tablia-occasions', ['الكود', 'التاريخ', 'الوقت', 'الاسم', 'الموبايل', 'المناسبة', 'الباقة', 'الأفراد', 'سعر الفرد', 'الإجمالي', 'العربون', 'الباقي', 'العنوان', 'ملاحظات', 'الحالة'],
        array_map(fn($r) => [$r['code'], $r['date'], $r['time'] ?? '', $r['name'], $r['phone'], $r['occasion'] ?? '', $r['packageName'] ?? '', $r['guests'], $r['pp'] ?? 0, $r['estimate'] ?? 0, $r['deposit'] ?? 0,
            max(0, (float)($r['estimate'] ?? 0) - (float)($r['deposit'] ?? 0)), $r['address'] ?? '', $r['notes'] ?? '', RES_ST[$r['status']] ?? $r['status']], $list));
}
$n = fn($f) => count(array_filter($all, $f));
$tabs = ['week' => ['الأسبوع ده', $n(fn($r) => $r['date'] >= $t && $r['date'] <= $wk)], 'up' => ['القادمة', $n(fn($r) => $r['date'] >= $t)], 'past' => ['السابقة', $n(fn($r) => $r['date'] < $t)], 'all' => ['الكل', count($all)]];
$days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
$live = array_filter($list, fn($r) => $r['status'] !== 'cancelled');
$sumEst = array_sum(array_map(fn($r) => (float)($r['estimate'] ?? 0), $live)); $sumDep = array_sum(array_map(fn($r) => (float)($r['deposit'] ?? 0), $live));
$s = settings();
admin_head('العزايم والمناسبات', 'reservations', (can('export') ? '<a class="b" href="?' . e(http_build_query(['tab' => $tab, 'st' => $fs, 'export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>' : '') . (can('res.edit') ? '<a class="b b--primary" href="reservation.php">' . icon('plus') . ' عزومة جديدة</a>' : ''));
?>
<?php if (empty($s['reservationsEnabled'])): ?><div class="flash flash--bad">حجز العزايم من الموقع مقفول حاليًا. تقدر تفتحه من <a href="settings.php">الإعدادات</a>.</div><?php endif; ?>
<p class="hint" style="margin-bottom:14px">كل طلب أوبن بوفيه أو سِت منيو أو عزومة بيتبعت من الموقع بيتسجل هنا بعدد الأفراد والحساب المبدئي. تابعه: ابعت عرض السعر، سجّل العربون، وأكّد على واتساب بضغطة.</p>
<section class="kpis" style="margin-bottom:16px">
  <div class="kpi"><span>عزايم في القائمة</span><b class="latin"><?= count($live) ?></b><small><?= number_format(array_sum(array_column($live, 'guests'))) ?> فرد</small></div>
  <div class="kpi"><span>إجمالي الاتفاقات</span><b class="latin"><?= number_format($sumEst) ?></b><small>جنيه</small></div>
  <div class="kpi"><span>عربون اتدفع</span><b class="latin"><?= number_format($sumDep) ?></b><small>الباقي <?= egp(max(0, $sumEst - $sumDep)) ?></small></div>
</section>
<nav class="tabs">
  <?php foreach ($tabs as $k => [$l, $c]): ?><a href="?tab=<?= $k ?>" class="<?= $tab === $k ? 'is-on' : '' ?>"><?= $l ?> <b><?= $c ?></b></a><?php endforeach; ?>
</nav>
<form class="filters" method="get"><input type="hidden" name="tab" value="<?= e($tab) ?>">
  <select name="st" data-autosubmit><option value="">كل الحالات</option><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($fs, $k) ?>><?= $l ?></option><?php endforeach; ?></select>
  <span class="muted"><?= count($list) ?> عزومة</span>
</form>
<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>الموعد</th><th>العميل</th><th>المناسبة والباقة</th><th>الأفراد</th><th>الحساب</th><th>الحالة</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($list as $r): $wp = wa_phone($r['phone']); $rest = max(0, (float)($r['estimate'] ?? 0) - (float)($r['deposit'] ?? 0));
    $msg = 'أهلًا ' . $r['name'] . ' ✨ بخصوص عزومتك مع طبلية يوم ' . date('d/m', strtotime($r['date'])) . ' لعدد ' . (int)$r['guests'] . ' فرد (' . ($r['packageName'] ?? '') . ')، كود ' . $r['code'] . '.'; ?>
    <tr class="<?= $r['status'] === 'cancelled' ? 'is-hidden' : '' ?>">
      <td class="nowrap"><b class="latin"><?= e(date('d/m', strtotime($r['date']))) ?><?= !empty($r['time']) ? ' · ' . e($r['time']) : '' ?></b><small><?= $days[(int)date('w', strtotime($r['date']))] ?><?= $r['date'] === $t ? ' · النهارده' : '' ?></small></td>
      <td><a href="reservation.php?id=<?= e($r['id']) ?>" style="color:var(--cream)"><b><?= e($r['name']) ?></b></a><small><span class="latin" dir="ltr"><?= e($r['phone']) ?></span><?= $r['code'] ? ' · <span class="latin">' . e($r['code']) . '</span>' : '' ?></small></td>
      <td><b style="font-weight:500"><?= e($r['occasion'] ?: 'عزومة') ?></b><small style="color:var(--taupe)"><?= e($r['packageName'] ?? '') ?></small><?php if (!empty($r['notes'])): ?><small><?= e(mb_substr($r['notes'], 0, 80)) ?></small><?php endif; ?></td>
      <td class="latin"><b><?= number_format((int)$r['guests']) ?></b></td>
      <td class="nowrap"><b class="latin"><?= egp($r['estimate'] ?? 0) ?></b><small><?= (float)($r['deposit'] ?? 0) ? 'عربون ' . number_format((float)$r['deposit']) . ' · باقي ' . number_format($rest) : 'لسه مفيش عربون' ?></small></td>
      <td><?php if (can('res.edit')): ?><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($r['id']) ?>">
        <select name="status" class="inp" style="padding:6px 10px;width:auto" data-autosubmit><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($r['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></form><?php else: ?><?= badge($r['status'], RES_ST) ?><?php endif; ?></td>
      <td class="end nowrap">
        <?php if ($wp): ?><a class="icon-b" target="_blank" href="https://wa.me/<?= e($wp) ?>?text=<?= rawurlencode($msg) ?>" title="كلّم العميل واتساب"><?= icon('wa') ?></a><?php endif; ?>
        <?php if (can('res.edit')): ?><a class="icon-b" href="reservation.php?id=<?= e($r['id']) ?>" title="تعديل"><?= icon('edit') ?></a><?php endif; ?>
        <?php if (can('res.delete')): ?><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($r['id']) ?>"><button class="icon-b" name="act" value="delete" data-confirm="حذف العزومة؟" title="حذف"><?= icon('trash') ?></button></form><?php endif; ?>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="7" class="empty">مفيش عزايم هنا.</td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

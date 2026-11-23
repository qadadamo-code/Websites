<?php
require __DIR__ . '/inc.php';
require_admin();

if (posted()) {
    $id = p('id'); $st = p('status');
    if (p('act') === 'delete') {
        bc_tx('reservations', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($r) => $r['id'] !== $id)); });
        flash('تم حذف الحجز');
    } elseif (isset(RES_ST[$st])) {
        bc_tx('reservations', function (&$d) use ($id, $st) { foreach ($d as &$r) if ($r['id'] === $id) $r['status'] = $st; });
        flash('تم تحديث الحجز: ' . RES_ST[$st]);
    }
    go('reservations.php?' . http_build_query(array_filter(['tab' => $_GET['tab'] ?? '', 'st' => $_GET['st'] ?? ''])));
}

$all = bc_load('reservations');
$t = today();
$tab = (string)($_GET['tab'] ?? 'up'); $fs = (string)($_GET['st'] ?? '');
$list = array_values(array_filter($all, function ($r) use ($tab, $fs, $t) {
    if ($tab === 'today' && $r['date'] !== $t) return false;
    if ($tab === 'up' && $r['date'] < $t) return false;
    if ($tab === 'past' && $r['date'] >= $t) return false;
    if ($fs !== '' && $r['status'] !== $fs) return false;
    return true;
}));
usort($list, fn($a, $b) => $tab === 'past' ? strcmp($b['date'] . $b['time'], $a['date'] . $a['time']) : strcmp($a['date'] . $a['time'], $b['date'] . $b['time']));
if (($_GET['export'] ?? '') === 'csv') {
    csv_download('reservations', ['الكود', 'التاريخ', 'الوقت', 'الاسم', 'الموبايل', 'الأفراد', 'المناسبة', 'ملاحظات', 'الحالة'],
        array_map(fn($r) => [$r['code'], $r['date'], $r['time'], $r['name'], $r['phone'], $r['guests'], $r['occasion'], $r['notes'], RES_ST[$r['status']] ?? $r['status']], $list));
}
$n = fn($f) => count(array_filter($all, $f));
$tabs = ['today' => ['اليوم', $n(fn($r) => $r['date'] === $t)], 'up' => ['القادمة', $n(fn($r) => $r['date'] >= $t)], 'past' => ['السابقة', $n(fn($r) => $r['date'] < $t)], 'all' => ['الكل', count($all)]];
$days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function wa_phone(string $p): string { $d = preg_replace('/\D/', '', $p); return strpos($d, '0') === 0 ? '2' . $d : $d; }
$s = settings();
admin_head('الحجوزات', 'reservations', '<a class="b" href="?' . e(http_build_query(['tab' => $tab, 'st' => $fs, 'export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>');
?>
<?php if (empty($s['reservationsEnabled'])): ?><div class="flash flash--bad">الحجز من الموقع مقفول حاليًا. تقدر تفتحه من <a href="settings.php">الإعدادات</a>.</div><?php endif; ?>
<nav class="tabs">
  <?php foreach ($tabs as $k => [$l, $c]): ?><a href="?tab=<?= $k ?>" class="<?= $tab === $k ? 'is-on' : '' ?>"><?= $l ?> <b><?= $c ?></b></a><?php endforeach; ?>
</nav>
<form class="filters" method="get"><input type="hidden" name="tab" value="<?= e($tab) ?>">
  <select name="st" data-autosubmit><option value="">كل الحالات</option><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($fs, $k) ?>><?= $l ?></option><?php endforeach; ?></select>
  <span class="muted"><?= count($list) ?> حجز · <?= array_sum(array_column(array_filter($list, fn($r) => $r['status'] !== 'cancelled'), 'guests')) ?> فرد</span>
</form>
<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>الموعد</th><th>العميل</th><th>الأفراد</th><th>المناسبة / ملاحظات</th><th>الحالة</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($list as $r): $wp = wa_phone($r['phone']); $msg = 'أهلًا ' . $r['name'] . '، حجزك في باركود يوم ' . date('d/m', strtotime($r['date'])) . ' الساعة ' . $r['time'] . ' لعدد ' . $r['guests'] . ' مؤكد ✓ (كود: ' . $r['code'] . ')'; ?>
    <tr class="<?= $r['status'] === 'cancelled' ? 'is-hidden' : '' ?>">
      <td class="nowrap"><b class="latin"><?= e(date('d/m', strtotime($r['date']))) ?> · <?= e($r['time']) ?></b><small><?= $days[(int)date('w', strtotime($r['date']))] ?><?= $r['date'] === $t ? ' · اليوم' : '' ?></small></td>
      <td><b><?= e($r['name']) ?></b><small><span class="latin" dir="ltr"><?= e($r['phone']) ?></span><?= $r['code'] ? ' · <span class="latin">' . e($r['code']) . '</span>' : '' ?></small></td>
      <td class="latin"><?= (int)$r['guests'] ?></td>
      <td><small style="color:var(--taupe)"><?= e($r['occasion'] ?: '—') ?></small><?php if ($r['notes']): ?><small><?= e($r['notes']) ?></small><?php endif; ?></td>
      <td><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($r['id']) ?>">
        <select name="status" class="inp" style="padding:6px 10px;width:auto" data-autosubmit><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($r['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></form></td>
      <td class="end nowrap">
        <?php if ($wp): ?><a class="icon-b" target="_blank" href="https://wa.me/<?= e($wp) ?>?text=<?= rawurlencode($msg) ?>" title="تأكيد على واتساب"><?= icon('wa') ?></a><?php endif; ?>
        <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($r['id']) ?>"><button class="icon-b" name="act" value="delete" data-confirm="حذف الحجز؟" title="حذف"><?= icon('trash') ?></button></form>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="6" class="empty">لا توجد حجوزات هنا.</td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

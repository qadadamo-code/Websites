<?php
require __DIR__ . '/inc.php';
require_perm('log.view');
$log = bc_load('log');
$users = users_all();
$undoable = []; foreach (bc_load('undo') as $r) if (empty($r['undone'])) $undoable[$r['req']] = $r['uid'];
$mineId = me()['id'] ?? ''; $canAll = can('undo.all');
$fu = (string)($_GET['u'] ?? ''); $q = trim((string)($_GET['q'] ?? '')); $from = (string)($_GET['from'] ?? ''); $to = (string)($_GET['to'] ?? '');
$list = array_values(array_filter($log, function ($r) use ($fu, $q, $from, $to) {
    if ($fu !== '' && $r['uid'] !== $fu) return false;
    $d = substr($r['at'], 0, 10);
    if ($from !== '' && $d < $from) return false;
    if ($to !== '' && $d > $to) return false;
    if ($q !== '' && mb_stripos($r['action'] . ' ' . $r['detail'] . ' ' . $r['name'], $q) === false) return false;
    return true;
}));
if (($_GET['export'] ?? '') === 'csv' && can('export')) {
    csv_download('activity-log', ['الوقت', 'المستخدم', 'العملية', 'التفاصيل'], array_map(fn($r) => [fdate($r['at']), $r['name'], $r['action'], $r['detail']], $list));
}
admin_head('سجل النشاط', 'log', can('export') ? '<a class="b" href="?' . e(http_build_query(['u' => $fu, 'q' => $q, 'from' => $from, 'to' => $to, 'export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>' : '');
?>
<p class="hint" style="margin-bottom:14px">كل تعديل في اللوحة بيتسجّل هنا باسم اللي عمله ووقته. لو حد دخّل حاجة غلط أو مسح حاجة بالغلط، دوس «تراجع» جنب العملية والبيانات ترجع زي ما كانت. التراجع نفسه بيتسجّل، فتقدر ترجع فيه برضه.</p>
<form class="filters" method="get">
  <div class="search"><?= icon('search') ?><input name="q" value="<?= e($q) ?>" placeholder="ابحث في العمليات"></div>
  <select name="u" data-autosubmit><option value="">كل المستخدمين</option><?php foreach ($users as $u): ?><option value="<?= e($u['id']) ?>" <?= sel($fu, $u['id']) ?>><?= e($u['name'] ?: $u['user']) ?></option><?php endforeach; ?></select>
  <input type="date" name="from" value="<?= e($from) ?>"><input type="date" name="to" value="<?= e($to) ?>">
  <button class="b">عرض</button><span class="muted"><?= count($list) ?> عملية</span>
</form>
<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>الوقت</th><th>المستخدم</th><th>العملية</th><th>التفاصيل</th><th></th></tr></thead>
  <tbody>
  <?php foreach (array_slice($list, 0, 500) as $r): ?>
    <tr><td class="nowrap"><b class="latin"><?= e(date('d/m · H:i', strtotime($r['at']))) ?></b><small><?= ago($r['at']) ?></small></td>
      <td><b><?= e($r['name']) ?></b></td><td><?= e($r['action']) ?></td><td><small style="color:var(--taupe)"><?= e($r['detail']) ?></small></td>
      <td class="end"><?php $rq = $r['req'] ?? ''; if ($rq !== '' && isset($undoable[$rq]) && ($undoable[$rq] === $mineId || $canAll) && $r['action'] !== 'تسجيل دخول'): $undoable[$rq] = null; ?>
        <form method="post" action="undo.php" class="inline-form"><?= csrf_field() ?><input type="hidden" name="req" value="<?= e($rq) ?>"><input type="hidden" name="back" value="<?= e($_SERVER['REQUEST_URI'] ?? 'log.php') ?>"><button class="b b--sm" data-confirm="ترجيع البيانات زي ما كانت قبل العملية دي؟"><?= icon('undo') ?> تراجع</button></form>
      <?php endif; ?></td></tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="5" class="empty">لا توجد عمليات مسجلة.</td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

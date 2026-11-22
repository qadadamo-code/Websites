<?php
require __DIR__ . '/inc.php';
require_admin();
$all = al_load('bookings');
$type = $_GET['type'] ?? ''; $st = $_GET['status'] ?? ''; $q = trim((string)($_GET['q'] ?? ''));
$list = array_filter($all, function ($b) use ($type, $st, $q) {
    if ($type && $b['type'] !== $type) return false;
    if ($st && $b['status'] !== $st) return false;
    if ($q !== '' && mb_stripos($b['ref'] . ' ' . $b['name'] . ' ' . $b['phone'], $q) === false) return false;
    return true;
});
$c = al_load('content');
$bn = array_column(array_map(fn($x) => ['id' => $x['id'], 'n' => $x['name']['ar']], $c['branches'] ?? []), 'n', 'id');
admin_head('الحجوزات والطلبات', 'bookings');
?>
<form class="filters card">
  <input name="q" placeholder="بحث بالمرجع أو الاسم أو الهاتف" value="<?= e($q) ?>">
  <select name="type"><option value="">كل الأنواع</option><?php foreach (TYPES as $k => $v): ?><option value="<?= $k ?>" <?= $type === $k ? 'selected' : '' ?>><?= $v ?></option><?php endforeach; ?></select>
  <select name="status"><option value="">كل الحالات</option><?php foreach (STATUS as $k => $v): ?><option value="<?= $k ?>" <?= $st === $k ? 'selected' : '' ?>><?= $v ?></option><?php endforeach; ?></select>
  <button class="btn">تصفية</button>
</form>
<section class="card">
<?php if (!$list): ?><p class="muted empty">لا توجد نتائج.</p><?php else: ?>
<table class="tbl"><thead><tr><th>المرجع</th><th>النوع</th><th>العميل</th><th>الفرع</th><th>الموعد</th><th>التقدير</th><th>الحالة</th></tr></thead><tbody>
<?php foreach ($list as $b): ?>
<tr onclick="location='booking.php?ref=<?= e($b['ref']) ?>'"><td><b><?= e($b['ref']) ?></b><small><?= e(fmt_date($b['created'])) ?></small></td><td><?= e(TYPES[$b['type']] ?? '') ?></td><td><?= e($b['name']) ?><small dir="ltr"><?= e($b['phone']) ?></small></td><td><?= e($bn[$b['branch']] ?? '—') ?></td><td><?= e(trim($b['date'] . ' ' . $b['time']) ?: '—') ?></td><td><?= $b['estimate'] ? number_format($b['estimate']) . ' د.إ' : '—' ?></td><td><?= status_badge($b['status']) ?></td></tr>
<?php endforeach; ?></tbody></table><?php endif; ?>
</section>
<?php admin_foot();

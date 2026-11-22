<?php
require __DIR__ . '/inc.php';
require_admin();
$ref = (string)($_GET['ref'] ?? '');
if (post_ok()) {
    $action = $_POST['action'] ?? '';
    al_tx('bookings', function (&$all) use ($ref, $action) {
        foreach ($all as $i => &$b) {
            if ($b['ref'] !== $ref) continue;
            if ($action === 'delete') { array_splice($all, $i, 1); return; }
            $s = $_POST['status'] ?? $b['status'];
            if (isset(STATUS[$s]) && $s !== $b['status']) { $b['log'][] = ['t' => date('c'), 'm' => 'الحالة: ' . STATUS[$s]]; $b['status'] = $s; }
            $note = clean_str($_POST['note'] ?? '', 500);
            if ($note !== '') $b['log'][] = ['t' => date('c'), 'm' => $note];
            if (isset($_POST['estimate']) && $_POST['estimate'] !== '') $b['estimate'] = max(0, (int)$_POST['estimate']);
            return;
        }
    });
    if ($action === 'delete') { flash('تم حذف الطلب'); back('bookings.php'); }
    flash('تم الحفظ'); back('booking.php?ref=' . urlencode($ref));
}
$b = current(array_filter(al_load('bookings'), fn($x) => $x['ref'] === $ref));
if (!$b) { flash('الطلب غير موجود', 'bad'); back('bookings.php'); }
$c = al_load('content');
$find = fn($k, $id) => current(array_filter($c[$k] ?? [], fn($x) => $x['id'] === $id)) ?: null;
$label = fn($k, $id) => ($x = $find($k, $id)) ? ($x['name']['ar'] ?? $x['title']['ar'] ?? $id) : $id;
$wa = preg_replace('/\D+/', '', $b['phone']);
if (str_starts_with($wa, '05')) $wa = '971' . substr($wa, 1);
$msg = "مرحباً {$b['name']}، معك فريق أرض المغامرات بخصوص طلبك رقم {$b['ref']}.";
admin_head('الطلب ' . $b['ref'], 'bookings');
?>
<div class="grid-detail">
<section class="card">
  <div class="card__h"><h2><?= e(TYPES[$b['type']] ?? '') ?> · <?= e($b['ref']) ?></h2><?= status_badge($b['status']) ?></div>
  <dl class="dl">
    <dt>العميل</dt><dd><?= e($b['name']) ?></dd>
    <dt>الهاتف</dt><dd dir="ltr"><a href="tel:<?= e($b['phone']) ?>"><?= e($b['phone']) ?></a></dd>
    <?php if ($b['branch']): ?><dt>الفرع</dt><dd><?= e($label('branches', $b['branch'])) ?></dd><?php endif; ?>
    <?php if ($b['date']): ?><dt>الموعد</dt><dd><?= e($b['date'] . ' ' . $b['time']) ?></dd><?php endif; ?>
    <?php if ($b['kids']): ?><dt>عدد الأطفال</dt><dd><?= (int)$b['kids'] ?></dd><?php endif; ?>
    <?php if ($b['package']): ?><dt>الباقة</dt><dd><?= e($label('packages', $b['package'])) ?></dd><?php endif; ?>
    <?php if ($b['addons']): ?><dt>الإضافات</dt><dd><?= e(implode('، ', array_map(fn($a) => $label('addons', $a), $b['addons']))) ?></dd><?php endif; ?>
    <?php if ($b['items']): ?><dt>الألعاب</dt><dd><?= e(implode('، ', array_map(fn($a) => $label('rentals', $a), $b['items']))) ?></dd><?php endif; ?>
    <?php if ($b['address']): ?><dt>العنوان</dt><dd><?= e($b['address']) ?></dd><?php endif; ?>
    <?php if ($b['notes']): ?><dt>ملاحظات</dt><dd><?= nl2br(e($b['notes'])) ?></dd><?php endif; ?>
    <dt>التقدير</dt><dd><?= $b['estimate'] ? number_format($b['estimate']) . ' درهم' : '—' ?></dd>
    <dt>وقت الطلب</dt><dd><?= e(fmt_date($b['created'])) ?> · <?= $b['lang'] === 'en' ? 'English' : 'عربي' ?></dd>
  </dl>
  <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/<?= e($wa) ?>?text=<?= rawurlencode($msg) ?>">مراسلة العميل على واتساب</a>
</section>
<section class="card">
  <h2>تحديث الطلب</h2>
  <form method="post" class="form">
    <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
    <label>الحالة<select name="status"><?php foreach (STATUS as $k => $v): ?><option value="<?= $k ?>" <?= $b['status'] === $k ? 'selected' : '' ?>><?= $v ?></option><?php endforeach; ?></select></label>
    <label>السعر النهائي (درهم)<input type="number" name="estimate" min="0" value="<?= (int)$b['estimate'] ?>"></label>
    <label>ملاحظة داخلية<textarea name="note" rows="3" placeholder="مثال: تم تأكيد الموعد مع ولي الأمر"></textarea></label>
    <button class="btn" name="action" value="save">حفظ</button>
  </form>
  <?php if ($b['log']): ?><h3>السجل</h3><ul class="log"><?php foreach (array_reverse($b['log']) as $l): ?><li><small><?= e(fmt_date($l['t'])) ?></small><?= e($l['m']) ?></li><?php endforeach; ?></ul><?php endif; ?>
  <form method="post" onsubmit="return confirm('حذف الطلب نهائياً؟')"><input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><button class="btn btn--danger" name="action" value="delete">حذف الطلب</button></form>
</section>
</div>
<?php admin_foot();

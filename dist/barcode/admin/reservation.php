<?php
/** Add a reservation by hand (phone / walk-in) or edit any reservation. */
require __DIR__ . '/inc.php';
require_perm('res.edit');
$all = bc_load('reservations');
$id = (string)($_GET['id'] ?? '');
$r = null; foreach ($all as $x) if ($x['id'] === $id) $r = $x;
if ($id !== '' && !$r) { flash('الحجز غير موجود', 'bad'); go('reservations.php'); }
$isNew = !$r;

if (posted()) {
    $row = array_merge($r ?: ['id' => bc_id('r'), 'at' => now_iso(), 'code' => 'BC-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)), 'source' => 'manual'], [
        'name' => clean(p('name'), 80), 'phone' => clean(digits_en(p('phone')), 30), 'date' => pdate('date'), 'time' => ptime('time'),
        'guests' => max(1, min(200, (int)digits_en(p('guests')))), 'table' => clean(p('table'), 20), 'occasion' => clean(p('occasion'), 60),
        'notes' => clean(p('notes'), 300), 'status' => isset(RES_ST[p('status')]) ? p('status') : 'new', 'updated' => now_iso(), 'updatedBy' => me()['name'] ?? '',
    ]);
    if ($row['name'] === '' || $row['date'] === '') { flash('الاسم والتاريخ مطلوبين', 'bad'); go('reservation.php' . ($isNew ? '' : '?id=' . rawurlencode($id))); }
    bc_tx('reservations', function (&$d) use ($row, $isNew) {
        if ($isNew) { array_unshift($d, $row); return; }
        foreach ($d as $i => $x) if ($x['id'] === $row['id']) $d[$i] = $row;
    });
    log_act($isNew ? 'إضافة حجز' : 'تعديل حجز', $row['name'] . ' · ' . $row['date'] . ' ' . $row['time'] . ' · ' . $row['guests'] . ' أفراد');
    flash($isNew ? 'تمت إضافة الحجز' : 'تم حفظ الحجز');
    go('reservations.php?tab=' . ($row['date'] === today() ? 'today' : ($row['date'] > today() ? 'up' : 'past')));
}
$r = $r ?: ['name' => '', 'phone' => '', 'date' => today(), 'time' => '20:00', 'guests' => 2, 'table' => '', 'occasion' => '', 'notes' => '', 'status' => 'confirmed', 'code' => ''];
admin_head($isNew ? 'حجز جديد' : 'تعديل حجز', 'reservations', '<a class="b" href="reservations.php">رجوع للحجوزات</a>');
?>
<form method="post" class="card" style="max-width:820px">
  <?= csrf_field() ?>
  <div class="card__head"><h3><?= $isNew ? 'بيانات الحجز' : 'حجز ' . e($r['name']) ?></h3><?php if ($r['code']): ?><span class="code"><?= e($r['code']) ?></span><?php endif; ?></div>
  <div class="fg">
    <label class="f"><span>الاسم *</span><input name="name" value="<?= e($r['name']) ?>" required maxlength="80"></label>
    <label class="f"><span>الموبايل</span><input name="phone" value="<?= e($r['phone']) ?>" class="latin" dir="ltr" inputmode="tel"></label>
    <label class="f"><span>التاريخ *</span><input name="date" type="date" value="<?= e($r['date']) ?>" required></label>
    <label class="f"><span>الوقت</span><input name="time" type="time" value="<?= e($r['time']) ?>"></label>
    <label class="f"><span>عدد الأفراد</span><input name="guests" type="number" min="1" max="200" value="<?= (int)$r['guests'] ?>" class="latin"></label>
    <label class="f"><span>رقم الطاولة</span><input name="table" value="<?= e($r['table'] ?? '') ?>" maxlength="20" placeholder="مثلًا: 7 أو VIP"></label>
    <label class="f"><span>المناسبة</span><input name="occasion" value="<?= e($r['occasion']) ?>" maxlength="60" placeholder="عيد ميلاد، اجتماع…"></label>
    <label class="f"><span>الحالة</span><select name="status"><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($r['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></label>
    <label class="f f--full"><span>ملاحظات</span><textarea name="notes" rows="3" maxlength="300"><?= e($r['notes']) ?></textarea></label>
  </div>
  <div class="form-actions"><a class="b" href="reservations.php">إلغاء</a><button class="b b--primary"><?= $isNew ? 'إضافة الحجز' : 'حفظ' ?></button></div>
</form>
<?php admin_foot();

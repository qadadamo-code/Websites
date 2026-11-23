<?php
require __DIR__ . '/inc.php';
require_perm('events.edit', 'events.guests');
$events = bc_load('events');
$id = (string)($_GET['id'] ?? '');
$ev = null; foreach ($events as $x) if ($x['id'] === $id) $ev = $x;
if ($id !== '' && !$ev) { flash('الفعالية غير موجودة', 'bad'); go('events.php'); }
$isNew = !$ev;
$rsvps = $ev ? array_values(array_filter(bc_load('rsvps'), fn($r) => $r['event'] === $ev['id'])) : [];

if ($ev && ($_GET['export'] ?? '') === 'csv' && can('export', 'events.guests')) {
    csv_download('rsvp-' . $ev['slug'], ['الكود', 'الاسم', 'الموبايل', 'عدد الأفراد', 'ملاحظة', 'الحالة', 'وقت التسجيل'],
        array_map(fn($r) => [$r['code'], $r['name'], $r['phone'], $r['guests'], $r['note'] ?? '', $r['status'] === 'cancelled' ? 'ملغي' : 'مؤكد', fdate($r['at'])], $rsvps));
}

if (posted()) {
    $act = p('act');
    if (in_array($act, ['rsvp', 'addguest', 'editguest', 'delguest', 'checkin'], true)) need('events.guests');
    if (in_array($act, ['save', 'delete'], true)) need('events.edit');
    if ($act === 'editguest' && $ev) {
        $rid = p('rid');
        bc_tx('rsvps', function (&$d) use ($rid) { foreach ($d as &$r) if ($r['id'] === $rid) { $r['name'] = clean(p('name'), 80) ?: $r['name']; $r['phone'] = clean(digits_en(p('phone')), 30); $r['guests'] = max(1, min(50, (int)digits_en(p('guests', '1')))); $r['note'] = clean(p('note'), 200); } });
        log_act('تعديل ضيف فعالية', $ev['title'] . ' · ' . p('name'));
        flash('تم حفظ بيانات الضيف'); go('event.php?id=' . rawurlencode($id) . '#guests');
    }
    if ($act === 'delguest' && $ev) {
        $rid = p('rid');
        bc_tx('rsvps', function (&$d) use ($rid) { $d = array_values(array_filter($d, fn($r) => $r['id'] !== $rid)); });
        log_act('حذف ضيف فعالية', $ev['title']);
        flash('تم حذف الضيف'); go('event.php?id=' . rawurlencode($id) . '#guests');
    }
    if ($act === 'checkin' && $ev) {
        $rid = p('rid');
        bc_tx('rsvps', function (&$d) use ($rid) { foreach ($d as &$r) if ($r['id'] === $rid) $r['checkedIn'] = empty($r['checkedIn']) ? now_iso() : ''; });
        go('event.php?id=' . rawurlencode($id) . '#guests');
    }
    if ($act === 'rsvp' && $ev) {
        $rid = p('rid'); $st = p('status') === 'cancelled' ? 'cancelled' : 'confirmed';
        bc_tx('rsvps', function (&$d) use ($rid, $st) { foreach ($d as &$r) if ($r['id'] === $rid) $r['status'] = $st; });
        log_act($st === 'cancelled' ? 'إلغاء دعوة' : 'تأكيد دعوة', $ev['title']);
        flash($st === 'cancelled' ? 'تم إلغاء الدعوة' : 'تمت إعادة تأكيد الدعوة'); go('event.php?id=' . rawurlencode($id) . '#guests');
    }
    if ($act === 'addguest' && $ev) {
        $name = clean(p('name'), 80); $phone = clean(digits_en(p('phone')), 30);
        if ($name !== '') {
            bc_tx('rsvps', function (&$d) use ($ev, $name, $phone) {
                array_unshift($d, ['id' => bc_id('v'), 'event' => $ev['id'], 'code' => 'INV-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)), 'at' => now_iso(),
                    'name' => $name, 'phone' => $phone, 'guests' => max(1, (int)p('guests', '1')), 'note' => 'أضيف من اللوحة', 'status' => 'confirmed']);
            });
            log_act('إضافة ضيف فعالية', $ev['title'] . ' · ' . $name);
            flash('تمت إضافة الضيف');
        }
        go('event.php?id=' . rawurlencode($id) . '#guests');
    }
    if ($act === 'delete' && $ev) {
        bc_tx('events', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        bc_tx('rsvps', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['event'] !== $id)); });
        log_act('حذف فعالية', $ev['title']);
        flash('تم حذف الفعالية'); go('events.php');
    }
    if ($act === 'save') {
        $title = clean(p('title'), 90); $date = pdate('date');
        $slug = slugify(p('slug') !== '' ? p('slug') : (p('titleEn') !== '' ? p('titleEn') : 'event-' . $date));
        foreach ($events as $x) if (($x['slug'] ?? '') === $slug && $x['id'] !== $id) $slug .= '-' . substr(bin2hex(random_bytes(2)), 0, 3);
        $errs = [];
        if ($title === '') $errs[] = 'اكتب عنوان الفعالية';
        if ($date === '') $errs[] = 'اختر تاريخ الفعالية';
        if ($errs) { flash(implode(' · ', $errs), 'bad'); }
        else {
            $cover = $ev['cover'] ?? '';
            if (!empty($_FILES['cover']['tmp_name'])) { $up = save_upload($_FILES['cover'], 'events'); if ($up) $cover = $up; else flash('الصورة لازم تكون JPG أو PNG أو WEBP', 'bad'); }
            if (p('remove_cover') === '1') $cover = '';
            $row = array_merge($ev ?: ['id' => bc_id('e'), 'created' => now_iso()], [
                'slug' => $slug, 'title' => $title, 'titleEn' => clean(p('titleEn'), 90), 'subtitle' => clean(p('subtitle'), 140),
                'date' => $date, 'time' => ptime('time'), 'endTime' => ptime('endTime'), 'place' => clean(p('place'), 120),
                'price' => clean(p('price'), 60), 'description' => clean(p('description'), 1500), 'cover' => $cover,
                'capacity' => max(0, (int)digits_en(p('capacity'))), 'maxPerGuest' => max(1, min(20, (int)digits_en(p('maxPerGuest', '4')) ?: 4)),
                'visible' => !empty($_POST['visible']), 'rsvpOpen' => !empty($_POST['rsvpOpen']),
            ]);
            bc_tx('events', function (&$d) use ($row, $isNew) {
                if ($isNew) { $d[] = $row; return; }
                foreach ($d as &$x) if ($x['id'] === $row['id']) $x = $row;
            });
            log_act($isNew ? 'إنشاء فعالية' : 'تعديل فعالية', $row['title'] . ' · ' . $row['date']);
            flash($isNew ? 'تم إنشاء الدعوة. انسخ الرابط وابعته للضيوف' : 'تم حفظ الفعالية');
            go('event.php?id=' . rawurlencode($row['id']));
        }
    }
}

$e = $ev ?: ['title' => p('title'), 'titleEn' => p('titleEn'), 'slug' => p('slug'), 'subtitle' => p('subtitle'), 'date' => p('date'), 'time' => p('time') ?: '20:00', 'endTime' => p('endTime'),
    'place' => p('place') ?: (settings()['brand'] ?? 'باركود كافيه'), 'price' => p('price'), 'description' => p('description'), 'cover' => '', 'capacity' => p('capacity'), 'maxPerGuest' => p('maxPerGuest') ?: 4, 'visible' => true, 'rsvpOpen' => true];
$link = $ev ? '../event.php?e=' . rawurlencode($ev['slug']) : '';
$active = array_filter($rsvps, fn($r) => $r['status'] !== 'cancelled');
$guestN = array_sum(array_column($active, 'guests'));
admin_head($isNew ? 'فعالية جديدة' : $e['title'], 'events', '<a class="b" href="events.php">→ كل الفعاليات</a>' . ($ev ? '<a class="b" href="' . e($link) . '" target="_blank">' . icon('eye') . ' معاينة الدعوة</a>' : ''));
?>
<?php if ($ev): ?>
<section class="card" style="margin-bottom:18px">
  <div class="card__head"><h3>رابط الدعوة</h3><span class="muted"><?= $guestN ?> ضيف مؤكد<?= !empty($ev['capacity']) ? ' من ' . (int)$ev['capacity'] : '' ?></span></div>
  <div class="share">
    <input id="evLink" readonly data-abs="<?= e($link) ?>" onclick="this.select()">
    <button class="b" data-copy="#evLink"><?= icon('copy') ?> نسخ</button>
    <a class="b b--primary" data-wa-share="<?= e($link) ?>" data-text="<?= e('أنت مدعو! ' . $ev['title'] . ' · ' . date('d/m', strtotime($ev['date'])) . ($ev['time'] ? ' · ' . $ev['time'] : '')) ?>" href="#" target="_blank"><?= icon('wa') ?> مشاركة على واتساب</a>
  </div>
</section>
<?php endif; ?>

<form method="post" enctype="multipart/form-data" class="form-grid">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <section class="card">
    <div class="card__head"><h3>تفاصيل الفعالية</h3></div>
    <div class="fg">
      <label class="f f--full"><span>عنوان الفعالية *</span><input name="title" value="<?= e($e['title']) ?>" required maxlength="90" placeholder="مثال: ليلة جاز وقهوة"></label>
      <label class="f f--full"><span>سطر فرعي</span><input name="subtitle" value="<?= e($e['subtitle'] ?? '') ?>" maxlength="140" placeholder="مثال: عزف حي مع مشروب مجاني لكل ضيف"></label>
      <label class="f"><span>التاريخ *</span><input type="date" name="date" value="<?= e($e['date']) ?>" required></label>
      <label class="f"><span>المكان</span><input name="place" value="<?= e($e['place'] ?? '') ?>" maxlength="120"></label>
      <label class="f"><span>يبدأ الساعة</span><input type="time" name="time" value="<?= e($e['time'] ?? '') ?>"></label>
      <label class="f"><span>ينتهي الساعة</span><input type="time" name="endTime" value="<?= e($e['endTime'] ?? '') ?>"></label>
      <label class="f"><span>السعر / الدخول</span><input name="price" value="<?= e($e['price'] ?? '') ?>" maxlength="60" placeholder="مثال: مجانًا · 150 ج.م تشمل مشروب"></label>
      <label class="f"><span>العنوان بالإنجليزي (للرابط)</span><input name="titleEn" id="evTitleEn" value="<?= e($e['titleEn'] ?? '') ?>" class="latin" dir="ltr" placeholder="Jazz Night"></label>
      <label class="f f--full"><span>تفاصيل الدعوة</span><textarea name="description" rows="5" maxlength="1500" placeholder="اكتب البرنامج، الفقرات، أي تعليمات للضيوف…"><?= e($e['description'] ?? '') ?></textarea></label>
    </div>
  </section>

  <div class="stack">
    <section class="card">
      <div class="card__head"><h3>صورة الدعوة</h3></div>
      <div class="upload">
        <div class="upload__preview upload__preview--wide" id="evPrev"><?php if (!empty($e['cover'])): ?><img src="<?= e(src($e['cover'])) ?>" alt=""><?php else: ?><span>بدون صورة (سيظهر تصميم باركود الافتراضي)</span><?php endif; ?></div>
        <label class="b"><input type="file" name="cover" accept="image/jpeg,image/png,image/webp" hidden data-preview="#evPrev">اختر صورة</label>
        <?php if (!empty($e['cover'])): ?><label class="check"><input type="checkbox" name="remove_cover" value="1"> إزالة</label><?php endif; ?>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h3>التسجيل والظهور</h3></div>
      <div class="fg">
        <label class="f"><span>العدد الأقصى للضيوف</span><input name="capacity" value="<?= e((string)($e['capacity'] ?: '')) ?>" inputmode="numeric" class="latin" placeholder="بلا حد"></label>
        <label class="f"><span>أقصى أفراد لكل تسجيل</span><input name="maxPerGuest" value="<?= e((string)$e['maxPerGuest']) ?>" inputmode="numeric" class="latin"></label>
        <label class="f f--full"><span>رابط الدعوة (حروف إنجليزي)</span><input name="slug" id="evSlug" value="<?= e($e['slug'] ?? '') ?>" class="latin" dir="ltr" placeholder="jazz-night"><small>يتولد تلقائيًا لو تركته فارغًا.</small></label>
      </div>
      <label class="switch"><input type="checkbox" name="visible" <?= checked($e['visible']) ?>><i></i><span>تظهر في قسم الفعاليات بالموقع</span></label>
      <label class="switch"><input type="checkbox" name="rsvpOpen" <?= checked($e['rsvpOpen'] ?? true) ?>><i></i><span>التسجيل وتأكيد الحضور مفتوح</span></label>
    </section>
  </div>

  <div class="form-actions">
    <button class="b b--primary"><?= $isNew ? 'إنشاء الدعوة' : 'حفظ التعديلات' ?></button>
    <?php if (!$isNew): ?><button class="b b--danger" name="act" value="delete" data-confirm="حذف الفعالية وكل تسجيلاتها نهائيًا؟">حذف الفعالية</button><?php endif; ?>
  </div>
</form>

<?php if ($ev): ?>
<section class="card" id="guests" style="margin-top:18px">
  <div class="card__head"><h3>قائمة الضيوف (<?= count($active) ?> تسجيل · <?= $guestN ?> فرد)</h3>
    <div class="dl"><span class="muted"><?= count(array_filter($rsvps, fn($r) => !empty($r['checkedIn']))) ?> حضروا فعلًا</span><a class="b b--sm" href="?id=<?= e($ev['id']) ?>&export=csv"><?= icon('down') ?> تنزيل Excel</a></div></div>
  <?php if (can('events.guests')): ?>
  <form method="post" class="filters">
    <?= csrf_field() ?><input type="hidden" name="act" value="addguest">
    <input class="inp" name="name" placeholder="اسم الضيف" required style="max-width:220px">
    <input class="inp latin" name="phone" placeholder="الموبايل" style="max-width:170px">
    <input class="inp latin" name="guests" value="1" inputmode="numeric" style="max-width:70px" title="عدد الأفراد">
    <button class="b b--sm"><?= icon('plus') ?> إضافة ضيف يدويًا</button>
  </form>
  <?php endif; ?>
  <?php if (!$rsvps): ?><p class="empty">لا يوجد تسجيلات بعد. شارك رابط الدعوة وأول تأكيد سيظهر هنا.</p><?php else: ?>
  <div class="table-wrap" style="border:0;background:none">
  <table class="tbl">
    <thead><tr><th>الكود</th><th>الضيف</th><th>الأفراد</th><th>ملاحظة</th><th>سجّل</th><th>الحالة</th><th>الحضور</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rsvps as $r): $ph = preg_replace('/\D/', '', $r['phone']); if (strpos($ph, '0') === 0) $ph = '2' . $ph; ?>
      <tr class="<?= $r['status'] === 'cancelled' ? 'is-hidden' : '' ?>">
        <td><span class="code"><?= e($r['code']) ?></span></td>
        <td><b><?= e($r['name']) ?></b><small class="latin" dir="ltr" style="text-align:end"><?= e($r['phone']) ?></small></td>
        <td class="latin"><?= (int)$r['guests'] ?></td>
        <td><small><?= e($r['note'] ?? '') ?></small></td>
        <td><small><?= ago($r['at']) ?></small></td>
        <td><?= badge($r['status'], ['confirmed' => 'مؤكد', 'cancelled' => 'ملغي']) ?></td>
        <td><?php if (can('events.guests') && $r['status'] !== 'cancelled'): ?><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="checkin"><input type="hidden" name="rid" value="<?= e($r['id']) ?>"><button class="b b--sm <?= !empty($r['checkedIn']) ? 'b--on' : '' ?>"><?= !empty($r['checkedIn']) ? '✓ حضر ' . e(date('H:i', strtotime($r['checkedIn']))) : 'تسجيل حضور' ?></button></form><?php endif; ?></td>
        <td class="end nowrap">
          <?php if ($ph): ?><a class="icon-b" target="_blank" href="https://wa.me/<?= e($ph) ?>?text=<?= rawurlencode('أهلًا ' . $r['name'] . '، دعوتك لـ«' . $ev['title'] . '» مؤكدة. كود الدعوة: ' . $r['code']) ?>" title="واتساب"><?= icon('wa') ?></a><?php endif; ?>
          <?php if (can('events.guests')): ?>
          <button type="button" class="icon-b" title="تعديل" data-toggle-row="g-<?= e($r['id']) ?>"><?= icon('edit') ?></button>
          <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="rsvp"><input type="hidden" name="rid" value="<?= e($r['id']) ?>">
            <?php if ($r['status'] === 'cancelled'): ?><button class="b b--sm" name="status" value="confirmed">إعادة تأكيد</button>
            <?php else: ?><button class="b b--sm" name="status" value="cancelled" data-confirm="إلغاء دعوة <?= e($r['name']) ?>؟">إلغاء</button><?php endif; ?>
          </form>
          <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="delguest"><input type="hidden" name="rid" value="<?= e($r['id']) ?>"><button class="icon-b" data-confirm="حذف <?= e($r['name']) ?> من القائمة نهائيًا؟" title="حذف"><?= icon('trash') ?></button></form>
          <?php endif; ?>
        </td>
      </tr>
      <?php if (can('events.guests')): ?>
      <tr class="edit-row" id="g-<?= e($r['id']) ?>" hidden><td colspan="8">
        <form method="post" class="filters" style="margin:0"><?= csrf_field() ?><input type="hidden" name="act" value="editguest"><input type="hidden" name="rid" value="<?= e($r['id']) ?>">
          <input class="inp" name="name" value="<?= e($r['name']) ?>" required style="max-width:220px">
          <input class="inp latin" name="phone" value="<?= e($r['phone']) ?>" style="max-width:170px" dir="ltr">
          <input class="inp latin" name="guests" value="<?= (int)$r['guests'] ?>" type="number" min="1" max="50" style="max-width:80px">
          <input class="inp" name="note" value="<?= e($r['note'] ?? '') ?>" placeholder="ملاحظة" style="max-width:260px">
          <button class="b b--sm b--primary">حفظ</button>
        </form>
      </td></tr>
      <?php endif; ?>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php endif; ?>
</section>
<?php endif; ?>
<?php admin_foot();

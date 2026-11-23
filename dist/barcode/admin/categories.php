<?php
require __DIR__ . '/inc.php';
require_perm('items.edit');
$cats = sort_by_order(bc_load('categories'));
$items = bc_load('items');
$count = []; foreach ($items as $it) $count[$it['cat']] = ($count[$it['cat']] ?? 0) + 1;
$edit = isset($_GET['id']) ? (string)$_GET['id'] : null;
$cur = null; if ($edit !== null && $edit !== '') foreach ($cats as $c) if ($c['id'] === $edit) $cur = $c;
if ($edit !== null && $edit !== '' && !$cur) { flash('القسم غير موجود', 'bad'); go('categories.php'); }
$seqs = seq_options();

if (posted()) {
    $act = p('act');
    if ($act === 'order') {
        $ord = (array)($_POST['order'] ?? []);
        bc_tx('categories', function (&$d) use ($ord) { foreach ($d as &$c) if (isset($ord[$c['id']])) $c['order'] = (int)$ord[$c['id']]; });
        log_act('ترتيب الأقسام');
        flash('تم حفظ ترتيب الأقسام'); go('categories.php');
    }
    if ($act === 'toggle') {
        $id = p('id');
        bc_tx('categories', function (&$d) use ($id) { foreach ($d as &$c) if ($c['id'] === $id) $c['visible'] = empty($c['visible']); });
        log_act('إظهار/إخفاء قسم', $id);
        flash('تم التحديث'); go('categories.php');
    }
    if ($act === 'delete' && $cur) {
        need('items.delete'); log_act('حذف قسم', $cur['title']);
        $n = $count[$cur['id']] ?? 0; $to = p('move_to');
        if ($n && $to === '__delete') bc_tx('items', function (&$d) use ($cur) { $d = array_values(array_filter($d, fn($x) => $x['cat'] !== $cur['id'])); });
        elseif ($n && $to !== '' && $to !== $cur['id']) bc_tx('items', function (&$d) use ($cur, $to) { foreach ($d as &$x) if ($x['cat'] === $cur['id']) $x['cat'] = $to; });
        elseif ($n) { flash('القسم فيه أصناف: اختر قسمًا تنقلها إليه أو اختر حذفها معه', 'bad'); go('categories.php?id=' . rawurlencode($cur['id'])); }
        bc_tx('categories', function (&$d) use ($cur) { $d = array_values(array_filter($d, fn($c) => $c['id'] !== $cur['id'])); });
        flash('تم حذف القسم'); go('categories.php');
    }
    if ($act === 'save') {
        $title = clean(p('title'), 60);
        if ($title === '') { flash('اكتب اسم القسم', 'bad'); go('categories.php?id=' . rawurlencode((string)$edit)); }
        $base = $cur ?: ['id' => bc_id('k'), 'image' => '', 'order' => (count($cats) + 1) * 1, 'code' => ''];
        $img = $base['image'] ?? '';
        if (!empty($_FILES['image']['tmp_name'])) { $up = save_upload($_FILES['image'], 'categories'); if ($up) $img = $up; else flash('الصورة لازم تكون JPG أو PNG أو WEBP', 'bad'); }
        if (p('remove_image') === '1') $img = '';
        $seq = p('seq'); if ($seq !== '' && !in_array($seq, $seqs, true)) $seq = '';
        $disc = max(0, min(90, (float)digits_en(p('discount'))));
        $row = array_merge($base, [
            'title' => $title, 'titleEn' => clean(p('titleEn'), 60), 'code' => clean(p('code'), 12) ?: ('BC-' . str_pad((string)(count($cats) + 1), 2, '0', STR_PAD_LEFT)),
            'line' => clean(p('line'), 200), 'seq' => $seq, 'image' => $img, 'visible' => !empty($_POST['visible']),
            'discount' => $disc, 'discountFrom' => $disc ? pdate('discountFrom') : '', 'discountTo' => $disc ? pdate('discountTo') : '',
        ]);
        bc_tx('categories', function (&$d) use ($row, $cur) {
            if (!$cur) { $d[] = $row; return; }
            foreach ($d as &$c) if ($c['id'] === $row['id']) $c = $row;
        });
        log_act($cur ? 'تعديل قسم' : 'إضافة قسم', $row['title'] . ($disc ? ' · خصم ' . $disc . '%' : ''));
        flash($cur ? 'تم حفظ القسم' : 'تمت إضافة القسم. أضف له أصنافًا ليظهر في الموقع');
        go('categories.php');
    }
}

if ($edit !== null):
    $c = $cur ?: ['id' => '', 'title' => '', 'titleEn' => '', 'code' => '', 'line' => '', 'seq' => '', 'image' => '', 'visible' => true, 'discount' => 0, 'discountFrom' => '', 'discountTo' => ''];
    admin_head($cur ? 'تعديل قسم: ' . $c['title'] : 'قسم جديد', 'categories', '<a class="b" href="categories.php">→ رجوع للأقسام</a>');
?>
<form method="post" enctype="multipart/form-data" class="form-grid">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <section class="card">
    <div class="card__head"><h3>بيانات القسم</h3></div>
    <div class="fg">
      <label class="f"><span>اسم القسم *</span><input name="title" value="<?= e($c['title']) ?>" required maxlength="60" placeholder="مثال: الحلويات"></label>
      <label class="f"><span>الاسم بالإنجليزي</span><input name="titleEn" value="<?= e($c['titleEn'] ?? '') ?>" class="latin" dir="ltr" placeholder="Desserts"></label>
      <label class="f"><span>كود القسم</span><input name="code" value="<?= e($c['code'] ?? '') ?>" class="latin" dir="ltr" maxlength="12" placeholder="BC-06"><small>يظهر كرقم باركود فوق عنوان القسم.</small></label>
      <label class="switch" style="align-self:end"><input type="checkbox" name="visible" <?= checked($c['visible']) ?>><i></i><span>ظاهر في الموقع</span></label>
      <label class="f f--full"><span>جملة تعريفية</span><textarea name="line" rows="2" maxlength="200" placeholder="سطر يظهر تحت اسم القسم"><?= e($c['line'] ?? '') ?></textarea></label>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>خلفية القسم المتحركة</h3></div>
    <div class="fg">
      <label class="f f--full"><span>فيديو جاهز</span><select name="seq"><option value="">— بدون فيديو (استخدم صورة) —</option>
        <?php foreach ($seqs as $s): ?><option value="<?= e($s) ?>" <?= sel($c['seq'] ?? '', $s) ?>><?= e(SEQ_LABELS[$s] ?? $s) ?></option><?php endforeach; ?></select>
        <small>الفيديو يتحرك مع السكرول. لو اخترت «بدون فيديو» ارفع صورة غلاف وسيظهر عليها تأثير زووم.</small></label>
    </div>
    <div class="upload" style="margin-top:12px">
      <div class="upload__preview upload__preview--wide" id="catPrev"><?php if (!empty($c['image'])): ?><img src="<?= e(src($c['image'])) ?>" alt=""><?php elseif (!empty($c['seq'])): ?><img src="../assets/seq/<?= e($c['seq']) ?>/024.jpg" alt=""><?php else: ?><span>بدون صورة</span><?php endif; ?></div>
      <label class="b"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden data-preview="#catPrev">صورة غلاف</label>
      <?php if (!empty($c['image'])): ?><label class="check"><input type="checkbox" name="remove_image" value="1"> إزالة الصورة</label><?php endif; ?>
    </div>
  </section>

  <section class="card card--full">
    <div class="card__head"><h3>خصم على القسم كله</h3><span class="muted">يُطبَّق على كل أصناف القسم اللي مالهاش خصم خاص</span></div>
    <div class="fg" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <label class="f"><span>نسبة الخصم %</span><input name="discount" value="<?= e((string)(0 + ($c['discount'] ?? 0)) ?: '') ?>" inputmode="decimal" class="latin" placeholder="0"></label>
      <label class="f"><span>يبدأ</span><input type="date" name="discountFrom" value="<?= e($c['discountFrom'] ?? '') ?>"></label>
      <label class="f"><span>ينتهي</span><input type="date" name="discountTo" value="<?= e($c['discountTo'] ?? '') ?>"></label>
    </div>
  </section>

  <div class="form-actions">
    <button class="b b--primary">حفظ القسم</button>
    <?php if ($cur): ?><a class="b" href="items.php?cat=<?= e($cur['id']) ?>">أصناف القسم (<?= $count[$cur['id']] ?? 0 ?>)</a><?php endif; ?>
  </div>
</form>

<?php if ($cur): $n = $count[$cur['id']] ?? 0; ?>
<form method="post" class="card" style="margin-top:18px;border-color:rgba(240,138,122,.25)">
  <?= csrf_field() ?><input type="hidden" name="act" value="delete">
  <div class="card__head"><h3>حذف القسم</h3></div>
  <?php if ($n): ?>
    <p class="muted" style="margin-bottom:12px">القسم فيه <?= $n ?> صنف. اختر ماذا تفعل بها:</p>
    <div class="filters"><select name="move_to"><option value="">اختر…</option><?php foreach ($cats as $o) if ($o['id'] !== $cur['id']): ?><option value="<?= e($o['id']) ?>">نقلها إلى: <?= e($o['title']) ?></option><?php endif; ?><option value="__delete">حذف الأصناف مع القسم</option></select>
    <button class="b b--danger" data-confirm="متأكد من حذف القسم؟">حذف القسم</button></div>
  <?php else: ?>
    <button class="b b--danger" data-confirm="متأكد من حذف القسم؟">حذف القسم</button>
  <?php endif; ?>
</form>
<?php endif; ?>
<?php admin_foot(); exit; endif;

admin_head('الأقسام', 'categories', '<a class="b b--primary" href="categories.php?id=">' . icon('plus') . ' قسم جديد</a>');
?>
<p class="hint" style="margin-bottom:14px">الأقسام تظهر في الموقع بنفس الترتيب هنا. غيّر الأرقام ثم اضغط «حفظ الترتيب». القسم يظهر فقط لو فيه أصناف ظاهرة.</p>
<form method="post">
  <?= csrf_field() ?>
  <div class="table-wrap">
  <table class="tbl">
    <thead><tr><th>الترتيب</th><th>القسم</th><th>الخلفية</th><th>الأصناف</th><th>خصم القسم</th><th>الحالة</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($cats as $c): $thumb = !empty($c['image']) ? src($c['image']) : (!empty($c['seq']) ? '../assets/seq/' . $c['seq'] . '/024.jpg' : ''); ?>
      <tr class="<?= empty($c['visible']) ? 'is-hidden' : '' ?>">
        <td><input class="order-in latin" name="order[<?= e($c['id']) ?>]" value="<?= (int)$c['order'] ?>" inputmode="numeric"></td>
        <td><a href="categories.php?id=<?= e($c['id']) ?>" style="color:var(--cream)"><b><?= e($c['title']) ?></b></a><small class="latin"><?= e(($c['code'] ?? '') . ' · ' . ($c['titleEn'] ?? '')) ?></small></td>
        <td><?php if ($thumb): ?><img class="cat-thumb" src="<?= e($thumb) ?>" alt=""><?php endif; ?><small><?= !empty($c['image']) ? 'صورة' : (!empty($c['seq']) ? 'فيديو: ' . e(SEQ_LABELS[$c['seq']] ?? $c['seq']) : '—') ?></small></td>
        <td><a class="chip" href="items.php?cat=<?= e($c['id']) ?>"><?= $count[$c['id']] ?? 0 ?> صنف</a></td>
        <td><?php if (!empty($c['discount']) && in_window($c['discountFrom'] ?? null, $c['discountTo'] ?? null)): ?><span class="st st--sale">-<?= 0 + $c['discount'] ?>%</span><?php elseif (!empty($c['discount'])): ?><span class="st st--off">مجدول -<?= 0 + $c['discount'] ?>%</span><?php else: ?><span class="muted">—</span><?php endif; ?></td>
        <td><button class="tg <?= !empty($c['visible']) ? 'on' : '' ?>" form="tc-<?= e($c['id']) ?>" title="ظاهر في الموقع"><?= icon('eye') ?></button></td>
        <td class="end"><a class="icon-b" href="categories.php?id=<?= e($c['id']) ?>" title="تعديل"><?= icon('edit') ?></a></td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$cats): ?><tr><td colspan="7" class="empty">لا توجد أقسام.</td></tr><?php endif; ?>
    </tbody>
  </table>
  </div>
  <div class="form-actions" style="margin-top:12px"><button class="b" name="act" value="order">حفظ الترتيب</button></div>
</form>
<?php foreach ($cats as $c): ?><form method="post" id="tc-<?= e($c['id']) ?>" hidden><?= csrf_field() ?><input type="hidden" name="act" value="toggle"><input type="hidden" name="id" value="<?= e($c['id']) ?>"></form><?php endforeach; ?>
<?php admin_foot();

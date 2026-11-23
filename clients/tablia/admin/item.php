<?php
require __DIR__ . '/inc.php';
require_perm('items.edit');
$cats = sort_by_order(bc_load('categories'));
$items = bc_load('items');
$id = (string)($_GET['id'] ?? '');
$it = null; foreach ($items as $x) if ($x['id'] === $id) $it = $x;
if ($id !== '' && !$it) { flash('الصنف غير موجود', 'bad'); go('items.php'); }
$isNew = !$it;
$it = $it ?: ['id' => '', 'cat' => (string)($_GET['cat'] ?? ($cats[0]['id'] ?? '')), 'group' => '', 'name' => '', 'desc' => '', 'price' => '', 'sizes' => [], 'unit' => '', 'sale' => null, 'saleFrom' => '', 'saleTo' => '', 'tag' => '', 'image' => '', 'available' => true, 'visible' => true, 'order' => 0];

if (posted()) {
    if (p('act') === 'duplicate' && !$isNew) {
        $copy = array_merge($it, ['id' => bc_id('x'), 'name' => $it['name'] . ' (نسخة)', 'order' => (int)($it['order'] ?? 0) + 1, 'visible' => false]);
        if (!empty($copy['image']) || item_image($it) !== '') $copy['image'] = item_image($it);
        bc_tx('items', function (&$d) use ($copy) { $d[] = $copy; });
        log_act('نسخ صنف', $it['name']);
        flash('تم عمل نسخة مخفية من الصنف، عدّلها وأظهرها'); go('item.php?id=' . rawurlencode($copy['id']));
    }
    if (p('act') === 'delete' && !$isNew) {
        need('items.delete'); log_act('حذف صنف', $it['name']);
        bc_tx('items', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        flash('تم حذف الصنف'); go('items.php');
    }
    $name = clean(p('name'), 80); $price = (float)digits_en(p('price')); $cat = p('cat');
    $sizes = [];
    foreach ((array)($_POST['sz_label'] ?? []) as $i => $l) {
        $l = clean((string)$l, 30); $v = (float)digits_en((string)($_POST['sz_price'][$i] ?? ''));
        if ($l !== '' && $v > 0) $sizes[] = ['label' => $l, 'price' => $v];
    }
    if ($sizes) $price = $sizes[0]['price'];
    $errs = [];
    if ($name === '') $errs[] = 'اكتب اسم الصنف';
    if ($price <= 0) $errs[] = 'اكتب سعر صحيح أو حجم واحد على الأقل';
    if (!in_array($cat, array_column($cats, 'id'), true)) $errs[] = 'اختر القسم';
    $sale = (float)digits_en(p('sale'));
    if ($sale && $sale >= $price) $errs[] = 'سعر الخصم لازم يكون أقل من السعر الأصلي';
    if ($errs) { flash(implode(' · ', $errs), 'bad'); }
    else {
        $img = $it['image'];
        if (!empty($_FILES['image']['tmp_name'])) { $up = save_upload($_FILES['image'], 'items'); if ($up) $img = $up; else flash('الصورة لازم تكون JPG أو PNG أو WEBP وأقل من 12MB', 'bad'); }
        if (p('remove_image') === '1') $img = '';
        $row = array_merge($it, [
            'cat' => $cat, 'group' => clean(p('group'), 60), 'name' => $name, 'desc' => clean(p('desc'), 240), 'price' => $price, 'sizes' => $sizes, 'unit' => clean(p('unit'), 60),
            'sale' => $sale > 0 ? $sale : null, 'saleFrom' => $sale > 0 ? pdate('saleFrom') : '', 'saleTo' => $sale > 0 ? pdate('saleTo') : '',
            'tag' => clean(p('tag'), 30), 'image' => $img, 'available' => !empty($_POST['available']), 'visible' => !empty($_POST['visible']),
        ]);
        if ($isNew) {
            $row['id'] = bc_id('x');
            $max = 0; foreach ($items as $x) if ($x['cat'] === $cat) $max = max($max, (int)($x['order'] ?? 0));
            $row['order'] = $max + 10;
        } elseif (p('order') !== '') $row['order'] = (int)p('order');
        log_act($isNew ? 'إضافة صنف' : 'تعديل صنف', $row['name'] . ' · ' . $row['price'] . ' ج');
        bc_tx('items', function (&$d) use ($row, $isNew) {
            if ($isNew) { $d[] = $row; return; }
            foreach ($d as &$x) if ($x['id'] === $row['id']) $x = $row;
        });
        flash($isNew ? 'تمت إضافة الصنف وظهر في الموقع' : 'تم حفظ التعديلات');
        go(p('next') === 'new' ? 'item.php?cat=' . rawurlencode($cat) : 'items.php?cat=' . rawurlencode($cat));
    }
    $it = array_merge($it, ['name' => p('name'), 'price' => p('price'), 'cat' => $cat, 'group' => p('group'), 'desc' => p('desc'), 'tag' => p('tag'), 'sale' => p('sale'), 'unit' => p('unit'), 'sizes' => $sizes]);
}
// existing sub-groups per category, for suggestions
$groups = []; foreach ($items as $x) if (!empty($x['group'])) $groups[$x['cat']][$x['group']] = true;
admin_head($isNew ? 'صنف جديد' : 'تعديل: ' . $it['name'], 'items', '<a class="b" href="items.php">→ رجوع للأصناف</a>');
?>
<form method="post" enctype="multipart/form-data" class="form-grid">
  <?= csrf_field() ?>
  <section class="card">
    <div class="card__head"><h3>بيانات الصنف</h3></div>
    <div class="fg">
      <label class="f f--full"><span>اسم الصنف *</span><input name="name" value="<?= e($it['name']) ?>" required maxlength="80" placeholder="مثال: محشي ورق عنب"></label>
      <label class="f"><span>القسم *</span><select name="cat" id="catSel"><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>" <?= sel($it['cat'], $c['id']) ?>><?= e($c['title']) ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>القسم الفرعي</span><input name="group" value="<?= e($it['group'] ?? '') ?>" list="groupList" placeholder="مثال: مشويات"><small>الأصناف بنفس القسم الفرعي تظهر تحت عنوان واحد.</small></label>
      <datalist id="groupList"><?php foreach ($groups as $cid => $gs) foreach (array_keys($gs) as $g): ?><option value="<?= e($g) ?>"><?php endforeach; ?></datalist>
      <label class="f f--full"><span>وصف قصير (اختياري)</span><textarea name="desc" rows="2" maxlength="240" placeholder="المكونات أو اللي بيتقدم معاه، مثال: أرز • سلطة • عيش"><?= e($it['desc'] ?? '') ?></textarea></label>
      <label class="f"><span>الوحدة / بيكفي كام (اختياري)</span><input name="unit" value="<?= e($it['unit'] ?? '') ?>" maxlength="60" placeholder="مثال: تكفي من 4 لـ 6 أفراد · الدستة"></label>
      <label class="f"><span>شارة (اختياري)</span><input name="tag" value="<?= e($it['tag'] ?? '') ?>" maxlength="30" placeholder="مثال: الأكثر طلبًا · حجم كبير"></label>
      <?php if (!$isNew): ?><label class="f"><span>الترتيب داخل القسم</span><input name="order" type="number" value="<?= (int)($it['order'] ?? 0) ?>" class="latin"><small>الرقم الأصغر يظهر أولًا.</small></label><?php endif; ?>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>السعر والأحجام</h3></div>
    <div class="fg">
      <label class="f"><span>السعر (جنيه) *</span><input name="price" value="<?= e((string)$it['price']) ?>" inputmode="decimal" class="latin" id="basePrice"><small>لو للصنف أحجام، السعر الأساسي = سعر أول حجم.</small></label>
      <div class="f f--full"><span>الأحجام (اختياري) · مثال: كيلو / ½ كيلو</span>
        <div class="sizes-ed" id="sizesEd">
          <?php $sz = array_values((array)($it['sizes'] ?? [])); for ($i = 0; $i < max(3, count($sz) + 1); $i++): $z = $sz[$i] ?? ['label' => '', 'price' => '']; ?>
          <div class="sizes-ed__row"><input class="inp" name="sz_label[]" value="<?= e($z['label']) ?>" placeholder="<?= $i === 0 ? 'كيلو' : ($i === 1 ? '½ كيلو' : 'حجم آخر') ?>" maxlength="30"><input class="inp latin" name="sz_price[]" value="<?= e($z['price'] === '' ? '' : (string)(0 + $z['price'])) ?>" inputmode="decimal" placeholder="السعر"><span class="muted">ج</span></div>
          <?php endfor; ?>
        </div>
        <small class="muted">العميل بيختار الحجم من الموقع، والسعر بيتحسب في السيرفر. سيبها فاضية لو الصنف بسعر واحد.</small>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الخصم</h3></div>
    <div class="fg">
      <label class="f"><span>سعر بعد الخصم (للسعر الأساسي)</span><input name="sale" value="<?= e((string)($it['sale'] ?? '')) ?>" inputmode="decimal" class="latin" placeholder="سيبه فاضي لو مفيش خصم"></label>
      <label class="f"><span>الخصم يبدأ</span><input type="date" name="saleFrom" value="<?= e($it['saleFrom'] ?? '') ?>"></label>
      <label class="f"><span>الخصم ينتهي</span><input type="date" name="saleTo" value="<?= e($it['saleTo'] ?? '') ?>"></label>
      <p class="hint f--full">نسبة الخصم بتتطبق على كل الأحجام تلقائيًا. لو سبت التواريخ فاضية، الخصم يفضل شغال لحد ما تمسحه، والسعر القديم بيظهر مشطوب في الموقع.</p>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الصورة (اختياري)</h3></div>
    <div class="upload">
      <div class="upload__preview" id="imgPrev"><?php if (($im = item_image($it)) !== ''): ?><img src="<?= e(src($im)) ?>" alt=""><?php else: ?><span>بدون صورة</span><?php endif; ?></div>
      <label class="b"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden data-preview="#imgPrev">اختر صورة</label>
      <?php if (!empty($it['image'])): ?><label class="check"><input type="checkbox" name="remove_image" value="1"> إزالة صورتك والرجوع للصورة الافتراضية</label><?php elseif ($im !== ''): ?><small class="muted">صورة افتراضية. ارفع صورة حقيقية من المنتج لتحل محلها.</small><?php endif; ?>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الظهور</h3></div>
    <label class="switch"><input type="checkbox" name="visible" <?= checked($it['visible']) ?>><i></i><span>ظاهر في الموقع</span></label>
    <label class="switch"><input type="checkbox" name="available" <?= checked($it['available']) ?>><i></i><span>متاح للطلب (لو مقفول يظهر «خلصان النهارده»)</span></label>
  </section>

  <div class="form-actions">
    <button class="b b--primary">حفظ</button>
    <?php if ($isNew): ?><button class="b" name="next" value="new">حفظ وإضافة صنف آخر</button><?php endif; ?>
    <?php if (!$isNew): ?><button class="b b--danger" name="act" value="delete" data-confirm="حذف هذا الصنف نهائيًا؟">حذف الصنف</button><?php endif; ?>
  </div>
</form>
<?php admin_foot();

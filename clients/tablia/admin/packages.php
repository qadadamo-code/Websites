<?php
/** Open-buffet and set-menu packages: price per person, minimum guests, contents, visibility, photo. */
require __DIR__ . '/inc.php';
require_perm('pack.edit');
$packs = sort_by_order(bc_load('packages'));
$TYPES = ['set' => 'سِت منيو', 'buffet' => 'أوبن بوفيه'];
$LISTS = ['mains' => ['الأصناف الأساسية', 'كفتة لحم، شيش طاووق، أرز بالخلطة…'], 'apps' => ['المقبلات', 'سمبوسك، كبيبة، ورق عنب…'], 'salads' => ['السلطات', 'طحينة، بابا غنوج، كولسلو…'], 'sweets' => ['الحلو', 'حلويات شرقية، جاتوه…']];
$edit = isset($_GET['id']) ? (string)$_GET['id'] : null;
$cur = null; if ($edit !== null && $edit !== '') foreach ($packs as $p) if ($p['id'] === $edit) $cur = $p;
if ($edit !== null && $edit !== '' && !$cur) { flash('الباقة مش موجودة', 'bad'); go('packages.php'); }
$lines = fn(string $k) => array_slice(array_values(array_filter(array_map(fn($l) => clean($l, 80), preg_split('/\r?\n/', p($k))))), 0, 30);

if (posted()) {
    $act = p('act');
    if ($act === 'toggle') {
        $id = p('id');
        bc_tx('packages', function (&$d) use ($id) { foreach ($d as &$x) if ($x['id'] === $id) $x['visible'] = empty($x['visible']); });
        log_act('إظهار/إخفاء باقة', $id); flash('اتحدثت الباقة'); go('packages.php');
    }
    if ($act === 'delete' && $cur) {
        need('items.delete'); log_act('حذف باقة', $cur['name']);
        bc_tx('packages', function (&$d) use ($cur) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $cur['id'])); });
        flash('اتحذفت الباقة'); go('packages.php');
    }
    if ($act === 'duplicate' && $cur) {
        $copy = array_merge($cur, ['id' => bc_id('p'), 'name' => $cur['name'] . ' (نسخة)', 'visible' => false, 'order' => (int)$cur['order'] + 1]);
        bc_tx('packages', function (&$d) use ($copy) { $d[] = $copy; });
        log_act('نسخ باقة', $cur['name']); flash('اتعملت نسخة مخفية من الباقة'); go('packages.php?id=' . rawurlencode($copy['id']));
    }
    if ($act === 'save') {
        $name = clean(p('name'), 60); $price = (float)digits_en(p('price'));
        if ($name === '' || $price <= 0) { flash('اكتب اسم الباقة وسعر الفرد', 'bad'); go('packages.php?id=' . rawurlencode((string)$edit)); }
        $base = $cur ?: ['id' => bc_id('p'), 'image' => '', 'order' => (count($packs) + 1) * 10];
        $img = $base['image'] ?? '';
        if (!empty($_FILES['image']['tmp_name'])) { $up = save_upload($_FILES['image'], 'packages'); if ($up) $img = $up; else flash('الصورة لازم تكون JPG أو PNG أو WEBP', 'bad'); }
        if (p('remove_image') === '1') $img = '';
        $row = array_merge($base, [
            'type' => isset($TYPES[p('type')]) ? p('type') : 'set', 'name' => $name, 'price' => $price,
            'min' => max(1, min(5000, (int)digits_en(p('min') ?: '100'))), 'tag' => clean(p('tag'), 40),
            'mains' => $lines('mains'), 'apps' => $lines('apps'), 'salads' => $lines('salads'), 'sweets' => $lines('sweets'),
            'sweetsAlt' => clean(p('sweetsAlt'), 120), 'image' => $img, 'visible' => !empty($_POST['visible']),
        ]);
        if (p('order') !== '') $row['order'] = (int)p('order');
        bc_tx('packages', function (&$d) use ($row, $cur) {
            if (!$cur) { $d[] = $row; return; }
            foreach ($d as &$x) if ($x['id'] === $row['id']) $x = $row;
        });
        log_act($cur ? 'تعديل باقة' : 'إضافة باقة', $TYPES[$row['type']] . ' · ' . $row['name'] . ' · ' . $row['price'] . ' ج');
        flash($cur ? 'اتحفظت الباقة' : 'اتضافت الباقة وظهرت في الموقع'); go('packages.php');
    }
}

if ($edit !== null):
    $c = $cur ?: ['type' => (string)($_GET['type'] ?? 'set'), 'name' => '', 'price' => '', 'min' => 100, 'tag' => '', 'mains' => [], 'apps' => [], 'salads' => [], 'sweets' => [], 'sweetsAlt' => '', 'image' => '', 'visible' => true, 'order' => ''];
    admin_head($cur ? 'تعديل باقة: ' . $c['name'] : 'باقة جديدة', 'packages', '<a class="b" href="packages.php">رجوع للباقات</a>');
?>
<form method="post" enctype="multipart/form-data" class="form-grid">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <section class="card">
    <div class="card__head"><h3>بيانات الباقة</h3></div>
    <div class="fg">
      <div class="f f--full"><span>النوع</span><div class="seg"><?php foreach ($TYPES as $k => $l): ?><label><input type="radio" name="type" value="<?= $k ?>" <?= $c['type'] === $k ? 'checked' : '' ?> hidden><span><?= $l ?></span></label><?php endforeach; ?></div></div>
      <label class="f"><span>اسم الباقة *</span><input name="name" value="<?= e($c['name']) ?>" required maxlength="60" placeholder="مثال: باقة 5 أو الباقة الذهبية"></label>
      <label class="f"><span>سعر الفرد (ج) *</span><input name="price" value="<?= e((string)$c['price']) ?>" inputmode="decimal" class="latin" required></label>
      <label class="f"><span>أقل عدد أفراد</span><input name="min" type="number" min="1" value="<?= (int)$c['min'] ?>" class="latin"></label>
      <label class="f"><span>شارة (اختياري)</span><input name="tag" value="<?= e($c['tag'] ?? '') ?>" maxlength="40" placeholder="الأكثر تنوّعًا · الباقة الملكية"></label>
      <?php if ($cur): ?><label class="f"><span>الترتيب</span><input name="order" type="number" value="<?= (int)$c['order'] ?>" class="latin"></label><?php endif; ?>
      <label class="switch" style="align-self:end"><input type="checkbox" name="visible" <?= checked($c['visible']) ?>><i></i><span>ظاهرة في الموقع</span></label>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>صورة الباقة (اختياري)</h3></div>
    <div class="upload">
      <div class="upload__preview upload__preview--wide" id="pkPrev"><?php if (!empty($c['image'])): ?><img src="<?= e(src($c['image'])) ?>" alt=""><?php else: ?><span>بدون صورة</span><?php endif; ?></div>
      <label class="b"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden data-preview="#pkPrev">اختر صورة</label>
      <?php if (!empty($c['image'])): ?><label class="check"><input type="checkbox" name="remove_image" value="1"> إزالة الصورة</label><?php endif; ?>
    </div>
  </section>

  <section class="card card--full">
    <div class="card__head"><h3>محتوى الباقة</h3><span class="muted">كل سطر = صنف، وبيظهر في الموقع بنفس الترتيب</span></div>
    <div class="fg" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <?php foreach ($LISTS as $k => [$l, $ph]): ?>
      <label class="f list-ed"><span><?= $l ?></span><textarea name="<?= $k ?>" rows="7" placeholder="<?= e($ph) ?>"><?= e(implode("\n", (array)($c[$k] ?? []))) ?></textarea></label>
      <?php endforeach; ?>
      <label class="f f--full"><span>بدائل الحلو (اختياري)</span><input name="sweetsAlt" value="<?= e($c['sweetsAlt'] ?? '') ?>" maxlength="120" placeholder="أو كريم كراميل · أو أم علي"></label>
    </div>
  </section>

  <div class="form-actions">
    <button class="b b--primary">حفظ الباقة</button>
    <?php if ($cur): ?><button class="b" name="act" value="duplicate" formnovalidate>نسخ الباقة</button><button class="b b--danger" name="act" value="delete" formnovalidate data-confirm="حذف الباقة نهائيًا؟">حذف</button><?php endif; ?>
  </div>
</form>
<?php admin_foot(); exit; endif;

$res = bc_load('reservations'); $booked = [];
foreach ($res as $r) if (($r['status'] ?? '') !== 'cancelled' && !empty($r['package'])) { $booked[$r['package']] = ($booked[$r['package']] ?? 0) + 1; }
admin_head('باقات البوفيه والسيت منيو', 'packages', '<a class="b" href="packages.php?id=&amp;type=buffet">' . icon('plus') . ' أوبن بوفيه</a><a class="b b--primary" href="packages.php?id=&amp;type=set">' . icon('plus') . ' سِت منيو</a>');
?>
<p class="hint" style="margin-bottom:16px">الباقات دي بتظهر في قسم «المناسبات والأفراح» في الموقع، والعميل بيختار منها ويحسب التكلفة بعدد الأفراد ويبعتلك الطلب. أي تعديل هنا بيظهر فورًا.</p>
<?php foreach ($TYPES as $type => $tl): $list = array_values(array_filter($packs, fn($p) => $p['type'] === $type)); ?>
<h3 style="margin:8px 0 12px;font-size:18px"><?= $tl ?> <span class="muted latin">(<?= count($list) ?>)</span></h3>
<div class="pack-grid" style="margin-bottom:26px">
  <?php foreach ($list as $p): ?>
  <article class="pack<?= empty($p['visible']) ? ' is-off' : '' ?>">
    <div class="pack__head">
      <small><?= e($p['tag'] ?: $tl) ?></small>
      <h3><?= e($p['name']) ?></h3>
      <div class="pack__price latin"><?= number_format((float)$p['price']) ?> <span>ج للفرد · من <?= (int)$p['min'] ?> فرد</span></div>
    </div>
    <div class="pack__body">
      <?php foreach ($LISTS as $k => [$l]): if (!empty($p[$k])): ?><div><b><?= $l ?>:</b> <?= e(implode(' • ', $p[$k])) ?></div><?php endif; endforeach; ?>
      <?php if (!empty($p['sweetsAlt'])): ?><div class="muted"><?= e($p['sweetsAlt']) ?></div><?php endif; ?>
    </div>
    <div class="pack__foot">
      <a class="b b--sm" href="packages.php?id=<?= e($p['id']) ?>"><?= icon('edit') ?> تعديل</a>
      <button class="b b--sm" form="tp-<?= e($p['id']) ?>"><?= icon('eye') ?> <?= !empty($p['visible']) ? 'إخفاء' : 'إظهار' ?></button>
      <span class="muted" style="margin-inline-start:auto;align-self:center"><?= (int)($booked[$p['id']] ?? 0) ?> عزومة</span>
    </div>
  </article>
  <form method="post" id="tp-<?= e($p['id']) ?>" hidden><?= csrf_field() ?><input type="hidden" name="act" value="toggle"><input type="hidden" name="id" value="<?= e($p['id']) ?>"></form>
  <?php endforeach; ?>
  <?php if (!$list): ?><p class="empty">مفيش باقات <?= $tl ?> لسه.</p><?php endif; ?>
</div>
<?php endforeach; ?>
<?php admin_foot();

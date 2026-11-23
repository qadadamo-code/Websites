<?php
require __DIR__ . '/inc.php';
require_admin();
$cats = sort_by_order(bc_load('categories'));
$catById = []; foreach ($cats as $c) $catById[$c['id']] = $c;

if (posted()) {
    $act = p('act');
    $ids = array_map('strval', (array)($_POST['ids'] ?? []));
    if ($act === 'toggle') { $ids = [p('id')]; }
    bc_tx('items', function (&$items) use ($act, $ids) {
        $set = array_flip($ids);
        if ($act === 'delete') { $items = array_values(array_filter($items, fn($i) => !isset($set[$i['id']]))); return; }
        foreach ($items as &$it) {
            if (!isset($set[$it['id']])) continue;
            switch ($act) {
                case 'toggle': $f = p('field'); if (in_array($f, ['available', 'visible'], true)) $it[$f] = empty($it[$f]); break;
                case 'show': $it['visible'] = true; break;
                case 'hide': $it['visible'] = false; break;
                case 'in': $it['available'] = true; break;
                case 'out': $it['available'] = false; break;
                case 'price': $v = (float)digits_en((string)($_POST['price'][$it['id']] ?? '')); if ($v > 0) $it['price'] = $v; break;
                case 'sale':
                    $pct = max(0, min(90, (float)p('pct')));
                    if ($pct > 0) { $it['sale'] = round($it['price'] * (1 - $pct / 100)); $it['saleFrom'] = pdate('from'); $it['saleTo'] = pdate('to'); }
                    else { $it['sale'] = null; $it['saleFrom'] = ''; $it['saleTo'] = ''; }
                    break;
                case 'move': $c = p('cat'); if ($c !== '') $it['cat'] = $c; break;
            }
        }
    });
    $msgs = ['delete' => 'تم حذف الأصناف المحددة', 'toggle' => 'تم التحديث', 'show' => 'الأصناف ظاهرة الآن في الموقع', 'hide' => 'تم إخفاء الأصناف',
        'in' => 'الأصناف متاحة', 'out' => 'تم تعليم الأصناف كنافدة', 'price' => 'تم حفظ الأسعار', 'sale' => 'تم تطبيق الخصم', 'move' => 'تم نقل الأصناف'];
    flash($msgs[$act] ?? 'تم');
    go('items.php?' . http_build_query(array_filter(['cat' => $_GET['cat'] ?? '', 'q' => $_GET['q'] ?? ''])));
}

$items = bc_load('items');
$co = []; foreach ($cats as $i => $c) $co[$c['id']] = $i;
usort($items, fn($a, $b) => [($co[$a['cat']] ?? 99), (int)($a['order'] ?? 0)] <=> [($co[$b['cat']] ?? 99), (int)($b['order'] ?? 0)]);
$fc = (string)($_GET['cat'] ?? ''); $q = trim((string)($_GET['q'] ?? '')); $fs = (string)($_GET['s'] ?? '');
$list = array_filter($items, function ($it) use ($fc, $q, $fs) {
    if ($fc !== '' && $it['cat'] !== $fc) return false;
    if ($q !== '' && mb_stripos($it['name'] . ' ' . ($it['group'] ?? ''), $q) === false) return false;
    if ($fs === 'hidden' && !empty($it['visible'])) return false;
    if ($fs === 'out' && !empty($it['available'])) return false;
    if ($fs === 'sale' && empty($it['sale'])) return false;
    return true;
});
admin_head('الأصناف', 'items', '<a class="b b--primary" href="item.php' . ($fc ? '?cat=' . e($fc) : '') . '">' . icon('plus') . ' صنف جديد</a>');
?>
<form class="filters" method="get">
  <div class="search"><?= icon('search') ?><input name="q" value="<?= e($q) ?>" placeholder="ابحث باسم الصنف…"></div>
  <select name="cat" onchange="this.form.submit()"><option value="">كل الأقسام</option><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>" <?= sel($fc, $c['id']) ?>><?= e($c['title']) ?></option><?php endforeach; ?></select>
  <select name="s" onchange="this.form.submit()"><option value="">كل الحالات</option><option value="hidden" <?= sel($fs, 'hidden') ?>>مخفي</option><option value="out" <?= sel($fs, 'out') ?>>نافد</option><option value="sale" <?= sel($fs, 'sale') ?>>عليه خصم</option></select>
  <span class="muted"><?= count($list) ?> صنف</span>
</form>

<form method="post" id="bulk">
  <?= csrf_field() ?>
  <div class="bulkbar" id="bulkbar" hidden>
    <b><span id="selN">0</span> محدد</b>
    <button name="act" value="show" class="b b--sm">إظهار</button>
    <button name="act" value="hide" class="b b--sm">إخفاء</button>
    <button name="act" value="in" class="b b--sm">متاح</button>
    <button name="act" value="out" class="b b--sm">نافد</button>
    <span class="bulkbar__grp"><input name="pct" type="number" min="0" max="90" placeholder="%" class="latin"><input type="date" name="from" title="من"><input type="date" name="to" title="إلى"><button name="act" value="sale" class="b b--sm">خصم %</button></span>
    <span class="bulkbar__grp"><select name="cat"><option value="">نقل إلى…</option><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>"><?= e($c['title']) ?></option><?php endforeach; ?></select><button name="act" value="move" class="b b--sm">نقل</button></span>
    <button name="act" value="delete" class="b b--sm b--danger" data-confirm="حذف الأصناف المحددة نهائيًا؟">حذف</button>
  </div>

  <div class="table-wrap">
  <table class="tbl">
    <thead><tr><th class="w-chk"><input type="checkbox" data-all></th><th>الصنف</th><th>القسم</th><th>السعر</th><th>الحالة</th><th></th></tr></thead>
    <tbody>
    <?php $lastCat = null; foreach ($list as $it): $c = $catById[$it['cat']] ?? null; [$fp, $was, $bdg] = item_price($it, $c); ?>
      <tr class="<?= empty($it['visible']) ? 'is-hidden' : '' ?>">
        <td class="w-chk"><input type="checkbox" name="ids[]" value="<?= e($it['id']) ?>" data-row></td>
        <td><div class="cell-item"><?php if (($im = item_image($it)) !== ''): ?><img src="<?= e(src($im)) ?>" alt=""><?php else: ?><span class="ph"><?= e(mb_substr($it['name'], 0, 1)) ?></span><?php endif; ?>
          <div><a href="item.php?id=<?= e($it['id']) ?>"><b><?= e($it['name']) ?></b></a><small><?= e(implode(' · ', array_filter([$it['group'] ?? '', $it['tag'] ?? '']))) ?></small></div></div></td>
        <td><span class="chip"><?= e($c['title'] ?? '—') ?></span></td>
        <td class="nowrap"><input class="price-in latin" name="price[<?= e($it['id']) ?>]" value="<?= e((string)(0 + $it['price'])) ?>" inputmode="decimal" data-price>
          <?php if ($was): ?><small class="sale"><?= e($bdg) ?> = <?= egp($fp) ?></small><?php endif; ?></td>
        <td class="nowrap">
          <button class="tg <?= !empty($it['visible']) ? 'on' : '' ?>" form="t-<?= e($it['id']) ?>-v" title="ظاهر في الموقع"><?= icon('eye') ?></button>
          <button class="tg tg--txt <?= !empty($it['available']) ? 'on' : '' ?>" form="t-<?= e($it['id']) ?>-a"><?= !empty($it['available']) ? 'متاح' : 'نافد' ?></button>
        </td>
        <td class="nowrap end"><a class="icon-b" href="item.php?id=<?= e($it['id']) ?>" title="تعديل"><?= icon('edit') ?></a></td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$list): ?><tr><td colspan="6" class="empty">لا توجد أصناف مطابقة.</td></tr><?php endif; ?>
    </tbody>
  </table>
  </div>
  <div class="savebar" id="savebar" hidden><span>عدّلت أسعارًا ولم تُحفظ بعد</span><button name="act" value="price" class="b b--primary">حفظ الأسعار</button></div>
</form>
<?php foreach ($list as $it): foreach (['v' => 'visible', 'a' => 'available'] as $k => $f): ?>
<form method="post" id="t-<?= e($it['id']) ?>-<?= $k ?>" hidden><?= csrf_field() ?><input type="hidden" name="act" value="toggle"><input type="hidden" name="id" value="<?= e($it['id']) ?>"><input type="hidden" name="field" value="<?= $f ?>"></form>
<?php endforeach; endforeach; ?>
<?php admin_foot();

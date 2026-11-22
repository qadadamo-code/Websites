<?php
/** Schema-driven editor for every content collection (packages, add-ons, rentals, zones, branches, reviews, FAQ). */
require __DIR__ . '/inc.php';
require_admin();
$schemas = schemas();
$key = (string)($_GET['c'] ?? '');
if (!isset($schemas[$key])) back('index.php');
[$title, $labelPath, $fields] = $schemas[$key];
$icons = ['palette' => 'ألوان', 'sparkles' => 'لمعة', 'party' => 'احتفال', 'rainbow' => 'قوس قزح', 'popcorn' => 'بوب كورن', 'camera' => 'كاميرا', 'gift' => 'هدية', 'cake' => 'كعكة', 'music' => 'موسيقى'];
$colors = ['orange' => 'برتقالي', 'navy' => 'كحلي', 'red' => 'أحمر', 'sky' => 'سماوي', 'yellow' => 'أصفر'];

if (post_ok()) {
    $action = $_POST['action'] ?? '';
    $idx = (int)($_POST['idx'] ?? -1);
    $err = al_tx('content', function (&$c) use ($key, $fields, $action, $idx) {
        $list = $c[$key] ?? [];
        if ($action === 'delete' && isset($list[$idx])) { array_splice($list, $idx, 1); }
        elseif (($action === 'up' || $action === 'down') && isset($list[$idx])) {
            $j = $action === 'up' ? $idx - 1 : $idx + 1;
            if (isset($list[$j])) { [$list[$idx], $list[$j]] = [$list[$j], $list[$idx]]; }
        } elseif ($action === 'save') {
            $item = $idx >= 0 && isset($list[$idx]) ? $list[$idx] : [];
            foreach ($fields as [$p, , $t]) {
                $name = 'f_' . str_replace('.', '__', $p);
                if ($t === 'image') {
                    if (!empty($_FILES[$name]['tmp_name'])) { $up = save_upload($_FILES[$name]); if ($up) path_set($item, $p, $up); }
                    elseif (path_get($item, $p) === null) path_set($item, $p, '');
                    continue;
                }
                $v = $_POST[$name] ?? '';
                if ($t === 'bool') $v = !empty($_POST[$name]);
                elseif ($t === 'number') $v = (int)$v;
                elseif ($t === 'lines') $v = array_values(array_filter(array_map(fn($l) => clean_str($l, 200), preg_split('/\r?\n/', (string)$v)), 'strlen'));
                elseif ($t === 'id') { $v = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', (string)$v), '-')); if ($v === '') $v = 'i' . bin2hex(random_bytes(3)); }
                elseif ($t === 'textarea') $v = clean_str($v, 1200);
                else $v = clean_str($v, 400);
                path_set($item, $p, $v);
            }
            if (isset($item['id'])) foreach ($list as $j => $o) if ($j !== $idx && ($o['id'] ?? null) === $item['id']) return 'المعرّف مستخدم من عنصر آخر، اختر معرّفاً مختلفاً';
            if ($idx >= 0 && isset($list[$idx])) $list[$idx] = $item; else $list[] = $item;
        }
        $c[$key] = array_values($list);
        return null;
    });
    if ($err) flash($err, 'bad'); else flash('تم الحفظ، والتغيير ظاهر على الموقع الآن');
    back('content.php?c=' . $key);
}

$list = al_load('content')[$key] ?? [];

function field_html(array $f, array $item, array $icons, array $colors): string {
    [$p, $label, $t] = $f;
    $name = 'f_' . str_replace('.', '__', $p);
    $v = path_get($item, $p);
    $wide = in_array($t, ['textarea', 'lines'], true) ? ' class="wide"' : '';
    $dir = str_ends_with($p, '.en') || in_array($t, ['id', 'number', 'time'], true) || $p === 'map' || $p === 'size' ? ' dir="ltr"' : '';
    switch ($t) {
        case 'textarea': $in = '<textarea name="' . $name . '" rows="3"' . $dir . '>' . e($v) . '</textarea>'; break;
        case 'lines': $in = '<textarea name="' . $name . '" rows="5"' . $dir . '>' . e(implode("\n", (array)$v)) . '</textarea>'; break;
        case 'number': $in = '<input type="number" name="' . $name . '" value="' . e($v ?? 0) . '" dir="ltr">'; break;
        case 'time': $in = '<input type="time" name="' . $name . '" value="' . e($v === '24:00' ? '23:59' : $v) . '">'; break;
        case 'bool': return '<label class="chk"><input type="checkbox" name="' . $name . '" value="1" ' . ($v ? 'checked' : '') . '> ' . e($label) . '</label>';
        case 'icon': $in = '<select name="' . $name . '">' . implode('', array_map(fn($k) => '<option value="' . $k . '"' . ($v === $k ? ' selected' : '') . '>' . $icons[$k] . '</option>', array_keys($icons))) . '</select>'; break;
        case 'color': $in = '<select name="' . $name . '">' . implode('', array_map(fn($k) => '<option value="' . $k . '"' . ($v === $k ? ' selected' : '') . '>' . $colors[$k] . '</option>', array_keys($colors))) . '</select>'; break;
        case 'image':
            $src = img_src($v);
            $in = ($src ? '<img class="thumb" src="' . e($src) . '" alt="">' : '') . '<input type="file" name="' . $name . '" accept="image/jpeg,image/png,image/webp">';
            break;
        default: $in = '<input name="' . $name . '" value="' . e($v) . '"' . $dir . '>';
    }
    return '<label' . $wide . '>' . e($label) . $in . '</label>';
}

admin_head($title, 'c-' . $key);
?>
<p class="muted lead">كل تعديل هنا يظهر على الموقع مباشرة بعد الحفظ، بدون أي برمجة.</p>
<?php foreach ($list as $i => $item): ?>
<details class="card item">
  <summary><span class="n"><?= $i + 1 ?></span><?= e(path_get($item, $labelPath) ?: '(بدون اسم)') ?>
    <?php if (isset($item['price'])): ?><em><?= number_format((int)$item['price']) ?> درهم</em><?php endif; ?></summary>
  <form method="post" enctype="multipart/form-data" class="form grid-f">
    <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="idx" value="<?= $i ?>">
    <?php foreach ($fields as $f) echo field_html($f, $item, $icons, $colors); ?>
    <div class="actions wide">
      <button class="btn" name="action" value="save">حفظ</button>
      <button class="btn btn--ghost" name="action" value="up" formnovalidate>↑</button>
      <button class="btn btn--ghost" name="action" value="down" formnovalidate>↓</button>
      <button class="btn btn--danger" name="action" value="delete" formnovalidate onclick="return confirm('حذف هذا العنصر؟')">حذف</button>
    </div>
  </form>
</details>
<?php endforeach; ?>
<details class="card item item--new" <?= $list ? '' : 'open' ?>>
  <summary><span class="n">+</span>إضافة عنصر جديد</summary>
  <form method="post" enctype="multipart/form-data" class="form grid-f">
    <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="idx" value="-1">
    <?php foreach ($fields as $f) echo field_html($f, [], $icons, $colors); ?>
    <div class="actions wide"><button class="btn" name="action" value="save">إضافة</button></div>
  </form>
</details>
<?php admin_foot();

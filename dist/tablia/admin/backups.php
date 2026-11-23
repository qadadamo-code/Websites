<?php
/** Backups: automatic every 3 hours + on demand; download, restore from the list or from a file. */
require __DIR__ . '/inc.php';
require_perm('backup.manage');
const RESTORE_SKIP = ['users', 'admin', 'log', 'undo', 'ratelimit', 'migrations'];
$types = ['auto' => 'تلقائية', 'manual' => 'يدوية', 'pre' => 'قبل استرجاع'];
$valid = fn(string $f) => preg_match('~^bk-\d{8}-\d{6}-(auto|manual|pre)-[0-9a-f]+\.json(\.gz)?$~', $f) && is_file(bc_backup_dir() . '/' . $f);

if (($_GET['dl'] ?? '') !== '') {
    $f = basename((string)$_GET['dl']);
    if (!$valid($f)) { http_response_code(404); exit; }
    log_act('تنزيل نسخة احتياطية', $f);
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="tablia-' . $f . '"');
    header('Content-Length: ' . filesize(bc_backup_dir() . '/' . $f));
    readfile(bc_backup_dir() . '/' . $f); exit;
}

function restore_bundle(array $b, string $label): int {
    bc_backup_make('pre', me()['name'] ?? '');                 // safety net: the current state before restoring
    $n = 0; $GLOBALS['bc_no_undo'] = true;
    foreach ($b['files'] as $k => $data) {
        if (!preg_match('/^[a-z0-9_-]+$/', (string)$k) || in_array($k, RESTORE_SKIP, true) || !is_array($data)) continue;
        bc_tx($k, function (&$d) use ($data) { $d = $data; }); $n++;
    }
    $GLOBALS['bc_no_undo'] = false;
    log_act('استرجاع نسخة احتياطية', $label . ' · ' . $n . ' ملف');
    return $n;
}

if (posted()) {
    $act = p('act');
    if ($act === 'make') { $f = bc_backup_make('manual', me()['name'] ?? ''); log_act('نسخة احتياطية يدوية', (string)$f); flash($f ? 'تم عمل نسخة احتياطية دلوقتي' : 'تعذّر حفظ النسخة، راجع مساحة الاستضافة', $f ? 'ok' : 'bad'); }
    if ($act === 'restore') {
        $f = basename(p('file'));
        $b = $valid($f) ? bc_backup_read(bc_backup_dir() . '/' . $f) : null;
        if (!$b) flash('النسخة دي مش سليمة', 'bad');
        else { restore_bundle($b, fdate($b['created'])); flash('تم الاسترجاع لنسخة ' . fdate($b['created']) . '. حالتك قبل الاسترجاع اتحفظت في نسخة «قبل استرجاع» لو حبيت ترجعلها'); }
    }
    if ($act === 'upload') {
        $tmp = $_FILES['bk']['tmp_name'] ?? '';
        $b = ($tmp && is_uploaded_file($tmp) && $_FILES['bk']['size'] < 40 * 1024 * 1024) ? bc_backup_read($tmp) : null;
        if (!$b) flash('الملف ده مش نسخة احتياطية من طبلية', 'bad');
        else { restore_bundle($b, 'ملف مرفوع ' . fdate($b['created'])); flash('تم الاسترجاع من الملف. حالتك قبلها اتحفظت في نسخة «قبل استرجاع»'); }
    }
    if ($act === 'delete') { $f = basename(p('file')); if ($valid($f)) { @unlink(bc_backup_dir() . '/' . $f); log_act('حذف نسخة احتياطية', $f); flash('تم حذف النسخة'); } }
    go('backups.php');
}
$list = bc_backup_list();
$last = $list[0]['at'] ?? '';
$total = array_sum(array_column($list, 'size'));
admin_head('النسخ الاحتياطي', 'backups', '<form method="post" class="inline-form">' . csrf_field() . '<input type="hidden" name="act" value="make"><button class="b b--primary">' . icon('shield') . ' نسخة احتياطية الآن</button></form>');
?>
<section class="kpis">
  <div class="kpi"><span>آخر نسخة</span><b class="latin" style="font-size:22px"><?= $last ? e(date('d/m · H:i', strtotime($last))) : '—' ?></b><small><?= $last ? ago($last) : 'لسه' ?></small></div>
  <div class="kpi"><span>النسخ المحفوظة</span><b class="latin"><?= count($list) ?></b><small><?= number_format($total / 1024) ?> KB</small></div>
  <div class="kpi"><span>النسخ التلقائية</span><b class="latin" style="font-size:22px">كل 3 ساعات</b><small>بيتحفظ آخر 7 أيام</small></div>
  <div class="kpi"><span>بيتحفظ في النسخة</span><b style="font-size:16px;line-height:1.5">المنيو والطلبات والحجوزات والخصومات والفعاليات والإعدادات</b></div>
</section>

<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>كل النسخ</h3><span class="muted">الاسترجاع بيرجّع المنيو والطلبات والحجوزات والخصومات والفعاليات والإعدادات، ومش بيلمس حسابات الموظفين</span></div>
    <?php if (!$list): ?><p class="empty">مفيش نسخ لسه. أول نسخة تلقائية هتتعمل مع أول زيارة، أو دوس «نسخة احتياطية الآن».</p><?php else: ?>
    <div class="tscroll"><table class="tbl">
      <thead><tr><th>التاريخ</th><th>النوع</th><th>الحجم</th><th></th></tr></thead>
      <tbody><?php foreach ($list as $b): ?>
        <tr><td class="nowrap"><b class="latin"><?= e(date('d/m/Y · H:i', strtotime($b['at']))) ?></b><small><?= ago($b['at']) ?></small></td>
          <td><span class="st st--<?= $b['type'] === 'auto' ? 'confirmed' : ($b['type'] === 'manual' ? 'done' : 'new') ?>"><?= $types[$b['type']] ?></span></td>
          <td class="latin"><?= number_format($b['size'] / 1024) ?> KB</td>
          <td class="end nowrap">
            <a class="icon-b" href="?dl=<?= e(rawurlencode($b['file'])) ?>" title="تنزيل"><?= icon('down') ?></a>
            <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="restore"><input type="hidden" name="file" value="<?= e($b['file']) ?>"><button class="b b--sm" data-confirm="ترجيع الموقع لحالته يوم <?= e(date('d/m H:i', strtotime($b['at']))) ?>؟ هنحفظ حالتك الحالية الأول."><?= icon('undo') ?> استرجاع</button></form>
            <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="file" value="<?= e($b['file']) ?>"><button class="icon-b" data-confirm="حذف النسخة دي نهائيًا؟" title="حذف"><?= icon('trash') ?></button></form>
          </td></tr>
      <?php endforeach; ?></tbody>
    </table></div>
    <?php endif; ?>
  </section>
  <div class="stack">
    <form method="post" enctype="multipart/form-data" class="card">
      <?= csrf_field() ?><input type="hidden" name="act" value="upload">
      <div class="card__head"><h3>استرجاع من ملف</h3></div>
      <p class="muted" style="margin-bottom:12px">لو نزّلت نسخة على جهازك قبل كده، ارفعها هنا وكل البيانات ترجع زي ما كانت.</p>
      <label class="f"><input type="file" name="bk" accept=".gz,.json,application/gzip,application/json" required></label>
      <div class="form-actions"><button class="b b--primary b--block" data-confirm="استرجاع البيانات من الملف ده؟ هنحفظ حالتك الحالية الأول.">استرجاع من الملف</button></div>
    </form>
    <section class="card">
      <div class="card__head"><h3>نصيحة</h3></div>
      <p class="muted">نزّل نسخة على موبايلك أو جهازك مرة كل أسبوع، عشان تبقى معاك نسخة حتى لو الاستضافة نفسها حصلها مشكلة.</p>
    </section>
  </div>
</div>
<?php admin_foot();

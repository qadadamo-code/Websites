<?php
/** Printable QR cards for the café tables: scanning opens the menu as an in-café order for that table. */
require __DIR__ . '/inc.php';
require_perm('settings.site');
$s = settings();
if (posted()) {
    $list = array_values(array_unique(array_filter(array_map(fn($l) => clean($l, 20), preg_split('/[\r\n,]+/', p('tables'))))));
    if (p('quick') !== '') { $n = max(1, min(200, (int)digits_en(p('quick')))); $list = array_map('strval', range(1, $n)); }
    bc_save('settings', array_merge($s, ['tables' => array_slice($list, 0, 200)]));
    log_act('تعديل الترابيزات', count($list) . ' ترابيزة');
    flash('اتحفظت الترابيزات، اطبع الكروت تحت');
    go('tables.php');
}
$tables = $s['tables'] ?? array_map('strval', range(1, 12));
$base = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? '') . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/x')), '/') . '/';
admin_head('QR الترابيزات', 'tables', '<button class="b b--primary" type="button" onclick="print()">' . icon('print') . ' اطبع الكروت</button>');
?>
<div class="cols np">
  <form method="post" class="card card--wide">
    <?= csrf_field() ?>
    <div class="card__head"><h3>الترابيزات</h3><span class="muted">كل سطر = ترابيزة (رقم أو اسم زي VIP أو تراس 3)</span></div>
    <div class="fg">
      <label class="f"><span>بسرعة: عندي كام ترابيزة؟</span><input name="quick" inputmode="numeric" class="latin" placeholder="<?= count($tables) ?>"></label>
      <label class="f f--full"><span>أو اكتبهم بنفسك</span><textarea name="tables" rows="4"><?= e(implode("\n", $tables)) ?></textarea></label>
    </div>
    <div class="form-actions"><button class="b b--primary">حفظ</button></div>
  </form>
  <section class="card">
    <div class="card__head"><h3>بيشتغل إزاي؟</h3></div>
    <p class="muted">العميل يصوّر الكود اللي على الترابيزة، المنيو يفتح عنده على طول، ولما يطلب الطلب بيوصل على واتساب والداشبورد ومكتوب عليه رقم الترابيزة. الطباعة على A4، وكل صفحة فيها 6 كروت جاهزة للقص.</p>
  </section>
</div>
<div class="qr-sheet" id="qrSheet" data-base="<?= e($base) ?>">
  <?php foreach ($tables as $t): ?>
  <div class="qr-card">
    <img src="../assets/brand/roundel-cream.png" alt="" class="qr-card__logo">
    <div class="qr-card__code" data-qr="<?= e($base . '?t=' . rawurlencode($t) . '#menu') ?>"></div>
    <b>امسح واطلب</b>
    <span>المنيو كامل والطلب يوصل على ترابيزتك</span>
    <div class="qr-card__table"><small>TABLE</small><i class="latin"><?= e($t) ?></i></div>
  </div>
  <?php endforeach; ?>
</div>
<script src="qrcode.js?v=<?= BC_VERSION ?>"></script>
<script>
document.querySelectorAll('[data-qr]').forEach((el) => {
  const q = qrcode(0, 'M'); q.addData(el.dataset.qr); q.make();
  el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  el.title = el.dataset.qr;
});
</script>
<?php admin_foot();

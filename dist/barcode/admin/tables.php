<?php
/**
 * Café tables: live board (which table has an open order), add / edit / delete tables,
 * and printable QR cards. Each QR carries the table's secret code, so a printed card can be
 * cancelled by giving the table a new code.
 */
require __DIR__ . '/inc.php';
require_perm('orders.view', 'tables.manage');
$tables = tables_all();
$byId = []; foreach ($tables as $t) $byId[$t['id']] = $t;
$manage = can('tables.manage');
/* QR card design (dashboard-editable). Layout = cards per A4 page; card size follows from it. */
const QR_LAYOUTS = [1 => [1, 1], 2 => [1, 2], 4 => [2, 2], 6 => [3, 2], 8 => [2, 4], 9 => [3, 3], 12 => [3, 4]];
const QR_THEMES = ['espresso' => 'إسبريسو (بني غامق)', 'cream' => 'كريمي فاتح', 'copper' => 'نحاسي', 'noir' => 'أسود ودهبي'];
$qd = array_merge(['per' => 6, 'theme' => 'espresso', 'dir' => 'auto', 'qr' => 62, 'title' => 'امسح واطلب', 'sub' => 'المنيو كامل والطلب يوصل على ترابيزتك',
    'label' => 'TABLE', 'foot' => '', 'logo' => true, 'table' => true, 'round' => true, 'zone' => false], (array)(settings()['qrCard'] ?? []));

if (posted()) {
    need('tables.manage');
    $act = p('act'); $id = p('id'); $t = $byId[$id] ?? null;
    $row = fn() => ['name' => clean(p('name'), 20), 'zone' => clean(p('zone'), 30), 'seats' => max(1, min(40, (int)digits_en(p('seats') ?: '4')))];
    if ($act === 'add') {
        $r = $row();
        $n = (int)digits_en(p('count'));
        $new = [];
        if ($n > 0) {
            // quick add: continue numbering after the highest numeric table name
            $max = 0; foreach ($tables as $x) if (ctype_digit($x['name'])) $max = max($max, (int)$x['name']);
            for ($i = 1; $i <= min(100, $n); $i++) $new[] = ['name' => (string)($max + $i)] + $r;
        } elseif ($r['name'] !== '') $new[] = $r;
        if (!$new) { flash('اكتب اسم أو رقم الترابيزة', 'bad'); go('tables.php#manage'); }
        $names = array_map(fn($x) => mb_strtolower($x['name']), $tables);
        foreach ($new as $x) if (in_array(mb_strtolower($x['name']), $names, true)) { flash('في ترابيزة اسمها ' . $x['name'] . ' بالفعل', 'bad'); go('tables.php#manage'); }
        $last = $tables ? max(array_column($tables, 'order')) : 0;
        bc_tx('tables', function (&$d) use ($new, &$last) {
            foreach ($new as $x) { $last += 10; $d[] = ['id' => bc_id('t'), 'name' => $x['name'], 'zone' => $x['zone'], 'seats' => $x['seats'], 'active' => true, 'code' => table_code(), 'order' => $last]; }
        });
        log_act('إضافة ترابيزات', implode('، ', array_column($new, 'name')));
        flash(count($new) === 1 ? 'اتضافت ترابيزة ' . $new[0]['name'] . '، الـ QR بتاعها جاهز تحت' : 'اتضاف ' . count($new) . ' ترابيزة، الكروت جاهزة للطباعة تحت');
        go('tables.php#manage');
    }
    if ($act === 'card') {
        $per = (int)p('per'); if (!isset(QR_LAYOUTS[$per])) $per = 6;
        $card = ['per' => $per, 'theme' => isset(QR_THEMES[p('theme')]) ? p('theme') : 'espresso', 'dir' => in_array(p('dir'), ['auto', 'v', 'h'], true) ? p('dir') : 'auto',
            'qr' => max(35, min(90, (int)p('qr'))), 'title' => clean(p('title'), 40), 'sub' => clean(p('sub'), 90), 'label' => clean(p('label'), 16),
            'foot' => clean(p('foot'), 80), 'logo' => !empty($_POST['logo']), 'table' => !empty($_POST['table']), 'round' => !empty($_POST['round']), 'zone' => !empty($_POST['zone'])];
        bc_save('settings', array_merge(settings(), ['qrCard' => $card]));
        log_act('تعديل تصميم كروت QR', $per . ' في الصفحة · ' . QR_THEMES[$card['theme']]);
        flash('اتحفظ تصميم الكروت'); go('tables.php#design');
    }
    if ($act === 'dinein') {
        $on = !empty($_POST['dineIn']);
        bc_save('settings', array_merge(settings(), ['dineIn' => $on]));
        log_act($on ? 'تفعيل الطلب من داخل الكافيه' : 'إيقاف الطلب من داخل الكافيه');
        flash($on ? 'اتفعل الطلب من داخل الكافيه: الزبون يقدر يطلب بالـ QR أو يختار رقم ترابيزته' : 'اتقفل الطلب من داخل الكافيه، والموقع بقى توصيل واستلام بس'); go('tables.php#manage');
    }
    if ($act === 'mode') {
        $m = in_array(p('mode'), ['both', 'site', 'whatsapp'], true) ? p('mode') : 'both';
        bc_save('settings', array_merge(settings(), ['tableOrder' => $m]));
        log_act('طريقة الطلب من الترابيزة', $m);
        flash('اتحفظت طريقة الطلب'); go('tables.php#manage');
    }
    if (!$t) { flash('الترابيزة مش موجودة', 'bad'); go('tables.php'); }
    if ($act === 'save') {
        $r = $row();
        if ($r['name'] === '') { flash('اسم الترابيزة مطلوب', 'bad'); go('tables.php#manage'); }
        foreach ($tables as $x) if ($x['id'] !== $id && mb_strtolower($x['name']) === mb_strtolower($r['name'])) { flash('في ترابيزة تانية بنفس الاسم', 'bad'); go('tables.php#manage'); }
        bc_tx('tables', function (&$d) use ($id, $r) { foreach ($d as &$x) if ($x['id'] === $id) $x = array_merge($x, $r, ['active' => !empty($_POST['active'])]); });
        log_act('تعديل ترابيزة', $t['name'] . ($t['name'] !== $r['name'] ? ' ← ' . $r['name'] : ''));
        flash('اتحفظت ترابيزة ' . $r['name']); go('tables.php#manage');
    }
    if ($act === 'toggle') {
        bc_tx('tables', function (&$d) use ($id) { foreach ($d as &$x) if ($x['id'] === $id) $x['active'] = empty($x['active']); });
        log_act(empty($t['active']) ? 'تشغيل ترابيزة' : 'إيقاف ترابيزة', $t['name']);
        flash(empty($t['active']) ? 'الترابيزة اشتغلت تاني' : 'الترابيزة اتوقفت: الـ QR بتاعها مش هيقبل طلبات'); go('tables.php#manage');
    }
    if ($act === 'recode') {
        bc_tx('tables', function (&$d) use ($id) { foreach ($d as &$x) if ($x['id'] === $id) $x['code'] = table_code(); });
        log_act('تغيير كود QR', $t['name']);
        flash('اتعمل كود جديد لترابيزة ' . $t['name'] . '. اطبع الكارت الجديد، القديم مبقاش شغال'); go('tables.php#manage');
    }
    if ($act === 'delete') {
        bc_tx('tables', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        log_act('حذف ترابيزة', $t['name']);
        flash('اتحذفت ترابيزة ' . $t['name']); go('tables.php#manage');
    }
    if ($act === 'move') {
        $dir = p('dir') === 'up' ? -1 : 1;
        $ids = array_column($tables, 'id'); $i = array_search($id, $ids, true); $j = $i + $dir;
        if ($i !== false && isset($ids[$j])) {
            [$ids[$i], $ids[$j]] = [$ids[$j], $ids[$i]];
            $ord = array_flip($ids);
            bc_tx('tables', function (&$d) use ($ord) { foreach ($d as &$x) if (isset($ord[$x['id']])) $x['order'] = ($ord[$x['id']] + 1) * 10; });
            log_act('ترتيب الترابيزات', $t['name']);
        }
        go('tables.php#manage');
    }
}

$live = table_live();
$mode = settings()['tableOrder'] ?? 'both';
$dine = !empty(settings()['dineIn']);
$base = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? '') . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/x')), '/') . '/';
$stLabel = ['new' => 'طلب جديد', 'preparing' => 'بيتحضّر', 'ready' => 'جاهز للتقديم'];
$ago = function (string $iso): string { $m = max(0, (int)floor((time() - strtotime($iso)) / 60)); return $m < 1 ? 'دلوقتي' : ($m < 60 ? 'من ' . $m . ' د' : 'من ' . floor($m / 60) . ' س'); };
admin_head('الترابيزات و QR', 'tables', $manage ? '<button class="b b--primary" type="button" data-print-all>' . icon('print') . ' اطبع كل الكروت</button>' : '');
?>
<section class="card np">
  <div class="card__head"><h3>حالة الترابيزات دلوقتي</h3><span class="muted"><?= count($live) ?> ترابيزة عليها طلبات مفتوحة · بتتحدث لوحدها</span></div>
  <div class="tboard" id="tboard">
    <?php foreach ($tables as $t): $l = $live[$t['id']] ?? null; ?>
    <a class="tbox <?= $l ? 'tbox--' . $l['st'] : '' ?> <?= empty($t['active']) ? 'is-off' : '' ?>" href="orders.php?table=<?= e(rawurlencode($t['id'])) ?>" data-tid="<?= e($t['id']) ?>">
      <span class="tbox__name latin"><?= e($t['name']) ?></span>
      <?php if ($t['zone']): ?><small><?= e($t['zone']) ?></small><?php endif; ?>
      <?php if ($l): ?>
        <em class="tbox__st"><?= $stLabel[$l['st']] ?></em>
        <span class="tbox__meta"><b class="latin"><?= count($l['orders']) ?></b> طلب · <b class="latin"><?= number_format($l['total']) ?></b> EGP · <?= $ago($l['at']) ?></span>
      <?php else: ?>
        <em class="tbox__st"><?= empty($t['active']) ? 'موقوفة' : 'فاضية' ?></em>
      <?php endif; ?>
    </a>
    <?php endforeach; ?>
    <?php if (!$tables): ?><p class="empty">لسه مفيش ترابيزات، ضيف من تحت</p><?php endif; ?>
  </div>
</section>

<?php if ($manage): ?>
<div class="cols np" id="manage">
  <section class="card card--wide">
    <div class="card__head"><h3>إدارة الترابيزات</h3><span class="muted"><?= count($tables) ?> ترابيزة</span></div>
    <form method="post" class="tadd">
      <?= csrf_field() ?><input type="hidden" name="act" value="add">
      <label class="f"><span>اسم أو رقم الترابيزة</span><input name="name" placeholder="مثلاً 13 أو VIP 1" maxlength="20"></label>
      <label class="f"><span>المكان (اختياري)</span><input name="zone" placeholder="جوه / تراس / دور تاني" maxlength="30"></label>
      <label class="f f--sm"><span>كراسي</span><input name="seats" inputmode="numeric" class="latin" value="4"></label>
      <label class="f f--sm"><span>أو ضيف عدد</span><input name="count" inputmode="numeric" class="latin" placeholder="مثلاً 5"></label>
      <button class="b b--primary"><?= icon('plus') ?> إضافة</button>
    </form>
    <div class="tscroll">
    <table class="tbl ttbl">
      <thead><tr><th>الترابيزة</th><th>المكان</th><th>كراسي</th><th>شغالة</th><th class="end">إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($tables as $i => $t): $fid = 'tf' . $t['id']; ?>
        <tr class="<?= empty($t['active']) ? 'is-hidden' : '' ?>">
          <td><input form="<?= $fid ?>" name="name" value="<?= e($t['name']) ?>" maxlength="20" class="in-cell latin" aria-label="اسم الترابيزة"></td>
          <td><input form="<?= $fid ?>" name="zone" value="<?= e($t['zone']) ?>" maxlength="30" class="in-cell" placeholder="—" aria-label="المكان"></td>
          <td><input form="<?= $fid ?>" name="seats" value="<?= (int)$t['seats'] ?>" inputmode="numeric" class="in-cell in-cell--n latin" aria-label="كراسي"></td>
          <td><label class="switch"><input form="<?= $fid ?>" type="checkbox" name="active" value="1" <?= !empty($t['active']) ? 'checked' : '' ?>><i></i></label></td>
          <td class="end nowrap">
            <form method="post" id="<?= $fid ?>" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="save"><input type="hidden" name="id" value="<?= e($t['id']) ?>"><button class="b b--sm b--primary">حفظ</button></form>
            <button type="button" class="b b--sm" data-print-one="<?= e($t['id']) ?>" title="اطبع الكارت ده بس"><?= icon('print') ?></button>
            <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="move"><input type="hidden" name="dir" value="up"><input type="hidden" name="id" value="<?= e($t['id']) ?>"><button class="b b--sm" <?= $i === 0 ? 'disabled' : '' ?> title="لفوق">↑</button></form>
            <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="move"><input type="hidden" name="dir" value="down"><input type="hidden" name="id" value="<?= e($t['id']) ?>"><button class="b b--sm" <?= $i === count($tables) - 1 ? 'disabled' : '' ?> title="لتحت">↓</button></form>
            <form method="post" class="inline-form" data-confirm="هيتعمل QR جديد للترابيزة دي والكارت القديم هيبطّل يشتغل. تكمل؟"><?= csrf_field() ?><input type="hidden" name="act" value="recode"><input type="hidden" name="id" value="<?= e($t['id']) ?>"><button class="b b--sm" title="كود جديد (يلغي الكارت القديم)"><?= icon('undo') ?></button></form>
            <form method="post" class="inline-form" data-confirm="متأكد إنك عايز تحذف ترابيزة <?= e($t['name']) ?>؟"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($t['id']) ?>"><button class="b b--sm b--danger" title="حذف"><?= icon('trash') ?></button></form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    </div>
  </section>
  <section class="card">
    <div class="card__head"><h3>الطلب من داخل الكافيه</h3></div>
    <form method="post" class="dinein <?= $dine ? 'is-on' : '' ?>">
      <?= csrf_field() ?><input type="hidden" name="act" value="dinein">
      <label class="switch"><input type="checkbox" name="dineIn" value="1" <?= $dine ? 'checked' : '' ?> onchange="this.form.submit()"><i></i><span><b><?= $dine ? 'مفعّل' : 'مقفول' ?></b><small><?= $dine ? 'الزبون يقدر يطلب من الترابيزة بالـ QR، أو يختار "في الكافيه" ويحدد رقم ترابيزته' : 'الموقع توصيل واستلام بس، والـ QR بيفتح المنيو للتصفح من غير طلب' ?></small></span></label>
    </form>
    <div class="card__head" style="margin-top:18px"><h3>الزبون يطلب إزاي؟</h3></div>
    <form method="post" class="tmode" <?= $dine ? '' : 'style="opacity:.5;pointer-events:none"' ?>>
      <?= csrf_field() ?><input type="hidden" name="act" value="mode">
      <?php foreach (['both' => ['الاتنين، والزبون يختار', 'زرار "ابعت للكافيه" من الموقع، وتحته "أو ابعته على واتساب"'], 'site' => ['من الموقع بس', 'الطلب يوصل لوحة التحكم على طول مع تنبيه بصوت'], 'whatsapp' => ['واتساب بس', 'الطلب يتبعت على واتساب الكافيه ومكتوب فيه رقم الترابيزة']] as $k => [$lb, $ds]): ?>
        <label class="opt"><input type="radio" name="mode" value="<?= $k ?>" <?= $mode === $k ? 'checked' : '' ?> onchange="this.form.submit()"><span><b><?= $lb ?></b><small><?= $ds ?></small></span></label>
      <?php endforeach; ?>
    </form>
    <p class="muted" style="margin-top:12px">في كل الحالات الطلب بيتسجل في صفحة الطلبات باسم الترابيزة. ولو كارت اتسرق أو اتصوّر برّه الكافيه، دوس على زرار الكود الجديد جنب الترابيزة واطبع كارت جديد.</p>
  </section>
</div>

<section class="card np qd" id="design">
  <div class="card__head"><h3>تصميم كروت الـ QR</h3><span class="muted">أي تغيير بيظهر على الكروت تحت على طول، ودوس حفظ عشان يتثبت للطباعة</span></div>
  <form method="post" id="qdForm" class="qd__form">
    <?= csrf_field() ?><input type="hidden" name="act" value="card">
    <div class="qd__group"><h4>المقاس وطريقة العرض</h4>
      <div class="f"><span>عدد الكروت في صفحة A4</span>
        <div class="seg-pick"><?php foreach (QR_LAYOUTS as $n => [$c, $r]): ?><label><input type="radio" name="per" value="<?= $n ?>" <?= (int)$qd['per'] === $n ? 'checked' : '' ?>><span class="latin"><?= $n ?></span></label><?php endforeach; ?></div>
        <small id="qdSize"></small>
      </div>
      <div class="f"><span>شكل الكارت</span>
        <div class="seg-pick seg-pick--txt"><?php foreach (['auto' => 'تلقائي', 'v' => 'طولي', 'h' => 'عرضي'] as $k => $l): ?><label><input type="radio" name="dir" value="<?= $k ?>" <?= $qd['dir'] === $k ? 'checked' : '' ?>><span><?= $l ?></span></label><?php endforeach; ?></div>
      </div>
      <label class="f"><span>حجم الكود <b class="latin" id="qrVal"><?= (int)$qd['qr'] ?>%</b></span><input type="range" name="qr" min="35" max="90" value="<?= (int)$qd['qr'] ?>" class="range"></label>
    </div>
    <div class="qd__group"><h4>التصميم</h4>
      <div class="qd__themes"><?php foreach (QR_THEMES as $k => $l): ?><label class="qd__theme qrt-<?= $k ?>"><input type="radio" name="theme" value="<?= $k ?>" <?= $qd['theme'] === $k ? 'checked' : '' ?>><i></i><span><?= $l ?></span></label><?php endforeach; ?></div>
      <div class="chips-row" style="margin-top:12px">
        <label class="chk"><input type="checkbox" name="logo" value="1" <?= $qd['logo'] ? 'checked' : '' ?>> اللوجو</label>
        <label class="chk"><input type="checkbox" name="table" value="1" <?= $qd['table'] ? 'checked' : '' ?>> رقم الترابيزة</label>
        <label class="chk"><input type="checkbox" name="zone" value="1" <?= $qd['zone'] ? 'checked' : '' ?>> المكان (تراس…)</label>
        <label class="chk"><input type="checkbox" name="round" value="1" <?= $qd['round'] ? 'checked' : '' ?>> حواف دايرية</label>
      </div>
    </div>
    <div class="qd__group"><h4>الكلام</h4>
      <label class="f"><span>العنوان</span><input name="title" value="<?= e($qd['title']) ?>" maxlength="40"></label>
      <label class="f"><span>السطر اللي تحته</span><input name="sub" value="<?= e($qd['sub']) ?>" maxlength="90"></label>
      <label class="f"><span>كلمة قبل الرقم</span><input name="label" value="<?= e($qd['label']) ?>" maxlength="16" placeholder="TABLE أو ترابيزة"></label>
      <label class="f"><span>سطر في الآخر (اختياري)</span><input name="foot" value="<?= e($qd['foot']) ?>" maxlength="80" placeholder="مثلاً: Wi-Fi: Barcode · باسورد 12345678"></label>
    </div>
    <div class="qd__acts"><button class="b b--primary"><?= icon('edit') ?> حفظ التصميم</button><button type="button" class="b" data-print-all><?= icon('print') ?> اطبع كل الكروت</button></div>
  </form>
</section>

<?php [$qc, $qr] = QR_LAYOUTS[(int)$qd['per']]; $qw = (190 - 6 * ($qc - 1)) / $qc; $qh = (277 - 6 * ($qr - 1)) / $qr; $qlay = $qd['dir'] === 'auto' ? ($qw / $qh > 1.25 ? 'h' : 'v') : $qd['dir']; ?>
<div class="qr-sheet qrt-<?= e($qd['theme']) ?> <?= $qd['round'] ? 'is-round' : '' ?>" id="qrSheet" data-layout="<?= $qlay ?>" style="--cols:<?= $qc ?>;--rows:<?= $qr ?>;--qr:<?= (int)$qd['qr'] ?>;--ar:<?= round($qw, 2) ?> / <?= round($qh, 2) ?>">
  <?php foreach ($tables as $t): if (empty($t['active'])) continue; ?>
  <div class="qr-card" data-card="<?= e($t['id']) ?>">
    <div class="qr-card__in">
      <img src="../assets/brand/roundel-cream.png" alt="" class="qr-card__logo qr-card__logo--c" <?= $qd['logo'] ? '' : 'hidden' ?>><img src="../assets/brand/roundel-dark.png" alt="" class="qr-card__logo qr-card__logo--d" <?= $qd['logo'] ? '' : 'hidden' ?>>
      <div class="qr-card__code" data-qr="<?= e($base . '?t=' . rawurlencode($t['code']) . '#menu') ?>"></div>
      <div class="qr-card__txt">
        <b class="qr-card__title" <?= $qd['title'] === '' ? 'hidden' : '' ?>><?= e($qd['title']) ?></b>
        <span class="qr-card__sub" <?= $qd['sub'] === '' ? 'hidden' : '' ?>><?= e($qd['sub']) ?></span>
        <div class="qr-card__table" <?= $qd['table'] ? '' : 'hidden' ?>><small class="qr-card__label"><?= e($qd['label']) ?></small><i class="latin"><?= e($t['name']) ?></i></div>
        <em class="qr-card__zone" <?= $qd['zone'] && $t['zone'] !== '' ? '' : 'hidden' ?> data-has="<?= $t['zone'] !== '' ? 1 : 0 ?>"><?= e($t['zone']) ?></em>
        <span class="qr-card__foot" <?= $qd['foot'] === '' ? 'hidden' : '' ?>><?= e($qd['foot']) ?></span>
      </div>
    </div>
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
(() => {
  const f = document.getElementById('qdForm'), sh = document.getElementById('qrSheet'); if (!f || !sh) return;
  const L = <?= json_encode(QR_LAYOUTS) ?>;
  const W = 190, H = 277, G = 6; // A4 printable area and gap, mm
  const apply = () => {
    const per = f.per.value, [c, r] = L[per], w = (W - G * (c - 1)) / c, h = (H - G * (r - 1)) / r;
    sh.style.setProperty('--cols', c); sh.style.setProperty('--rows', r); sh.style.setProperty('--qr', f.qr.value);
    sh.style.setProperty('--ar', `${w} / ${h}`);
    const dir = f.dir.value === 'auto' ? (w / h > 1.25 ? 'h' : 'v') : f.dir.value;
    sh.dataset.layout = dir;
    sh.className = sh.className.replace(/qrt-\w+/, 'qrt-' + f.theme.value);
    sh.classList.toggle('is-round', f.round.checked);
    document.getElementById('qrVal').textContent = f.qr.value + '%';
    document.getElementById('qdSize').textContent = `مقاس الكارت تقريبًا ${Math.round(w)} × ${Math.round(h)} مم`;
    const set = (sel, val) => sh.querySelectorAll(sel).forEach((el) => { el.textContent = val; el.hidden = !val; });
    set('.qr-card__title', f.title.value.trim()); set('.qr-card__sub', f.sub.value.trim()); set('.qr-card__foot', f.foot.value.trim());
    sh.querySelectorAll('.qr-card__label').forEach((el) => { el.textContent = f.label.value.trim(); });
    sh.querySelectorAll('.qr-card__logo').forEach((el) => { el.hidden = !f.logo.checked; });
    sh.querySelectorAll('.qr-card__table').forEach((el) => { el.hidden = !f.table.checked; });
    sh.querySelectorAll('.qr-card__zone').forEach((el) => { el.hidden = !(f.zone.checked && el.dataset.has === '1'); });
  };
  f.addEventListener('input', apply); f.addEventListener('change', apply); apply();
})();
document.querySelectorAll('[data-print-all]').forEach((b) => b.addEventListener('click', () => { document.body.classList.remove('print-one'); print(); }));
document.querySelectorAll('[data-print-one]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.qr-card').forEach((c) => c.classList.toggle('is-print', c.dataset.card === b.dataset.printOne));
  document.body.classList.add('print-one'); print();
  setTimeout(() => document.body.classList.remove('print-one'), 500);
}));
</script>
<?php endif; ?>
<?php admin_foot();

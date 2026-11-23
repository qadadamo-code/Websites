<?php
/**
 * Send invitations/offers to every customer on WhatsApp, one tap per person (WhatsApp blocks automatic bulk
 * sending from normal numbers). Customers are collected from orders, reservations and event guests, de-duplicated.
 */
require __DIR__ . '/inc.php';
require_perm('events.guests', 'disc.edit');

/* ---------- customers ---------- */
$people = [];
$addP = function (string $name, string $phone, string $at, string $src) use (&$people) {
    $wa = wa_phone($phone);
    if (strlen($wa) < 10) return;
    $p = $people[$wa] ?? ['name' => $name, 'phone' => $phone, 'wa' => $wa, 'last' => '', 'n' => 0, 'src' => []];
    $p['n']++; $p['src'][$src] = true;
    if ($at > $p['last']) { $p['last'] = $at; if ($name !== '') $p['name'] = $name; }
    $people[$wa] = $p;
};
foreach (bc_load('orders') as $o) $addP($o['name'] ?? '', $o['phone'] ?? '', $o['at'] ?? '', 'orders');
foreach (bc_load('reservations') as $r) $addP($r['name'] ?? '', $r['phone'] ?? '', $r['at'] ?? ($r['date'] ?? ''), 'res');
foreach (bc_load('rsvps') as $r) $addP($r['name'] ?? '', $r['phone'] ?? '', $r['at'] ?? '', 'events');
uasort($people, fn($a, $b) => strcmp($b['last'], $a['last']));
$srcL = ['orders' => 'طلبات', 'res' => 'حجوزات', 'events' => 'فعاليات'];

/* ---------- exports ---------- */
$x = (string)($_GET['export'] ?? '');
if ($x !== '' && can('export')) {
    log_act('تنزيل أرقام العملاء', count($people) . ' عميل · ' . $x);
    if ($x === 'vcf') {
        header('Content-Type: text/vcard; charset=utf-8');
        header('Content-Disposition: attachment; filename="barcode-customers-' . date('Y-m-d') . '.vcf"');
        foreach ($people as $p) {
            $n = str_replace([';', ',', "\n", "\r"], ' ', $p['name'] ?: 'عميل');
            echo "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:{$n} (باركود)\r\nN:{$n};;;;\r\nTEL;TYPE=CELL:+{$p['wa']}\r\nEND:VCARD\r\n";
        }
        exit;
    }
    csv_download('barcode-customers', ['الاسم', 'الموبايل', 'واتساب', 'عدد التعاملات', 'آخر تعامل', 'المصدر'],
        array_map(fn($p) => [$p['name'], $p['phone'], '+' . $p['wa'], $p['n'], fdate($p['last']), implode('، ', array_map(fn($k) => $srcL[$k], array_keys($p['src'])))], array_values($people)));
}

/* ---------- campaign (what's being sent) ---------- */
$base = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? '') . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/x')), '/') . '/';
$events = array_values(array_filter(bc_load('events'), fn($e) => ($e['date'] ?? '') >= today()));
usort($events, fn($a, $b) => strcmp($a['date'], $b['date']));
$coupons = array_values(array_filter(bc_load('coupons'), fn($c) => !empty($c['active']) && in_window($c['from'] ?: null, $c['to'] ?: null)));
$brand = settings()['brand'] ?? 'باركود كافيه';
$tpls = [];
foreach ($events as $e) $tpls['ev-' . $e['id']] = ['label' => 'دعوة: ' . $e['title'], 'text' => "أهلًا {name} 👋\nمعزوم على «{$e['title']}» في {$brand}\n📅 " . date('d/m', strtotime($e['date'])) . ($e['time'] ? ' · ' . $e['time'] : '') . "\nأكّد حضورك من هنا:\n{$base}event.php?e=" . rawurlencode($e['slug'])];
foreach ($coupons as $c) $tpls['cp-' . $c['id']] = ['label' => 'عرض: كود ' . $c['code'], 'text' => "أهلًا {name} ☕\nعشانك من عملاء {$brand} المميزين: كود خصم " . ($c['type'] === 'fixed' ? (0 + $c['value']) . ' ج.م' : (0 + $c['value']) . '%') . "\nاكتب الكود {$c['code']} في الفاتورة واطلب من هنا:\n{$base}" . (!empty($c['to']) ? "\nالعرض لحد " . date('d/m', strtotime($c['to'])) : '')];
$tpls['menu'] = ['label' => 'المنيو الجديد', 'text' => "أهلًا {name} 👋\nنزّلنا أصناف جديدة في {$brand}، شوف المنيو واطلب من هنا:\n{$base}"];
$tpls['custom'] = ['label' => 'رسالة من عندك', 'text' => "أهلًا {name} 👋\n"];
$key = (string)($_GET['t'] ?? array_key_first($tpls));
if (!isset($tpls[$key])) $key = array_key_first($tpls);

$sentAll = bc_load('invites');
if (posted() && p('act') === 'mark') {
    $wa = preg_replace('/\D/', '', p('wa')); $k = preg_replace('/[^a-z0-9-]/', '', p('t'));
    $GLOBALS['bc_no_undo'] = true;
    bc_tx('invites', function (&$d) use ($wa, $k) { $d[$k][$wa] = now_iso(); });
    header('Content-Type: application/json'); echo '{"ok":true}'; exit;
}
if (posted() && p('act') === 'reset') { $k = preg_replace('/[^a-z0-9-]/', '', p('t')); bc_tx('invites', function (&$d) use ($k) { unset($d[$k]); }); log_act('تصفير قائمة الإرسال', $tpls[$k]['label'] ?? $k); flash('اتصفّرت علامات الإرسال للرسالة دي'); go('invite.php?t=' . rawurlencode($k)); }
$sent = $sentAll[$key] ?? [];
$src = (string)($_GET['src'] ?? '');
$list = array_values(array_filter($people, fn($p) => $src === '' || !empty($p['src'][$src])));
$left = count(array_filter($list, fn($p) => !isset($sent[$p['wa']])));

admin_head('إرسال الدعوات والعروض', 'invite', can('export') ? '<a class="b" href="?export=vcf">' . icon('down') . ' جهات اتصال (vCard)</a><a class="b" href="?export=csv">' . icon('down') . ' Excel</a>' : '');
?>
<section class="card wa-how">
  <div class="card__head"><h3>إزاي بتشتغل؟</h3><span class="muted"><?= count($people) ?> عميل من الطلبات والحجوزات والفعاليات، من غير تكرار</span></div>
  <p class="muted">اختار الرسالة، ودوس «ابدأ الإرسال». كل ضغطة بتفتح واتساب على عميل والرسالة مكتوبة باسمه، تبعت وترجع تدوس «التالي». واتساب بيمنع الإرسال الجماعي الأوتوماتيك من الأرقام العادية، والطريقة دي بتحمي رقمك من الحظر. ولو عايز تستخدم «قوائم البث» في واتساب بيزنس، نزّل جهات الاتصال (vCard) واحفظها على موبايل الكافيه.</p>
</section>

<div class="cols">
  <section class="card card--wide">
    <form method="get" class="fg" id="tplForm">
      <label class="f"><span>الرسالة</span><select name="t" data-autosubmit><?php foreach ($tpls as $k => $t): ?><option value="<?= e($k) ?>" <?= sel($key, $k) ?>><?= e($t['label']) ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>العملاء</span><select name="src" data-autosubmit><option value="">كل العملاء (<?= count($people) ?>)</option><?php foreach ($srcL as $k => $l): ?><option value="<?= $k ?>" <?= sel($src, $k) ?>>اللي جم من <?= $l ?></option><?php endforeach; ?></select></label>
    </form>
    <label class="f" style="margin-top:12px"><span>نص الرسالة <small class="muted">({name} = اسم العميل)</small></span><textarea id="waMsg" rows="7" maxlength="900"><?= e($tpls[$key]['text']) ?></textarea></label>
    <div class="wa-run" id="waRun" data-key="<?= e($key) ?>" data-csrf="<?= e(csrf()) ?>">
      <div class="wa-run__stat"><b class="latin" id="waLeft"><?= $left ?></b><span>لسه ما اتبعتلهمش من <?= count($list) ?></span></div>
      <div class="wa-run__cur" id="waCur" hidden><small>العميل الحالي</small><b id="waName"></b><span class="latin" id="waPhone" dir="ltr"></span></div>
      <div class="wa-run__btns">
        <a class="b b--primary" id="waGo" href="#" target="_blank" rel="noopener"><?= icon('ext') ?> ابدأ الإرسال</a>
        <button class="b" id="waSkip" type="button" hidden>تخطّي</button>
      </div>
    </div>
  </section>
  <section class="card">
    <div class="card__head"><h3>القائمة</h3>
      <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="reset"><input type="hidden" name="t" value="<?= e($key) ?>"><button class="b b--sm" data-confirm="تصفير علامات الإرسال للرسالة دي؟">تصفير</button></form></div>
    <?php if (!$list): ?><p class="empty">لسه مفيش عملاء. أول ما توصل طلبات أو حجوزات هيظهروا هنا.</p><?php endif; ?>
    <ul class="wa-list" id="waList" data-lenis-prevent>
      <?php foreach ($list as $p): ?>
      <li data-wa="<?= e($p['wa']) ?>" data-name="<?= e(explode(' ', trim($p['name']))[0] ?? '') ?>" data-full="<?= e($p['name']) ?>" class="<?= isset($sent[$p['wa']]) ? 'is-sent' : '' ?>">
        <span><b><?= e($p['name'] ?: 'عميل') ?></b><small class="latin" dir="ltr"><?= e($p['phone']) ?></small></span>
        <em><?= isset($sent[$p['wa']]) ? '✓ اتبعت' : implode('، ', array_map(fn($k) => $srcL[$k], array_keys($p['src']))) ?></em>
      </li>
      <?php endforeach; ?>
    </ul>
  </section>
</div>
<?php admin_foot();

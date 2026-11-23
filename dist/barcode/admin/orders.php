<?php
require __DIR__ . '/inc.php';
require_admin();

if (posted()) {
    $id = p('id'); $st = p('status');
    if (p('act') === 'delete') {
        bc_tx('orders', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($o) => $o['id'] !== $id)); });
        flash('تم حذف الطلب'); go('orders.php');
    }
    if (isset(ORDER_ST[$st])) bc_tx('orders', function (&$d) use ($id, $st) { foreach ($d as &$o) if ($o['id'] === $id) $o['status'] = $st; });
    flash('تم تحديث حالة الطلب: ' . (ORDER_ST[$st] ?? ''));
    go('orders.php?' . http_build_query(array_filter(['st' => $_GET['st'] ?? '', 'q' => $_GET['q'] ?? '', 'open' => p('back') === 'open' ? $id : ''])));
}

$orders = bc_load('orders');
$fs = (string)($_GET['st'] ?? ''); $q = trim((string)($_GET['q'] ?? '')); $from = (string)($_GET['from'] ?? ''); $to = (string)($_GET['to'] ?? '');
$list = array_values(array_filter($orders, function ($o) use ($fs, $q, $from, $to) {
    if ($fs !== '' && $o['status'] !== $fs) return false;
    $d = substr($o['at'], 0, 10);
    if ($from !== '' && $d < $from) return false;
    if ($to !== '' && $d > $to) return false;
    if ($q !== '' && mb_stripos($o['name'] . ' ' . $o['phone'] . ' ' . ($o['no'] ?? ''), $q) === false) return false;
    return true;
}));
if (($_GET['export'] ?? '') === 'csv') {
    csv_download('orders', ['رقم', 'التاريخ', 'العميل', 'الموبايل', 'النوع', 'العنوان', 'الأصناف', 'قبل الخصم', 'الخصم', 'الكود', 'الإجمالي', 'الحالة', 'ملاحظات'],
        array_map(fn($o) => [$o['no'] ?? '', fdate($o['at']), $o['name'], $o['phone'], $o['type'], $o['address'] ?? '',
            implode(' + ', array_map(fn($l) => $l['qty'] . '× ' . $l['name'], $o['items'])), $o['subtotal'], $o['discount'], $o['coupon'] ?? '', $o['total'],
            ORDER_ST[$o['status']] ?? $o['status'], $o['notes'] ?? ''], $list));
}
$cnt = ['' => count($orders)]; foreach (ORDER_ST as $k => $_) $cnt[$k] = count(array_filter($orders, fn($o) => $o['status'] === $k));
$open = (string)($_GET['open'] ?? ''); $cur = null; foreach ($orders as $o) if ($o['id'] === $open) $cur = $o;
$sum = array_sum(array_column(array_filter($list, fn($o) => $o['status'] !== 'cancelled'), 'total'));
$qs = fn(array $x) => '?' . http_build_query(array_filter(array_merge(['st' => $fs, 'q' => $q, 'from' => $from, 'to' => $to], $x)));
function wa_phone(string $p): string { $d = preg_replace('/\D/', '', $p); return strpos($d, '0') === 0 ? '2' . $d : $d; }

admin_head('الطلبات', 'orders', '<a class="b" href="' . e($qs(['export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>');
?>
<p class="hint" style="margin-bottom:14px">كل طلب يبعته العميل من الموقع (واتساب أو إيميل) بيتسجّل هنا تلقائيًا بأسعار المنيو الحالية. غيّر حالته وانت بتحضّره.</p>
<nav class="tabs">
  <a href="<?= e($qs(['st' => ''])) ?>" class="<?= $fs === '' ? 'is-on' : '' ?>">الكل <b><?= $cnt[''] ?></b></a>
  <?php foreach (ORDER_ST as $k => $l): ?><a href="<?= e($qs(['st' => $k])) ?>" class="<?= $fs === $k ? 'is-on' : '' ?>"><?= $l ?> <b><?= $cnt[$k] ?></b></a><?php endforeach; ?>
</nav>
<form class="filters" method="get">
  <input type="hidden" name="st" value="<?= e($fs) ?>">
  <div class="search"><?= icon('search') ?><input name="q" value="<?= e($q) ?>" placeholder="اسم العميل أو الموبايل أو رقم الطلب"></div>
  <input type="date" name="from" value="<?= e($from) ?>" title="من">
  <input type="date" name="to" value="<?= e($to) ?>" title="إلى">
  <button class="b">بحث</button>
  <span class="muted"><?= count($list) ?> طلب · <?= egp($sum) ?></span>
</form>

<?php if ($cur): $wp = wa_phone($cur['phone']); ?>
<section class="card" style="margin-bottom:18px;border-color:rgba(201,141,84,.35)" id="detail">
  <div class="card__head"><h3>طلب <?= $cur['no'] ? '<span class="latin">#' . e($cur['no']) . '</span>' : '' ?> · <?= e($cur['name']) ?></h3><a href="<?= e($qs([])) ?>">إغلاق ✕</a></div>
  <div class="cols" style="margin:0">
    <div>
      <table class="lines">
        <?php foreach ($cur['items'] as $l): ?><tr><td><?= e($l['name']) ?> <span class="muted latin">× <?= (int)$l['qty'] ?></span></td><td class="end latin"><?= egp($l['price'] * $l['qty']) ?></td></tr><?php endforeach; ?>
        <tfoot>
          <?php if (!empty($cur['discount'])): ?><tr><td class="muted">قبل الخصم</td><td class="end latin muted"><?= egp($cur['subtotal']) ?></td></tr>
          <tr><td style="color:var(--glow)">خصم <?= $cur['coupon'] ? '<span class="code">' . e($cur['coupon']) . '</span>' : '' ?></td><td class="end latin" style="color:var(--glow)">- <?= egp($cur['discount']) ?></td></tr><?php endif; ?>
          <tr><td>الإجمالي</td><td class="end latin" style="font-size:18px;color:var(--paper)"><?= egp($cur['total']) ?></td></tr>
        </tfoot>
      </table>
    </div>
    <div class="detail">
      <dl class="kv">
        <dt>الموبايل</dt><dd class="latin" dir="ltr" style="text-align:end"><?= e($cur['phone']) ?></dd>
        <dt>نوع الطلب</dt><dd><?= e($cur['type']) ?></dd>
        <?php if (!empty($cur['address'])): ?><dt>العنوان</dt><dd><?= e($cur['address']) ?></dd><?php endif; ?>
        <?php if (!empty($cur['notes'])): ?><dt>ملاحظات</dt><dd><?= e($cur['notes']) ?></dd><?php endif; ?>
        <dt>وصل</dt><dd><?= fdate($cur['at']) ?> · عبر <?= $cur['channel'] === 'email' ? 'الإيميل' : 'واتساب' ?></dd>
        <dt>الحالة</dt><dd><?= badge($cur['status'], ORDER_ST) ?></dd>
      </dl>
      <form method="post" class="dl"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($cur['id']) ?>"><input type="hidden" name="back" value="open">
        <?php foreach (ORDER_ST as $k => $l) if ($k !== $cur['status']): ?><button class="b b--sm" name="status" value="<?= $k ?>"><?= $l ?></button><?php endif; ?>
        <?php if ($wp): ?><a class="b b--sm" target="_blank" href="https://wa.me/<?= e($wp) ?>?text=<?= rawurlencode('أهلًا ' . $cur['name'] . '، طلبك من باركود وصلنا وجاري تحضيره ☕') ?>"><?= icon('wa') ?> رد على العميل</a><?php endif; ?>
        <button class="b b--sm b--danger" name="act" value="delete" data-confirm="حذف الطلب من السجل؟">حذف</button>
      </form>
    </div>
  </div>
</section>
<?php endif; ?>

<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>الطلب</th><th>العميل</th><th>الأصناف</th><th>الإجمالي</th><th>الحالة</th><th></th></tr></thead>
  <tbody>
  <?php foreach (array_slice($list, 0, 300) as $o): ?>
    <tr class="<?= $o['id'] === $open ? 'is-open' : '' ?>">
      <td class="nowrap"><b class="latin"><?= $o['no'] ? '#' . e($o['no']) : '—' ?></b><small><?= ago($o['at']) ?></small></td>
      <td><a href="<?= e($qs(['open' => $o['id']])) ?>#detail" style="color:var(--cream)"><b><?= e($o['name']) ?></b></a><small><?= e($o['type']) ?> · <span class="latin" dir="ltr"><?= e($o['phone']) ?></span></small></td>
      <td><small style="color:var(--taupe);max-width:280px"><?= e(implode('، ', array_map(fn($l) => $l['qty'] . '× ' . $l['name'], array_slice($o['items'], 0, 4)))) ?><?= count($o['items']) > 4 ? '…' : '' ?></small></td>
      <td class="nowrap"><b class="latin"><?= egp($o['total']) ?></b><?php if (!empty($o['discount'])): ?><small class="sale">خصم <?= egp($o['discount']) ?></small><?php endif; ?></td>
      <td><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($o['id']) ?>">
        <select name="status" class="inp" style="padding:6px 10px;width:auto" data-autosubmit><?php foreach (ORDER_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($o['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></form></td>
      <td class="end"><a class="icon-b" href="<?= e($qs(['open' => $o['id']])) ?>#detail" title="التفاصيل"><?= icon('eye') ?></a></td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="6" class="empty"><?= $orders ? 'لا توجد طلبات مطابقة.' : 'لم تصل طلبات بعد. أول طلب من الموقع سيظهر هنا.' ?></td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

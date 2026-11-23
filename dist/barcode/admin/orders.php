<?php
require __DIR__ . '/inc.php';
require_perm('orders.view');

if (posted()) {
    $id = p('id'); $st = p('status');
    $ref = ''; foreach (bc_load('orders') as $x) if ($x['id'] === $id) $ref = '#' . ($x['no'] ?? '') . ' · ' . $x['name'];
    if (p('act') === 'delete') {
        need('orders.delete');
        log_act('حذف طلب', $ref);
        bc_tx('orders', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($o) => $o['id'] !== $id)); });
        flash('تم حذف الطلب'); go('orders.php');
    }
    need('orders.edit');
    if (p('act') === 'pay') { $pm = array_key_exists(p('pay'), PAY_METHODS) ? p('pay') : ''; bc_tx('orders', function (&$d) use ($id, $pm) { foreach ($d as &$o) if ($o['id'] === $id) { $o['pay'] = $pm; $o['paid'] = $pm !== ''; } }); log_act('تسجيل دفع', $ref . ' · ' . PAY_METHODS[$pm]); flash('تم تسجيل الدفع: ' . PAY_METHODS[$pm]); go('orders.php?open=' . rawurlencode($id) . '#detail'); }
    if (isset(ORDER_ST[$st])) { bc_tx('orders', function (&$d) use ($id, $st) { foreach ($d as &$o) if ($o['id'] === $id) $o['status'] = $st; }); log_act('تغيير حالة طلب', $ref . ' ← ' . ORDER_ST[$st]); }
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
if (($_GET['export'] ?? '') === 'csv' && can('export')) {
    csv_download('orders', ['رقم', 'التاريخ', 'العميل', 'الموبايل', 'النوع', 'العنوان', 'الأصناف', 'قبل الخصم', 'الخصم', 'الكود', 'الإجمالي', 'الحالة', 'الدفع', 'ملاحظات'],
        array_map(fn($o) => [$o['no'] ?? '', fdate($o['at']), $o['name'], $o['phone'], $o['type'], $o['address'] ?? '',
            implode(' + ', array_map(fn($l) => $l['qty'] . '× ' . $l['name'], $o['items'])), $o['subtotal'], $o['discount'], $o['coupon'] ?? '', $o['total'],
            ORDER_ST[$o['status']] ?? $o['status'], PAY_METHODS[$o['pay'] ?? ''] ?? '', $o['notes'] ?? ''], $list));
}
$cnt = ['' => count($orders)]; foreach (ORDER_ST as $k => $_) $cnt[$k] = count(array_filter($orders, fn($o) => $o['status'] === $k));
$open = (string)($_GET['open'] ?? ''); $cur = null; foreach ($orders as $o) if ($o['id'] === $open) $cur = $o;
$sum = array_sum(array_column(array_filter($list, fn($o) => $o['status'] !== 'cancelled'), 'total'));
$qs = fn(array $x) => '?' . http_build_query(array_filter(array_merge(['st' => $fs, 'q' => $q, 'from' => $from, 'to' => $to], $x)));

admin_head('الطلبات', 'orders', (can('export') ? '<a class="b" href="' . e($qs(['export' => 'csv'])) . '">' . icon('down') . ' تنزيل Excel</a>' : '') . (can('orders.edit') ? '<a class="b b--primary" href="order.php">' . icon('plus') . ' طلب جديد</a>' : ''));
?>
<p class="hint" style="margin-bottom:14px">كل طلب يبعته العميل من الموقع بيتسجّل هنا تلقائيًا. تقدر تضيف طلب يدوي (تليفون أو في الكافيه)، وتعدّل أي طلب: الأصناف والأسعار والخصم والدفع والحالة.</p>
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
        <dt>نوع الطلب</dt><dd><?= e($cur['type']) ?><?php if (!empty($cur['table'])): ?> · <b class="table-tag">ترابيزة <span class="latin"><?= e($cur['table']) ?></span></b><?php endif; ?></dd>
        <?php if (!empty($cur['address'])): ?><dt>العنوان</dt><dd><?= e($cur['address']) ?></dd><?php endif; ?>
        <?php if (!empty($cur['notes'])): ?><dt>ملاحظات</dt><dd><?= e($cur['notes']) ?></dd><?php endif; ?>
        <dt>وصل</dt><dd><?= fdate($cur['at']) ?> · عبر <?= ['email' => 'الإيميل', 'manual' => 'تسجيل يدوي'][$cur['channel'] ?? ''] ?? 'واتساب' ?></dd>
        <dt>الحالة</dt><dd><?= badge($cur['status'], ORDER_ST) ?></dd>
        <dt>الدفع</dt><dd><?= !empty($cur['pay']) ? '<span class="st st--done">' . e(PAY_METHODS[$cur['pay']] ?? '') . '</span>' : '<span class="st st--new">لم يُدفع</span>' ?></dd>
        <?php if (!empty($cur['staffNote'])): ?><dt>ملاحظة داخلية</dt><dd><?= e($cur['staffNote']) ?></dd><?php endif; ?>
        <?php if (!empty($cur['updatedBy'])): ?><dt>آخر تعديل</dt><dd><?= e($cur['updatedBy']) ?> · <?= ago($cur['updated']) ?></dd><?php endif; ?>
      </dl>
      <form method="post" class="dl"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($cur['id']) ?>"><input type="hidden" name="back" value="open">
        <?php if (can('orders.edit')): foreach (ORDER_ST as $k => $l) if ($k !== $cur['status']): ?><button class="b b--sm" name="status" value="<?= $k ?>"><?= $l ?></button><?php endif; endif; ?>
      </form>
      <?php if (can('orders.edit')): ?>
      <form method="post" class="dl" style="margin-top:8px"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($cur['id']) ?>"><input type="hidden" name="act" value="pay">
        <select name="pay" class="inp" style="width:auto;padding:6px 10px"><?php foreach (PAY_METHODS as $k => $l): ?><option value="<?= $k ?>" <?= sel($cur['pay'] ?? '', $k) ?>><?= $l ?></option><?php endforeach; ?></select>
        <button class="b b--sm">تسجيل الدفع</button>
        <a class="b b--sm" href="order.php?id=<?= e($cur['id']) ?>"><?= icon('edit') ?> تعديل الطلب</a>
      </form>
      <?php endif; ?>
      <form method="post" class="dl" style="margin-top:8px"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($cur['id']) ?>">
        <a class="b b--sm" target="_blank" href="print.php?id=<?= e($cur['id']) ?>"><?= icon('print') ?> طباعة</a>
        <?php if ($wp): ?><a class="b b--sm" target="_blank" href="https://wa.me/<?= e($wp) ?>?text=<?= rawurlencode('أهلًا ' . $cur['name'] . '، طلبك من باركود وصلنا وجاري تحضيره ☕') ?>"><?= icon('wa') ?> رد على العميل</a><?php endif; ?>
        <?php if (can('orders.delete')): ?><button class="b b--sm b--danger" name="act" value="delete" data-confirm="حذف الطلب من السجل؟">حذف</button><?php endif; ?>
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
      <td><a href="<?= e($qs(['open' => $o['id']])) ?>#detail" style="color:var(--cream)"><b><?= e($o['name']) ?></b></a><small><?= e($o['type']) ?><?= !empty($o['table']) ? ' · ترابيزة ' . e($o['table']) : '' ?> · <span class="latin" dir="ltr"><?= e($o['phone']) ?></span></small></td>
      <td><small style="color:var(--taupe);max-width:280px"><?= e(implode('، ', array_map(fn($l) => $l['qty'] . '× ' . $l['name'], array_slice($o['items'], 0, 4)))) ?><?= count($o['items']) > 4 ? '…' : '' ?></small></td>
      <td class="nowrap"><b class="latin"><?= egp($o['total']) ?></b><?php if (!empty($o['discount'])): ?><small class="sale">خصم <?= egp($o['discount']) ?></small><?php endif; ?></td>
      <td><?php if (can('orders.edit')): ?><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($o['id']) ?>">
        <select name="status" class="inp" style="padding:6px 10px;width:auto" data-autosubmit><?php foreach (ORDER_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($o['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></form><?php else: ?><?= badge($o['status'], ORDER_ST) ?><?php endif; ?>
        <?php if (!empty($o['pay'])): ?><small class="paid">✓ <?= e(PAY_METHODS[$o['pay']] ?? '') ?></small><?php endif; ?></td>
      <td class="end nowrap"><a class="icon-b" href="<?= e($qs(['open' => $o['id']])) ?>#detail" title="التفاصيل"><?= icon('eye') ?></a><?php if (can('orders.edit')): ?><a class="icon-b" href="order.php?id=<?= e($o['id']) ?>" title="تعديل"><?= icon('edit') ?></a><?php endif; ?><?php if (can('orders.delete')): ?><form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($o['id']) ?>"><button class="icon-b" name="act" value="delete" data-confirm="حذف الطلب؟" title="حذف"><?= icon('trash') ?></button></form><?php endif; ?></td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$list): ?><tr><td colspan="6" class="empty"><?= $orders ? 'لا توجد طلبات مطابقة.' : 'لم تصل طلبات بعد. أول طلب من الموقع سيظهر هنا.' ?></td></tr><?php endif; ?>
  </tbody>
</table>
</div>
<?php admin_foot();

<?php
require __DIR__ . '/inc.php';
require_admin();
$id = (string)($_GET['id'] ?? '');
$flow = ['new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

if (post_ok()) {
    $restock = null;
    eb_transaction('orders', function (array &$orders) use ($id, $flow, &$restock) {
        foreach ($orders as &$o) {
            if ($o['number'] !== $id) continue;
            $new = in_array($_POST['status'] ?? '', $flow, true) ? $_POST['status'] : $o['status'];
            if ($new !== $o['status']) {
                if ($new === 'cancelled') $restock = ['items' => $o['items'], 'sign' => 1];
                elseif ($o['status'] === 'cancelled') $restock = ['items' => $o['items'], 'sign' => -1];
                $o['status'] = $new;
                $o['history'][] = ['status' => $new, 'at' => date('c')];
            }
            $o['paid'] = !empty($_POST['paid']);
            $o['admin_note'] = mb_substr(trim((string)($_POST['admin_note'] ?? '')), 0, 1000);
        }
    });
    // cancelling puts the pieces back in stock (and un-cancelling takes them out again)
    if ($restock) eb_transaction('products', function (array &$products) use ($restock) {
        foreach ($products as &$p) foreach ($restock['items'] as $it) if ($p['id'] === $it['id']) {
            $p['stock'] = max(0, (int)$p['stock'] + $restock['sign'] * $it['qty']);
            $p['sold'] = max(0, (int)($p['sold'] ?? 0) - $restock['sign'] * $it['qty']);
        }
    });
    flash('تم حفظ الطلب' . ($restock ? ($restock['sign'] > 0 ? ' ورجعت القطع للمخزون' : ' واتخصمت القطع من المخزون') : ''));
    back('order.php?id=' . rawurlencode($id));
}

$o = null;
foreach (eb_load('orders') as $x) if ($x['number'] === $id) $o = $x;
if (!$o) { admin_head('طلب غير موجود', 'orders'); echo '<p class="muted">الطلب ده مش موجود.</p>'; admin_foot(); exit; }
$c = $o['customer'];
$waNum = '2' . $c['phone'];
$msgs = [
    'new' => "أهلاً {$c['name']} 🤍\nمعاكِ إليجانس بوتيك. وصلنا طلبك رقم {$o['number']} بإجمالي " . egp($o['total']) . ".\nممكن نأكد معاكِ العنوان: " . gov_name($c['gov']) . '، ' . $c['city'] . '، ' . $c['address'] . '؟',
    'confirmed' => "أهلاً {$c['name']} 🤍\nتم تأكيد طلبك {$o['number']} وجاري تجهيزه بكل حب.",
    'shipped' => "أهلاً {$c['name']} 🤍\nطلبك {$o['number']} اتشحن وهيوصلك خلال 1-3 أيام عمل. جهزي " . ($o['payment'] === 'cod' ? egp($o['total']) . ' للمندوب.' : 'نفسك للبريق ✨'),
];
$waText = $msgs[$o['status']] ?? $msgs['confirmed'];
admin_head('طلب ' . $o['number'], 'orders');
?>
<div class="toolbar no-print">
  <a class="btn btn--ghost" href="orders.php">→ كل الطلبات</a>
  <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/<?= e($waNum) ?>?text=<?= rawurlencode($waText) ?>">واتساب العميلة</a>
  <a class="btn btn--ghost" href="tel:<?= e($c['phone']) ?>">اتصال</a>
  <button class="btn btn--ghost" onclick="print()">🖨 طباعة بوليصة</button>
</div>

<div class="grid2 grid2--order">
  <div class="card">
    <div class="card__head"><h2>المنتجات</h2><?= status_badge($o['status']) ?></div>
    <ul class="list list--prod">
      <?php foreach ($o['items'] as $it): ?><li><img src="<?= e(img_src($it['img'])) ?>" alt=""><span><?= e($it['name']) ?> <small>× <?= (int)$it['qty'] ?></small></span><b><?= egp($it['price'] * $it['qty']) ?></b></li><?php endforeach; ?>
    </ul>
    <div class="sums">
      <div><span>المجموع</span><b><?= egp($o['subtotal']) ?></b></div>
      <?php if ($o['discount'] > 0): ?><div><span>خصم (<?= e($o['coupon']) ?>)</span><b>− <?= egp($o['discount']) ?></b></div><?php endif; ?>
      <div><span>الشحن</span><b><?= $o['shipping'] ? egp($o['shipping']) : 'مجاني' ?></b></div>
      <div class="sums__total"><span>الإجمالي</span><b><?= egp($o['total']) ?></b></div>
    </div>
  </div>

  <div class="card">
    <h2>العميلة</h2>
    <dl class="dl">
      <dt>الاسم</dt><dd><?= e($c['name']) ?></dd>
      <dt>الموبايل</dt><dd dir="ltr"><?= e($c['phone']) ?><?= $c['phone2'] ? ' / ' . e($c['phone2']) : '' ?></dd>
      <?php if ($c['email']): ?><dt>الإيميل</dt><dd><?= e($c['email']) ?></dd><?php endif; ?>
      <dt>العنوان</dt><dd><?= e(gov_name($c['gov'])) ?>، <?= e($c['city']) ?><br><?= e($c['address']) ?></dd>
      <?php if ($c['notes']): ?><dt>ملاحظات</dt><dd class="note"><?= nl2br(e($c['notes'])) ?></dd><?php endif; ?>
      <dt>الدفع</dt><dd><?= payment_label($o['payment']) ?></dd>
      <dt>التاريخ</dt><dd><?= fmt_date($o['created']) ?></dd>
    </dl>
    <?php if ($o['receipt']): $isPdf = str_ends_with($o['receipt'], '.pdf'); ?>
      <h3>إيصال التحويل</h3>
      <a href="receipt.php?f=<?= e($o['receipt']) ?>" target="_blank" class="receipt"><?php if ($isPdf): ?>📄 فتح الإيصال (PDF)<?php else: ?><img src="receipt.php?f=<?= e($o['receipt']) ?>" alt="receipt"><?php endif; ?></a>
    <?php endif; ?>
  </div>
</div>

<form class="card no-print" method="post">
  <h2>تحديث الطلب</h2>
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <div class="statuses">
    <?php foreach ($flow as $s): ?><label class="st-opt st-opt--<?= $s ?>"><input type="radio" name="status" value="<?= $s ?>" <?= $o['status'] === $s ? 'checked' : '' ?>><span><?= status_label($s) ?></span></label><?php endforeach; ?>
  </div>
  <label class="check"><input type="checkbox" name="paid" value="1" <?= !empty($o['paid']) ? 'checked' : '' ?>> تم استلام المبلغ</label>
  <label class="fld">ملاحظة داخلية (مش بتظهر للعميلة)<textarea name="admin_note" rows="2"><?= e($o['admin_note']) ?></textarea></label>
  <button class="btn btn--gold">حفظ</button>
  <div class="hist"><b>سجل الطلب:</b> <?php foreach ($o['history'] as $h): ?><span><?= status_label($h['status']) ?> · <?= fmt_date($h['at']) ?></span><?php endforeach; ?></div>
</form>

<!-- printable shipping label -->
<div class="label print-only">
  <h2>Elegance Boutique — <?= e($o['number']) ?></h2>
  <p><b><?= e($c['name']) ?></b> — <?= e($c['phone']) ?><?= $c['phone2'] ? ' / ' . e($c['phone2']) : '' ?></p>
  <p><?= e(gov_name($c['gov'])) ?>، <?= e($c['city']) ?>، <?= e($c['address']) ?></p>
  <p><?php foreach ($o['items'] as $it): ?><?= e($it['name']) ?> ×<?= (int)$it['qty'] ?> · <?php endforeach; ?></p>
  <p style="font-size:22px"><b>المطلوب تحصيله: <?= ($o['payment'] === 'cod' && empty($o['paid'])) ? egp($o['total']) : '0 (مدفوع)' ?></b></p>
</div>
<?php admin_foot();

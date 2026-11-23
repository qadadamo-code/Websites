<?php
/** 80mm thermal-style receipt for one order. */
require __DIR__ . '/inc.php';
require_perm('orders.view');
$o = null; foreach (bc_load('orders') as $x) if ($x['id'] === ($_GET['id'] ?? '')) $o = $x;
if (!$o) { http_response_code(404); exit('الطلب غير موجود'); }
$s = settings();
?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>طلب #<?= e($o['no']) ?></title>
<link rel="stylesheet" href="admin.css?v=<?= BC_VERSION ?>">
<style>
body{background:#fff;color:#111;font-family:var(--f);margin:0;padding:16px}
.rc{width:76mm;margin:0 auto;font-size:13px}
.rc h1{font-family:var(--fd);text-align:center;margin:0;font-size:22px}
.rc .c{text-align:center}.rc .m{color:#555;font-size:11px}
.rc hr{border:0;border-top:1px dashed #999;margin:10px 0}
.rc table{width:100%;border-collapse:collapse}.rc td{padding:3px 0;vertical-align:top}.rc td.n{text-align:left;font-family:var(--fl);white-space:nowrap}
.rc .t td{font-weight:700;font-size:16px}
@media print{.np{display:none}body{padding:0}}
</style></head><body>
<div class="rc">
  <h1>طبلية</h1><div class="c m">من مطبخ ماما رحاب</div>
  <div class="c m"><?= e($s['address'] ?? '') ?></div><div class="c m latin"><?= e($s['whatsappDisplay'] ?? '') ?></div>
  <hr>
  <div>طلب <b class="latin">#<?= e($o['no']) ?></b> · <?= e($o['type']) ?><?= !empty($o['day']) ? ' · تسليم <b class="latin">' . e(date('d/m', strtotime($o['day']))) . '</b>' . (!empty($o['slot']) ? ' ' . e($o['slot']) : '') : '' ?></div>
  <div class="m latin"><?= e(fdate($o['at'])) ?></div>
  <div><?= e($o['name']) ?> <span class="latin"><?= e($o['phone']) ?></span></div>
  <?php if (!empty($o['address'])): ?><div class="m"><?= e($o['address']) ?></div><?php endif; ?>
  <hr>
  <table>
    <?php foreach ($o['items'] as $l): ?><tr><td><?= e($l['name']) ?><?= !empty($l['size']) ? ' (' . e($l['size']) . ')' : '' ?> <span class="latin">×<?= (int)$l['qty'] ?></span></td><td class="n"><?= number_format($l['price'] * $l['qty']) ?></td></tr><?php endforeach; ?>
  </table>
  <hr>
  <table>
    <?php if (!empty($o['discount']) || !empty($o['service']) || !empty($o['vat']) || !empty($o['delivery'])): ?><tr><td>المجموع</td><td class="n"><?= number_format($o['subtotal']) ?></td></tr><?php endif; ?>
    <?php if (!empty($o['discount'])): ?><tr><td>خصم <?= e($o['coupon'] ?? '') ?></td><td class="n">-<?= number_format($o['discount']) ?></td></tr><?php endif; ?>
    <?php if (!empty($o['service'])): ?><tr><td>خدمة</td><td class="n"><?= number_format($o['service']) ?></td></tr><?php endif; ?>
    <?php if (!empty($o['vat'])): ?><tr><td>ضريبة</td><td class="n"><?= number_format($o['vat']) ?></td></tr><?php endif; ?>
    <?php if (!empty($o['delivery'])): ?><tr><td>توصيل <?= e($o['zone'] ?? '') ?></td><td class="n"><?= number_format($o['delivery']) ?></td></tr><?php endif; ?>
    <tr class="t"><td>الإجمالي</td><td class="n"><?= number_format($o['total']) ?> EGP</td></tr>
    <tr><td class="m">الدفع</td><td class="n m"><?= e(PAY_METHODS[$o['pay'] ?? ''] ?? '') ?></td></tr>
  </table>
  <?php if (!empty($o['notes'])): ?><hr><div class="m">ملاحظات: <?= e($o['notes']) ?></div><?php endif; ?>
  <hr><div class="c">بالهنا والشفا</div>
  <p class="c np"><button onclick="print()" class="b b--primary">طباعة</button></p>
</div>
<script>setTimeout(() => print(), 400);</script>
</body></html>

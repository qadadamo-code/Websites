<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/orders.php';
$n = (string)($_GET['n'] ?? ''); $tok = (string)($_GET['t'] ?? '');
$order = null;
foreach (eb_load('orders') as $o) if ($o['number'] === $n && hash_equals($o['token'], $tok)) { $order = $o; break; }
$pageTitle = t('thank_you');
$pageClass = 'page-order';
$noPreloader = true;
$ar = LANG === 'ar';
require __DIR__ . '/inc/header.php';
if (!$order): ?>
  <section class="empty empty--page wrap"><h1 class="sec-title"><?= t('not_found') ?></h1><a class="btn btn--dark" href="track.php"><?= t('track') ?></a></section>
<?php require __DIR__ . '/inc/footer.php'; exit; endif;
$wa = wa_link(order_text($order, LANG));
$transfer = in_array($order['payment'], ['instapay', 'vodafone'], true);
$s = eb_load('settings');
?>
<section class="done wrap">
  <div class="done__in">
    <div class="done__seal"><svg class="mono" viewBox="0 0 120 120"><use href="#eb-mono"/></svg></div>
    <p class="eyebrow"><span class="line"></span><?= t('thank_you') ?>، <?= e(explode(' ', $order['customer']['name'])[0]) ?><span class="line"></span></p>
    <h1 data-split><?= t('order_received') ?></h1>
    <p><?= t('order_received_sub') ?></p>
    <div class="done__no"><?= e($order['number']) ?></div>

    <?php if ($transfer && !$order['receipt']): ?>
      <div class="done__box" style="background:var(--cream)">
        <b><?= $ar ? 'خطوة صغيرة لتأكيد طلبك' : 'One small step to confirm' ?></b>
        <span><?= $ar ? 'حوّلي ' : 'Transfer ' ?><b><?= money($order['total']) ?></b> <?= $ar ? 'على ' : 'via ' ?><?= payment_label($order['payment']) ?>
          <?php $to = $order['payment'] === 'instapay' ? $s['instapay_handle'] : $s['vodafone_number']; if ($to): ?> — <b dir="ltr"><?= e($to) ?></b><?php endif; ?>
          <?= $ar ? '، وابعتي صورة الإيصال على واتساب.' : ', then send the receipt on WhatsApp.' ?></span>
      </div>
    <?php endif; ?>

    <div class="done__box">
      <?php foreach ($order['items'] as $it): ?>
        <div class="row"><span><?= e($ar ? $it['name'] : $it['name_en']) ?> × <?= (int)$it['qty'] ?></span><span><?= money($it['price'] * $it['qty']) ?></span></div>
      <?php endforeach; ?>
      <div class="row"><span><?= t('shipping') ?></span><span><?= $order['shipping'] ? money($order['shipping']) : ($ar ? 'مجاني' : 'Free') ?></span></div>
      <?php if ($order['discount'] > 0): ?><div class="row"><span><?= t('discount') ?> (<?= e($order['coupon']) ?>)</span><span>− <?= money($order['discount']) ?></span></div><?php endif; ?>
      <div class="row row--total"><span><?= t('total') ?></span><span><?= money($order['total']) ?></span></div>
      <div class="row"><span><?= t('payment') ?></span><span><?= payment_label($order['payment']) ?></span></div>
    </div>

    <div class="done__ctas">
      <?php if ($wa): ?><a class="btn btn--wa" href="<?= e($wa) ?>" target="_blank" rel="noopener"><?= t('send_wa') ?></a><?php endif; ?>
      <a class="btn btn--ghost" href="track.php?n=<?= e($order['number']) ?>"><?= t('track') ?></a>
      <a class="btn btn--dark" href="shop.php"><?= t('continue') ?></a>
    </div>
  </div>
</section>
<?php require __DIR__ . '/inc/footer.php'; ?>

<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/orders.php';
$pageTitle = t('track');
$pageClass = 'page-track';
$noPreloader = true;
$ar = LANG === 'ar';
$n = strtoupper(trim((string)($_REQUEST['n'] ?? '')));
if ($n !== '' && strpos($n, 'EB-') !== 0 && ctype_digit($n)) $n = 'EB-' . $n;
$phone = normalize_phone((string)($_POST['phone'] ?? ''));
$order = null; $tried = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
if ($tried && csrf_ok()) {
    foreach (eb_load('orders') as $o) if ($o['number'] === $n && $o['customer']['phone'] === $phone) { $order = $o; break; }
}
require __DIR__ . '/inc/header.php';
$flow = ['new', 'confirmed', 'preparing', 'shipped', 'delivered'];
?>
<section class="track wrap">
  <form class="track__form" method="post">
    <p class="eyebrow" style="justify-content:center"><span class="line"></span><?= t('track') ?><span class="line"></span></p>
    <h1 class="sec-title"><?= $ar ? 'طلبك <em>فين دلوقتي؟</em>' : 'Where is <em>my order?</em>' ?></h1>
    <p><?= t('track_sub') ?></p>
    <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
    <div class="field"><input name="n" required placeholder=" " dir="ltr" value="<?= e($n) ?>"><label><?= t('order_no') ?> (EB-1001)</label></div>
    <div class="field"><input name="phone" required inputmode="tel" placeholder=" " dir="ltr" value="<?= e($_POST['phone'] ?? '') ?>"><label><?= t('phone') ?></label></div>
    <button class="btn btn--dark btn--block" type="submit"><?= t('track_btn') ?></button>
    <?php if ($tried && !$order): ?><p class="track__err"><?= t('not_found') ?></p><?php endif; ?>
  </form>

  <?php if ($order):
    $hist = [];
    foreach ($order['history'] as $h) $hist[$h['status']] = $h['at'];
    $curIdx = array_search($order['status'], $flow, true);
  ?>
  <div class="timeline">
    <div class="timeline__head">
      <div><span class="eyebrow" style="margin:0"><?= t('order_no') ?></span><b><?= e($order['number']) ?></b></div>
      <div><span class="eyebrow" style="margin:0"><?= t('status') ?></span><b style="font-family:var(--f-display)"><?= status_label($order['status']) ?></b></div>
    </div>
    <?php if ($order['status'] === 'cancelled'): ?>
      <p class="tl--cancel"><?= $ar ? 'تم إلغاء الطلب. لو في أي استفسار كلمينا.' : 'This order was cancelled. Contact us with any questions.' ?></p>
    <?php else: ?>
    <ol class="tl">
      <?php foreach ($flow as $k => $st): $done = $curIdx !== false && $k <= $curIdx; ?>
        <li class="<?= $done ? 'is-done' : '' ?> <?= $k === $curIdx ? 'is-now' : '' ?>">
          <i><?= $done ? '✓' : $k + 1 ?></i><span><?= status_label($st) ?></span>
          <?php if (!empty($hist[$st])): ?><small dir="ltr"><?= date('d/m · H:i', strtotime($hist[$st])) ?></small><?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ol>
    <?php endif; ?>
    <div class="timeline__items">
      <?php foreach ($order['items'] as $it): ?><div><span><?= e($ar ? $it['name'] : $it['name_en']) ?> × <?= (int)$it['qty'] ?></span><span><?= money($it['price'] * $it['qty']) ?></span></div><?php endforeach; ?>
      <div><b><?= t('total') ?></b><b><?= money($order['total']) ?></b></div>
    </div>
  </div>
  <?php endif; ?>
</section>
<?php require __DIR__ . '/inc/footer.php'; ?>

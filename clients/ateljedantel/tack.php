<?php
require __DIR__ . '/inc/layout.php';
$s = settings();
$ref = (string)($_GET['o'] ?? ''); $k = (string)($_GET['k'] ?? '');
$o = null;
foreach (ad_load('orders') as $x) if ($x['ref'] === $ref && hash_equals((string)($x['token'] ?? ''), $k)) $o = $x;
if (!$o) { http_response_code(404); require __DIR__ . '/404.php'; exit; }
$en = lang() === 'en';
site_head(t('ty.title'), ['page' => 'thanks']);
?>
<section class="ty">
  <div class="ty__seal"><?= ic('check') ?></div>
  <p class="eyebrow" style="justify-content:center"><?= t('ty.no') ?> · <?= e($o['ref']) ?></p>
  <h1 class="h1" style="font-size:clamp(40px,6vw,80px)"><?= t('ty.title') ?></h1>
  <p class="lead" style="max-width:620px;margin:20px auto 0"><?= t('ty.lead') ?></p>
  <div class="ty__box">
    <div class="box">
      <h2><?= t('co.summary') ?></h2>
      <?php foreach ($o['items'] as $l): ?>
      <div class="li"><img src="<?= e($l['img']) ?>" alt=""><div><h4><?= e($en ? ($l['titleEn'] ?: $l['title']) : $l['title']) ?></h4><small><?= e(implode(' · ', array_filter([$l['color'], $l['size']]))) ?> · <?= (int)$l['q'] ?> st</small></div><span class="price"><?= kr($l['price'] * $l['q']) ?></span></div>
      <?php endforeach; ?>
      <div class="sumrow" style="margin-top:12px"><span><?= t('ui.subtotal') ?></span><b><?= kr($o['subtotal']) ?></b></div>
      <?php if ($o['discount']): ?><div class="sumrow disc"><span><?= t('co.discount') ?> (<?= e($o['coupon']) ?>)</span><b>-<?= kr($o['discount']) ?></b></div><?php endif; ?>
      <div class="sumrow"><span><?= t('co.shipping') ?></span><b><?= $o['shipping'] ? kr($o['shipping']) : t('co.free') ?></b></div>
      <div class="sumrow total"><span><?= t('co.total') ?></span><b><?= kr($o['total']) ?></b></div>
    </div>
    <div class="box">
      <h2><?= t('ty.next') ?></h2>
      <div class="paybox">
        <?php if ($o['pay'] === 'swish'): ?>
          <?php if (($s['pay']['swish']['number'] ?? '') !== ''): ?><span><?= t('ty.swish') ?></span><b><?= e($s['pay']['swish']['number']) ?></b><span class="muted"><?= e($s['pay']['swish']['name'] ?? '') ?> · <?= t('ty.ref') ?> <b style="font-size:inherit"><?= e($o['ref']) ?></b></span><?php else: ?><span><?= t('ty.later') ?></span><?php endif; ?>
        <?php elseif ($o['pay'] === 'bank'): ?>
          <?php if (($s['pay']['bank']['bankgiro'] ?? '') !== '' || ($s['pay']['bank']['iban'] ?? '') !== ''): ?>
            <?php if ($s['pay']['bank']['bankgiro']): ?><span><?= t('ty.bank') ?></span><b><?= e($s['pay']['bank']['bankgiro']) ?></b><?php endif; ?>
            <?php if ($s['pay']['bank']['iban']): ?><span>IBAN</span><b><?= e($s['pay']['bank']['iban']) ?></b><?php if ($s['pay']['bank']['bic']): ?><span class="muted">BIC <?= e($s['pay']['bank']['bic']) ?></span><?php endif; endif; ?>
            <span class="muted"><?= t('ty.ref') ?> <b style="font-size:inherit"><?= e($o['ref']) ?></b></span>
          <?php else: ?><span><?= t('ty.later') ?></span><?php endif; ?>
        <?php elseif ($o['pay'] === 'stripe' && ($s['pay']['stripe']['link'] ?? '') !== ''): ?>
          <a class="btn" href="<?= e($s['pay']['stripe']['link']) ?>" target="_blank" rel="noopener"><?= t('ty.paylink') ?> <?= ic('arrow') ?></a>
        <?php else: ?><span><?= t('co.storeD') ?></span><?php endif; ?>
      </div>
      <ol class="how"><li><?= t('co.how2') ?></li><li><?= t('co.how3') ?></li></ol>
    </div>
    <div class="row-btns" style="justify-content:center"><a class="btn btn--line" href="butik.php"><?= t('ui.continue') ?></a><a class="btn" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a></div>
  </div>
</section>
<?php site_foot(); ?>

<?php
$key = ['privacy' => 'privacy', 'cookies' => 'cookies', 'terms' => 'terms', 'donation-policy' => 'donation', 'accessibility' => 'accessibility'][$page];
page_head(['path' => $page, 'title' => t("legal.$key.title")]);
?>
<section class="page-hero plain"><div class="wrap ph-inner narrow"><p class="eyebrow"><?= te('footer.legal') ?></p><h1><?= te("legal.$key.title") ?></h1><p class="small"><?= te('legal.updated') ?>: <?= e(date_l('2026-11-24')) ?></p></div></section>
<section class="sec pt0">
 <div class="wrap narrow legal">
  <?php foreach (tl("legal.$key.sections") as $s): ?><h2><?= e($s['h']) ?></h2><p><?= e($s['p']) ?></p><?php endforeach; ?>
  <?php if ($key === 'donation'): ?><p class="notice"><?= icon('info', 'ic') ?> <span><?= te('donate.no_tax') ?> <?= te('donate.not_charity') ?></span></p><?php endif; ?>
  <p><a href="<?= e(u('contact')) ?>"><?= te('nav.contact') ?></a></p>
 </div>
</section>
<?php page_foot();

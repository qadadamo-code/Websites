<?php
require __DIR__ . '/inc/layout.php';
site_head(t('size.title'), ['page' => 'size']);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('size.title') ?></span></nav><h1 class="h1" data-lines><?= t('size.title') ?></h1><p class="lead"><?= t('size.lead') ?></p></section>
<section class="wrap" style="padding-bottom:100px">
  <div class="measure"><div data-rise><b>01 · <?= t('size.bust') ?></b><p><?= t('size.bustD') ?></p></div><div data-rise><b>02 · <?= t('size.waist') ?></b><p><?= t('size.waistD') ?></p></div><div data-rise><b>03 · <?= t('size.hip') ?></b><p><?= t('size.hipD') ?></p></div></div>
  <?php require __DIR__ . '/inc/sizechart.php'; ?>
</section>
<?php site_foot(); ?>

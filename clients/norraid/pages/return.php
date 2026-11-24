<?php
page_head(['path' => 'thank-you', 'title' => t('return.title'), 'noindex' => true]);
?>
<section class="page-hero plain"><div class="wrap ph-inner narrow center">
 <?= logo_mark('nf-mark') ?>
 <h1><?= te('return.title') ?></h1>
 <p class="lead"><?= te('return.text') ?></p>
 <p class="notice"><?= icon('info', 'ic') ?> <span><?= te('return.note') ?></span></p>
 <p><?= te('return.contact') ?> <a href="<?= e(u('contact')) ?>"><?= te('nav.contact') ?></a></p>
 <p><a class="btn btn-forest" href="<?= e(u('')) ?>"><?= te('return.home') ?></a></p>
</div></section>
<?= newsletter_block() ?>
<?php page_foot();

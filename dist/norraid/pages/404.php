<?php
page_head(['path' => '', 'title' => t('notfound.title'), 'noindex' => true]);
?>
<section class="page-hero plain"><div class="wrap ph-inner narrow center"><?= logo_mark('nf-mark') ?><h1><?= te('notfound.title') ?></h1><p class="lead"><?= te('notfound.text') ?></p><p><a class="btn btn-forest" href="<?= e(u('')) ?>"><?= te('return.home') ?></a></p></div></section>
<?php page_foot();

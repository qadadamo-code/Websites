<?php
require_once __DIR__ . '/inc/layout.php';
if (!headers_sent()) http_response_code(404);
site_head(t('404.t'), ['page' => '404']);
?>
<section class="err404"><b>404</b><h1 class="h2"><?= t('404.t') ?></h1><p class="muted" style="max-width:520px;margin:16px auto 30px"><?= t('404.d') ?></p><a class="btn" href="butik.php"><?= t('nav.shop') ?> <?= ic('arrow') ?></a></section>
<?php site_foot(); ?>

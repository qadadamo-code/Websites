<?php
$items = tl('faq.items');
page_head(['path' => 'faq', 'title' => t('faq.title'), 'jsonld' => ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => array_map(fn($i) => ['@type' => 'Question', 'name' => $i['q'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $i['a']]], $items)]]);
?>
<section class="page-hero plain"><div class="wrap ph-inner"><h1><?= te('faq.title') ?></h1></div></section>
<section class="sec pt0">
 <div class="wrap narrow">
  <div class="faq">
   <?php foreach ($items as $i => $q): ?>
    <details class="reveal"<?= $i === 0 ? ' open' : '' ?>><summary><?= e($q['q']) ?><?= icon('chev', 'ic sm') ?></summary><p><?= e($q['a']) ?></p></details>
   <?php endforeach; ?>
  </div>
  <p class="center"><a class="btn btn-forest" href="<?= e(u('contact')) ?>"><?= te('nav.contact') ?></a></p>
 </div>
</section>
<?php page_foot();

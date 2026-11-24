<?php
if ($slug !== '') {
    $s = story($slug);
    if (!$s) { http_response_code(404); require __DIR__ . '/404.php'; return; }
    $src = sources()[$s['source'] ?? ''] ?? null;
    $m = !empty($s['media']) ? media($s['media']) : null;
    page_head(['path' => 'stories/' . $slug, 'title' => story_text($s, 'title'), 'description' => story_text($s, 'summary'), 'og_type' => 'article', 'og' => $m ? media_url($m) : '',
        'jsonld' => ['@context' => 'https://schema.org', '@type' => 'Article', 'headline' => story_text($s, 'title'), 'datePublished' => $s['published'], 'author' => ['@type' => 'Organization', 'name' => $src['org'] ?? ''], 'publisher' => ['@type' => 'Organization', 'name' => 'NORRAID AFRICA']]]);
    $cn = country_name($s['country']);
    ?>
<article class="story-page">
 <header class="page-hero plain">
  <div class="wrap ph-inner narrow">
   <nav class="crumbs" aria-label="Breadcrumb"><a href="<?= e(u('stories')) ?>"><?= te('nav.stories') ?></a> / <span><?= e($cn) ?></span></nav>
   <p class="story-meta"><a class="chip" href="<?= e(u($s['country'])) ?>"><?= e($cn) ?></a> <span><?= te('common.third_party') ?></span> <span><?= te('common.published') ?> <?= e(date_l((string)$s['published'])) ?></span></p>
   <h1><?= e(story_text($s, 'title')) ?></h1>
   <p class="lead"><?= e(story_text($s, 'summary')) ?></p>
  </div>
 </header>
 <div class="wrap narrow">
  <?php if ($m): ?><?= figure($s['media'], 'story-fig', 1600) ?>
  <?php else: ?><div class="story-quote big" aria-hidden="true"><?= icon('quote', 'ic q') ?><span><?= e($cn) ?></span></div><p class="small muted"><?= te('stories.photo_note') ?></p><?php endif; ?>
  <div class="prose story-text"><?php foreach ((array)t('stories.' . $slug . '.body') as $p): ?><p><?= e($p) ?></p><?php endforeach; ?></div>
  <div class="story-facts">
   <section><h2><?= te('stories.context') ?></h2><p><?= e(story_text($s, 'context')) ?></p></section>
   <section><h2><?= te('stories.needs') ?></h2><p><?= e(story_text($s, 'needs')) ?></p></section>
   <section><h2><?= te('stories.chronology') ?></h2><ol class="timeline"><?php foreach (story_list($s, 'chronology') as $c): ?><li><?= e($c) ?></li><?php endforeach; ?></ol></section>
   <section class="attrib"><h2><?= te('stories.attribution') ?></h2>
    <p><?= te('common.reported_by') ?> <b><?= e($src['org'] ?? '') ?></b> — <a href="<?= e($src['url'] ?? '#') ?>" target="_blank" rel="noopener"><?= e($src['title'] ?? '') ?></a></p>
    <p class="small"><?= te('stories.status') ?>: <?= te('stories.approved') ?> · <?= te('common.verified') ?> <?= e(date_l((string)($src['verified'] ?? ''))) ?></p>
    <p class="small"><?= te('stories.policy') ?></p>
   </section>
  </div>
 </div>
 <?php if (!empty($s['cta'])) echo donate_band(t('stories.help_cta', ['country' => $cn]), t('countries_page.donate_text', ['country' => $cn]), $s['country']); ?>
</article>
<?php page_foot(); return;
}
page_head(['path' => 'stories', 'title' => t('stories.title'), 'description' => t('stories.lead')]);
$f = (string)($_GET['country'] ?? '');
if (!in_array($f, COUNTRY_IDS, true)) $f = '';
?>
<section class="page-hero plain">
 <div class="wrap ph-inner"><p class="eyebrow"><?= te('common.third_party') ?></p><h1><?= te('stories.title') ?></h1><p class="lead"><?= te('stories.lead') ?></p></div>
</section>
<section class="sec pt0">
 <div class="wrap">
  <nav class="filters" aria-label="<?= te('stories.filter') ?>">
   <a href="<?= e(u('stories')) ?>"<?= $f === '' ? ' aria-current="true"' : '' ?>><?= te('stories.all') ?></a>
   <?php foreach (COUNTRY_IDS as $c): ?><a href="<?= e(u('stories')) ?>?country=<?= e($c) ?>"<?= $f === $c ? ' aria-current="true"' : '' ?>><?= e(country_name($c)) ?></a><?php endforeach; ?>
  </nav>
  <div class="story-grid"><?php foreach (stories($f ?: null) as $s) echo story_card($s); ?></div>
  <p class="notice"><?= icon('info', 'ic') ?> <span><?= te('stories.policy') ?></span></p>
 </div>
</section>
<?= newsletter_block() ?>
<?php page_foot();

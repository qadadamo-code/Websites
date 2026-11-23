<?php
require __DIR__ . '/inc/layout.php';
$en = lang() === 'en';
$items = press_items();
$months = $en ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
$fmt = function (string $d) use ($months, $en) {
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $d, $m)) return e($d);
    return $en ? $months[(int)$m[2] - 1] . ' ' . (int)$m[3] . ', ' . $m[1] : (int)$m[3] . ' ' . $months[(int)$m[2] - 1] . ' ' . $m[1];
};
site_head(t('nav.press'), ['page' => 'press', 'desc' => $en ? 'Articles and press about Ateljé Dantel in Umeå.' : 'Artiklar och press om Ateljé Dantel i Umeå.']);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.press') ?></span></nav>
  <p class="eyebrow"><?= $en ? 'Press' : 'Press' ?></p><h1 class="h1" data-lines><?= $en ? 'Ateljé Dantel in the media' : 'Ateljé Dantel i media' ?></h1>
  <p class="lead" style="max-width:640px;margin-top:18px" data-rise><?= $en ? 'What local newspapers have written about us and our atelier in Umeå.' : 'Det här har lokaltidningarna skrivit om oss och vår ateljé i Umeå.' ?></p></section>
<section class="wrap press" style="padding-bottom:100px">
  <?php if (!$items): ?><p class="muted"><?= $en ? 'Articles coming soon.' : 'Artiklar kommer snart.' ?></p><?php endif; ?>
  <ol class="press__list">
    <?php foreach ($items as $i => $a): ?>
    <li class="press__item" data-rise>
      <a href="<?= e($a['url']) ?>" target="_blank" rel="noopener">
        <span class="press__n"><?= str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT) ?></span>
        <span class="press__meta"><b><?= e($a['source']) ?></b><time datetime="<?= e($a['date']) ?>"><?= $fmt($a['date']) ?></time></span>
        <span class="press__body"><span class="press__t">”<?= e($a['title']) ?>”</span><span class="press__d"><?= e($en ? ($a['en'] ?: $a['sv']) : $a['sv']) ?></span></span>
        <span class="press__go"><?= $en ? 'Read' : 'Läs' ?> <?= ic('arrow') ?></span>
      </a>
    </li>
    <?php endforeach; ?>
  </ol>
  <p class="muted press__note"><?= $en ? 'Articles open on each newspaper\'s website and may require a subscription. Are you a journalist? Contact us at ' : 'Artiklarna öppnas hos respektive tidning och kan kräva prenumeration. Är du journalist? Kontakta oss på ' ?><a href="mailto:<?= e(settings()['email']) ?>"><?= e(settings()['email']) ?></a>.</p>
</section>
<?php site_foot(); ?>

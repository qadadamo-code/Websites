<?php
require __DIR__ . '/inc/layout.php';
$c = content(); $en = lang() === 'en';
$img = (string)($c['herrImg'] ?? 'assets/img/couple-kiss.webp');
site_head(t('nav.herr'), ['page' => 'herr', 'desc' => $en ? 'Buy or rent tails, tuxedo, morning suit and suit in central Umeå. Fitting in about 30 minutes – book before conferments, weddings and galas.' : 'Köp eller hyr frack, smoking, jackett och kostym i centrala Umeå. Utprovning på cirka 30 minuter – boka inför promovering, bröllop och gala.']);
$items = [
    ['Frack', 'Tails', 'Högtidligaste klädkoden – för promovering, Nobelfest och white tie-galor.', 'The most formal dress code – for conferments, Nobel banquets and white tie galas.'],
    ['Smoking', 'Tuxedo', 'Klassisk black tie för bröllop, baler och kvällsfester.', 'Classic black tie for weddings, balls and evening parties.'],
    ['Jackett', 'Morning suit', 'Högtidsdräkt för dagtid – bröllop, dop och officiella högtider.', 'Formal daywear – weddings, christenings and official ceremonies.'],
    ['Kostym', 'Suit', 'Mörk kostym för bröllop, fest och företagsevent.', 'Dark suit for weddings, parties and corporate events.'],
];
$faq = [
    [['Kan jag både köpa och hyra?', 'Can I both buy and rent?'], ['Ja. Vi säljer och hyr ut frack, smoking, jackett och kostym. Vi hjälper dig att välja det som passar tillfället och din budget.', 'Yes. We sell and rent tails, tuxedos, morning suits and suits, and help you choose what suits the occasion and your budget.']],
    [['Hur lång tid tar en utprovning?', 'How long does a fitting take?'], ['Cirka en halvtimme. Boka gärna tid i god tid, särskilt inför vårens promoveringar och höstens jubileer.', 'About half an hour. Book well ahead, especially before the spring conferments and autumn anniversary celebrations.']],
    [['Kan ni justera plagget så det sitter perfekt?', 'Can you adjust the garment so it fits perfectly?'], ['Ja. Våra sömmerskor i skrädderiet justerar längd på byxor och ärmar och tar in eller släpper ut där det behövs.', 'Yes. Our seamstresses adjust trouser and sleeve length and take in or let out where needed.']],
    [['Har ni tillbehör och begagnat?', 'Do you have accessories and pre-owned?'], ['Ja. Utöver uthyrning och försäljning kan du fynda skjortor, byxor, kavajer och västar i vårt begagnade sortiment.', 'Yes. Besides rental and sales you can find shirts, trousers, blazers and waistcoats in our pre-owned range.']],
];
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.herr') ?></span></nav>
  <p class="eyebrow"><?= $en ? 'Menswear & rental' : 'Herrekipering & uthyrning' ?></p><h1 class="h1" data-lines><?= $en ? 'Tails, tuxedo or suit – buy or rent' : 'Frack, smoking eller kostym – köp eller hyr' ?></h1>
  <p class="lead" style="max-width:680px;margin-top:18px" data-rise><?= $en ? 'We help you dress right for conferments, weddings, balls and galas – with personal fitting in our atelier in MVG-gallerian, Umeå.' : 'Vi hjälper dig att klä dig rätt inför promovering, bröllop, bal och gala – med personlig utprovning i vår ateljé i MVG-gallerian, Umeå.' ?></p>
  <div class="row-btns" style="margin-top:26px" data-rise><a class="btn" href="boka.php?typ=herr"><?= ic('cal') ?> <?= $en ? 'Book a fitting (30 min)' : 'Boka utprovning (30 min)' ?></a><a class="btn btn--line" href="kontakt.php"><?= $en ? 'Ask us' : 'Fråga oss' ?></a></div>
</section>
<section class="wrap" style="padding-bottom:60px"><div class="split">
  <img src="<?= e($img) ?>" alt="<?= $en ? 'Menswear at Ateljé Dantel' : 'Herrekipering hos Ateljé Dantel' ?>" loading="lazy" data-rise style="aspect-ratio:4/5;width:100%;object-fit:cover;border-radius:var(--r)">
  <div><h2 class="h2" style="font-size:clamp(28px,3vw,42px);margin-bottom:18px" data-lines><?= $en ? 'Personal fitting' : 'Personlig utprovning' ?></h2>
  <p data-rise><?= e(tr($c['menswear'])) ?></p>
  <ul class="herr__list" data-rise>
    <?php foreach ($items as $it): ?><li><b><?= e($en ? $it[1] : $it[0]) ?></b><span><?= e($en ? $it[3] : $it[2]) ?></span></li><?php endforeach; ?>
  </ul></div>
</div></section>
<section class="sec faq wrap-narrow" style="padding-top:20px">
  <header class="sec__hd sec__hd--center"><p class="eyebrow"><?= $en ? 'Good to know' : 'Bra att veta' ?></p><h2 class="h2" data-lines><?= $en ? 'Questions about menswear' : 'Frågor om herrekipering' ?></h2></header>
  <div class="acc">
    <?php foreach ($faq as $i => [$q, $a]): ?>
    <details class="acc__item"<?= $i === 0 ? ' open' : '' ?>><summary><span><?= e($en ? $q[1] : $q[0]) ?></span><i><?= ic('plus') ?></i></summary><div class="acc__body"><p><?= e($en ? $a[1] : $a[0]) ?></p></div></details>
    <?php endforeach; ?>
  </div>
  <p style="text-align:center;margin-top:34px"><a class="btn" href="boka.php?typ=herr"><?= ic('cal') ?> <?= $en ? 'Book a fitting' : 'Boka utprovning' ?></a></p>
</section>
<?php site_foot(); ?>

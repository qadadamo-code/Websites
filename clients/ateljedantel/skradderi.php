<?php
require __DIR__ . '/inc/layout.php';
$c = content(); $en = lang() === 'en';
site_head(t('nav.tailor'), ['page' => 'tailor', 'desc' => $en ? 'Tailoring and alterations with 40 years of experience in central Umeå. Price list, menswear and rental of tails and tuxedos.' : 'Skrädderi och ändringar med 40 års erfarenhet i centrala Umeå. Prislista, herrekipering och uthyrning av frack och smoking.']);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.tailor') ?></span></nav>
  <p class="eyebrow"><?= $en ? '40 years of experience' : '40 års erfarenhet' ?></p><h1 class="h1" data-lines><?= $en ? 'Tailoring & alterations' : 'Skrädderi & ändringar' ?></h1>
  <p class="lead"><?= $en ? 'In our tailoring workshop you meet experience, craft and personal service – from small alterations to fully tailored garments.' : 'I vårt skrädderi möts du av erfarenhet, hantverk och personlig service – från mindre ändringar till helt skräddarsydda plagg.' ?></p></section>
<section class="wrap" style="padding-bottom:60px"><div class="split">
  <img src="assets/img/sewing.webp" alt="" loading="lazy" data-rise style="aspect-ratio:4/3">
  <div><h2 class="h2" style="font-size:clamp(28px,3vw,42px);margin-bottom:18px" data-lines><?= $en ? 'Personal service on site' : 'Personlig service på plats' ?></h2>
  <p data-rise><?= $en ? 'Bring your garment and tell us what you need. Our tailors measure and pin directly on site to ensure a careful, durable result – button replacement, zips, trouser hems, jeans repairs and tailored blazers. Whether everyday wear or party clothes, every garment is adjusted to your wishes for the best possible fit.' : 'Kom in med ditt plagg och berätta vad du behöver hjälp med. Våra skräddare mäter och nålar upp direkt på plats för ett noggrant och hållbart resultat – knappbyte, dragkedjebyten, uppläggning av byxor, lagning av jeans och skräddarsydda kavajer. Oavsett om det gäller vardagsplagg eller festkläder anpassar vi varje plagg efter dina önskemål för bästa möjliga passform.' ?></p>
  <a class="btn" href="boka.php?typ=skradd" data-rise><?= ic('cal') ?> <?= $en ? 'Book tailoring' : 'Boka skrädderi' ?></a></div>
</div></section>
<section class="sec wrap" style="padding-top:40px">
  <header class="sec__hd"><p class="eyebrow"><?= $en ? 'Price list' : 'Prislista' ?></p><h2 class="h2" data-lines><?= $en ? 'What does it cost?' : 'Vad kostar det?' ?></h2></header>
  <div class="prices"><?php foreach ($c['tailor'] as $g): ?><div class="box" data-rise><h3><?= e(tr($g['g'])) ?> <?= ic('needle') ?></h3><?php foreach ($g['rows'] as [$n, $pr]): ?><div class="prow"><span><?= e(tr($n)) ?></span><span><?= e($pr) ?> kr</span></div><?php endforeach; ?></div><?php endforeach; ?></div>
  <p class="fine" style="text-align:left;margin-top:16px"><?= $en ? 'Prices from, incl. VAT. Final price is set when we see the garment.' : 'Priser från, inkl. moms. Slutpriset bestäms när vi sett plagget.' ?></p>
</section>
<section class="banner" id="herr" data-parallax style="min-height:min(80vh,720px)"><img src="assets/img/couple-kiss.webp" alt="" loading="lazy" data-speed="0.15" style="object-position:50% 30%">
  <div class="banner__copy wrap"><p class="eyebrow"><?= $en ? 'Menswear' : 'Herrekipering' ?></p><h2 class="h1" style="font-size:clamp(36px,5vw,72px)" data-lines><?= $en ? 'Tails, tuxedo or suit – buy or rent' : 'Frack, smoking eller kostym – köp eller hyr' ?></h2>
  <p style="max-width:640px;opacity:.9;margin-bottom:28px"><?= e(tr($c['menswear'])) ?></p><a class="btn btn--light" href="boka.php?typ=herr"><?= ic('cal') ?> <?= $en ? 'Book a fitting (30 min)' : 'Boka utprovning (30 min)' ?></a></div></section>
<?php site_foot(); ?>

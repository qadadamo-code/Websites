<?php
require __DIR__ . '/inc/layout.php';
$c = content(); $s = settings(); $en = lang() === 'en';
site_head(t('nav.about'), ['page' => 'about', 'desc' => tr($c['story']['text'])]);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.about') ?></span></nav>
  <p class="eyebrow"><?= $en ? 'Since 2012' : 'Sedan 2012' ?></p><h1 class="h1" data-lines><?= e(tr($c['story']['title'])) ?></h1></section>
<section class="wrap" style="padding-bottom:80px">
  <div class="split">
    <div class="reveal-img" data-reveal-img style="aspect-ratio:4/4.4"><img class="reveal-img__base" src="assets/img/mofida-draping.webp" alt="Mofida Alashi" loading="lazy"><img class="reveal-img__top" src="assets/img/mofida-draping.webp" alt="" aria-hidden="true" loading="lazy"></div>
    <div>
      <p class="lead" data-rise><?= e(tr($c['story']['text'])) ?></p>
      <p data-rise><?= $en ? 'Our atelier is in MVG-gallerian on Kungsgatan in central Umeå. Here you will find wedding dresses, evening and prom gowns, bridal accessories and our own tailoring workshop. As the shop has grown, Mofida now has four employees who help her with all the work – a team that takes the time to make every customer feel special.' : 'Vår ateljé ligger i MVG-gallerian på Kungsgatan i centrala Umeå. Här hittar du brudklänningar, fest- och balklänningar, accessoarer till bruden och vårt eget skrädderi. I takt med att butiken expanderat har hon nu fyra anställda som hjälper henne med allt arbete – ett team som tar sig tid att få varje kund att känna sig speciell.' ?></p>
      <blockquote style="margin:28px 0 0;padding-top:24px;border-top:1px solid var(--line)"><span style="font:300 26px/1.4 var(--f-d);font-style:italic">“<?= e(tr($c['story']['quote'])) ?>”</span><cite style="display:block;margin-top:12px;font:500 12px var(--f-d);letter-spacing:.2em;text-transform:uppercase;color:var(--mute)">Mofida Alashi</cite></blockquote>
    </div>
  </div>
</section>
<section class="wrap"><div class="stats"><div><b>40+</b><span><?= t('home.since') ?></span></div><div><b>2012</b><span><?= t('home.est') ?></span></div><div><b>5</b><span><?= $en ? 'people in the team' : 'personer i teamet' ?></span></div></div></section>
<section class="sec wrap">
  <div class="strip"><img src="assets/img/store.webp" alt="" loading="lazy" data-rise><img src="assets/img/mofida-sewing.webp" alt="" loading="lazy" data-rise><img src="assets/img/sketch.webp" alt="" loading="lazy" data-rise></div>
</section>
<section class="sec services" style="padding-top:0">
  <header class="sec__hd wrap"><p class="eyebrow"><?= t('home.services') ?></p><h2 class="h2" data-lines><?= t('home.servicesT') ?></h2></header>
  <div class="svc wrap" data-svc><ul class="svc__list"><?php foreach ($c['services'] as $i => $sv): ?><li class="<?= $i === 0 ? 'on' : '' ?>"><a href="<?= $sv['id'] === 'herr' ? 'herr.php' : ($sv['id'] === 'skradd' ? 'skradderi.php' : 'boka.php') ?>"><span class="svc__n">0<?= $i + 1 ?></span><span class="svc__t"><?= e(tr($sv['t'])) ?></span><span class="svc__d"><?= e(tr($sv['d'])) ?></span><span class="svc__go"><?= ic('arrow') ?></span></a></li><?php endforeach; ?></ul>
  <figure class="svc__view arch"><?php foreach ($c['services'] as $i => $sv): ?><img src="<?= e($sv['img']) ?>" alt="" class="<?= $i === 0 ? 'on' : '' ?>" loading="lazy"><?php endforeach; ?></figure></div>
</section>
<section class="news wrap-narrow"><h2 class="h2" data-lines><?= t('home.visit') ?></h2><p class="muted"><?= e($s['address']) ?>, <?= e($s['city']) ?></p><div class="row-btns" style="justify-content:center;margin-top:24px"><a class="btn" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a><a class="btn btn--line" href="kontakt.php"><?= t('nav.contact') ?></a></div></section>
<?php site_foot(); ?>

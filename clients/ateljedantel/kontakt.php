<?php
require __DIR__ . '/inc/layout.php';
$s = settings(); $en = lang() === 'en';
$about = clean((string)($_GET['om'] ?? ''), 160);
site_head(t('nav.contact'), ['page' => 'contact']);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.contact') ?></span></nav><h1 class="h1" data-lines><?= $en ? 'We would love to hear from you' : 'Vi hörs gärna' ?></h1></section>
<section class="contact-grid wrap">
  <div>
    <ul class="visit__list" style="font-size:18px">
      <li><?= ic('pin') ?><a href="<?= e($s['mapUrl']) ?>" target="_blank" rel="noopener"><?= e($s['address']) ?>, <?= e($s['city']) ?></a></li>
      <li><?= ic('phone') ?><a href="tel:<?= e($s['phoneIntl']) ?>"><?= e($s['phone']) ?></a></li>
      <li><?= ic('mail') ?><a href="mailto:<?= e($s['email']) ?>"><?= e($s['email']) ?></a></li>
    </ul>
    <ul class="hours" style="margin-top:20px"><?php foreach ($s['hours'] as $h): ?><li style="border-color:var(--line)"><span><?= e(tr($h['d'])) ?></span><span><?= e(tr($h['h'])) ?></span></li><?php endforeach; ?></ul>
    <a class="mapimg" href="<?= e($s['mapUrl']) ?>" target="_blank" rel="noopener"><img src="assets/img/map.webp" alt="<?= t('ui.map') ?>" loading="lazy"><span class="btn btn--sm"><?= ic('pin') ?> <?= t('ui.map') ?></span></a>
  </div>
  <form class="box" id="contactForm" novalidate>
    <h2><?= $en ? 'Send a message' : 'Skicka ett meddelande' ?></h2>
    <div class="form-grid">
      <div class="fld full"><label for="cname"><?= t('co.name') ?> *</label><input id="cname" name="name" autocomplete="name"><span class="msg"></span></div>
      <div class="fld"><label for="cemail"><?= t('co.email') ?> *</label><input id="cemail" name="email" type="email" autocomplete="email"><span class="msg"></span></div>
      <div class="fld"><label for="cphone"><?= t('co.phone') ?></label><input id="cphone" name="phone" type="tel" autocomplete="tel"><span class="msg"></span></div>
      <?php if ($about): ?><div class="fld full"><label for="cprod"><?= $en ? 'About' : 'Gäller' ?></label><input id="cprod" name="product" value="<?= e($about) ?>" readonly></div><?php endif; ?>
      <div class="fld full"><label for="cmsg"><?= $en ? 'Message' : 'Meddelande' ?> *</label><textarea id="cmsg" name="message"></textarea><span class="msg"></span></div>
    </div>
    <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn" style="margin-top:16px"><?= $en ? 'Send' : 'Skicka' ?> <?= ic('arrow') ?></button>
    <p class="coupon-msg" id="cMsg" role="status" style="margin-top:12px"></p>
  </form>
</section>
<script>
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, m = document.getElementById('cMsg'), fd = new FormData(f);
  f.querySelectorAll('.fld').forEach(x => { x.classList.remove('err'); const s = x.querySelector('.msg'); s && (s.textContent = ''); });
  try { const r = await fetch('api/contact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fd.entries())) }); const d = await r.json();
    if (d.ok) { f.reset(); m.className = 'coupon-msg ok'; m.textContent = <?= json_encode($en ? 'Thank you! We will get back to you soon.' : 'Tack! Vi återkommer så snart vi kan.') ?>; return; }
    Object.entries(d.errors || {}).forEach(([k, v]) => { const fl = f.querySelector('[name=' + k + ']')?.closest('.fld'); if (fl) { fl.classList.add('err'); fl.querySelector('.msg').textContent = v; } });
    m.className = 'coupon-msg bad'; m.textContent = d.msg || '';
  } catch (er) { m.className = 'coupon-msg bad'; m.textContent = AD.t['f.err']; }
});
</script>
<?php site_foot(); ?>

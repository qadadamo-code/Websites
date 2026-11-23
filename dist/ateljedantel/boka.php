<?php
require __DIR__ . '/inc/layout.php';
$s = settings(); $b = booking_cfg();
$types = (array)($b['types'] ?? []);
$typ = (string)($_GET['typ'] ?? ''); if (!array_filter($types, fn($x) => $x['id'] === $typ)) $typ = $types[0]['id'] ?? '';
$pre = (string)($_GET['p'] ?? '');
site_head(t('bk.title'), ['page' => 'booking', 'desc' => t('bk.lead')]);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('bk.title') ?></span></nav><h1 class="h1" data-lines><?= t('bk.title') ?></h1><p class="lead"><?= t('bk.lead') ?></p></section>
<?php if (empty($b['enabled'])): ?>
<div class="wrap" style="padding-bottom:100px"><div class="box"><p><?= lang() === 'en' ? 'Online booking is paused right now. Call or email us and we will find a time.' : 'Onlinebokningen är pausad just nu. Ring eller mejla oss så hittar vi en tid.' ?></p><a class="btn" href="tel:<?= e($s['phoneIntl']) ?>"><?= ic('phone') ?> <?= e($s['phone']) ?></a></div></div>
<?php else: ?>
<form class="bk wrap" id="bk" novalidate data-pre="<?= e($pre) ?>" data-wish="<?= !empty($_GET['wish']) ? 1 : 0 ?>">
  <div>
    <div class="box"><h2><span class="n">1</span><?= t('bk.type') ?></h2>
      <div class="types">
        <?php foreach ($types as $ty): ?><label class="optc"><input type="radio" name="type" value="<?= e($ty['id']) ?>" data-min="<?= (int)$ty['min'] ?>" data-label="<?= e(tr($ty['name'])) ?>"<?= $ty['id'] === $typ ? ' checked' : '' ?>><span><b><?= e(tr($ty['name'])) ?></b><small><?= (int)$ty['min'] ?> <?= t('bk.min') ?></small></span></label><?php endforeach; ?>
      </div>
    </div>
    <div class="box"><h2><span class="n">2</span><?= t('bk.day') ?></h2>
      <div class="cal__hd"><button type="button" data-m="-1" aria-label="<?= t('ui.prev') ?>"><?= ic('arrow') ?></button><span id="calTitle"></span><button type="button" data-m="1" aria-label="<?= t('ui.next') ?>"><?= ic('arrow') ?></button></div>
      <div class="cal" id="cal"></div>
      <p class="fine" style="text-align:left;margin-top:14px"><?= t('bk.sat') ?></p>
    </div>
    <div class="box"><h2><span class="n">3</span><?= t('bk.time') ?></h2><div class="slots" id="slots"><p class="muted"><?= t('bk.day') ?>…</p></div><span class="msg" data-msg="time" style="color:var(--red);font-size:13px"></span></div>
    <div class="box"><h2><span class="n">4</span><?= t('bk.you') ?></h2>
      <div class="form-grid">
        <div class="fld full"><label for="bname"><?= t('co.name') ?> *</label><input id="bname" name="name" autocomplete="name"><span class="msg"></span></div>
        <div class="fld"><label for="bemail"><?= t('co.email') ?> *</label><input id="bemail" name="email" type="email" autocomplete="email"><span class="msg"></span></div>
        <div class="fld"><label for="bphone"><?= t('co.phone') ?> *</label><input id="bphone" name="phone" type="tel" autocomplete="tel"><span class="msg"></span></div>
        <div class="fld"><label for="bguests"><?= t('bk.guests') ?></label><select id="bguests" name="guests"><?php for ($i = 1; $i <= 6; $i++): ?><option><?= $i ?></option><?php endfor; ?></select></div>
        <div class="fld"><label for="bevent"><?= t('bk.date') ?></label><input id="bevent" name="event" type="date"></div>
        <div class="fld full" id="wishWrap" hidden><label><?= t('bk.wish') ?></label><div class="wishpick" id="wishPick"></div></div>
        <div class="fld full"><label for="bnote"><?= t('co.note') ?></label><textarea id="bnote" name="note"></textarea></div>
      </div>
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    </div>
  </div>
  <aside class="bk__sum box">
    <img src="assets/img/store.webp" alt="Ateljé Dantel" loading="lazy">
    <h2 style="margin-bottom:10px"><?= t('bk.title') ?></h2>
    <div class="bk__line"><?= ic('spark') ?><span id="sType">—</span></div>
    <div class="bk__line"><?= ic('cal') ?><span id="sDate">—</span></div>
    <div class="bk__line"><?= ic('clock') ?><span id="sTime">—</span></div>
    <div class="bk__line"><?= ic('pin') ?><span><?= e($s['address']) ?>, <?= e($s['city']) ?></span></div>
    <button class="btn btn--block" id="bkBtn" type="submit" style="margin-top:20px"><?= t('bk.send') ?> <?= ic('arrow') ?></button>
    <p class="coupon-msg bad" id="bkErr" role="alert"></p>
    <?php if (!empty($s['bookingExternal'])): ?><p class="fine" style="margin-top:12px"><?= lang() === 'en' ? 'Prefer our booking system?' : 'Föredrar du vårt bokningssystem?' ?> <a href="<?= e($s['bookingExternal']) ?>" target="_blank" rel="noopener" style="text-decoration:underline">BokaMera</a></p><?php endif; ?>
  </aside>
</form>
<section class="ty wrap" id="bkOk" hidden>
  <div class="ty__seal"><?= ic('check') ?></div>
  <h2 class="h1" style="font-size:clamp(40px,6vw,80px)"><?= t('bk.ok') ?></h2>
  <p class="lead" id="bkOkWhen" style="margin-top:14px"></p>
  <p class="muted"><?= t('bk.okD') ?></p>
  <div class="row-btns" style="justify-content:center;margin-top:24px"><a class="btn" href="butik.php"><?= t('nav.shop') ?></a></div>
</section>
<?php endif; ?>
<?php site_foot(['scripts' => ['assets/js/booking.js']]); ?>

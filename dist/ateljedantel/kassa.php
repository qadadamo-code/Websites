<?php
require __DIR__ . '/inc/layout.php';
$s = settings();
$ship = $s['shipping'] ?? [];
$pays = pay_methods('pickup');
$payInfo = ['swish' => ['co.swish', 'co.swishD'], 'bank' => ['co.bank', 'co.bankD'], 'store' => ['co.store', 'co.storeD'], 'stripe' => ['co.card', 'co.cardD']];
site_head(t('co.title'), ['page' => 'checkout', 'body' => 'is-checkout']);
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('co.title') ?></span></nav><h1 class="h1"><?= t('co.title') ?></h1></section>
<?php if (empty($s['ordersEnabled'])): ?>
<div class="wrap" style="padding-bottom:100px"><div class="box"><p><?= t('co.closed') ?></p><a class="btn" href="kontakt.php"><?= t('nav.contact') ?></a></div></div>
<?php else: ?>
<form class="co wrap" id="co" novalidate data-ship='<?= e(json_encode(['post' => (float)($ship['postnord'] ?? 0), 'free' => (float)($ship['freeOver'] ?? 0)])) ?>'>
  <div>
    <div class="box">
      <h2><span class="n">1</span><?= t('co.contact') ?></h2>
      <div class="form-grid">
        <div class="fld full"><label for="name"><?= t('co.name') ?> *</label><input id="name" name="name" autocomplete="name" required><span class="msg"></span></div>
        <div class="fld"><label for="email"><?= t('co.email') ?> *</label><input id="email" name="email" type="email" autocomplete="email" required><span class="msg"></span></div>
        <div class="fld"><label for="phone"><?= t('co.phone') ?> *</label><input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><span class="msg"></span></div>
      </div>
    </div>
    <div class="box">
      <h2><span class="n">2</span><?= t('co.delivery') ?></h2>
      <div class="opts">
        <?php if (!empty($ship['pickup'])): ?><label class="optc"><input type="radio" name="ship" value="pickup" checked><span><b><?= t('co.pickup') ?></b><small><?= t('co.pickupD') ?></small></span><span class="amt"><?= t('co.free') ?></span></label><?php endif; ?>
        <label class="optc"><input type="radio" name="ship" value="post"<?= empty($ship['pickup']) ? ' checked' : '' ?>><span><b><?= t('co.post') ?></b><small><?= e(tr($ship['note'] ?? '')) ?><?= !empty($ship['freeOver']) ? ' · ' . (lang() === 'en' ? 'Free over ' : 'Fri frakt över ') . kr($ship['freeOver']) : '' ?></small></span><span class="amt"><?= kr($ship['postnord'] ?? 0) ?></span></label>
      </div>
      <div class="form-grid" id="addr" hidden style="margin-top:16px">
        <div class="fld full"><label for="address"><?= t('co.address') ?> *</label><input id="address" name="address" autocomplete="street-address"><span class="msg"></span></div>
        <div class="fld"><label for="zip"><?= t('co.zip') ?> *</label><input id="zip" name="zip" autocomplete="postal-code" inputmode="numeric"><span class="msg"></span></div>
        <div class="fld"><label for="city"><?= t('co.city') ?> *</label><input id="city" name="city" autocomplete="address-level2"><span class="msg"></span></div>
      </div>
    </div>
    <div class="box">
      <h2><span class="n">3</span><?= t('co.pay') ?></h2>
      <div class="opts" id="pays">
        <?php foreach (['swish', 'bank', 'store', 'stripe'] as $i => $k): if (!in_array($k, pay_methods('pickup'), true)) continue; ?>
        <label class="optc" data-pay="<?= $k ?>"><input type="radio" name="pay" value="<?= $k ?>"<?= $k === $pays[0] ? ' checked' : '' ?>><span><b><?= t($payInfo[$k][0]) ?></b><small><?= t($payInfo[$k][1]) ?></small></span></label>
        <?php endforeach; ?>
      </div>
      <span class="msg" data-msg="pay" style="color:var(--red);font-size:13px"></span>
      <div class="fld" style="margin-top:16px"><label for="note"><?= t('co.note') ?></label><textarea id="note" name="note" placeholder="<?= t('co.noteph') ?>"></textarea></div>
    </div>
  </div>
  <aside class="co__sum box">
    <h2><?= t('co.summary') ?></h2>
    <div id="coItems"></div>
    <div class="coupon"><input id="coupon" placeholder="<?= t('co.coupon') ?>" aria-label="<?= t('co.coupon') ?>" autocomplete="off"><button type="button" class="btn btn--line btn--sm" id="couponBtn"><?= t('co.apply') ?></button></div>
    <p class="coupon-msg" id="couponMsg"></p>
    <div class="sumrow"><span><?= t('ui.subtotal') ?></span><b id="sSub">0 kr</b></div>
    <div class="sumrow disc" id="sDiscRow" hidden><span><?= t('co.discount') ?></span><b id="sDisc"></b></div>
    <div class="sumrow"><span><?= t('co.shipping') ?></span><b id="sShip"><?= t('co.free') ?></b></div>
    <div class="sumrow total"><span><?= t('co.total') ?></span><b id="sTotal">0 kr</b></div>
    <p class="fine" style="text-align:left;margin:4px 0 18px"><?= t('co.vat') ?></p>
    <label class="check"><input type="checkbox" name="terms" id="terms"> <span><?= str_replace(['köpvillkoren', 'terms'], ['<a href="villkor.php" target="_blank">köpvillkoren</a>', '<a href="villkor.php" target="_blank">terms</a>'], t('co.terms')) ?></span></label>
    <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn btn--block" id="placeBtn" type="submit"><?= t('co.place') ?> <?= ic('arrow') ?></button>
    <p class="coupon-msg bad" id="coErr" role="alert"></p>
    <h3 style="font-size:16px;margin-top:22px"><?= t('co.how') ?></h3>
    <ol class="how"><li><?= t('co.how1') ?></li><li><?= t('co.how2') ?></li><li><?= t('co.how3') ?></li></ol>
  </aside>
</form>
<?php endif; ?>
<?php site_foot(['scripts' => ['assets/js/checkout.js']]); ?>

<?php
require __DIR__ . '/inc/bootstrap.php';
$pageTitle = t('checkout');
$pageClass = 'page-checkout';
$noPreloader = true;
$s = eb_load('settings');
$ship = eb_load('shipping');
$ar = LANG === 'ar';
$pageScripts = ['assets/js/checkout.js'];
require __DIR__ . '/inc/header.php';
?>
<section class="co wrap">
  <header class="co__head">
    <p class="eyebrow"><span class="line"></span><?= t('checkout') ?></p>
    <h1 class="sec-title"><?= $ar ? 'خطوة أخيرة… <em>وتبقى ليكِ</em>' : 'One last step — <em>and it’s yours</em>' ?></h1>
  </header>

  <div class="co__empty" data-co-empty hidden>
    <p><?= t('cart_empty') ?></p><a class="btn btn--dark" href="shop.php"><?= t('shop_all') ?></a>
  </div>

  <form class="co__grid" data-co-form enctype="multipart/form-data" novalidate>
    <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
    <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="co__form">
      <fieldset class="co__box">
        <legend><span>1</span><?= t('contact_info') ?></legend>
        <div class="field"><input name="name" required autocomplete="name" placeholder=" "><label><?= t('full_name') ?></label></div>
        <div class="field-row">
          <div class="field"><input name="phone" required inputmode="tel" autocomplete="tel" placeholder=" " dir="ltr"><label><?= t('phone') ?></label></div>
          <div class="field"><input name="phone2" inputmode="tel" placeholder=" " dir="ltr"><label><?= t('phone2') ?></label></div>
        </div>
        <div class="field"><input name="email" type="email" autocomplete="email" placeholder=" " dir="ltr"><label><?= t('email_opt') ?></label></div>
      </fieldset>

      <fieldset class="co__box">
        <legend><span>2</span><?= t('delivery_info') ?></legend>
        <div class="field-row">
          <div class="field field--select">
            <select name="gov" required data-gov>
              <option value=""><?= t('choose_gov') ?></option>
              <?php foreach ($ship as $g): ?><option value="<?= e($g['id']) ?>" data-fee="<?= (float)$g['fee'] ?>"><?= e($g[LANG]) ?></option><?php endforeach; ?>
            </select><label><?= t('governorate') ?></label>
          </div>
          <div class="field"><input name="city" required placeholder=" "><label><?= t('city') ?></label></div>
        </div>
        <div class="field"><textarea name="address" required rows="2" placeholder=" "></textarea><label><?= t('address') ?></label><small><?= t('address_ph') ?></small></div>
        <div class="field"><textarea name="notes" rows="2" placeholder=" "></textarea><label><?= t('notes') ?></label><small><?= t('notes_ph') ?></small></div>
      </fieldset>

      <fieldset class="co__box">
        <legend><span>3</span><?= t('payment') ?></legend>
        <div class="pay">
          <?php if (!empty($s['pay_cod'])): ?>
          <label class="pay__opt"><input type="radio" name="payment" value="cod" checked><span class="pay__ui"><b><?= t('cod') ?></b><small><?= t('cod_sub') ?></small></span><i class="pay__ico">💵</i></label>
          <?php endif; ?>
          <?php if (!empty($s['pay_instapay'])): ?>
          <label class="pay__opt"><input type="radio" name="payment" value="instapay" <?= empty($s['pay_cod']) ? 'checked' : '' ?>><span class="pay__ui"><b><?= t('instapay') ?></b><small><?= t('transfer_sub') ?></small></span><i class="pay__ico">⚡</i></label>
          <?php endif; ?>
          <?php if (!empty($s['pay_vodafone'])): ?>
          <label class="pay__opt"><input type="radio" name="payment" value="vodafone"><span class="pay__ui"><b><?= t('vodafone') ?></b><small><?= t('transfer_sub') ?></small></span><i class="pay__ico">📱</i></label>
          <?php endif; ?>
        </div>
        <div class="pay__transfer" data-transfer hidden>
          <p data-transfer-to="instapay"><?= t('transfer_to') ?>: <b dir="ltr"><?= e($s['instapay_handle'] ?: ($ar ? 'سيتم إرسال البيانات على واتساب' : 'details sent on WhatsApp')) ?></b></p>
          <p data-transfer-to="vodafone"><?= t('transfer_to') ?>: <b dir="ltr"><?= e($s['vodafone_number'] ?: ($ar ? 'سيتم إرسال الرقم على واتساب' : 'number sent on WhatsApp')) ?></b></p>
          <label class="upload"><input type="file" name="receipt" accept="image/*,application/pdf" data-receipt><span data-receipt-label><?= t('upload_receipt') ?></span></label>
          <small><?= t('receipt_later') ?></small>
        </div>
      </fieldset>
    </div>

    <aside class="co__sum">
      <div class="co__sum-in">
        <h3><?= t('order_summary') ?></h3>
        <div class="co__items" data-co-items></div>
        <div class="coupon">
          <input name="coupon" placeholder="<?= t('coupon') ?>" data-coupon dir="ltr">
          <button type="button" class="btn btn--ghost btn--sm" data-coupon-apply><?= t('apply') ?></button>
        </div>
        <p class="coupon__msg" data-coupon-msg></p>
        <div class="co__rows">
          <div><span><?= t('subtotal') ?></span><b data-co-sub>—</b></div>
          <div><span><?= t('shipping') ?></span><b data-co-ship>—</b></div>
          <div class="co__disc" data-co-disc-row hidden><span><?= t('discount') ?></span><b data-co-disc>—</b></div>
          <div class="co__total"><span><?= t('total') ?></span><b data-co-total>—</b></div>
        </div>
        <button class="btn btn--dark btn--block btn--lg" type="submit" data-co-submit><span><?= t('place_order') ?></span></button>
        <p class="co__err" data-co-err role="alert"></p>
        <p class="co__secure">🔒 <?= t('secure_note') ?></p>
      </div>
    </aside>
  </form>
</section>
<?php require __DIR__ . '/inc/footer.php'; ?>

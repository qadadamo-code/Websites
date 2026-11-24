<?php
page_head(['path' => 'donate', 'title' => t('donate.title'), 'description' => t('donate.lead'), 'body' => 'donate-page']);
$fund = (string)($_GET['fund'] ?? 'general');
if (!in_array($fund, array_merge(['general'], COUNTRY_IDS), true)) $fund = 'general';
$amounts = array_map('intval', (array)setting('amounts', [10, 25, 50, 100, 250]));
$rname = trim((string)setting('recipient_name'));
$pp = (string)setting('paypal_url');
$qr = (string)setting('paypal_qr');
?>
<section class="page-hero plain donate-hero">
 <div class="wrap ph-inner"><p class="eyebrow"><?= icon('lock', 'ic sm') ?> PayPal</p><h1><?= te('donate.title') ?></h1><p class="lead"><?= te('donate.lead') ?></p></div>
</section>
<section class="sec pt0">
 <div class="wrap donate-grid">
  <form class="donate-form" method="post" action="<?= e(nr_base()) ?>api/donate.php" data-donate>
   <input type="hidden" name="_t" value="<?= e(form_token()) ?>">
   <input type="hidden" name="lang" value="<?= e(L()) ?>">
   <fieldset>
    <legend><?= te('donate.step1') ?></legend>
    <div class="fund-grid">
     <?php foreach (array_merge(COUNTRY_IDS, ['general']) as $f): $c = $f === 'general' ? null : country($f); ?>
      <label class="fund">
       <input type="radio" name="fund" value="<?= e($f) ?>"<?= $f === $fund ? ' checked' : '' ?>>
       <span class="fund-card">
        <?php if ($c): ?><span class="fund-img"><?= img($c['hero'], '', 900, false, '200px') ?></span><?php else: ?><span class="fund-img fund-gen"><?= logo_mark('fund-mark') ?></span><?php endif; ?>
        <span class="fund-txt"><b><?= $f === 'general' ? te('donate.fund_general') : e(country_name($f)) ?></b><small><?= $f === 'general' ? te('donate.fund_general_d') : te('donate.fund_country_d', ['country' => country_name($f)]) ?></small></span>
        <span class="fund-check"><?= icon('check', 'ic sm') ?></span>
       </span>
      </label>
     <?php endforeach; ?>
    </div>
   </fieldset>
   <fieldset>
    <legend><?= te('donate.step2') ?></legend>
    <div class="amounts">
     <?php foreach ($amounts as $i => $a): ?>
      <label class="amt"><input type="radio" name="amount" value="<?= $a ?>"<?= $i === 2 ? ' checked' : '' ?>><span>€<?= e(num($a)) ?></span></label>
     <?php endforeach; ?>
     <?php if (setting('custom_amount', true)): ?>
      <label class="amt amt-custom"><input type="radio" name="amount" value="custom"><span><?= te('donate.custom') ?></span></label>
     <?php endif; ?>
    </div>
    <?php if (setting('custom_amount', true)): ?>
    <div class="custom-row" hidden data-custom>
     <label for="custom-amt"><?= te('donate.custom_ph') ?></label>
     <div class="input-pre"><span>€</span><input id="custom-amt" name="custom" type="number" inputmode="decimal" min="1" max="10000" step="1"></div>
     <p class="small"><?= te('donate.custom_note') ?></p>
    </div>
    <?php endif; ?>
    <p class="small muted"><?= te('donate.currency_note') ?></p>
    <p class="form-msg" role="alert" data-err hidden><?= te('donate.error_amount') ?></p>
   </fieldset>
   <fieldset>
    <legend><?= te('donate.step3') ?></legend>
    <div class="recipient">
     <h2><?= icon('info', 'ic') ?> <?= te('donate.recipient_title') ?></h2>
     <p><b><?= te('donate.recipient_personal', ['name' => $rname !== '' ? ' (' . $rname . ')' : '']) ?></b></p>
     <?php if ($rname === ''): ?><p><?= te('donate.recipient_pending') ?></p><?php endif; ?>
     <?php if ($de = trim((string)setting('donate_email'))): ?><p class="small"><?= icon('mail', 'ic sm') ?> <?= te('contact.donate_q') ?> <a href="mailto:<?= e($de) ?>"><?= e($de) ?></a></p><?php endif; ?>
     <ul class="checks">
      <li><?= icon('info', 'ic sm') ?> <?= te('donate.not_charity') ?></li>
      <li><?= icon('info', 'ic sm') ?> <?= te('donate.no_tax') ?></li>
      <li><?= icon('check', 'ic sm') ?> <?= te('donate.how_used') ?></li>
     </ul>
     <a href="<?= e(u('donation-policy')) ?>"><?= te('donate.policy_link') ?></a>
    </div>
    <p class="summary" data-summary aria-live="polite"></p>
    <?php if ($pp): ?>
     <button class="btn btn-gold btn-lg btn-block" type="submit"><?= icon('lock', 'ic') ?> <?= te('donate.button') ?></button>
     <p class="small center"><?= te('donate.secure') ?></p>
    <?php else: ?><p class="notice"><?= te('donate.unavailable') ?></p><?php endif; ?>
   </fieldset>
  </form>
  <aside class="donate-side">
   <figure class="ds-photo"><?= img('drc_backtoschool', '', 900, false, '400px') ?><figcaption class="credit"><?= media_credit(media('drc_backtoschool')) ?></figcaption></figure>
   <?php if ($qr && is_file(NR_ROOT . '/' . $qr)): ?>
   <div class="qr-box">
    <img src="<?= e(nr_base() . $qr) ?>" alt="PayPal QR code" width="160" height="160" loading="lazy">
    <div><h2><?= te('donate.qr_title') ?></h2><p><?= te('donate.qr_text') ?></p></div>
   </div>
   <?php endif; ?>
   <div class="side-box"><h2><?= te('donate.refund_title') ?></h2><p><?= te('donate.refund_text') ?></p><a href="<?= e(u('privacy')) ?>"><?= te('footer.privacy') ?></a></div>
   <div class="side-box"><h2><?= te('home.how_title') ?></h2>
    <ol class="mini-steps"><?php foreach (tl('home.how_steps') as $st): ?><li><b><?= e($st['t']) ?></b> <?= e($st['d']) ?></li><?php endforeach; ?></ol>
   </div>
  </aside>
 </div>
 <script type="application/json" id="donate-i18n"><?= json_encode(['summary' => t('donate.summary'), 'summary_any' => t('donate.summary_any'), 'general' => t('donate.fund_general'), 'countries' => array_combine(COUNTRY_IDS, array_map('country_name', COUNTRY_IDS)), 'fundWord' => ''], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
</section>
<?php page_foot();

<?php
page_head(['path' => 'contact', 'title' => t('contact.title'), 'description' => t('contact.lead')]);
$email = trim((string)setting('contact_email'));
?>
<section class="page-hero plain"><div class="wrap ph-inner"><h1><?= te('contact.title') ?></h1><p class="lead"><?= te('contact.lead') ?></p></div></section>
<section class="sec pt0">
 <div class="wrap contact-grid">
  <form class="card-form" method="post" action="<?= e(nr_base()) ?>api/contact.php" data-ajax novalidate>
   <input type="hidden" name="_t" value="<?= e(form_token()) ?>">
   <input type="hidden" name="lang" value="<?= e(L()) ?>">
   <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
   <div class="field"><label for="c-name"><?= te('contact.name') ?></label><input id="c-name" name="name" required maxlength="120" autocomplete="name"></div>
   <div class="field"><label for="c-email"><?= te('contact.email') ?></label><input id="c-email" name="email" type="email" required maxlength="200" autocomplete="email"></div>
   <div class="field"><label for="c-topic"><?= te('contact.topic') ?></label><select id="c-topic" name="topic"><?php foreach ((array)t('contact.topics') as $k => $v): ?><option value="<?= e($k) ?>"><?= e($v) ?></option><?php endforeach; ?></select></div>
   <div class="field"><label for="c-msg"><?= te('contact.message') ?></label><textarea id="c-msg" name="message" rows="6" required maxlength="5000"></textarea></div>
   <p class="small"><?= te('contact.privacy') ?> <a href="<?= e(u('privacy')) ?>"><?= te('footer.privacy') ?></a></p>
   <button class="btn btn-forest btn-lg" type="submit"><?= icon('mail', 'ic') ?> <?= te('contact.send') ?></button>
   <p class="form-msg" role="status" aria-live="polite"></p>
  </form>
  <aside class="side-box">
   <?= logo_mark('ct-mark') ?>
   <h2>NORRAID AFRICA</h2>
   <p><?= icon('pin', 'ic sm') ?> <?= te('contact.based') ?></p>
   <?php if ($email): ?><p><?= icon('mail', 'ic sm') ?> <a href="mailto:<?= e($email) ?>"><?= e($email) ?></a></p><?php else: ?><p class="small"><?= te('contact.email_pending') ?></p><?php endif; ?>
   <?php if ($de = trim((string)setting('donate_email'))): ?><p><?= icon('heart', 'ic sm') ?> <?= te('contact.donate_q') ?> <a href="mailto:<?= e($de) ?>"><?= e($de) ?></a></p><?php endif; ?>
   <p class="small"><?= te('transparency.status_pending') ?></p>
  </aside>
 </div>
</section>
<?php page_foot();

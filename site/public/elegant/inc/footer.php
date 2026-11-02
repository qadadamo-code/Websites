</main>
<?php $s = eb_load('settings'); $wa = wa_link(LANG === 'ar' ? 'أهلاً إليجانس، عندي استفسار' : 'Hello Elegance, I have a question'); ?>
<footer class="ftr">
  <div class="ftr__top">
    <div class="ftr__brand">
      <svg class="mono" viewBox="0 0 120 120"><use href="#eb-mono"/></svg>
      <p class="ftr__tag"><?= e(L($s, 'tagline')) ?></p>
      <form class="ftr__news" data-news>
        <label><?= t('newsletter') ?><small><?= t('newsletter_sub') ?></small></label>
        <div class="ftr__news-row">
          <input type="email" required placeholder="email@example.com" aria-label="Email">
          <button class="btn btn--gold btn--sm" type="submit">→</button>
        </div>
      </form>
    </div>
    <div class="ftr__col">
      <h4><?= t('collections') ?></h4>
      <?php foreach (categories() as $c): if (!category_count($c['id'])) continue; ?>
        <a href="shop.php?cat=<?= e($c['id']) ?>"><?= e($c[LANG]) ?></a>
      <?php endforeach; ?>
      <a href="shop.php"><?= t('shop_all') ?></a>
    </div>
    <div class="ftr__col">
      <h4><?= t('contact') ?></h4>
      <?php if ($wa): ?><a href="<?= e($wa) ?>" target="_blank" rel="noopener">WhatsApp</a><?php endif; ?>
      <?php if (!empty($s['phone'])): ?><a href="tel:<?= e($s['phone']) ?>" dir="ltr"><?= e($s['phone']) ?></a><?php endif; ?>
      <?php if (!empty($s['email'])): ?><a href="mailto:<?= e($s['email']) ?>"><?= e($s['email']) ?></a><?php endif; ?>
      <a href="track.php"><?= t('track') ?></a>
    </div>
    <div class="ftr__col">
      <h4><?= t('follow') ?></h4>
      <?php if (!empty($s['instagram'])): ?><a href="https://instagram.com/<?= e($s['instagram']) ?>" target="_blank" rel="noopener">Instagram · @<?= e($s['instagram']) ?></a><?php endif; ?>
      <?php if (!empty($s['facebook'])): ?><a href="<?= e($s['facebook']) ?>" target="_blank" rel="noopener">Facebook</a><?php endif; ?>
      <?php if (!empty($s['tiktok'])): ?><a href="<?= e($s['tiktok']) ?>" target="_blank" rel="noopener">TikTok</a><?php endif; ?>
      <a href="privacy.php"><?= t('privacy') ?></a>
    </div>
  </div>
  <div class="ftr__giant" aria-hidden="true">ELEGANCE</div>
  <div class="ftr__bottom">
    <span>© <?= date('Y') ?> <?= e(L($s, 'store_name')) ?> — <?= t('rights') ?></span>
    <span class="ftr__pay"><?= t('cod') ?> · InstaPay · Vodafone Cash</span>
  </div>
</footer>

<?php if ($wa): ?>
<a class="wa-float" href="<?= e($wa) ?>" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 32 32"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8.9 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.7-.5z"/></svg>
</a>
<?php endif; ?>

<aside class="drawer" data-cart aria-hidden="true" aria-label="<?= t('your_cart') ?>">
  <div class="drawer__veil" data-cart-close></div>
  <div class="drawer__panel">
    <div class="drawer__head">
      <h3><?= t('your_cart') ?> <span data-cart-count>0</span></h3>
      <button class="drawer__x" data-cart-close aria-label="<?= t('close') ?>">✕</button>
    </div>
    <div class="ship-meter" data-ship-meter><p></p><div class="ship-meter__bar"><i></i></div></div>
    <div class="drawer__items" data-cart-items></div>
    <div class="drawer__foot">
      <div class="drawer__row"><span><?= t('subtotal') ?></span><b data-cart-subtotal>0</b></div>
      <a class="btn btn--dark btn--block" href="checkout.php" data-checkout-link><?= t('checkout') ?></a>
      <button class="btn btn--ghost btn--block" data-cart-close><?= t('continue') ?></button>
    </div>
  </div>
</aside>

<div class="toast" data-toast role="status" aria-live="polite"></div>
<div class="cursor" aria-hidden="true"><i class="cursor__dot"></i><i class="cursor__ring"><span></span></i></div>

<script src="<?= asset('assets/vendor/gsap.min.js') ?>"></script>
<script src="<?= asset('assets/vendor/ScrollTrigger.min.js') ?>"></script>
<script src="<?= asset('assets/vendor/lenis.min.js') ?>"></script>
<script src="<?= asset('assets/js/site.js') ?>"></script>
<?php if (!empty($pageScripts)) foreach ($pageScripts as $ps): ?><script src="<?= asset($ps) ?>"></script><?php endforeach; ?>
</body>
</html>

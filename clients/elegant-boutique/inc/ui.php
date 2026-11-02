<?php
/** Product card: hover reveals the second photo, quick-add slides up, tilt + glow follow the cursor. */
function product_card(array $p, int $i = 0, string $extra = ''): string {
    $name = e(L($p, 'name'));
    $url = 'product.php?p=' . rawurlencode($p['id']);
    $img1 = e($p['images'][0] ?? '');
    $img2 = e($p['images'][1] ?? ($p['images'][0] ?? ''));
    $cat = category($p['category']);
    $badge = L($p, 'badge');
    $stock = (int)$p['stock'];
    $low = $stock > 0 && $stock <= (int)setting('low_stock', 2);
    ob_start(); ?>
<article class="pcard <?= $extra ?>" data-tilt data-cursor="<?= LANG === 'ar' ? 'شوفي' : 'View' ?>" style="--i:<?= $i ?>">
  <a class="pcard__media" href="<?= $url ?>" aria-label="<?= $name ?>">
    <img class="pcard__img pcard__img--a" src="<?= $img1 ?>" alt="<?= $name ?>" loading="lazy" width="900" height="1200">
    <?php if (count($p['images']) > 1): ?><img class="pcard__img pcard__img--b" src="<?= $img2 ?>" alt="" loading="lazy" width="900" height="1200"><?php endif; ?>
    <span class="pcard__glow"></span>
    <?php if (!$stock): ?><span class="pcard__badge pcard__badge--out"><?= t('sold_out') ?></span>
    <?php elseif ($badge): ?><span class="pcard__badge"><?= e($badge) ?></span><?php endif; ?>
  </a>
  <?php if ($stock): ?>
  <button class="pcard__quick" data-add="<?= e($p['id']) ?>"><span>+</span> <?= t('quick_add') ?></button>
  <?php endif; ?>
  <div class="pcard__info">
    <span class="pcard__cat"><?= e($cat[LANG] ?? '') ?></span>
    <h3 class="pcard__name"><a href="<?= $url ?>"><?= $name ?></a></h3>
    <div class="pcard__price">
      <?php if (!empty($p['compare']) && $p['compare'] > $p['price']): ?><s><?= money($p['compare']) ?></s><?php endif; ?>
      <span><?= money($p['price']) ?></span>
      <?php if ($low): ?><em><?= sprintf(t('only_left'), $stock) ?></em><?php endif; ?>
    </div>
  </div>
</article>
<?php return (string)ob_get_clean();
}

function split_words(string $text): string {
    $out = [];
    foreach (preg_split('/\s+/u', trim($text)) as $i => $w) {
        $out[] = '<span class="w"><span style="--d:' . $i . '">' . e($w) . '</span></span>';
    }
    return implode(' ', $out);
}

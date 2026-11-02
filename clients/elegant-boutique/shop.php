<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/ui.php';
$cat = isset($_GET['cat']) ? category((string)$_GET['cat']) : null;
$q = trim((string)($_GET['q'] ?? ''));
$sort = (string)($_GET['sort'] ?? 'featured');
$list = products();
if ($cat) $list = array_values(array_filter($list, fn($p) => $p['category'] === $cat['id']));
if ($q !== '') {
    $needle = mb_strtolower($q);
    $list = array_values(array_filter($list, fn($p) => mb_strpos(mb_strtolower($p['name_ar'] . ' ' . $p['name_en'] . ' ' . $p['desc_ar'] . ' ' . $p['desc_en']), $needle) !== false));
}
if ($sort === 'low') usort($list, fn($a, $b) => $a['price'] <=> $b['price']);
elseif ($sort === 'high') usort($list, fn($a, $b) => $b['price'] <=> $a['price']);
else usort($list, fn($a, $b) => (int)!empty($b['featured']) <=> (int)!empty($a['featured']));

$pageTitle = $cat ? $cat[LANG] : t('shop_all');
$pageClass = 'page-shop';
$noPreloader = true;
$heroImg = $cat['image'] ?? 'assets/img/scenes/hero-still.webp';
require __DIR__ . '/inc/header.php';
$qs = fn(array $over) => 'shop.php?' . http_build_query(array_filter(array_merge(['cat' => $cat['id'] ?? null, 'sort' => $sort !== 'featured' ? $sort : null, 'q' => $q ?: null], $over)));
?>
<section class="shop-hero">
  <div class="shop-hero__bg"><img src="<?= e($heroImg) ?>" alt=""></div>
  <div class="shop-hero__inner wrap">
    <p class="eyebrow"><span class="line"></span><?= t('collections') ?></p>
    <h1 data-split><?= split_words($pageTitle) ?></h1>
    <p><?= count($list) ?> <?= t('pieces') ?><?= $q !== '' ? ' — “' . e($q) . '”' : '' ?></p>
  </div>
</section>

<section class="shop wrap">
  <div class="shop__bar">
    <div class="chips" role="tablist">
      <a class="chip <?= !$cat ? 'is-on' : '' ?>" href="<?= e($qs(['cat' => null])) ?>"><?= t('all') ?></a>
      <?php foreach (categories() as $c): $n = category_count($c['id']); if (!$n) continue; ?>
        <a class="chip <?= ($cat['id'] ?? '') === $c['id'] ? 'is-on' : '' ?>" href="<?= e($qs(['cat' => $c['id']])) ?>"><?= e($c[LANG]) ?> <sup><?= $n ?></sup></a>
      <?php endforeach; ?>
    </div>
    <label class="sort">
      <span><?= t('sort') ?></span>
      <select onchange="location.href=this.value">
        <option value="<?= e($qs(['sort' => null])) ?>" <?= $sort === 'featured' ? 'selected' : '' ?>><?= t('sort_featured') ?></option>
        <option value="<?= e($qs(['sort' => 'low'])) ?>" <?= $sort === 'low' ? 'selected' : '' ?>><?= t('sort_low') ?></option>
        <option value="<?= e($qs(['sort' => 'high'])) ?>" <?= $sort === 'high' ? 'selected' : '' ?>><?= t('sort_high') ?></option>
      </select>
    </label>
  </div>
  <?php if (!$list): ?>
    <div class="empty"><p><?= t('no_results') ?></p><a class="btn btn--dark" href="shop.php"><?= t('shop_all') ?></a></div>
  <?php else: ?>
    <div class="pgrid pgrid--shop">
      <?php foreach ($list as $i => $p) echo product_card($p, $i % 8); ?>
    </div>
  <?php endif; ?>
</section>
<?php require __DIR__ . '/inc/footer.php'; ?>

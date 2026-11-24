<?php
/** Country page photos. The country texts live in the language files and are edited on the Translations page (section "country"). */
require __DIR__ . '/inc.php';
require_perm('content');
csrf_check();
$SECS = ['food' => 'Food', 'water' => 'Water', 'health' => 'Health', 'displacement' => 'Displacement', 'education' => 'Education'];
$mo = media_opts();
if (is_post()) {
    $cid = (string)p('id');
    if (!country($cid)) go('countries.php');
    admin_tx('countries', function (&$l) use ($cid, $SECS, $mo) {
        foreach ($l as &$c) if ($c['id'] === $cid) {
            $h = (string)p('hero'); if (isset($mo[$h])) $c['hero'] = $h;
            $c['gallery'] = array_values(array_filter(array_map('strval', (array)p('gallery', [])), fn($g) => isset($mo[$g])));
            foreach ($SECS as $k => $_) { $v = (string)p("sec_$k"); $c['sections'][$k] = isset($mo[$v]) ? $v : ''; }
        }
    }, 'update', $cid, 'photos');
    flash('Saved.');
    go('countries.php#' . $cid);
}
admin_head('Countries');
?>
<p class="intro">Choose the photos for each country page. To change the texts (introduction, needs, priorities), open <a href="translations.php?lang=en&sec=country">Translations → country</a>. Statistics are under <a href="crud.php?t=stats">Statistics</a>.</p>
<?php foreach (countries() as $c): ?>
<form class="card form" method="post" id="<?= e($c['id']) ?>">
 <?= csrf_field() ?><input type="hidden" name="id" value="<?= e($c['id']) ?>">
 <h2><?= e(country_name($c['id'])) ?> <a class="small" href="../en/<?= e($c['id']) ?>/" target="_blank" rel="noopener">View ↗</a></h2>
 <div class="grid">
  <label class="f">Hero photo<select name="hero"><?= opts($mo, $c['hero']) ?></select></label>
  <?php foreach ($SECS as $k => $label): ?><label class="f"><?= e($label) ?> section photo<select name="sec_<?= e($k) ?>"><?= opts($mo, $c['sections'][$k] ?? '', true) ?></select></label><?php endforeach; ?>
  <fieldset class="f full"><legend class="lbl">Gallery (in order)</legend><div class="checks-grid">
   <?php foreach ($mo as $mid => $label): ?><label class="chk"><input type="checkbox" name="gallery[]" value="<?= e($mid) ?>"<?= in_array($mid, (array)$c['gallery'], true) ? ' checked' : '' ?>> <?= e($label) ?></label><?php endforeach; ?>
  </div></fieldset>
 </div>
 <div class="actions"><button class="btn">Save <?= e(country_name($c['id'])) ?></button></div>
</form>
<?php endforeach;
admin_foot();

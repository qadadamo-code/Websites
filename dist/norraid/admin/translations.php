<?php
require __DIR__ . '/inc.php';
require_perm('translations');
csrf_check();
$lang = (string)($_GET['lang'] ?? 'sv');
if (!isset(LOCALES[$lang])) $lang = 'sv';
$file = function (string $l): array {
    $data = json_decode((string)@file_get_contents(NR_ROOT . "/lang/$l.json"), true) ?: [];
    $flat = [];
    $walk = function ($arr, $prefix) use (&$walk, &$flat) {
        foreach ($arr as $k => $v) {
            $key = $prefix === '' ? (string)$k : "$prefix.$k";
            if (is_array($v) && array_keys($v) !== range(0, count($v) - 1)) $walk($v, $key); else $flat[$key] = $v;
        }
    };
    $walk($data, '');
    return $flat;
};
$en = $file('en');
$base = $file($lang);
$ov = nr_load('i18n_overrides');
$mine = $ov[$lang] ?? [];
if (is_post()) {
    $in = (array)p('v', []);
    $n = 0;
    foreach ($in as $k => $v) {
        $k = (string)$k;
        if (!isset($en[$k]) || !is_string($en[$k])) continue;
        $v = str_clean($v, 8000);
        $orig = is_string($base[$k] ?? null) ? $base[$k] : '';
        if ($v === '' || $v === $orig) { if (isset($mine[$k])) { unset($mine[$k]); $n++; } }
        elseif (($mine[$k] ?? null) !== $v) { $mine[$k] = $v; $n++; }
    }
    $ov[$lang] = $mine;
    nr_write('i18n_overrides', $ov);
    audit('translate', "lang:$lang", "$n strings");
    flash("$n strings saved for " . LOCALES[$lang][0] . '.');
    go('translations.php?' . http_build_query(['lang' => $lang, 'sec' => $_GET['sec'] ?? '', 'q' => $_GET['q'] ?? '', 'missing' => $_GET['missing'] ?? '']));
}
$sections = array_values(array_unique(array_map(fn($k) => explode('.', $k)[0], array_keys($en))));
$sec = (string)($_GET['sec'] ?? 'home');
$q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
$missingOnly = !empty($_GET['missing']);
$rows = [];
foreach ($en as $k => $v) {
    if (!is_string($v)) continue;
    if ($q === '' && $sec !== '' && explode('.', $k)[0] !== $sec) continue;
    $cur = $mine[$k] ?? (is_string($base[$k] ?? null) ? $base[$k] : '');
    if ($q !== '' && !str_contains(mb_strtolower($k . ' ' . $v . ' ' . $cur), $q)) continue;
    if ($missingOnly && $cur !== '') continue;
    $rows[$k] = [$v, $cur, isset($mine[$k])];
}
$missingCount = count(array_filter($en, fn($v, $k) => is_string($v) && ($mine[$k] ?? $base[$k] ?? '') === '', ARRAY_FILTER_USE_BOTH));
admin_head('Translations');
?>
<p class="intro">Edit the site text in any language. Your edits override the built-in translation and survive updates. Empty a field to go back to the built-in text. Keep numbers as 0-9 digits in every language.</p>
<form class="toolbar" method="get">
 <select name="lang"><?php foreach (LOCALES as $c => $i): ?><option value="<?= e($c) ?>"<?= $c === $lang ? ' selected' : '' ?>><?= e($i[0] . ' (' . $c . ')') ?></option><?php endforeach; ?></select>
 <select name="sec"><option value="">All sections</option><?php foreach ($sections as $s): ?><option<?= $s === $sec ? ' selected' : '' ?>><?= e($s) ?></option><?php endforeach; ?></select>
 <input type="search" name="q" value="<?= e((string)($_GET['q'] ?? '')) ?>" placeholder="Search text">
 <label class="chk"><input type="checkbox" name="missing" value="1"<?= $missingOnly ? ' checked' : '' ?>> Missing only (<?= $missingCount ?>)</label>
 <button class="btn ghost">Show</button>
</form>
<form method="post" class="card" action="translations.php?<?= e(http_build_query(['lang' => $lang, 'sec' => $sec, 'q' => $_GET['q'] ?? '', 'missing' => $missingOnly ? 1 : ''])) ?>">
 <?= csrf_field() ?>
 <div class="tr-list">
 <?php foreach (array_slice($rows, 0, 200, true) as $k => [$src, $cur, $isOv]): $long = mb_strlen($src) > 90; ?>
  <div class="tr-row<?= $isOv ? ' ov' : '' ?>">
   <div class="tr-src"><code><?= e($k) ?></code><p dir="ltr"><?= e($src) ?></p></div>
   <?php if ($long): ?><textarea name="v[<?= e($k) ?>]" rows="3" dir="<?= LOCALES[$lang][1] ?>" lang="<?= e($lang) ?>"><?= e($cur) ?></textarea>
   <?php else: ?><input name="v[<?= e($k) ?>]" value="<?= e($cur) ?>" dir="<?= LOCALES[$lang][1] ?>" lang="<?= e($lang) ?>"><?php endif; ?>
  </div>
 <?php endforeach; ?>
 <?php if (!$rows): ?><p class="muted">Nothing to show.</p><?php endif; ?>
 </div>
 <?php if (count($rows) > 200): ?><p class="muted">Showing 200 of <?= count($rows) ?>. Narrow with a section or search.</p><?php endif; ?>
 <div class="actions sticky"><button class="btn">Save translations</button></div>
</form>
<?php admin_foot();

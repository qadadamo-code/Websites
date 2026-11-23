<?php
require __DIR__ . '/inc.php';
require_perm('content.edit');
$tab = in_array($_GET['tab'] ?? '', ['home', 'faq', 'services', 'tailor'], true) ? $_GET['tab'] : 'home';
$pair = fn($k, $max = 2000) => ['sv' => clean(p($k . '_sv'), $max), 'en' => clean(p($k . '_en'), $max)];
if (posted()) {
    $sec = p('sec');
    if ($sec === 'home') {
        ad_tx('content', function (&$c) use ($pair) {
            $c['hero'] = ['kicker' => $pair('h_kicker', 80), 'title' => $pair('h_title', 120), 'text' => $pair('h_text', 400)];
            $c['story'] = ['title' => $pair('s_title', 120), 'text' => $pair('s_text', 2000), 'quote' => $pair('s_quote', 300)];
            $c['menswear'] = $pair('menswear', 1500);
        });
        $ann = $pair('announce', 200);
        ad_tx('settings', function (&$s) use ($ann) { $s['announce'] = $ann; });
    }
    if ($sec === 'faq') {
        $faq = [];
        foreach ((array)($_POST['faq'] ?? []) as $f) { $q = ['sv' => clean((string)($f['qsv'] ?? ''), 200), 'en' => clean((string)($f['qen'] ?? ''), 200)]; $a = ['sv' => clean((string)($f['asv'] ?? ''), 1500), 'en' => clean((string)($f['aen'] ?? ''), 1500)]; if ($q['sv'] !== '' && $a['sv'] !== '') $faq[] = ['q' => $q, 'a' => $a]; }
        ad_tx('content', function (&$c) use ($faq) { $c['faq'] = $faq; });
    }
    if ($sec === 'services') {
        $old = content()['services'] ?? []; $out = [];
        foreach ((array)($_POST['sv'] ?? []) as $i => $sv) {
            $img = (string)($sv['img'] ?? '');
            if (!empty($_FILES['simg']['tmp_name'][$i])) { $up = save_upload($_FILES['simg'], 'site', (int)$i); if ($up) $img = $up; }
            if (!preg_match('~^(assets/img|uploads/site)/[A-Za-z0-9._-]+$~', $img)) $img = $old[$i]['img'] ?? 'assets/img/store.webp';
            $t = ['sv' => clean((string)($sv['tsv'] ?? ''), 80), 'en' => clean((string)($sv['ten'] ?? ''), 80)]; if ($t['sv'] === '') continue;
            $out[] = ['id' => preg_replace('/[^a-z0-9]/', '', (string)($sv['id'] ?? '')) ?: ad_id('s'), 'img' => $img, 't' => $t, 'd' => ['sv' => clean((string)($sv['dsv'] ?? ''), 400), 'en' => clean((string)($sv['den'] ?? ''), 400)]];
        }
        ad_tx('content', function (&$c) use ($out) { $c['services'] = $out; });
    }
    if ($sec === 'tailor') {
        $groups = [];
        foreach ((array)($_POST['tg'] ?? []) as $g) {
            $name = ['sv' => clean((string)($g['sv'] ?? ''), 60), 'en' => clean((string)($g['en'] ?? ''), 60)]; if ($name['sv'] === '') continue;
            $rows = [];
            foreach (preg_split('/\R/', (string)($g['rows'] ?? '')) as $line) { $parts = array_map('trim', explode('|', $line)); if (count($parts) < 2 || $parts[0] === '') continue; $price = array_pop($parts); $rows[] = [['sv' => clean($parts[0], 120), 'en' => clean($parts[1] ?? '', 120)], clean($price, 30)]; }
            $groups[] = ['g' => $name, 'rows' => $rows];
        }
        ad_tx('content', function (&$c) use ($groups) { $c['tailor'] = $groups; });
    }
    log_act(L('Ändrade texter', 'Changed texts'), $sec); flash(L('Texterna är sparade och syns direkt på webbplatsen', 'The texts are saved and live on the website'));
    go('content.php?tab=' . $tab);
}
$c = content(); $s = settings();
/* two-language field */
function bi(string $name, string $label, array $v, int $rows = 0, int $max = 0): string {
    $out = '<div class="grid2">';
    foreach (['sv' => 'SV', 'en' => 'EN'] as $l => $tag) {
        $val = e($v[$l] ?? '');
        $out .= '<label>' . $label . ' <span class="hint">' . $tag . '</span>' . ($rows ? '<textarea name="' . $name . '_' . $l . '" rows="' . $rows . '">' . $val . '</textarea>' : '<input name="' . $name . '_' . $l . '" value="' . $val . '"' . ($max ? ' maxlength="' . $max . '"' : '') . '>') . '</label>';
    }
    return $out . '</div>';
}
admin_head(L('Texter & FAQ', 'Texts & FAQ'), 'content', '<a class="b b--ghost" href="../" target="_blank">' . icon('eye') . ' ' . L('Visa webbplatsen', 'View website') . '</a>');
?>
<div class="tabs"><?php foreach (['home' => L('Startsida & om oss', 'Home & about'), 'faq' => 'FAQ', 'services' => L('Tjänster', 'Services'), 'tailor' => L('Skrädderi – prislista', 'Tailoring – price list')] as $k => $lbl): ?><a href="?tab=<?= $k ?>" class="<?= $tab === $k ? 'on' : '' ?>"><?= e($lbl) ?></a><?php endforeach; ?></div>
<form method="post" enctype="multipart/form-data" data-dirty><?= csrf_field() ?><input type="hidden" name="sec" value="<?= $tab ?>">
<?php if ($tab === 'home'): ?>
  <div class="card"><h3><?= L('Meddelande högst upp (rullande list)', 'Announcement bar (scrolling)') ?></h3><?= bi('announce', L('Text', 'Text'), $s['announce'] ?? [], 0, 200) ?></div>
  <div class="card"><h3><?= L('Startsidans hero', 'Home hero') ?></h3>
    <?= bi('h_kicker', L('Liten rubrik', 'Kicker'), $c['hero']['kicker'] ?? []) ?>
    <?= bi('h_title', L('Rubrik', 'Headline'), $c['hero']['title'] ?? []) ?>
    <?= bi('h_text', L('Ingress', 'Intro'), $c['hero']['text'] ?? [], 3) ?>
  </div>
  <div class="card"><h3><?= L('Vår historia', 'Our story') ?></h3>
    <?= bi('s_title', L('Rubrik', 'Headline'), $c['story']['title'] ?? []) ?>
    <?= bi('s_text', L('Text', 'Text'), $c['story']['text'] ?? [], 6) ?>
    <?= bi('s_quote', L('Citat', 'Quote'), $c['story']['quote'] ?? [], 2) ?>
  </div>
  <div class="card"><h3><?= L('Herrekipering (skrädderisidan)', 'Menswear (tailoring page)') ?></h3><?= bi('menswear', L('Text', 'Text'), $c['menswear'] ?? [], 5) ?></div>
<?php elseif ($tab === 'faq'): ?>
  <div class="card" data-rep>
    <?php foreach ($c['faq'] ?? [] as $i => $f): ?>
    <div class="vcard" data-rep-row><div class="vcard__hd"><b><?= L('Fråga', 'Question') ?></b><span class="spacer"></span><button type="button" class="b b--ghost b--icon b--sm" data-rep-up><?= icon('up') ?></button><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm><?= icon('trash') ?></button></div>
      <div class="grid2"><label><?= L('Fråga', 'Question') ?> SV<input name="faq[<?= $i ?>][qsv]" value="<?= e($f['q']['sv']) ?>"></label><label><?= L('Fråga', 'Question') ?> EN<input name="faq[<?= $i ?>][qen]" value="<?= e($f['q']['en'] ?? '') ?>"></label>
      <label><?= L('Svar', 'Answer') ?> SV<textarea name="faq[<?= $i ?>][asv]" rows="3"><?= e($f['a']['sv']) ?></textarea></label><label><?= L('Svar', 'Answer') ?> EN<textarea name="faq[<?= $i ?>][aen]" rows="3"><?= e($f['a']['en'] ?? '') ?></textarea></label></div></div>
    <?php endforeach; ?>
    <button type="button" class="b b--ghost" data-rep-add><?= icon('plus') ?> <?= L('Lägg till fråga', 'Add question') ?></button>
    <template><div class="vcard" data-rep-row><div class="vcard__hd"><b><?= L('Ny fråga', 'New question') ?></b><span class="spacer"></span><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm>×</button></div><div class="grid2"><label><?= L('Fråga', 'Question') ?> SV<input name="faq[__i__][qsv]"></label><label><?= L('Fråga', 'Question') ?> EN<input name="faq[__i__][qen]"></label><label><?= L('Svar', 'Answer') ?> SV<textarea name="faq[__i__][asv]" rows="3"></textarea></label><label><?= L('Svar', 'Answer') ?> EN<textarea name="faq[__i__][aen]" rows="3"></textarea></label></div></div></template>
  </div>
<?php elseif ($tab === 'services'): ?>
  <div class="card">
    <?php foreach ($c['services'] ?? [] as $i => $sv): ?>
    <div class="vcard"><div class="row" style="align-items:flex-start">
      <img src="<?= e(src($sv['img'])) ?>" alt="" style="width:90px;height:120px;object-fit:cover;border-radius:10px">
      <div style="flex:1;min-width:240px"><input type="hidden" name="sv[<?= $i ?>][id]" value="<?= e($sv['id']) ?>"><input type="hidden" name="sv[<?= $i ?>][img]" value="<?= e($sv['img']) ?>">
        <div class="grid2"><label><?= L('Rubrik', 'Title') ?> SV<input name="sv[<?= $i ?>][tsv]" value="<?= e($sv['t']['sv']) ?>"></label><label><?= L('Rubrik', 'Title') ?> EN<input name="sv[<?= $i ?>][ten]" value="<?= e($sv['t']['en'] ?? '') ?>"></label>
        <label><?= L('Text', 'Text') ?> SV<textarea name="sv[<?= $i ?>][dsv]" rows="2"><?= e($sv['d']['sv']) ?></textarea></label><label><?= L('Text', 'Text') ?> EN<textarea name="sv[<?= $i ?>][den]" rows="2"><?= e($sv['d']['en'] ?? '') ?></textarea></label></div>
        <label><?= L('Byt bild', 'Replace image') ?><input type="file" name="simg[<?= $i ?>]" accept="image/jpeg,image/png,image/webp"></label>
      </div></div></div>
    <?php endforeach; ?>
  </div>
<?php else: ?>
  <div class="card" data-rep>
    <p class="hint"><?= L('En rad per tjänst: Svensk text | English text | Pris. Exempel: Uppläggning kjol | Skirt hem | 400', 'One line per service: Swedish text | English text | Price. Example: Uppläggning kjol | Skirt hem | 400') ?></p>
    <?php foreach ($c['tailor'] ?? [] as $i => $g): ?>
    <div class="vcard" data-rep-row><div class="vcard__hd"><b><?= e($g['g']['sv']) ?></b><span class="spacer"></span><button type="button" class="b b--ghost b--icon b--sm" data-rep-up><?= icon('up') ?></button><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm><?= icon('trash') ?></button></div>
      <div class="grid2"><label><?= L('Grupp', 'Group') ?> SV<input name="tg[<?= $i ?>][sv]" value="<?= e($g['g']['sv']) ?>"></label><label><?= L('Grupp', 'Group') ?> EN<input name="tg[<?= $i ?>][en]" value="<?= e($g['g']['en'] ?? '') ?>"></label></div>
      <label><?= L('Rader', 'Rows') ?><textarea name="tg[<?= $i ?>][rows]" rows="<?= max(3, count($g['rows']) + 1) ?>" style="font-family:ui-monospace,monospace;font-size:13px"><?= e(implode("\n", array_map(fn($r) => $r[0]['sv'] . ' | ' . ($r[0]['en'] ?? '') . ' | ' . $r[1], $g['rows']))) ?></textarea></label>
    </div>
    <?php endforeach; ?>
    <button type="button" class="b b--ghost" data-rep-add><?= icon('plus') ?> <?= L('Lägg till grupp', 'Add group') ?></button>
    <template><div class="vcard" data-rep-row><div class="vcard__hd"><b><?= L('Ny grupp', 'New group') ?></b><span class="spacer"></span><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm>×</button></div><div class="grid2"><label><?= L('Grupp', 'Group') ?> SV<input name="tg[__i__][sv]"></label><label><?= L('Grupp', 'Group') ?> EN<input name="tg[__i__][en]"></label></div><label><?= L('Rader', 'Rows') ?><textarea name="tg[__i__][rows]" rows="4"></textarea></label></div></template>
  </div>
<?php endif; ?>
<div class="sticky-save"><button class="b"><?= icon('check') ?> <?= L('Spara', 'Save') ?></button></div>
</form>
<?php admin_foot(); ?>

<?php
require __DIR__ . '/inc.php';
require_perm('media');
csrf_check();
$F = [
    'title' => ['label' => 'Title', 'required' => true, 'wide' => true],
    'artist' => ['label' => 'Photographer / credit', 'required' => true],
    'license' => ['label' => 'Licence (e.g. CC BY 2.0, or "Own photo, consent on file")', 'required' => true],
    'license_url' => ['label' => 'Licence link', 'input' => 'url'],
    'page' => ['label' => 'Original page (source)', 'input' => 'url', 'wide' => true],
    'src' => ['label' => 'Remote image URL (used until a local copy exists)', 'input' => 'url', 'wide' => true, 'max' => 1000],
    'date' => ['label' => 'Photo date', 'type' => 'date'],
    'country' => ['label' => 'Country', 'type' => 'select', 'options' => country_opts(), 'blank' => true],
    'alt' => ['label' => 'Description for screen readers (alt text)', 'type' => 'loc'],
];
$id = (string)($_GET['id'] ?? '');
if (is_post()) {
    $act = (string)p('act');
    if ($act === 'import') {
        $ids = p('id') === '*' ? array_keys(array_filter(media_all(), fn($m) => empty($m['file']))) : [(string)p('id')];
        @set_time_limit(300);
        $ok = 0; foreach (array_slice($ids, 0, 12) as $mid) if (media_import_one($mid)) $ok++;
        audit('media_import', 'media', "$ok of " . min(12, count($ids)));
        flash("$ok photo(s) stored locally." . (count($ids) > 12 ? ' Click again for the next batch.' : ''), $ok ? 'ok' : 'warn');
        go($id ? 'media.php?id=' . rawurlencode($id) : 'media.php');
    }
    if ($act === 'save') {
        $old = $id !== '' ? (media($id) ?? []) : [];
        $row = $old;
        foreach ($F as $k => $f) $row[$k] = field_value($k, $f, $old[$k] ?? null);
        if ($id === '') {
            $nid = preg_replace('/[^a-z0-9_]/', '', strtolower((string)p('new_id')));
            if ($nid === '' || media($nid)) { flash('Choose a unique short id (letters, numbers, underscore).', 'bad'); go('media.php?new=1'); }
            $row['id'] = $nid;
        }
        if (trim((string)$row['artist']) === '' || trim((string)$row['license']) === '') { flash('Credit and licence are required for every photo.', 'bad'); go('media.php?' . ($id ? 'id=' . rawurlencode($id) : 'new=1')); }
        if (!empty($_FILES['upload']['tmp_name']) && is_uploaded_file($_FILES['upload']['tmp_name'])) {
            if ($_FILES['upload']['size'] > 15 * 1024 * 1024) flash('Image is larger than 15 MB.', 'bad');
            elseif ($res = media_store_bytes($row['id'], (string)file_get_contents($_FILES['upload']['tmp_name']))) { $row = array_merge($row, $res); }
            else flash('Could not read that image. Use JPG, PNG or WEBP.', 'bad');
        }
        $row['updated'] = now_iso();
        $mid = $row['id'];
        admin_tx('media', function (&$l) use ($row, $mid) { foreach ($l as $i => $r) if ($r['id'] === $mid) { $l[$i] = $row; return; } $l[] = $row; }, $id ? 'update' : 'create', $mid);
        flash('Saved.');
        go('media.php?id=' . rawurlencode($mid));
    }
    if ($act === 'delete') {
        $used = [];
        foreach (countries() as $c) { if ($c['hero'] === $id || in_array($id, (array)$c['gallery'], true) || in_array($id, (array)$c['sections'], true)) $used[] = $c['id']; }
        foreach (nr_load('stories') as $s) if (($s['media'] ?? '') === $id) $used[] = 'story ' . $s['slug'];
        if ($used || in_array($id, ['hero_water', 'ss_water', 'drc_backtoschool'], true)) { flash('This photo is in use (' . implode(', ', $used ?: ['home or donate page']) . '). Replace it there first.', 'bad'); go('media.php?id=' . rawurlencode($id)); }
        $m = media($id);
        if (!empty($m['file'])) { @unlink(NR_UPLOADS . '/media/' . basename($m['file'])); @unlink(NR_UPLOADS . '/media/sm-' . basename($m['file'])); }
        admin_tx('media', function (&$l) use ($id) { $l = array_values(array_filter($l, fn($r) => $r['id'] !== $id)); }, 'delete', $id);
        flash('Deleted.');
        go('media.php');
    }
}
admin_head('Media');
if ($id !== '' || isset($_GET['new'])):
    $m = $id !== '' ? media($id) : [];
    if ($m === null) { echo '<p class="flash bad">Not found.</p>'; admin_foot(); exit; } ?>
 <p><a href="media.php">← All photos</a></p>
 <div class="media-edit">
  <?php if ($id !== ''): ?><figure class="card"><img src="<?= e(media_url($m, 900)) ?>" alt=""><figcaption class="small"><?= media_credit($m) ?><br><?= !empty($m['file']) ? '✓ Stored locally' : 'Loaded from the remote source' ?></figcaption>
   <?php if (empty($m['file']) && !empty($m['src'])): ?><form method="post"><?= csrf_field() ?><input type="hidden" name="act" value="import"><input type="hidden" name="id" value="<?= e($id) ?>"><button class="btn ghost">Store a local copy</button></form><?php endif; ?></figure><?php endif; ?>
  <form class="card form" method="post" enctype="multipart/form-data">
   <?= csrf_field() ?><input type="hidden" name="act" value="save">
   <div class="grid">
    <?php if ($id === ''): ?><label class="f">Short id *<input name="new_id" required pattern="[a-z0-9_]+"></label><?php endif; ?>
    <?php foreach ($F as $k => $f) echo field_input($k, $f, $m[$k] ?? ''); ?>
    <label class="f full">Upload image (JPG/PNG/WEBP, replaces the local copy)<input type="file" name="upload" accept="image/jpeg,image/png,image/webp"><small class="help">Only photos you have the right to use. No AI images of real beneficiaries; no identifiable people without consent.</small></label>
   </div>
   <div class="actions"><button class="btn">Save</button></div>
  </form>
 </div>
 <?php if ($id !== ''): ?><form method="post" class="danger-zone" data-confirm="Delete this photo?"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><button class="btn danger">Delete</button></form><?php endif; ?>
<?php else:
    $all = media_all(); $missing = count(array_filter($all, fn($m) => empty($m['file']))); ?>
 <p class="intro">Every photo carries its credit and licence on the site. Photos from Wikimedia Commons are copied to this server automatically in the background; you can also do it now.</p>
 <div class="toolbar">
  <form method="post"><?= csrf_field() ?><input type="hidden" name="act" value="import"><input type="hidden" name="id" value="*"><button class="btn ghost"<?= $missing ? '' : ' disabled' ?>>Store local copies (<?= $missing ?> remote)</button></form>
  <a class="btn" href="media.php?new=1">+ Add photo</a>
 </div>
 <div class="media-grid">
 <?php foreach ($all as $mid => $m): ?><a class="media-card" href="media.php?id=<?= e(rawurlencode($mid)) ?>"><img src="<?= e(media_url($m, 900)) ?>" alt="" loading="lazy"><span><b><?= e($mid) ?></b><?= e(mb_strimwidth((string)($m['title'] ?? ''), 0, 60, '…')) ?><small><?= e((string)($m['artist'] ?? '')) ?> · <?= e((string)($m['license'] ?? '')) ?> · <?= !empty($m['file']) ? 'local' : 'remote' ?></small></span></a><?php endforeach; ?>
 </div>
<?php endif;
admin_foot();

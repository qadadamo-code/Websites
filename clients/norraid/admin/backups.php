<?php
require __DIR__ . '/inc.php';
require_perm('backups');
csrf_check();
$dir = NR_STORAGE . '/backups/';
if (is_post()) {
    $act = (string)p('act');
    if ($act === 'make') { $n = nr_backup_make('manual'); audit('backup', (string)$n); flash($n ? "Backup created: $n" : 'Backup failed.', $n ? 'ok' : 'bad'); }
    if ($act === 'restore') {
        $f = basename((string)p('file'));
        if (!preg_match('/^bk-[\w-]+\.json(\.gz)?$/', $f) || !is_file($dir . $f)) { flash('Backup not found.', 'bad'); go('backups.php'); }
        $raw = (string)file_get_contents($dir . $f);
        if (str_ends_with($f, '.gz')) $raw = (string)gzdecode($raw);
        $data = json_decode($raw, true);
        if (!is_array($data['files'] ?? null)) { flash('This backup cannot be read.', 'bad'); go('backups.php'); }
        nr_backup_make('manual');
        foreach ($data['files'] as $k => $v) if (preg_match('/^[a-z0-9_]+$/', (string)$k) && !in_array($k, ['users', 'audit'], true)) nr_write($k, $v);
        audit('restore', $f);
        flash("Restored $f. Users and the audit log were kept as they are. A backup of the state before the restore was made.");
    }
    go('backups.php');
}
if (isset($_GET['download'])) {
    $f = basename((string)$_GET['download']);
    if (hash_equals(csrf(), (string)($_GET['_csrf'] ?? '')) && preg_match('/^bk-[\w-]+\.json(\.gz)?$/', $f) && is_file($dir . $f)) {
        audit('backup_download', $f);
        header('Content-Type: application/octet-stream'); header('Content-Disposition: attachment; filename="' . $f . '"'); readfile($dir . $f); exit;
    }
}
$files = glob($dir . 'bk-*') ?: []; rsort($files);
admin_head('Backups');
?>
<p class="intro">A backup of all site data is made automatically every 6 hours (last 40 kept). Uploaded files in /uploads are not inside these backups; cPanel backups cover them.</p>
<form method="post" class="toolbar"><?= csrf_field() ?><input type="hidden" name="act" value="make"><span></span><button class="btn">Make a backup now</button></form>
<div class="table-wrap"><table class="tbl"><thead><tr><th>File</th><th>Size</th><th></th><th></th></tr></thead><tbody>
<?php foreach ($files as $f): $b = basename($f); ?><tr><td><?= e($b) ?></td><td><?= e(number_format(filesize($f) / 1024, 1)) ?> KB</td>
<td><a href="backups.php?download=<?= e(rawurlencode($b)) ?>&_csrf=<?= e(csrf()) ?>">Download</a></td>
<td><form method="post" data-confirm="Restore this backup? Current content will be replaced (a safety backup is made first)."><?= csrf_field() ?><input type="hidden" name="act" value="restore"><input type="hidden" name="file" value="<?= e($b) ?>"><button class="linkbtn">Restore</button></form></td></tr><?php endforeach; ?>
</tbody></table></div>
<?php admin_foot();

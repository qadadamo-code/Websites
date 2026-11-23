<?php
require __DIR__ . '/inc.php';
require_perm('backup.manage');
$me = me();
$valid = fn($f) => (bool)preg_match('~^bk-\d{8}-\d{6}-(auto|manual|pre)-[0-9a-f]+\.json(\.gz)?$~', $f) && is_file(ad_backup_dir() . '/' . $f);
if (isset($_GET['dl']) && $valid((string)$_GET['dl'])) {
    $f = (string)$_GET['dl']; log_act(L('Laddade ner säkerhetskopia', 'Downloaded backup'), $f);
    header('Content-Type: application/octet-stream'); header('Content-Disposition: attachment; filename="ateljedantel-' . $f . '"'); header('Content-Length: ' . filesize(ad_backup_dir() . '/' . $f));
    readfile(ad_backup_dir() . '/' . $f); exit;
}
function restore_data(array $d, bool $users): int {
    ad_backup_make('pre', me()['user'] ?? '');
    $n = 0; $GLOBALS['ad_no_undo'] = true;
    foreach ($d['files'] as $k => $data) {
        if (!preg_match('/^[a-z]+$/', (string)$k) || in_array($k, ['ratelimit', 'logins', 'undo', 'log', 'migrations'], true) || !is_array($data)) continue;
        if ($k === 'users' && (!$users || !$data)) continue;
        ad_write($k, $data); $n++;
    }
    $GLOBALS['ad_no_undo'] = false;
    return $n;
}
if (posted()) {
    $act = p('act');
    if ($act === 'make') { $f = ad_backup_make('manual', $me['user']); log_act(L('Skapade säkerhetskopia', 'Created backup'), (string)$f); flash($f ? L('Säkerhetskopian är skapad', 'The backup was created') : L('Kunde inte skapa säkerhetskopia', 'Could not create backup'), $f ? 'ok' : 'bad'); }
    if ($act === 'restore' && $valid(p('file'))) {
        $d = ad_backup_read(ad_backup_dir() . '/' . p('file'));
        if ($d) { $n = restore_data($d, !empty($_POST['users'])); log_act(L('Återställde säkerhetskopia', 'Restored backup'), p('file')); flash(L("Återställt ($n filer). En kopia av läget före återställningen sparades.", "Restored ($n files). A copy of the state before restoring was saved.")); }
        else flash(L('Filen kunde inte läsas', 'The file could not be read'), 'bad');
    }
    if ($act === 'upload' && !empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name']) && $_FILES['file']['size'] < 50 * 1024 * 1024) {
        $d = ad_backup_read($_FILES['file']['tmp_name']);
        if ($d) { $n = restore_data($d, false); log_act(L('Återställde från uppladdad fil', 'Restored from uploaded file'), $_FILES['file']['name']); flash(L("Återställt ($n filer)", "Restored ($n files)")); }
        else flash(L('Filen är inte en säkerhetskopia från Ateljé Dantel', 'The file is not an Ateljé Dantel backup'), 'bad');
    }
    if ($act === 'delete' && $valid(p('file'))) { @unlink(ad_backup_dir() . '/' . p('file')); log_act(L('Raderade säkerhetskopia', 'Deleted backup'), p('file')); flash(L('Raderad', 'Deleted')); }
    go('backups.php');
}
$list = ad_backup_list();
$types = ['auto' => L('Automatisk', 'Automatic'), 'manual' => L('Manuell', 'Manual'), 'pre' => L('Före återställning', 'Before restore')];
admin_head(L('Säkerhetskopior', 'Backups'), 'backups', '<form method="post" style="margin:0">' . csrf_field() . '<input type="hidden" name="act" value="make"><button class="b">' . icon('plus') . ' ' . L('Skapa säkerhetskopia nu', 'Create backup now') . '</button></form>');
?>
<div class="cols">
  <div class="card" style="padding:0">
    <table class="t"><thead><tr><th><?= L('Tid', 'Time') ?></th><th><?= L('Typ', 'Type') ?></th><th class="hide-sm"><?= L('Storlek', 'Size') ?></th><th></th></tr></thead><tbody>
    <?php foreach ($list as $b): ?><tr><td><?= e(fdate($b['at'])) ?><br><small class="muted"><?= e(ago($b['at'])) ?></small></td><td><span class="st st--<?= $b['type'] === 'manual' ? 'on' : ($b['type'] === 'pre' ? 'warn' : 'off') ?>"><?= e($types[$b['type']]) ?></span></td><td class="hide-sm"><?= e(number_format($b['size'] / 1024, 0, ',', ' ')) ?> kB</td>
      <td><form method="post" class="acts"><?= csrf_field() ?><input type="hidden" name="file" value="<?= e($b['file']) ?>">
        <a class="b b--ghost b--icon b--sm" href="?dl=<?= e(urlencode($b['file'])) ?>" title="<?= L('Ladda ner', 'Download') ?>"><?= icon('down') ?></a>
        <button class="b b--ghost b--sm" name="act" value="restore" data-confirm="<?= L('Återställa butiken till den här tidpunkten? Ordrar och ändringar efter detta försvinner (en kopia av nuläget sparas först).', 'Restore the shop to this point in time? Orders and changes after it are lost (a copy of the current state is saved first).') ?>"><?= icon('undo') ?> <?= L('Återställ', 'Restore') ?></button>
        <button class="b b--ghost b--icon b--sm" name="act" value="delete" data-confirm="<?= L('Radera säkerhetskopian?', 'Delete the backup?') ?>"><?= icon('trash') ?></button>
      </form></td></tr><?php endforeach; ?>
    <?php if (!$list): ?><tr><td colspan="4" class="muted empty"><?= L('Inga säkerhetskopior ännu.', 'No backups yet.') ?></td></tr><?php endif; ?>
    </tbody></table>
  </div>
  <div>
    <div class="card"><h3><?= L('Så fungerar det', 'How it works') ?></h3><p class="muted"><?= L('All data (produkter, ordrar, bokningar, kunder, texter och inställningar) sparas automatiskt var tredje timme. De senaste 56 automatiska kopiorna (cirka en vecka) behålls. Ladda gärna ner en kopia ibland och spara den på din dator.', 'All data (products, orders, bookings, customers, texts and settings) is saved automatically every three hours. The latest 56 automatic copies (about a week) are kept. Feel free to download a copy now and then and keep it on your computer.') ?></p><p class="hint"><?= L('Användarkonton och lösenord återställs inte, så ingen blir utelåst.', 'User accounts and passwords are not restored, so nobody gets locked out.') ?></p></div>
    <form method="post" enctype="multipart/form-data" class="card"><?= csrf_field() ?><input type="hidden" name="act" value="upload">
      <h3><?= L('Återställ från fil', 'Restore from file') ?></h3>
      <input type="file" name="file" accept=".gz,.json" required>
      <button class="b b--ghost" style="margin-top:10px" data-confirm="<?= L('Återställa från filen? Nuvarande data ersätts (en kopia sparas först).', 'Restore from the file? Current data is replaced (a copy is saved first).') ?>"><?= L('Ladda upp och återställ', 'Upload and restore') ?></button>
    </form>
  </div>
</div>
<?php admin_foot(); ?>

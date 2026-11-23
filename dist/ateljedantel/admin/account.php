<?php
require __DIR__ . '/inc.php';
require_admin();
$me = me();
if (posted()) {
    $name = clean(p('name'), 60); $email = strtolower(clean(p('email'), 120));
    $cur = (string)($_POST['cur'] ?? ''); $new = (string)($_POST['new'] ?? '');
    if (!password_verify($cur, $me['hash'])) flash(L('Nuvarande lösenord stämmer inte', 'Current password is wrong'), 'bad');
    elseif ($email !== '' && !valid_email($email)) flash(L('Ogiltig e-post', 'Invalid email'), 'bad');
    elseif ($new !== '' && ($w = weak_pass($new))) flash($w, 'bad');
    elseif ($new !== '' && $new !== (string)($_POST['new2'] ?? '')) flash(L('Lösenorden matchar inte', 'Passwords do not match'), 'bad');
    else {
        ad_tx('users', function (&$all) use ($me, $name, $email, $new) { foreach ($all as &$u) if ($u['id'] === $me['id']) { $u['name'] = $name ?: $u['name']; $u['email'] = $email; if ($new !== '') { $u['hash'] = password_hash($new, PASSWORD_DEFAULT); $u['pwChanged'] = now_iso(); } } });
        if ($new !== '') session_regenerate_id(true);
        log_act(L('Uppdaterade sitt konto', 'Updated own account'), $new !== '' ? L('nytt lösenord', 'new password') : '');
        flash(L('Kontot är sparat', 'Account saved'));
    }
    go('account.php');
}
admin_head(L('Mitt konto', 'My account'), 'account');
?>
<form method="post" class="card narrow"><?= csrf_field() ?>
  <h3><?= e($me['user']) ?> · <?= e(role_label($me)) ?></h3>
  <div class="grid2">
    <label><?= L('Namn', 'Name') ?><input name="name" value="<?= e($me['name']) ?>"></label>
    <label><?= L('E-post (för inloggning)', 'Email (for sign in)') ?><input name="email" type="email" value="<?= e($me['email'] ?? '') ?>"></label>
    <label><?= L('Nytt lösenord (valfritt)', 'New password (optional)') ?><input name="new" type="password" autocomplete="new-password"></label>
    <label><?= L('Upprepa nytt lösenord', 'Repeat new password') ?><input name="new2" type="password" autocomplete="new-password"></label>
    <label class="full"><?= L('Nuvarande lösenord (krävs för att spara)', 'Current password (required to save)') ?><input name="cur" type="password" required autocomplete="current-password"></label>
  </div>
  <button class="b"><?= L('Spara', 'Save') ?></button>
</form>
<?php admin_foot(); ?>

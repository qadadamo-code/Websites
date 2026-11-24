<?php
require __DIR__ . '/inc.php';
require_login();
csrf_check();
$me = me();
if (is_post()) {
    $new = (string)p('new');
    if (!password_verify((string)p('old'), $me['hash'])) flash('Your current password is not correct.', 'bad');
    elseif ($new !== (string)p('new2')) flash('The two new passwords do not match.', 'bad');
    elseif ($w = weak_pass($new)) flash($w, 'bad');
    else {
        nr_tx('users', function (&$l) use ($me, $new) { foreach ($l as &$u) if ($u['id'] === $me['id']) { $u['hash'] = password_hash($new, PASSWORD_DEFAULT); $u['must_change'] = false; $u['changed'] = now_iso(); } });
        audit('password_change', 'users:' . $me['user']);
        session_regenerate_id(true);
        flash('Password changed.');
        go('index.php');
    }
    go('account.php');
}
admin_head('My account');
?>
<form class="card form narrow" method="post">
 <?= csrf_field() ?>
 <p><b><?= e($me['name'] ?: $me['user']) ?></b> · <?= e(ROLES[$me['role']][0] ?? '') ?><br><span class="muted"><?= e(ROLES[$me['role']][1] ?? '') ?></span></p>
 <?php if (!empty($me['must_change'])): ?><p class="flash warn">You are using a temporary password. Choose your own now.</p><?php endif; ?>
 <label class="f">Current password<input name="old" type="password" autocomplete="current-password" required></label>
 <label class="f">New password<input name="new" type="password" autocomplete="new-password" minlength="12" required><small class="help">At least 12 characters, with letters and numbers.</small></label>
 <label class="f">Repeat new password<input name="new2" type="password" autocomplete="new-password" minlength="12" required></label>
 <div class="actions"><button class="btn">Change password</button></div>
</form>
<?php admin_foot();

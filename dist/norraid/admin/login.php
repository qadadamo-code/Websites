<?php
require __DIR__ . '/inc.php';
if (me()) go('index.php');
$err = '';
if (is_post()) {
    csrf_check();
    $user = strtolower(trim((string)p('user')));
    if (rate_limited('admin_login', 8, 900)) $err = 'Too many attempts. Wait 15 minutes and try again.';
    else {
        $found = null;
        foreach (users_all() as $u) if (strtolower((string)$u['user']) === $user && !empty($u['active'])) $found = $u;
        // constant-time-ish: always verify against a hash
        $ok = password_verify((string)p('pass'), $found['hash'] ?? '$2y$10$WGKrmJtycfAHzB0Qo0kI3ePTzp2x8Gfyaw5UeCwyfP9.hG28dNbwa');
        if ($found && $ok) {
            session_regenerate_id(true);
            $_SESSION = ['uid' => $found['id'], 'born' => time(), 'seen' => time(), 'fp' => hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? ''))];
            nr_tx('users', function (&$l) use ($found) {
                foreach ($l as &$u) if ($u['id'] === $found['id']) {
                    $u['last_login'] = now_iso();
                    if (password_needs_rehash($u['hash'], PASSWORD_DEFAULT)) $u['hash'] = password_hash((string)p('pass'), PASSWORD_DEFAULT);
                }
            });
            audit('login', 'users:' . $found['user']);
            go('index.php');
        }
        audit('login_failed', 'users:' . mb_substr($user, 0, 40));
        $err = 'Wrong username or password.';
    }
}
admin_head('Sign in');
?>
<form class="card login" method="post" autocomplete="on">
 <img src="../assets/brand/norraid-logo-stacked-color.svg" alt="NORRAID AFRICA" width="200">
 <?php if (!empty($_SESSION['expired'])): unset($_SESSION['expired']); ?><p class="flash warn">Your session ended. Please sign in again.</p><?php endif; ?>
 <?php if ($err): ?><p class="flash bad" role="alert"><?= e($err) ?></p><?php endif; ?>
 <?php if (!users_all()): ?><p class="flash warn">No admin account exists yet. Upload data/admin.seed.json or ask your developer.</p><?php endif; ?>
 <?= csrf_field() ?>
 <label class="f">Username<input name="user" autocomplete="username" required autofocus></label>
 <label class="f">Password<input name="pass" type="password" autocomplete="current-password" required></label>
 <button class="btn">Sign in</button>
</form>
<?php admin_foot();

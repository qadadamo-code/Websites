<?php
/** Sign in. The very first visit (no users yet) creates the owner account. Failed attempts are rate limited per IP and per username. */
require __DIR__ . '/inc.php';
if (me()) go('index.php');
$setup = !users_all();
$err = '';
function login_guard(string $key, bool $fail = false): bool {
    return ad_tx('logins', function (&$d) use ($key, $fail) {
        $now = time();
        foreach ($d as $k => $v) { $d[$k] = array_values(array_filter($v, fn($t) => $t > $now - 900)); if (!$d[$k]) unset($d[$k]); }
        if ($fail) { $d[$key][] = $now; }
        return count($d[$key] ?? []) < 6;
    });
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!hash_equals(csrf(), (string)($_POST['_t'] ?? ''))) $err = L('Sessionen har gått ut, försök igen', 'The session expired, please try again');
    else {
        $user = strtolower(trim((string)($_POST['user'] ?? ''))); $pass = (string)($_POST['pass'] ?? '');
        $ipKey = 'ip:' . hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? '')); $uKey = 'u:' . hash('sha256', $user);
        if ($setup) {
            $name = clean((string)($_POST['name'] ?? ''), 60);
            if (!preg_match('/^[a-z0-9._-]{3,30}$/', $user)) $err = L('Användarnamn: 3–30 tecken (a–z, 0–9, . _ -)', 'Username: 3–30 characters (a–z, 0–9, . _ -)');
            elseif ($w = weak_pass($pass)) $err = $w;
            elseif ($pass !== (string)($_POST['pass2'] ?? '')) $err = L('Lösenorden matchar inte', 'Passwords do not match');
            else {
                $u = ['id' => ad_id('u'), 'user' => $user, 'name' => $name ?: $user, 'email' => '', 'role' => 'owner', 'perms' => [], 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'active' => true, 'created' => now_iso(), 'last' => now_iso()];
                ad_write('users', [$u]);
                session_regenerate_id(true);
                $_SESSION = ['uid' => $u['id'], 'born' => time(), 'seen' => time(), 'fp' => hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? '')), 'alang' => alang()];
                log_act(L('Skapade ägarkontot', 'Created the owner account'), $user);
                flash(L('Välkommen! Ditt ägarkonto är skapat.', 'Welcome! Your owner account has been created.'));
                go('index.php');
            }
        } elseif (!login_guard($ipKey) || !login_guard($uKey)) {
            $err = L('För många misslyckade försök. Vänta 15 minuter.', 'Too many failed attempts. Wait 15 minutes.');
        } else {
            $hit = null; foreach (users_all() as $u) if (strtolower($u['user']) === $user || ($u['email'] !== '' && strtolower($u['email']) === $user)) $hit = $u;
            $ok = $hit && !empty($hit['active']) && password_verify($pass, $hit['hash']);
            if (!$hit) password_verify($pass, '$2y$10$abcdefghijklmnopqrstuuWkF3Gx0xZJ6HqJmQ3n3m0cX7nYvT5nK'); // same timing either way
            if ($ok) {
                if (password_needs_rehash($hit['hash'], PASSWORD_DEFAULT)) $hit['hash'] = password_hash($pass, PASSWORD_DEFAULT);
                ad_tx('users', function (&$all) use ($hit) { foreach ($all as &$x) if ($x['id'] === $hit['id']) { $x['last'] = now_iso(); $x['hash'] = $hit['hash']; } });
                session_regenerate_id(true);
                $_SESSION = ['uid' => $hit['id'], 'born' => time(), 'seen' => time(), 'fp' => hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? '')), 'alang' => alang()];
                log_act(L('Loggade in', 'Signed in'));
                go('index.php');
            }
            login_guard($ipKey, true); login_guard($uKey, true);
            usleep(400000);
            $err = L('Fel användarnamn eller lösenord', 'Wrong username or password');
        }
    }
}
?><!doctype html>
<html lang="<?= alang() ?>"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title><?= L('Logga in', 'Sign in') ?> · Ateljé Dantel</title><link rel="icon" href="../assets/brand/favicon.png"><link rel="stylesheet" href="admin.css?v=<?= AD_VERSION ?>"></head>
<body class="login">
<div class="login__art"><img src="../assets/img/bride-garden.webp" alt=""><div><img src="../assets/brand/mark-light.svg" alt="" class="login__mark"><p>Ateljé Dantel</p><small><?= L('Fest- & brudklänningar · Umeå', 'Evening & bridal wear · Umeå') ?></small></div></div>
<form class="login__box" method="post" autocomplete="on">
  <?= csrf_field() ?>
  <a class="login__lang" href="?alang=<?= alang() === 'en' ? 'sv' : 'en' ?>"><?= alang() === 'en' ? 'Svenska' : 'English' ?></a>
  <h1><?= $setup ? L('Skapa ägarkonto', 'Create owner account') : L('Välkommen tillbaka', 'Welcome back') ?></h1>
  <p class="muted"><?= $setup ? L('Första gången: välj användarnamn och ett starkt lösenord. Kontot får alla behörigheter.', 'First time: choose a username and a strong password. This account gets every permission.') : L('Logga in för att hantera butiken.', 'Sign in to manage the shop.') ?></p>
  <?php if (!empty($_GET['expired'])): ?><div class="flash flash--bad"><?= L('Du har loggats ut av säkerhetsskäl.', 'You were signed out for security.') ?></div><?php endif; ?>
  <?php if ($err): ?><div class="flash flash--bad"><?= e($err) ?></div><?php endif; ?>
  <?php if ($setup): ?><label><?= L('Ditt namn', 'Your name') ?><input name="name" required autocomplete="name"></label><?php endif; ?>
  <label><?= $setup ? L('Användarnamn', 'Username') : L('Användarnamn eller e-post', 'Username or email') ?><input name="user" required autocomplete="username" autocapitalize="none" value="<?= e((string)($_POST['user'] ?? '')) ?>"></label>
  <label><?= L('Lösenord', 'Password') ?><input name="pass" type="password" required autocomplete="<?= $setup ? 'new-password' : 'current-password' ?>"></label>
  <?php if ($setup): ?><label><?= L('Upprepa lösenord', 'Repeat password') ?><input name="pass2" type="password" required autocomplete="new-password"></label><?php endif; ?>
  <button class="b b--block"><?= $setup ? L('Skapa konto', 'Create account') : L('Logga in', 'Sign in') ?></button>
  <a class="muted" href="../" style="font-size:13px">← <?= L('Till webbplatsen', 'Back to website') ?></a>
</form>
</body></html>

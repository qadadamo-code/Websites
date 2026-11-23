<?php
require __DIR__ . '/inc.php';
if (is_admin()) go('index.php');
$err = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $a = admin_data();
    $fails = bc_tx('ratelimit', function (&$d) {
        $k = 'login-' . substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 12); $now = time();
        $d[$k] = array_values(array_filter($d[$k] ?? [], fn($t) => $t > $now - 900));
        return count($d[$k]);
    });
    if ($fails >= 8) $err = 'محاولات كثيرة. انتظر 15 دقيقة ثم حاول مرة أخرى.';
    elseif (!empty($a['hash']) && hash_equals(csrf(), (string)($_POST['_t'] ?? '')) && strtolower(p('user')) === strtolower($a['user'] ?? 'admin') && password_verify((string)($_POST['pass'] ?? ''), $a['hash'])) {
        session_regenerate_id(true);
        $_SESSION['bc_admin'] = true;
        go('index.php');
    } else {
        bc_tx('ratelimit', function (&$d) { $d['login-' . substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 12)][] = time(); });
        $err = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
}
?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>دخول · لوحة باركود</title>
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Didact+Gothic&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= BC_VERSION ?>">
</head><body class="login">
<form class="login__card" method="post">
  <img src="../assets/brand/roundel-cream.png" alt="" class="login__logo">
  <h1>لوحة تحكم باركود</h1>
  <p>سجّل دخولك لإدارة المنيو والطلبات والفعاليات.</p>
  <?php if ($err): ?><div class="flash flash--bad"><?= e($err) ?></div><?php endif; ?>
  <?= csrf_field() ?>
  <label class="f"><span>اسم المستخدم</span><input name="user" value="admin" autocomplete="username" class="latin" required></label>
  <label class="f"><span>كلمة المرور</span><input name="pass" type="password" autocomplete="current-password" class="latin" required autofocus></label>
  <button class="b b--primary b--block">دخول</button>
</form>
</body></html>

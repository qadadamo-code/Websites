<?php
require __DIR__ . '/inc.php';
$err = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && csrf_ok()) {
    if (!rate_ok('login', 6, 900)) $err = 'محاولات كتير.. استنى ربع ساعة وجرّب تاني.';
    else {
        $a = admin_cred();
        if (hash_equals((string)$a['user'], trim((string)($_POST['user'] ?? ''))) && password_verify((string)($_POST['pass'] ?? ''), (string)$a['hash'])) {
            session_regenerate_id(true); $_SESSION['lm_admin'] = $a['user']; back('index.php');
        }
        $err = 'اسم المستخدم أو كلمة السر غلط';
    }
}
if (is_admin()) back('index.php');
?><!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>دخول · لوحة تحكم لمّة</title><link rel="icon" href="../assets/img/icon.svg">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Marhey:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=1"></head>
<body class="auth"><form class="auth__card" method="post">
  <img src="../assets/img/logo-stacked.svg" alt="لمّة" width="140">
  <h1>لوحة تحكم لمّة</h1>
  <p class="muted">من هنا تغيّر الأسعار، توقّف أي صنف خلص، وتضيف عروض.</p>
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <label>اسم المستخدم<input name="user" required autocomplete="username"></label>
  <label>كلمة السر<input name="pass" type="password" required autocomplete="current-password"></label>
  <?php if ($err): ?><p class="err"><?= e($err) ?></p><?php endif; ?>
  <button class="btn">دخول</button>
</form></body></html>

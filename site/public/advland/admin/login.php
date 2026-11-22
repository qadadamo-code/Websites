<?php
require __DIR__ . '/inc.php';
$setup = !admin_exists();
$err = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && csrf_ok()) {
    $user = trim((string)($_POST['user'] ?? ''));
    $pass = (string)($_POST['pass'] ?? '');
    if ($setup) {
        if (mb_strlen($user) < 3) $err = 'اسم المستخدم 3 أحرف على الأقل';
        elseif (strlen($pass) < 8) $err = 'كلمة المرور 8 أحرف على الأقل';
        elseif ($pass !== ($_POST['pass2'] ?? '')) $err = 'كلمتا المرور غير متطابقتين';
        else {
            file_put_contents(admin_file(), json_encode(['user' => $user, 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'created' => date('c')]));
            session_regenerate_id(true); $_SESSION['al_admin'] = $user;
            flash('تم إنشاء حساب الإدارة. أهلاً بك!'); back('index.php');
        }
    } elseif (!rate_ok('login', 6, 900)) {
        $err = 'محاولات كثيرة. انتظر ربع ساعة ثم حاول مرة أخرى.';
    } else {
        $a = json_decode((string)file_get_contents(admin_file()), true);
        if (hash_equals((string)$a['user'], $user) && password_verify($pass, (string)$a['hash'])) {
            session_regenerate_id(true); $_SESSION['al_admin'] = $user; back('index.php');
        }
        $err = 'بيانات الدخول غير صحيحة';
    }
}
if (!$setup && is_admin()) back('index.php');
?><!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>دخول · لوحة أرض المغامرات</title><link rel="icon" href="../favicon.png">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= AL_VERSION ?>"></head>
<body class="auth"><form class="auth__card" method="post">
  <img src="../img/logo-512.webp" alt="Adventure Land">
  <h1><?= $setup ? 'إنشاء حساب الإدارة' : 'تسجيل الدخول' ?></h1>
  <?php if ($setup): ?><p class="muted">أول دخول: اختر اسم مستخدم وكلمة مرور قوية. هذا الحساب يدير الحجوزات ومحتوى الموقع.</p><?php endif; ?>
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <label>اسم المستخدم<input name="user" required autocomplete="username" value="<?= e($_POST['user'] ?? '') ?>"></label>
  <label>كلمة المرور<input name="pass" type="password" required autocomplete="<?= $setup ? 'new-password' : 'current-password' ?>"></label>
  <?php if ($setup): ?><label>تأكيد كلمة المرور<input name="pass2" type="password" required autocomplete="new-password"></label><?php endif; ?>
  <?php if ($err): ?><p class="err"><?= e($err) ?></p><?php endif; ?>
  <button class="btn"><?= $setup ? 'إنشاء الحساب' : 'دخول' ?></button>
</form></body></html>

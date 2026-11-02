<?php
require __DIR__ . '/inc.php';
$setup = !admin_exists();
$err = '';
// brute-force guard: 6 failed attempts per IP per 15 minutes
$rlFile = EB_STORAGE . '/rl_login_' . md5($_SERVER['REMOTE_ADDR'] ?? 'x') . '.json';
$fails = array_filter(json_decode((string)@file_get_contents($rlFile), true) ?: [], fn($t) => $t > time() - 900);

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && csrf_ok()) {
    $user = trim((string)($_POST['user'] ?? ''));
    $pass = (string)($_POST['pass'] ?? '');
    if ($setup) {
        if (mb_strlen($user) < 3) $err = 'اسم المستخدم 3 حروف على الأقل';
        elseif (strlen($pass) < 8) $err = 'كلمة المرور 8 حروف على الأقل';
        elseif ($pass !== ($_POST['pass2'] ?? '')) $err = 'كلمتا المرور غير متطابقتين';
        else {
            file_put_contents(admin_file(), json_encode(['user' => $user, 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'created' => date('c')]));
            session_regenerate_id(true);
            $_SESSION['eb_admin'] = $user; $_SESSION['eb_admin_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
            flash('تم إنشاء حساب الإدارة. أهلاً بيك!');
            back('index.php');
        }
    } elseif (count($fails) >= 6) {
        $err = 'محاولات كتير. استنى ربع ساعة وحاول تاني.';
    } else {
        $a = json_decode((string)file_get_contents(admin_file()), true);
        if (hash_equals($a['user'], $user) && password_verify($pass, $a['hash'])) {
            @unlink($rlFile);
            session_regenerate_id(true);
            $_SESSION['eb_admin'] = $user; $_SESSION['eb_admin_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
            back('index.php');
        }
        $fails[] = time(); @file_put_contents($rlFile, json_encode(array_values($fails)));
        $err = 'بيانات الدخول غير صحيحة';
    }
}
if (!$setup && is_admin()) back('index.php');
?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>دخول · لوحة إليجانس</title><link rel="stylesheet" href="admin.css?v=<?= EB_VERSION ?>"><link rel="icon" href="../assets/img/brand/favicon.svg"></head>
<body class="auth">
<form class="auth__card" method="post">
  <img src="../assets/img/brand/logo-gold.png" alt="Elegance Boutique">
  <h1><?= $setup ? 'إنشاء حساب الإدارة' : 'تسجيل الدخول' ?></h1>
  <?php if ($setup): ?><p class="muted">أول مرة؟ اختار اسم مستخدم وكلمة مرور قوية. الحساب ده هو اللي هيدير المتجر.</p><?php endif; ?>
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <label>اسم المستخدم<input name="user" required autocomplete="username" value="<?= e($_POST['user'] ?? '') ?>"></label>
  <label>كلمة المرور<input name="pass" type="password" required autocomplete="<?= $setup ? 'new-password' : 'current-password' ?>"></label>
  <?php if ($setup): ?><label>تأكيد كلمة المرور<input name="pass2" type="password" required autocomplete="new-password"></label><?php endif; ?>
  <?php if ($err): ?><p class="err"><?= e($err) ?></p><?php endif; ?>
  <button class="btn btn--gold"><?= $setup ? 'إنشاء الحساب' : 'دخول' ?></button>
</form>
</body></html>

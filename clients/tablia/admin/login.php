<?php
require __DIR__ . '/inc.php';
if (is_admin()) go('index.php');
$err = '';
if (!empty($_SESSION['expired'])) { $err = 'انتهت الجلسة للأمان، سجّل دخولك تاني.'; unset($_SESSION['expired']); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $ipKey = 'login-' . substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 12);
    $userKey = 'login-u-' . substr(hash('sha256', strtolower(p('user'))), 0, 12);
    [$ipFails, $userFails] = bc_tx('ratelimit', function (&$d) use ($ipKey, $userKey) {
        $now = time();
        foreach ([$ipKey, $userKey] as $k) $d[$k] = array_values(array_filter($d[$k] ?? [], fn($t) => $t > $now - 900));
        return [count($d[$ipKey]), count($d[$userKey])];
    });
    $found = null;
    foreach (users_all() as $u) if (strtolower($u['user']) === strtolower(p('user'))) $found = $u;
    // same work whether or not the username exists, so timing gives nothing away
    $passOk = password_verify((string)($_POST['pass'] ?? ''), $found['hash'] ?? '$2y$10$mPcr3Cy8kujQ7TznSyC1TOUo1BEGFpygA5lZPukQ1PHsG2YCfmb2K');
    if ($ipFails >= 8 || $userFails >= 6) $err = 'محاولات كثيرة. انتظر 15 دقيقة ثم حاول مرة أخرى.';
    elseif (!hash_equals(csrf(), (string)($_POST['_t'] ?? ''))) $err = 'انتهت صلاحية الصفحة، حاول تاني.';
    elseif ($found && $passOk && empty($found['active'])) $err = 'الحساب ده موقوف. كلّم المدير العام.';
    elseif ($found && $passOk) {
        session_regenerate_id(true);
        $_SESSION['uid'] = $found['id']; $_SESSION['born'] = time(); $_SESSION['fp'] = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
        unset($_SESSION['csrf']);
        $rehash = password_needs_rehash($found['hash'], PASSWORD_DEFAULT) ? password_hash((string)$_POST['pass'], PASSWORD_DEFAULT) : null;
        bc_tx('users', function (&$d) use ($found, $rehash) { foreach ($d as &$u) if ($u['id'] === $found['id']) { $u['last'] = now_iso(); if ($rehash) $u['hash'] = $rehash; } });
        log_act('تسجيل دخول');
        go('index.php');
    } else {
        bc_tx('ratelimit', function (&$d) use ($ipKey, $userKey) { $d[$ipKey][] = time(); $d[$userKey][] = time(); });
        $row = ['at' => now_iso(), 'uid' => '', 'name' => 'النظام', 'action' => 'محاولة دخول فاشلة', 'detail' => 'اسم المستخدم: ' . mb_substr(p('user'), 0, 40) . ' · IP ' . substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 8), 'req' => ''];
        bc_tx('log', function (&$d) use ($row) { array_unshift($d, $row); });
        usleep(random_int(300000, 700000));
        $err = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
}
?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>دخول · لوحة طبلية</title>
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= BC_VERSION ?>">
</head><body class="login">
<form class="login__card" method="post">
  <img src="../assets/brand/badge.webp" alt="طبلية" class="login__logo">
  <h1>لوحة تحكم طبلية</h1>
  <p>مطبخ ماما رحاب من جوه: المنيو والطلبات والعزايم.</p>
  <?php if ($err): ?><div class="flash flash--bad"><?= e($err) ?></div><?php endif; ?>
  <?= csrf_field() ?>
  <label class="f"><span>اسم المستخدم</span><input name="user" value="<?= e(p('user')) ?>" autocomplete="username" class="latin" required autofocus></label>
  <label class="f"><span>كلمة المرور</span><input name="pass" type="password" autocomplete="current-password" class="latin" required></label>
  <button class="b b--primary b--block">دخول</button>
</form>
</body></html>

<?php
/** POST email → newsletter list (visible and exportable in the dashboard). */
require dirname(__DIR__) . '/inc/bootstrap.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !csrf_ok()) json_out(['ok' => false], 400);
$email = filter_var(trim((string)($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$ar = LANG === 'ar';
if (!$email) json_out(['ok' => false, 'msg' => $ar ? 'اكتبي إيميل صحيح' : 'Enter a valid email']);
eb_transaction('subscribers', function (array &$list) use ($email) {
    foreach ($list as $s) if (strcasecmp($s['email'], $email) === 0) return;
    $list[] = ['email' => $email, 'at' => date('c'), 'lang' => LANG];
});
json_out(['ok' => true, 'msg' => $ar ? 'أهلاً بيكِ في دائرة الأناقة ✦' : 'Welcome to the inner circle ✦']);

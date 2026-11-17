<?php
require __DIR__ . '/inc.php';
require_admin();
$fields = [
    ['whatsapp', 'رقم واتساب (أرقام فقط مع رمز الدولة، مثال 971507900323)', 'ltr'],
    ['phone', 'رقم الجوال المعروض', 'ltr'],
    ['landline', 'الهاتف الأرضي', 'ltr'],
    ['email', 'البريد الإلكتروني', 'ltr'],
    ['instagram', 'حساب إنستغرام (بدون @)', 'ltr'],
    ['announcement.ar', 'شريط الإعلان أعلى الموقع (عربي)', ''],
    ['announcement.en', 'شريط الإعلان (English)', 'ltr'],
];
if (post_ok()) {
    if (($_POST['action'] ?? '') === 'password') {
        $a = json_decode((string)file_get_contents(admin_file()), true);
        $new = (string)($_POST['new'] ?? '');
        if (!password_verify((string)($_POST['old'] ?? ''), $a['hash'])) flash('كلمة المرور الحالية غير صحيحة', 'bad');
        elseif (strlen($new) < 8) flash('كلمة المرور الجديدة 8 أحرف على الأقل', 'bad');
        else { $a['hash'] = password_hash($new, PASSWORD_DEFAULT); file_put_contents(admin_file(), json_encode($a)); flash('تم تغيير كلمة المرور'); }
        back('settings.php');
    }
    al_tx('content', function (&$c) use ($fields) {
        foreach ($fields as [$p]) path_set($c['settings'], $p, clean_str($_POST['f_' . str_replace('.', '__', $p)] ?? '', 300));
        $c['settings']['whatsapp'] = preg_replace('/\D+/', '', $c['settings']['whatsapp']);
        $c['settings']['announcement']['on'] = !empty($_POST['ann_on']);
    });
    flash('تم حفظ الإعدادات'); back('settings.php');
}
$s = al_load('content')['settings'] ?? [];
admin_head('الإعدادات والتواصل', 'settings');
?>
<section class="card"><h2>بيانات التواصل والإعلان</h2>
<form method="post" class="form grid-f"><input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
<?php foreach ($fields as [$p, $l, $d]): ?><label class="<?= str_starts_with($p, 'announcement') ? 'wide' : '' ?>"><?= e($l) ?><input name="f_<?= str_replace('.', '__', $p) ?>" value="<?= e(path_get($s, $p)) ?>" <?= $d ? 'dir="ltr"' : '' ?>></label><?php endforeach; ?>
<label class="chk wide"><input type="checkbox" name="ann_on" value="1" <?= !empty($s['announcement']['on']) ? 'checked' : '' ?>> إظهار شريط الإعلان</label>
<div class="actions wide"><button class="btn">حفظ</button></div></form></section>
<section class="card"><h2>تغيير كلمة المرور</h2>
<form method="post" class="form grid-f"><input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
<label>كلمة المرور الحالية<input type="password" name="old" required autocomplete="current-password"></label>
<label>كلمة المرور الجديدة<input type="password" name="new" required autocomplete="new-password"></label>
<div class="actions wide"><button class="btn" name="action" value="password">تغيير</button></div></form></section>
<?php admin_foot();

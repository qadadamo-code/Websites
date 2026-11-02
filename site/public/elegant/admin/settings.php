<?php
require __DIR__ . '/inc.php';
require_admin();
$fields = [
  'المتجر' => [
    'store_name_ar' => 'اسم المتجر بالعربي', 'store_name_en' => 'اسم المتجر بالإنجليزي',
    'tagline_ar' => 'الشعار بالعربي', 'tagline_en' => 'الشعار بالإنجليزي',
    'announcement_ar' => 'الشريط العلوي بالعربي', 'announcement_en' => 'الشريط العلوي بالإنجليزي',
  ],
  'التواصل' => [
    'whatsapp' => 'رقم واتساب (يظهر للعميلات)', 'phone' => 'رقم التليفون', 'email' => 'إيميل التواصل',
    'order_email' => 'إيميل استلام إشعارات الطلبات', 'instagram' => 'اسم حساب إنستجرام (بدون @)', 'facebook' => 'رابط فيسبوك', 'tiktok' => 'رابط تيك توك',
  ],
  'الدفع' => [
    'instapay_handle' => 'عنوان إنستاباي (مثلاً name@instapay)', 'vodafone_number' => 'رقم فودافون كاش',
  ],
  'إشعار واتساب فوري بالطلبات (اختياري)' => [
    'callmebot_phone' => 'رقمك على واتساب (بالكود الدولي 2010…)', 'callmebot_key' => 'مفتاح CallMeBot',
  ],
];
$checks = ['pay_cod' => 'الدفع عند الاستلام', 'pay_instapay' => 'إنستاباي', 'pay_vodafone' => 'فودافون كاش'];

if (post_ok()) {
    if (!empty($_POST['pw'])) {
        $a = json_decode((string)file_get_contents(admin_file()), true);
        if (!password_verify((string)$_POST['old'], $a['hash'])) flash('كلمة المرور الحالية غلط', 'bad');
        elseif (strlen((string)$_POST['new']) < 8) flash('كلمة المرور الجديدة 8 حروف على الأقل', 'bad');
        else { $a['hash'] = password_hash((string)$_POST['new'], PASSWORD_DEFAULT); file_put_contents(admin_file(), json_encode($a)); flash('تم تغيير كلمة المرور'); }
        back('settings.php');
    }
    $s = eb_load('settings');
    foreach ($fields as $group) foreach ($group as $k => $_) $s[$k] = mb_substr(trim((string)($_POST[$k] ?? '')), 0, 300);
    foreach ($checks as $k => $_) $s[$k] = !empty($_POST[$k]);
    if (!$s['pay_cod'] && !$s['pay_instapay'] && !$s['pay_vodafone']) $s['pay_cod'] = true;
    $s['low_stock'] = max(0, (int)($_POST['low_stock'] ?? 2));
    $s['instagram'] = ltrim($s['instagram'], '@');
    eb_save('settings', $s);
    flash('تم حفظ الإعدادات');
    back('settings.php');
}
$s = eb_load('settings');
admin_head('الإعدادات', 'settings');
?>
<form method="post" class="card">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <?php foreach ($fields as $title => $group): ?>
    <h2><?= e($title) ?></h2>
    <?php if ($title === 'الدفع'): ?>
      <div class="checks"><?php foreach ($checks as $k => $label): ?><label class="check"><input type="checkbox" name="<?= $k ?>" value="1" <?= !empty($s[$k]) ? 'checked' : '' ?>> <?= $label ?></label><?php endforeach; ?></div>
    <?php endif; ?>
    <?php if (str_starts_with($title, 'إشعار')): ?><p class="muted">فعّل الخدمة المجانية: ابعت "I allow callmebot to send me messages" من رقمك لـ +34 644 66 32 62 على واتساب، هيوصلك مفتاح، حطه هنا. بعدها كل طلب جديد هيوصلك رسالة فورية.</p><?php endif; ?>
    <div class="row3">
      <?php foreach ($group as $k => $label): ?><label class="fld"><?= e($label) ?><input name="<?= $k ?>" value="<?= e($s[$k] ?? '') ?>" <?= preg_match('/_en$|email|whatsapp|phone|number|handle|key|facebook|tiktok|instagram/', $k) ? 'dir="ltr"' : '' ?>></label><?php endforeach; ?>
    </div>
  <?php endforeach; ?>
  <h2>المخزون</h2>
  <div class="row3"><label class="fld">تنبيه "متبقي قطع قليلة" عند<input type="number" name="low_stock" min="0" value="<?= (int)($s['low_stock'] ?? 2) ?>"></label></div>
  <button class="btn btn--gold">حفظ الإعدادات</button>
</form>
<form method="post" class="card">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="pw" value="1">
  <h2>تغيير كلمة المرور</h2>
  <div class="row3"><label class="fld">الحالية<input type="password" name="old" required autocomplete="current-password"></label><label class="fld">الجديدة<input type="password" name="new" required autocomplete="new-password" minlength="8"></label></div>
  <button class="btn btn--dark">تغيير</button>
</form>
<?php admin_foot();

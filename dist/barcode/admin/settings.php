<?php
require __DIR__ . '/inc.php';
require_admin();
$s = settings();

if (posted()) {
    $act = p('act');
    if ($act === 'password') {
        $a = admin_data();
        $new = (string)($_POST['new'] ?? '');
        if (!password_verify((string)($_POST['old'] ?? ''), $a['hash'] ?? '')) flash('كلمة المرور الحالية غير صحيحة', 'bad');
        elseif (strlen($new) < 8) flash('كلمة المرور الجديدة لازم تكون 8 حروف على الأقل', 'bad');
        elseif ($new !== (string)($_POST['new2'] ?? '')) flash('تأكيد كلمة المرور غير مطابق', 'bad');
        else {
            $user = preg_replace('/[^A-Za-z0-9_.-]/', '', p('user')) ?: ($a['user'] ?? 'admin');
            bc_save('admin', ['user' => $user, 'hash' => password_hash($new, PASSWORD_DEFAULT), 'changed' => now_iso()]);
            session_regenerate_id(true);
            flash('تم تغيير بيانات الدخول بنجاح');
        }
        go('settings.php#security');
    }
    if ($act === 'save') {
        $wa = preg_replace('/\D/', '', digits_en(p('whatsapp')));
        if (strpos($wa, '0') === 0) $wa = '2' . $wa; // Egyptian local → international
        $ribbon = array_values(array_filter(array_map(fn($l) => clean($l, 60), preg_split('/\r?\n/', p('ribbon')))));
        $row = array_merge($s, [
            'brand' => clean(p('brand'), 60) ?: 'باركود كافيه', 'whatsapp' => $wa, 'whatsappDisplay' => clean(digits_en(p('whatsappDisplay')), 30),
            'email' => filter_var(p('email'), FILTER_VALIDATE_EMAIL) ?: '', 'address' => clean(p('address'), 200),
            'mapUrl' => preg_match('~^https?://~', p('mapUrl')) ? clean(p('mapUrl'), 400) : '', 'hours' => clean(p('hours'), 120),
            'social' => array_map(fn($k) => preg_match('~^https?://~', p($k)) ? clean(p($k), 300) : '', ['instagram' => 'instagram', 'facebook' => 'facebook', 'tiktok' => 'tiktok']),
            'ribbon' => array_slice($ribbon, 0, 8),
            'ordersEnabled' => !empty($_POST['ordersEnabled']), 'deliveryEnabled' => !empty($_POST['deliveryEnabled']), 'reservationsEnabled' => !empty($_POST['reservationsEnabled']),
        ]);
        bc_save('settings', $row);
        flash('تم حفظ الإعدادات وظهرت في الموقع');
        go('settings.php');
    }
}
$a = admin_data();
admin_head('الإعدادات', 'settings');
?>
<form method="post" class="form-grid">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <section class="card">
    <div class="card__head"><h3>بيانات التواصل</h3></div>
    <div class="fg">
      <label class="f f--full"><span>اسم المكان</span><input name="brand" value="<?= e($s['brand'] ?? '') ?>" maxlength="60"></label>
      <label class="f"><span>رقم واتساب الطلبات *</span><input name="whatsapp" value="<?= e($s['whatsapp'] ?? '') ?>" class="latin" dir="ltr" inputmode="tel" placeholder="201xxxxxxxxx"><small>الطلبات والحجوزات بتوصل على الرقم ده.</small></label>
      <label class="f"><span>الرقم كما يظهر للعملاء</span><input name="whatsappDisplay" value="<?= e($s['whatsappDisplay'] ?? '') ?>" class="latin" dir="ltr" placeholder="0120 310 1104"></label>
      <label class="f"><span>الإيميل</span><input name="email" type="email" value="<?= e($s['email'] ?? '') ?>" class="latin" dir="ltr"></label>
      <label class="f"><span>مواعيد العمل</span><input name="hours" value="<?= e($s['hours'] ?? '') ?>" maxlength="120"></label>
      <label class="f f--full"><span>العنوان</span><input name="address" value="<?= e($s['address'] ?? '') ?>" maxlength="200" placeholder="الشارع، المنطقة، المدينة"></label>
      <label class="f f--full"><span>رابط الخريطة (Google Maps)</span><input name="mapUrl" value="<?= e($s['mapUrl'] ?? '') ?>" class="latin" dir="ltr" placeholder="https://maps.app.goo.gl/…"></label>
    </div>
  </section>

  <div class="stack">
    <section class="card">
      <div class="card__head"><h3>السوشيال ميديا</h3><span class="muted">اللي يتساب فاضي مش هيظهر</span></div>
      <div class="fg">
        <?php foreach (['instagram' => 'إنستجرام', 'facebook' => 'فيسبوك', 'tiktok' => 'تيك توك'] as $k => $l): ?>
        <label class="f f--full"><span><?= $l ?></span><input name="<?= $k ?>" value="<?= e($s['social'][$k] ?? '') ?>" class="latin" dir="ltr" placeholder="https://"></label>
        <?php endforeach; ?>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h3>خدمات الموقع</h3></div>
      <label class="switch"><input type="checkbox" name="ordersEnabled" <?= checked($s['ordersEnabled'] ?? true) ?>><i></i><span>استقبال الطلبات أونلاين (زر «أضف للفاتورة»)</span></label>
      <label class="switch"><input type="checkbox" name="deliveryEnabled" <?= checked($s['deliveryEnabled'] ?? true) ?>><i></i><span>خيار التوصيل للمنازل</span></label>
      <label class="switch"><input type="checkbox" name="reservationsEnabled" <?= checked($s['reservationsEnabled'] ?? true) ?>><i></i><span>حجز الطاولات من الموقع</span></label>
    </section>
  </div>

  <section class="card card--full">
    <div class="card__head"><h3>الشريط المتحرك أعلى الموقع</h3><span class="muted">كل سطر = رسالة</span></div>
    <label class="f"><textarea name="ribbon" rows="4" maxlength="600"><?= e(implode("\n", $s['ribbon'] ?? [])) ?></textarea></label>
  </section>

  <div class="form-actions"><button class="b b--primary">حفظ الإعدادات</button></div>
</form>

<form method="post" class="card" id="security" style="margin-top:18px;max-width:640px">
  <?= csrf_field() ?><input type="hidden" name="act" value="password">
  <div class="card__head"><h3>بيانات الدخول للوحة</h3><?php if (!empty($a['seeded'])): ?><span class="st st--new">غيّر كلمة المرور المؤقتة</span><?php endif; ?></div>
  <div class="fg">
    <label class="f f--full"><span>اسم المستخدم</span><input name="user" value="<?= e($a['user'] ?? 'admin') ?>" class="latin" dir="ltr" autocomplete="username"></label>
    <label class="f f--full"><span>كلمة المرور الحالية</span><input name="old" type="password" class="latin" autocomplete="current-password" required></label>
    <label class="f"><span>كلمة المرور الجديدة</span><input name="new" type="password" class="latin" autocomplete="new-password" minlength="8" required></label>
    <label class="f"><span>تأكيد كلمة المرور</span><input name="new2" type="password" class="latin" autocomplete="new-password" minlength="8" required></label>
  </div>
  <div class="form-actions"><button class="b b--primary">تغيير بيانات الدخول</button></div>
</form>
<?php admin_foot();

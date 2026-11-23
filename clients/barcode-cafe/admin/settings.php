<?php
require __DIR__ . '/inc.php';
require_perm('settings.site', 'settings.marketing');
$s = settings();
$canSite = can('settings.site'); $canMkt = can('settings.marketing');

if (posted() && p('act') === 'save') {
    $row = $s;
    if ($canSite) {
        $wa = preg_replace('/\D/', '', digits_en(p('whatsapp')));
        if (strpos($wa, '0') === 0) $wa = '2' . $wa; // Egyptian local → international
        $row = array_merge($row, [
            'brand' => clean(p('brand'), 60) ?: 'باركود كافيه', 'whatsapp' => $wa, 'whatsappDisplay' => clean(digits_en(p('whatsappDisplay')), 30),
            'email' => filter_var(p('email'), FILTER_VALIDATE_EMAIL) ?: '', 'address' => clean(p('address'), 200),
            'mapUrl' => preg_match('~^https?://~', p('mapUrl')) ? clean(p('mapUrl'), 400) : '', 'hours' => clean(p('hours'), 120),
            'ordersEnabled' => !empty($_POST['ordersEnabled']), 'deliveryEnabled' => !empty($_POST['deliveryEnabled']), 'reservationsEnabled' => !empty($_POST['reservationsEnabled']),
        ]);
    }
    if ($canMkt) {
        $ribbon = array_values(array_filter(array_map(fn($l) => clean($l, 60), preg_split('/\r?\n/', p('ribbon')))));
        $row['social'] = array_map(fn($k) => preg_match('~^https?://~', p($k)) ? clean(p($k), 300) : '', ['instagram' => 'instagram', 'facebook' => 'facebook', 'tiktok' => 'tiktok']);
        $row['ribbon'] = array_slice($ribbon, 0, 8);
        $row['offersSection'] = !empty($_POST['offersSection']);
    }
    bc_save('settings', $row);
    log_act('تعديل الإعدادات', implode('، ', array_filter([$canSite ? 'التواصل والخدمات' : '', $canMkt ? 'الشريط والسوشيال' : ''])));
    flash('تم حفظ الإعدادات وظهرت في الموقع');
    go('settings.php');
}
admin_head('الإعدادات', 'settings', '<a class="b" href="account.php">حسابي وكلمة المرور</a>');
?>
<form method="post" class="form-grid">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <?php if ($canSite): ?>
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
  <?php endif; ?>

  <div class="stack">
    <?php if ($canMkt): ?>
    <section class="card">
      <div class="card__head"><h3>السوشيال ميديا</h3><span class="muted">اللي يتساب فاضي مش هيظهر</span></div>
      <div class="fg">
        <?php foreach (['instagram' => 'إنستجرام', 'facebook' => 'فيسبوك', 'tiktok' => 'تيك توك'] as $k => $l): ?>
        <label class="f f--full"><span><?= $l ?></span><input name="<?= $k ?>" value="<?= e($s['social'][$k] ?? '') ?>" class="latin" dir="ltr" placeholder="https://"></label>
        <?php endforeach; ?>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h3>قسم العروض في الموقع</h3></div>
      <label class="switch"><input type="checkbox" name="offersSection" <?= checked($s['offersSection'] ?? true) ?>><i></i><span>إظهار قسم «عروض باركود» تلقائيًا لما يكون فيه خصم شغّال</span></label>
    </section>
    <?php endif; if ($canSite): ?>
    <section class="card">
      <div class="card__head"><h3>خدمات الموقع</h3></div>
      <label class="switch"><input type="checkbox" name="ordersEnabled" <?= checked($s['ordersEnabled'] ?? true) ?>><i></i><span>استقبال الطلبات أونلاين (زر «أضف للفاتورة»)</span></label>
      <label class="switch"><input type="checkbox" name="deliveryEnabled" <?= checked($s['deliveryEnabled'] ?? true) ?>><i></i><span>خيار التوصيل للمنازل</span></label>
      <label class="switch"><input type="checkbox" name="reservationsEnabled" <?= checked($s['reservationsEnabled'] ?? true) ?>><i></i><span>حجز الطاولات من الموقع</span></label>
    </section>
    <?php endif; ?>
  </div>

  <?php if ($canMkt): ?>
  <section class="card card--full">
    <div class="card__head"><h3>الشريط المتحرك أعلى الموقع</h3><span class="muted">كل سطر = رسالة</span></div>
    <label class="f"><textarea name="ribbon" rows="4" maxlength="600"><?= e(implode("\n", $s['ribbon'] ?? [])) ?></textarea></label>
  </section>
  <?php endif; ?>

  <div class="form-actions"><button class="b b--primary">حفظ الإعدادات</button></div>
</form>

<?php admin_foot();

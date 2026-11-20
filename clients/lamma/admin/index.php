<?php
require __DIR__ . '/inc.php';
require_admin();
$tab = in_array($_GET['tab'] ?? '', ['items', 'offers', 'orders', 'settings'], true) ? $_GET['tab'] : 'items';

/* ---------- actions ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!csrf_ok()) { flash('انتهت الجلسة، جرّب تاني'); back("index.php?tab=$tab"); }
    $act = (string)($_POST['act'] ?? '');
    $ret = "index.php?tab=$tab" . (isset($_POST['cat']) ? '&cat=' . urlencode((string)$_POST['cat']) : '');

    if ($act === 'toggle') {
        $id = (string)$_POST['id'];
        lm_tx('menu', function (&$m) use ($id) { foreach ($m['items'] as &$i) if ($i['id'] === $id) $i['available'] = !($i['available'] ?? true); });
        flash('اتحدّث ✓'); back($ret . '#i-' . rawurlencode($id));
    }
    if ($act === 'save_item' || $act === 'add_item') {
        $vars = [];
        foreach ((array)($_POST['vl'] ?? []) as $k => $lbl) {
            $lbl = clean_str($lbl, 60); $p = trim((string)($_POST['vp'][$k] ?? ''));
            if ($lbl !== '' && $p !== '') $vars[] = ['label' => $lbl, 'price' => to_num($p)];
        }
        $up = save_upload('photo');
        $data = ['name' => clean_str($_POST['name'] ?? '', 90), 'desc' => clean_str($_POST['desc'] ?? '', 200), 'note' => clean_str($_POST['note'] ?? '', 80),
            'badge' => clean_str($_POST['badge'] ?? '', 30), 'cat' => clean_str($_POST['icat'] ?? '', 30), 'variants' => $vars];
        $img = $up ?: clean_str($_POST['img'] ?? '', 120);
        if ($data['name'] === '') { flash('اكتب اسم الصنف'); back($ret); }
        if ($act === 'add_item') {
            lm_tx('menu', function (&$m) use ($data, $img) {
                $cat = $data['cat'] ?: ($m['cats'][0]['id'] ?? 'misc');
                $defImg = ''; foreach ($m['cats'] as $c) if ($c['id'] === $cat) $defImg = $c['img'];
                $m['items'][] = array_merge($data, ['id' => $cat . '-' . bin2hex(random_bytes(3)), 'cat' => $cat, 'img' => $img ?: $defImg, 'available' => true]);
            });
            flash('الصنف اتضاف للمنيو ✓');
        } else {
            $id = (string)$_POST['id'];
            lm_tx('menu', function (&$m) use ($id, $data, $img) {
                foreach ($m['items'] as &$i) if ($i['id'] === $id) { $i = array_merge($i, $data); if ($img) $i['img'] = $img; if (!$data['cat']) $i['cat'] = $i['cat']; }
            });
            flash('اتحفظ ✓');
        }
        back($ret);
    }
    if ($act === 'del_item') {
        $id = (string)$_POST['id'];
        lm_tx('menu', function (&$m) use ($id) { $m['items'] = array_values(array_filter($m['items'], fn($i) => $i['id'] !== $id)); });
        flash('الصنف اتشال'); back($ret);
    }
    if ($act === 'save_offer' || $act === 'add_offer') {
        $up = save_upload('photo');
        $o = ['title' => clean_str($_POST['title'] ?? '', 60), 'desc' => clean_str($_POST['desc'] ?? '', 240), 'price' => to_num($_POST['price'] ?? 0),
            'old' => ($_POST['old'] ?? '') === '' ? null : to_num($_POST['old']), 'active' => !empty($_POST['active'])];
        $img = $up ?: clean_str($_POST['img'] ?? 'mahshi', 120);
        if ($o['title'] === '' || $o['price'] <= 0) { flash('اكتب اسم العرض وسعره'); back($ret); }
        if ($act === 'add_offer') lm_tx('menu', function (&$m) use ($o, $img) { $m['offers'][] = array_merge($o, ['id' => 'of' . bin2hex(random_bytes(3)), 'img' => $img]); });
        else { $id = (string)$_POST['id']; lm_tx('menu', function (&$m) use ($id, $o, $img) { foreach ($m['offers'] as &$x) if ($x['id'] === $id) $x = array_merge($x, $o, ['img' => $img]); }); }
        flash('العرض اتحفظ ✓'); back($ret);
    }
    if ($act === 'del_offer') {
        $id = (string)$_POST['id'];
        lm_tx('menu', function (&$m) use ($id) { $m['offers'] = array_values(array_filter($m['offers'], fn($x) => $x['id'] !== $id)); });
        flash('العرض اتشال'); back($ret);
    }
    if ($act === 'order_status') {
        $id = (string)$_POST['id']; $st = clean_str($_POST['status'] ?? '', 20);
        lm_tx('orders', function (&$o) use ($id, $st) { foreach ($o as &$x) if ($x['id'] === $id) $x['status'] = $st; });
        flash('اتحدّث ✓'); back($ret);
    }
    if ($act === 'settings') {
        $keys = ['whatsapp' => 20, 'phone' => 30, 'area' => 120, 'hours' => 120, 'announce' => 200, 'deliveryNote' => 200, 'facebook' => 200, 'instagram' => 200];
        lm_tx('menu', function (&$m) use ($keys) { foreach ($keys as $k => $max) $m['settings'][$k] = clean_str($_POST[$k] ?? '', $max); $m['settings']['whatsapp'] = preg_replace('/\D/', '', $m['settings']['whatsapp']); });
        flash('الإعدادات اتحفظت ✓'); back($ret);
    }
    if ($act === 'password') {
        $a = admin_cred(); $new = (string)($_POST['new'] ?? '');
        if (!password_verify((string)($_POST['old'] ?? ''), (string)$a['hash'])) flash('كلمة السر الحالية غلط');
        elseif (strlen($new) < 8) flash('كلمة السر الجديدة 8 حروف على الأقل');
        elseif ($new !== ($_POST['new2'] ?? '')) flash('كلمتين السر مش زي بعض');
        else { lm_save('admin', ['user' => clean_str($_POST['user'] ?? $a['user'], 40) ?: $a['user'], 'hash' => password_hash($new, PASSWORD_DEFAULT)]); flash('كلمة السر اتغيّرت ✓'); }
        back($ret);
    }
    back($ret);
}

$m = lm_load('menu');
$cats = $m['cats'] ?? []; $items = $m['items'] ?? []; $offers = $m['offers'] ?? []; $s = $m['settings'] ?? [];
$orders = $tab === 'orders' ? lm_load('orders') : [];
$fcat = (string)($_GET['cat'] ?? ($cats[0]['id'] ?? ''));
$q = trim((string)($_GET['q'] ?? ''));
$flash = take_flash();
$uploads = array_map(fn($f) => 'uploads/' . basename($f), glob(LM_UPLOADS . '/*.{webp,jpg,png}', GLOB_BRACE) ?: []);
function img_options(string $sel, array $uploads): string {
    $h = '';
    foreach (LM_IMAGES as $k => $n) $h .= '<option value="' . e($k) . '"' . ($sel === $k ? ' selected' : '') . '>' . e($n) . '</option>';
    foreach ($uploads as $u) $h .= '<option value="' . e($u) . '"' . ($sel === $u ? ' selected' : '') . '>صورة مرفوعة · ' . e(substr(basename($u), 5, 12)) . '</option>';
    return $h;
}
$off = count(array_filter($items, fn($i) => ($i['available'] ?? true) === false));
?><!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>لوحة تحكم لمّة</title><link rel="icon" href="../assets/img/icon.svg">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Marhey:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=1"></head>
<body>
<header class="top">
  <a class="top__logo" href="index.php"><img src="../assets/img/logo-h-cream.svg" alt="لمّة" height="40"></a>
  <nav class="tabs">
    <a href="?tab=items" class="<?= $tab === 'items' ? 'on' : '' ?>">المنيو والأسعار</a>
    <a href="?tab=offers" class="<?= $tab === 'offers' ? 'on' : '' ?>">العروض</a>
    <a href="?tab=orders" class="<?= $tab === 'orders' ? 'on' : '' ?>">الطلبات</a>
    <a href="?tab=settings" class="<?= $tab === 'settings' ? 'on' : '' ?>">الإعدادات</a>
  </nav>
  <div class="top__acts"><a href="../" target="_blank" class="ghost">شوف الموقع ↗</a><a href="logout.php" class="ghost">خروج</a></div>
</header>
<?php if ($flash): ?><div class="flash"><?= e($flash) ?></div><?php endif; ?>
<main class="wrap">

<?php if ($tab === 'items'): ?>
  <div class="stats">
    <div><b><?= count($items) ?></b><span>صنف في المنيو</span></div>
    <div><b><?= count($items) - $off ?></b><span>متاح النهارده</span></div>
    <div class="<?= $off ? 'warn' : '' ?>"><b><?= $off ?></b><span>متوقف (خلص)</span></div>
    <div><b><?= count(array_filter($offers, fn($o) => $o['active'] ?? true)) ?></b><span>عرض شغال</span></div>
  </div>
  <div class="bar">
    <div class="catbar"><?php foreach ($cats as $c): $n = count(array_filter($items, fn($i) => $i['cat'] === $c['id'])); ?>
      <a href="?tab=items&cat=<?= e($c['id']) ?>" class="<?= $fcat === $c['id'] && !$q ? 'on' : '' ?>"><?= e($c['name']) ?> <i><?= $n ?></i></a><?php endforeach; ?></div>
    <form class="qsearch"><input type="hidden" name="tab" value="items"><input name="q" value="<?= e($q) ?>" placeholder="دوّر على صنف"><button>بحث</button></form>
  </div>
  <p class="hint">غيّر السعر أو الاسم ودوس «حفظ». زرار «خلص النهارده» بيخفي إمكانية طلب الصنف من الموقع لحد ما ترجّعه.</p>
  <div class="items">
  <?php foreach ($items as $i): if ($q ? mb_stripos($i['name'], $q) === false : $i['cat'] !== $fcat) continue; $av = $i['available'] ?? true; $vs = $i['variants']; while (count($vs) < 4) $vs[] = ['label' => '', 'price' => '']; ?>
    <form class="item<?= $av ? '' : ' is-off' ?>" id="i-<?= e($i['id']) ?>" method="post" enctype="multipart/form-data">
      <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="id" value="<?= e($i['id']) ?>"><input type="hidden" name="cat" value="<?= e($fcat) ?>">
      <div class="item__img"><img src="<?= e(img_src($i['img'])) ?>" alt=""><label class="up">تغيير الصورة<input type="file" name="photo" accept="image/*"></label></div>
      <div class="item__main">
        <div class="row2"><label>اسم الصنف<input name="name" value="<?= e($i['name']) ?>" required></label>
          <label>القسم<select name="icat"><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>"<?= $c['id'] === $i['cat'] ? ' selected' : '' ?>><?= e($c['name']) ?></option><?php endforeach; ?></select></label></div>
        <label>وصف قصير<input name="desc" value="<?= e($i['desc'] ?? '') ?>" placeholder="اختياري"></label>
        <div class="vars"><span class="lbl">الأحجام والأسعار (بالجنيه)</span>
          <?php foreach ($vs as $k => $v): ?><div class="var"><input name="vl[]" value="<?= e($v['label']) ?>" placeholder="الحجم مثلًا: كيلو"><input name="vp[]" value="<?= e((string)$v['price']) ?>" inputmode="decimal" placeholder="السعر" class="pr"></div><?php endforeach; ?>
        </div>
        <div class="row3"><label>لو مفيش سعر<input name="note" value="<?= e($i['note'] ?? '') ?>" placeholder="مثلًا: السعر حسب الوزن"></label>
          <label>شارة<input name="badge" value="<?= e($i['badge'] ?? '') ?>" placeholder="مثلًا: جديد / عرض"></label>
          <label>الصورة<select name="img"><?= img_options($i['img'], $uploads) ?></select></label></div>
      </div>
      <div class="item__acts">
        <button class="btn" name="act" value="save_item">حفظ</button>
        <button class="btn <?= $av ? 'warn' : 'ok' ?>" name="act" value="toggle" formnovalidate><?= $av ? 'خلص النهارده' : 'رجّعه متاح' ?></button>
        <button class="btn del" name="act" value="del_item" formnovalidate onclick="return confirm('متأكد إنك عايز تشيل الصنف ده من المنيو؟')">حذف</button>
      </div>
    </form>
  <?php endforeach; ?>
  </div>
  <details class="add" open>
    <summary>+ ضيف صنف جديد</summary>
    <form method="post" enctype="multipart/form-data" class="item">
      <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="cat" value="<?= e($fcat) ?>">
      <div class="item__img"><img src="../assets/img/mark.svg" alt="" style="padding:20px;background:#3B0B1F"><label class="up">ارفع صورة<input type="file" name="photo" accept="image/*"></label></div>
      <div class="item__main">
        <div class="row2"><label>اسم الصنف<input name="name" required></label>
          <label>القسم<select name="icat"><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>"<?= $c['id'] === $fcat ? ' selected' : '' ?>><?= e($c['name']) ?></option><?php endforeach; ?></select></label></div>
        <label>وصف قصير<input name="desc" placeholder="اختياري"></label>
        <div class="vars"><span class="lbl">الأحجام والأسعار</span><?php for ($k = 0; $k < 3; $k++): ?><div class="var"><input name="vl[]" placeholder="الحجم"><input name="vp[]" inputmode="decimal" placeholder="السعر" class="pr"></div><?php endfor; ?></div>
        <div class="row3"><label>لو مفيش سعر<input name="note" placeholder="السعر حسب الوزن"></label><label>شارة<input name="badge" placeholder="جديد"></label><label>صورة جاهزة<select name="img"><option value="">صورة القسم</option><?= img_options('', $uploads) ?></select></label></div>
      </div>
      <div class="item__acts"><button class="btn" name="act" value="add_item">ضيف للمنيو</button></div>
    </form>
  </details>

<?php elseif ($tab === 'offers'): ?>
  <p class="hint">العروض بتظهر في قسم «عروض لمّة» على الموقع. شيل علامة «شغال» عشان توقف العرض من غير ما تمسحه.</p>
  <div class="items">
  <?php foreach (array_merge($offers, [null]) as $o): $new = $o === null; ?>
    <?php if ($new): ?><h3 class="sub">+ عرض جديد</h3><?php endif; ?>
    <form class="item<?= !$new && !($o['active'] ?? true) ? ' is-off' : '' ?>" method="post" enctype="multipart/form-data">
      <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><?php if (!$new): ?><input type="hidden" name="id" value="<?= e($o['id']) ?>"><?php endif; ?>
      <div class="item__img"><img src="<?= e(img_src($new ? 'mahshi' : $o['img'])) ?>" alt=""><label class="up">صورة<input type="file" name="photo" accept="image/*"></label></div>
      <div class="item__main">
        <label>اسم العرض<input name="title" value="<?= e($o['title'] ?? '') ?>" required placeholder="مثلًا: لمّة الجمعة"></label>
        <label>محتوى العرض<textarea name="desc" rows="2" placeholder="الأصناف اللي في العرض"><?= e($o['desc'] ?? '') ?></textarea></label>
        <div class="row3"><label>سعر العرض<input name="price" value="<?= e((string)($o['price'] ?? '')) ?>" inputmode="decimal" required></label>
          <label>السعر قبل العرض<input name="old" value="<?= e((string)($o['old'] ?? '')) ?>" inputmode="decimal" placeholder="اختياري"></label>
          <label>الصورة<select name="img"><?= img_options($o['img'] ?? 'mahshi', $uploads) ?></select></label></div>
        <label class="chk"><input type="checkbox" name="active" value="1"<?= $new || ($o['active'] ?? true) ? ' checked' : '' ?>> العرض شغال وظاهر على الموقع</label>
      </div>
      <div class="item__acts"><button class="btn" name="act" value="<?= $new ? 'add_offer' : 'save_offer' ?>"><?= $new ? 'ضيف العرض' : 'حفظ' ?></button>
        <?php if (!$new): ?><button class="btn del" name="act" value="del_offer" formnovalidate onclick="return confirm('تمسح العرض؟')">حذف</button><?php endif; ?></div>
    </form>
  <?php endforeach; ?>
  </div>

<?php elseif ($tab === 'orders'): ?>
  <p class="hint">كل أوردر اتبعت من الموقع على الواتساب بيتسجّل هنا كمان، عشان ماتفوّتش ولا طلب. (آخر 500 طلب)</p>
  <?php if (!$orders): ?><div class="empty">لسه مفيش طلبات.. أول ما حد يطلب من الموقع هيظهر هنا.</div><?php endif; ?>
  <div class="orders">
  <?php foreach ($orders as $o): $wa = preg_replace('/\D/', '', $o['phone']); if (str_starts_with($wa, '0')) $wa = '2' . $wa; ?>
    <article class="order st-<?= e(md5($o['status'])) ?>">
      <header><b><?= e($o['name']) ?></b><span><?= e(date('Y-m-d h:i A', strtotime($o['at']))) ?></span></header>
      <p class="meta">📞 <a href="tel:<?= e($o['phone']) ?>"><?= e($o['phone']) ?></a> · <a href="https://wa.me/<?= e($wa) ?>" target="_blank">واتساب</a><br>📍 <?= e($o['addr']) ?><br>🕑 <?= e($o['when']) ?> · 💳 <?= e($o['pay']) ?></p>
      <ul><?php foreach ($o['lines'] as $l): ?><li><?= (int)$l['qty'] ?> × <?= e($l['name']) ?> <small>(<?= e($l['label']) ?>)</small><?= $l['note'] ? ' <small>[' . e($l['note']) . ']</small>' : '' ?> <b><?= $l['price'] === null ? 'يتأكد' : number_format($l['price'] * $l['qty']) . ' ج' ?></b></li><?php endforeach; ?></ul>
      <?php if ($o['notes']): ?><p class="meta">📝 <?= e($o['notes']) ?></p><?php endif; ?>
      <footer><b>الإجمالي: <?= number_format((float)$o['total']) ?> ج</b>
        <form method="post"><input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="act" value="order_status"><input type="hidden" name="id" value="<?= e($o['id']) ?>">
          <select name="status" onchange="this.form.submit()"><?php foreach (['جديد', 'اتأكد', 'في الطريق', 'اتسلّم', 'اتلغى'] as $st): ?><option<?= $o['status'] === $st ? ' selected' : '' ?>><?= $st ?></option><?php endforeach; ?></select></form></footer>
    </article>
  <?php endforeach; ?>
  </div>

<?php else: ?>
  <div class="cols">
    <form method="post" class="panel">
      <h3>بيانات المطبخ</h3>
      <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="act" value="settings">
      <label>رقم الواتساب اللي بتوصله الطلبات (بكود الدولة)<input name="whatsapp" value="<?= e($s['whatsapp'] ?? '') ?>" inputmode="tel" placeholder="2010xxxxxxxx" required></label>
      <label>رقم التليفون اللي بيظهر في الموقع<input name="phone" value="<?= e($s['phone'] ?? '') ?>"></label>
      <label>المنطقة<input name="area" value="<?= e($s['area'] ?? '') ?>"></label>
      <label>مواعيد الشغل<input name="hours" value="<?= e($s['hours'] ?? '') ?>"></label>
      <label>الشريط الأحمر اللي فوق الموقع<input name="announce" value="<?= e($s['announce'] ?? '') ?>" placeholder="سيبه فاضي عشان يختفي"></label>
      <label>ملاحظة التوصيل في السلة<input name="deliveryNote" value="<?= e($s['deliveryNote'] ?? '') ?>"></label>
      <label>لينك فيسبوك<input name="facebook" value="<?= e($s['facebook'] ?? '') ?>" dir="ltr"></label>
      <label>لينك إنستجرام<input name="instagram" value="<?= e($s['instagram'] ?? '') ?>" dir="ltr"></label>
      <button class="btn">حفظ الإعدادات</button>
    </form>
    <form method="post" class="panel">
      <h3>الدخول وكلمة السر</h3>
      <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="act" value="password">
      <label>اسم المستخدم<input name="user" value="<?= e(admin_cred()['user']) ?>" autocomplete="username"></label>
      <label>كلمة السر الحالية<input type="password" name="old" required autocomplete="current-password"></label>
      <label>كلمة السر الجديدة<input type="password" name="new" required autocomplete="new-password"></label>
      <label>اكتبها تاني<input type="password" name="new2" required autocomplete="new-password"></label>
      <button class="btn">غيّر كلمة السر</button>
      <div class="qrbox"><img src="../assets/img/qr.svg" alt="QR" width="140"><p>ده كود QR الموقع. اطبعه على العلب والمنيو الورق، أو نزّله من <a href="../assets/img/qr.svg" download>هنا</a>.</p></div>
    </form>
  </div>
<?php endif; ?>
</main>
</body></html>

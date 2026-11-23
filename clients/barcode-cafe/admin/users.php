<?php
require __DIR__ . '/inc.php';
require_perm('users.manage');
$me = me();
$users = users_all();
$id = (string)($_GET['id'] ?? '');
$cur = null; foreach ($users as $u) if ($u['id'] === $id) $cur = $u;
$owners = fn(array $list) => count(array_filter($list, fn($u) => $u['role'] === 'owner' && !empty($u['active'])));

if (posted()) {
    $act = p('act'); $tid = p('id');
    $target = null; foreach ($users as $u) if ($u['id'] === $tid) $target = $u;
    if ($act === 'save') {
        $login = strtolower(preg_replace('/[^A-Za-z0-9_.-]/', '', p('user')));
        $role = isset(ROLES[p('role')]) ? p('role') : 'cashier';
        $perms = $role === 'custom' ? array_values(array_intersect((array)($_POST['perms'] ?? []), array_keys(PERMS))) : [];
        $pass = (string)($_POST['pass'] ?? '');
        $errs = [];
        if (strlen($login) < 3) $errs[] = 'اسم المستخدم لازم 3 حروف إنجليزي على الأقل';
        foreach ($users as $u) if ($u['user'] === $login && $u['id'] !== $tid) $errs[] = 'اسم المستخدم مستخدم قبل كده';
        if (!$target && strlen($pass) < 8) $errs[] = 'كلمة المرور لازم 8 حروف على الأقل';
        if ($target && $pass !== '' && strlen($pass) < 8) $errs[] = 'كلمة المرور الجديدة لازم 8 حروف على الأقل';
        $active = !empty($_POST['active']);
        if ($target && $target['role'] === 'owner' && ($role !== 'owner' || !$active) && $owners($users) <= 1) $errs[] = 'لازم يفضل مدير عام واحد على الأقل';
        if ($target && $target['id'] === $me['id'] && !$active) $errs[] = 'مينفعش توقف حسابك انت';
        if ($errs) { flash(implode(' · ', array_unique($errs)), 'bad'); go('users.php?id=' . rawurlencode($tid ?: 'new')); }
        $row = array_merge($target ?: ['id' => bc_id('u'), 'created' => now_iso(), 'last' => '', 'hash' => ''], [
            'user' => $login, 'name' => clean(p('name'), 60), 'role' => $role, 'perms' => $perms, 'active' => $active, 'phone' => clean(digits_en(p('phone')), 30),
        ]);
        if ($pass !== '') { $row['hash'] = password_hash($pass, PASSWORD_DEFAULT); $row['seeded'] = true; }
        bc_tx('users', function (&$d) use ($row) { foreach ($d as $i => $u) if ($u['id'] === $row['id']) { $d[$i] = $row; return; } $d[] = $row; });
        log_act($target ? 'تعديل مستخدم' : 'إضافة مستخدم', $row['user'] . ' · ' . ROLES[$role][0]);
        flash($target ? 'تم حفظ المستخدم' : 'تمت إضافة المستخدم. ابعتله اسم المستخدم وكلمة المرور، وهيغيّرها من «حسابي».');
        go('users.php');
    }
    if ($act === 'delete' && $target) {
        if ($target['id'] === $me['id']) { flash('مينفعش تحذف حسابك انت', 'bad'); go('users.php'); }
        if ($target['role'] === 'owner' && $owners($users) <= 1) { flash('لازم يفضل مدير عام واحد على الأقل', 'bad'); go('users.php'); }
        bc_tx('users', function (&$d) use ($tid) { $d = array_values(array_filter($d, fn($u) => $u['id'] !== $tid)); });
        log_act('حذف مستخدم', $target['user']);
        flash('تم حذف المستخدم'); go('users.php');
    }
    go('users.php');
}

admin_head('المستخدمين والصلاحيات', 'users', '<a class="b b--primary" href="?id=new">' . icon('plus') . ' مستخدم جديد</a>');
if ($id !== ''):
    $u = $cur ?: ['id' => '', 'user' => '', 'name' => '', 'role' => 'cashier', 'perms' => [], 'active' => true, 'phone' => ''];
?>
<form method="post" class="card" style="margin-bottom:18px;max-width:980px">
  <?= csrf_field() ?><input type="hidden" name="act" value="save"><input type="hidden" name="id" value="<?= e($u['id']) ?>">
  <div class="card__head"><h3><?= $cur ? 'تعديل: ' . e($u['name'] ?: $u['user']) : 'مستخدم جديد' ?></h3><a href="users.php">إغلاق ✕</a></div>
  <div class="fg">
    <label class="f"><span>الاسم</span><input name="name" value="<?= e($u['name']) ?>" maxlength="60" required placeholder="مثلًا: أحمد - كاشير"></label>
    <label class="f"><span>اسم المستخدم (إنجليزي)</span><input name="user" value="<?= e($u['user']) ?>" class="latin" dir="ltr" required pattern="[A-Za-z0-9_.\-]{3,}" autocomplete="off"></label>
    <label class="f"><span><?= $cur ? 'كلمة مرور جديدة (اتركها فاضية لو مش هتغيّرها)' : 'كلمة المرور' ?></span><input name="pass" type="text" class="latin" dir="ltr" minlength="8" <?= $cur ? '' : 'required' ?> autocomplete="new-password" data-gen-pass></label>
    <label class="f"><span>الموبايل (اختياري)</span><input name="phone" value="<?= e($u['phone'] ?? '') ?>" class="latin" dir="ltr" inputmode="tel"></label>
  </div>
  <h4 class="sub">الدور</h4>
  <div class="roles">
    <?php foreach (ROLES as $k => [$l, $d]): ?>
      <label class="role"><input type="radio" name="role" value="<?= $k ?>" <?= $u['role'] === $k ? 'checked' : '' ?> data-role><span><b><?= $l ?></b><small><?= $d ?></small></span></label>
    <?php endforeach; ?>
  </div>
  <div class="perms" id="permsBox">
    <h4 class="sub">الصلاحيات <small class="muted">(بتتحدد تلقائيًا حسب الدور، أو اختارها بنفسك مع «صلاحيات مخصصة»)</small></h4>
    <div class="perm-grid">
      <?php foreach (PERMS as $k => $l): $on = $u['role'] === 'custom' ? in_array($k, (array)$u['perms'], true) : in_array($k, user_perms($u), true); ?>
        <label class="chk"><input type="checkbox" name="perms[]" value="<?= $k ?>" <?= $on ? 'checked' : '' ?> data-perm="<?= $k ?>"><span><?= $l ?></span></label>
      <?php endforeach; ?>
    </div>
  </div>
  <label class="switch" style="margin-top:14px"><input type="checkbox" name="active" <?= checked($u['active']) ?>><i></i><span>الحساب مفعّل (اقفله لو الموظف ساب الشغل)</span></label>
  <div class="form-actions">
    <?php if ($cur && $cur['id'] !== $me['id']): ?><button class="b b--danger" name="act" value="delete" formnovalidate data-confirm="حذف المستخدم نهائيًا؟">حذف</button><?php endif; ?>
    <button class="b b--primary">حفظ المستخدم</button>
  </div>
</form>
<script>window.ROLE_PERMS = <?= json_encode(array_merge(ROLE_PERMS, ['owner' => array_keys(PERMS)])) ?>;</script>
<?php endif; ?>

<div class="table-wrap">
<table class="tbl">
  <thead><tr><th>المستخدم</th><th>الدور</th><th>الصلاحيات</th><th>آخر دخول</th><th>الحالة</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($users as $u): ?>
    <tr class="<?= empty($u['active']) ? 'is-hidden' : '' ?>">
      <td><b><?= e($u['name'] ?: $u['user']) ?></b><small class="latin" dir="ltr" style="text-align:end"><?= e($u['user']) ?></small></td>
      <td><span class="st st--confirmed"><?= e(role_label($u)) ?></span></td>
      <td><small style="color:var(--taupe)"><?= count(user_perms($u)) ?> من <?= count(PERMS) ?></small></td>
      <td><small><?= !empty($u['last']) ? ago($u['last']) : 'لم يدخل بعد' ?></small></td>
      <td><?= !empty($u['active']) ? '<span class="st st--done">مفعّل</span>' : '<span class="st st--cancelled">موقوف</span>' ?></td>
      <td class="end"><a class="icon-b" href="?id=<?= e($u['id']) ?>" title="تعديل"><?= icon('edit') ?></a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div>

<section class="card" style="margin-top:18px">
  <div class="card__head"><h3>إيه اللي يقدر يعمله كل دور؟</h3></div>
  <div class="table-wrap" style="border:0">
  <table class="tbl matrix">
    <thead><tr><th>الصلاحية</th><?php foreach (ROLES as $k => [$l]) if ($k !== 'custom'): ?><th class="c"><?= $l ?></th><?php endif; ?></tr></thead>
    <tbody><?php foreach (PERMS as $pk => $pl): ?><tr><td><?= $pl ?></td><?php foreach (ROLES as $k => $_) if ($k !== 'custom'): $has = $k === 'owner' || in_array($pk, ROLE_PERMS[$k] ?? [], true); ?><td class="c"><?= $has ? '<span class="yes">✓</span>' : '<span class="no">—</span>' ?></td><?php endif; ?></tr><?php endforeach; ?></tbody>
  </table>
  </div>
</section>
<?php admin_foot();

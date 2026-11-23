<?php
require __DIR__ . '/inc.php';
require_admin();
$me = me();

if (posted()) {
    $act = p('act');
    if ($act === 'profile') {
        $name = clean(p('name'), 60);
        bc_tx('users', function (&$d) use ($me, $name) { foreach ($d as &$u) if ($u['id'] === $me['id']) $u['name'] = $name; });
        log_act('تعديل الملف الشخصي');
        flash('تم حفظ بياناتك');
    }
    if ($act === 'password') {
        $new = (string)($_POST['new'] ?? '');
        if (!password_verify((string)($_POST['old'] ?? ''), $me['hash'])) flash('كلمة المرور الحالية غير صحيحة', 'bad');
        elseif (strlen($new) < 8) flash('كلمة المرور الجديدة لازم تكون 8 حروف على الأقل', 'bad');
        elseif ($new !== (string)($_POST['new2'] ?? '')) flash('تأكيد كلمة المرور غير مطابق', 'bad');
        else {
            bc_tx('users', function (&$d) use ($me, $new) { foreach ($d as &$u) if ($u['id'] === $me['id']) { $u['hash'] = password_hash($new, PASSWORD_DEFAULT); $u['seeded'] = false; $u['changed'] = now_iso(); } });
            session_regenerate_id(true);
            log_act('تغيير كلمة المرور');
            flash('تم تغيير كلمة المرور بنجاح');
        }
    }
    go('account.php');
}
admin_head('حسابي', 'account');
?>
<div class="cols" style="align-items:start">
  <form method="post" class="card">
    <?= csrf_field() ?><input type="hidden" name="act" value="profile">
    <div class="card__head"><h3>بياناتي</h3><span class="st st--confirmed"><?= e(role_label($me)) ?></span></div>
    <div class="fg">
      <label class="f f--full"><span>الاسم الظاهر</span><input name="name" value="<?= e($me['name'] ?? '') ?>" maxlength="60"></label>
      <label class="f f--full"><span>اسم المستخدم</span><input value="<?= e($me['user']) ?>" class="latin" dir="ltr" disabled><small>اسم المستخدم يغيّره المدير العام من صفحة المستخدمين.</small></label>
    </div>
    <div class="perm-chips"><?php foreach (user_perms($me) as $pk): ?><span><?= e(PERMS[$pk]) ?></span><?php endforeach; ?></div>
    <div class="form-actions"><button class="b b--primary">حفظ</button></div>
  </form>

  <form method="post" class="card" id="security">
    <?= csrf_field() ?><input type="hidden" name="act" value="password">
    <div class="card__head"><h3>كلمة المرور</h3><?php if (!empty($me['seeded'])): ?><span class="st st--new">غيّر كلمة المرور المؤقتة</span><?php endif; ?></div>
    <div class="fg">
      <label class="f f--full"><span>كلمة المرور الحالية</span><input name="old" type="password" class="latin" autocomplete="current-password" required></label>
      <label class="f"><span>الجديدة</span><input name="new" type="password" class="latin" autocomplete="new-password" minlength="8" required></label>
      <label class="f"><span>تأكيدها</span><input name="new2" type="password" class="latin" autocomplete="new-password" minlength="8" required></label>
    </div>
    <div class="form-actions"><button class="b b--primary">تغيير كلمة المرور</button></div>
  </form>
</div>
<?php admin_foot();

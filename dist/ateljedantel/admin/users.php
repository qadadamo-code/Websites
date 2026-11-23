<?php
require __DIR__ . '/inc.php';
require_perm('users.manage');
$me = me();
if (posted()) {
    $act = p('act'); $uid = p('id'); $users = users_all();
    $owners = count(array_filter($users, fn($u) => $u['role'] === 'owner' && !empty($u['active'])));
    $target = null; foreach ($users as $u) if ($u['id'] === $uid) $target = $u;
    if ($act === 'delete' && $target) {
        if ($uid === $me['id']) flash(L('Du kan inte radera dig själv', 'You cannot delete yourself'), 'bad');
        elseif ($target['role'] === 'owner' && $owners < 2) flash(L('Det måste finnas minst en ägare', 'There must be at least one owner'), 'bad');
        else { ad_tx('users', function (&$d) use ($uid) { $d = array_values(array_filter($d, fn($u) => $u['id'] !== $uid)); }); log_act(L('Raderade användare', 'Deleted user'), $target['user']); flash(L('Användaren är raderad', 'The user was deleted')); }
        go('users.php');
    }
    $role = array_key_exists(p('role'), ROLES()) ? p('role') : 'sales';
    $perms = array_values(array_intersect((array)($_POST['perms'] ?? []), array_keys(PERMS())));
    $active = !empty($_POST['active']); $pass = (string)($_POST['pass'] ?? '');
    $name = clean(p('name'), 60); $email = strtolower(clean(p('email'), 120));
    if ($email !== '' && !valid_email($email)) { flash(L('Ogiltig e-post', 'Invalid email'), 'bad'); go('users.php?id=' . urlencode($uid ?: 'new')); }
    if ($pass !== '' && ($w = weak_pass($pass))) { flash($w, 'bad'); go('users.php?id=' . urlencode($uid ?: 'new')); }
    if ($target) {
        if ($target['role'] === 'owner' && ($role !== 'owner' || !$active) && $owners < 2) { flash(L('Det måste finnas minst en aktiv ägare', 'There must be at least one active owner'), 'bad'); go('users.php?id=' . urlencode($uid)); }
        if ($uid === $me['id'] && !$active) { flash(L('Du kan inte inaktivera dig själv', 'You cannot deactivate yourself'), 'bad'); go('users.php?id=' . urlencode($uid)); }
        ad_tx('users', function (&$d) use ($uid, $role, $perms, $active, $pass, $name, $email) { foreach ($d as &$u) if ($u['id'] === $uid) { $u['role'] = $role; $u['perms'] = $role === 'custom' ? $perms : []; $u['active'] = $active; $u['name'] = $name ?: $u['name']; $u['email'] = $email; if ($pass !== '') { $u['hash'] = password_hash($pass, PASSWORD_DEFAULT); $u['pwChanged'] = now_iso(); } } });
        log_act(L('Ändrade användare', 'Changed user'), $target['user'] . ' → ' . $role);
    } else {
        $user = strtolower(trim(p('user')));
        if (!preg_match('/^[a-z0-9._-]{3,30}$/', $user)) { flash(L('Användarnamn: 3–30 tecken (a–z, 0–9, . _ -)', 'Username: 3–30 characters (a–z, 0–9, . _ -)'), 'bad'); go('users.php?id=new'); }
        foreach ($users as $u) if ($u['user'] === $user || ($email !== '' && $u['email'] === $email)) { flash(L('Användarnamnet eller e-posten finns redan', 'The username or email already exists'), 'bad'); go('users.php?id=new'); }
        if ($pass === '') { flash(L('Ange ett lösenord', 'Enter a password'), 'bad'); go('users.php?id=new'); }
        ad_tx('users', function (&$d) use ($user, $role, $perms, $active, $pass, $name, $email) { $d[] = ['id' => ad_id('u'), 'user' => $user, 'name' => $name ?: $user, 'email' => $email, 'role' => $role, 'perms' => $role === 'custom' ? $perms : [], 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'active' => $active, 'created' => now_iso(), 'last' => '']; });
        log_act(L('Skapade användare', 'Created user'), "$user ($role)");
    }
    flash(L('Användaren är sparad', 'The user is saved')); go('users.php');
}
$users = users_all();
$edit = null; foreach ($users as $u) if ($u['id'] === ($_GET['id'] ?? '')) $edit = $u;
admin_head(L('Användare & roller', 'Users & roles'), 'users', '<a class="b" href="?id=new">' . icon('plus') . ' ' . L('Ny användare', 'New user') . '</a>');
?>
<div class="cols">
  <div class="card" style="padding:0">
    <table class="t"><thead><tr><th><?= L('Användare', 'User') ?></th><th><?= L('Roll', 'Role') ?></th><th class="hide-sm"><?= L('Senast inloggad', 'Last sign in') ?></th><th>Status</th></tr></thead><tbody>
    <?php foreach ($users as $u): ?><tr><td><a class="rowlink" href="?id=<?= e($u['id']) ?>"><?= e($u['name']) ?></a><?= $u['id'] === $me['id'] ? ' <small class="muted">(' . L('du', 'you') . ')</small>' : '' ?><br><small class="muted"><?= e($u['user']) ?><?= $u['email'] ? ' · ' . e($u['email']) : '' ?></small></td><td><?= e(role_label($u)) ?></td><td class="hide-sm"><small><?= $u['last'] ? e(ago($u['last'])) : '—' ?></small></td><td><?= !empty($u['active']) ? '<span class="st st--on">' . L('Aktiv', 'Active') . '</span>' : '<span class="st st--off">' . L('Inaktiv', 'Inactive') . '</span>' ?></td></tr><?php endforeach; ?>
    </tbody></table>
  </div>
  <div>
    <?php if ($edit || ($_GET['id'] ?? '') === 'new'): $u = $edit ?: ['id' => '', 'user' => '', 'name' => '', 'email' => '', 'role' => 'sales', 'perms' => [], 'active' => true]; ?>
    <form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($u['id']) ?>"><input type="hidden" name="act" value="save">
      <h3><?= $edit ? e($u['user']) : L('Ny användare', 'New user') ?></h3>
      <?php if (!$edit): ?><label><?= L('Användarnamn', 'Username') ?><input name="user" required pattern="[a-z0-9._\-]{3,30}" autocomplete="off"></label><?php endif; ?>
      <label><?= L('Namn', 'Name') ?><input name="name" value="<?= e($u['name']) ?>"></label>
      <label><?= L('E-post (kan användas för inloggning)', 'Email (can be used to sign in)') ?><input type="email" name="email" value="<?= e($u['email']) ?>"></label>
      <label><?= L('Roll', 'Role') ?><select name="role" id="role"><?php foreach (ROLES() as $k => [$lbl, $desc]): ?><option value="<?= $k ?>" <?= sel($u['role'], $k) ?>><?= e($lbl) ?> – <?= e($desc) ?></option><?php endforeach; ?></select></label>
      <fieldset id="perms" style="border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:0 0 12px" <?= $u['role'] === 'custom' ? '' : 'hidden' ?>><legend class="hint"><?= L('Behörigheter', 'Permissions') ?></legend>
        <?php foreach (PERMS() as $k => $lbl): ?><label class="chk"><input type="checkbox" name="perms[]" value="<?= $k ?>" <?= in_array($k, $u['perms'] ?? [], true) ? 'checked' : '' ?>> <?= e($lbl) ?></label><?php endforeach; ?>
      </fieldset>
      <label><?= $edit ? L('Nytt lösenord (lämna tomt för att behålla)', 'New password (leave empty to keep)') : L('Lösenord (minst 10 tecken, bokstäver och siffror)', 'Password (at least 10 characters, letters and digits)') ?><input type="password" name="pass" autocomplete="new-password" <?= $edit ? '' : 'required' ?>></label>
      <label class="chk"><input type="checkbox" name="active" value="1" <?= checked($u['active']) ?>> <?= L('Aktiv (kan logga in)', 'Active (can sign in)') ?></label>
      <div class="row"><button class="b"><?= L('Spara', 'Save') ?></button><a class="b b--ghost" href="users.php"><?= L('Avbryt', 'Cancel') ?></a><span class="spacer"></span>
      <?php if ($edit && $edit['id'] !== $me['id']): ?><button class="b b--danger b--sm" form="udel" data-confirm="<?= L('Radera användaren?', 'Delete the user?') ?>"><?= icon('trash') ?></button><?php endif; ?></div>
    </form>
    <?php if ($edit): ?><form method="post" id="udel"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($edit['id']) ?>"></form><?php endif; ?>
    <script>document.getElementById('role').addEventListener('change',function(){document.getElementById('perms').hidden=this.value!=='custom'})</script>
    <?php else: ?>
    <div class="card"><h3><?= L('Roller', 'Roles') ?></h3><ul class="list"><?php foreach (ROLES() as $k => [$lbl, $desc]): ?><li><b><?= e($lbl) ?></b><small class="muted" style="text-align:right"><?= e($desc) ?></small></li><?php endforeach; ?></ul></div>
    <?php endif; ?>
  </div>
</div>
<?php admin_foot(); ?>

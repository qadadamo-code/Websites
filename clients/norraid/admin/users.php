<?php
require __DIR__ . '/inc.php';
require_perm('users');
csrf_check();
$users = users_all();
$id = (string)($_GET['id'] ?? '');
if (is_post()) {
    $act = (string)p('act');
    if ($act === 'save') {
        $user = strtolower(preg_replace('/[^a-z0-9._-]/i', '', (string)p('user')));
        $role = (string)p('role');
        $pass = (string)p('pass');
        if ($user === '' || !isset(ROLES[$role])) { flash('Username and role are required.', 'bad'); go('users.php' . ($id ? '?id=' . rawurlencode($id) : '?new=1')); }
        foreach ($users as $u) if ($u['user'] === $user && $u['id'] !== $id) { flash('That username is taken.', 'bad'); go('users.php?new=1'); }
        if ($id === '' && $pass === '') { flash('Set a temporary password for the new user.', 'bad'); go('users.php?new=1'); }
        if ($pass !== '' && ($w = weak_pass($pass))) { flash($w, 'bad'); go('users.php' . ($id ? '?id=' . rawurlencode($id) : '?new=1')); }
        $active = !empty($_POST['active']);
        if ($id === me()['id'] && (!$active || $role !== 'super')) { flash('You cannot remove your own Super Admin access.', 'bad'); go('users.php?id=' . rawurlencode($id)); }
        $nid = $id ?: uid('u');
        admin_tx('users', function (&$l) use ($nid, $user, $role, $pass, $active) {
            foreach ($l as &$u) if ($u['id'] === $nid) {
                $u['user'] = $user; $u['name'] = str_clean(p('name'), 80); $u['email'] = str_clean(p('email'), 120); $u['role'] = $role; $u['active'] = $active;
                if ($pass !== '') { $u['hash'] = password_hash($pass, PASSWORD_DEFAULT); $u['must_change'] = true; }
                return;
            }
            $l[] = ['id' => $nid, 'user' => $user, 'name' => str_clean(p('name'), 80), 'email' => str_clean(p('email'), 120), 'role' => $role, 'active' => $active,
                'hash' => password_hash($pass, PASSWORD_DEFAULT), 'must_change' => true, 'created' => now_iso()];
        }, $id ? 'update' : 'create', $user, "role=$role" . ($pass !== '' ? ', password reset' : ''));
        flash('Saved. ' . ($pass !== '' ? 'Give the temporary password to the user privately; they must change it at first sign-in.' : ''));
        go('users.php');
    }
}
admin_head('Users');
if ($id !== '' || isset($_GET['new'])):
    $u = ['user' => '', 'name' => '', 'email' => '', 'role' => 'editor', 'active' => true];
    foreach ($users as $x) if ($x['id'] === $id) $u = $x; ?>
 <p><a href="users.php">← All users</a></p>
 <form class="card form narrow" method="post" action="users.php<?= $id ? '?id=' . e(rawurlencode($id)) : '' ?>">
  <?= csrf_field() ?><input type="hidden" name="act" value="save">
  <label class="f">Username<input name="user" value="<?= e($u['user']) ?>" required pattern="[A-Za-z0-9._-]+"></label>
  <label class="f">Name<input name="name" value="<?= e($u['name'] ?? '') ?>"></label>
  <label class="f">Email<input name="email" type="email" value="<?= e($u['email'] ?? '') ?>"></label>
  <label class="f">Role<select name="role"><?php foreach (ROLES as $k => [$n, $d]): ?><option value="<?= e($k) ?>"<?= $u['role'] === $k ? ' selected' : '' ?>><?= e("$n – $d") ?></option><?php endforeach; ?></select></label>
  <label class="f"><?= $id ? 'New temporary password (leave empty to keep)' : 'Temporary password' ?><input name="pass" type="text" autocomplete="new-password" minlength="12"<?= $id ? '' : ' required' ?>><small class="help">The user must change it at first sign-in.</small></label>
  <label class="f chk"><input type="checkbox" name="active" value="1"<?= !empty($u['active']) ? ' checked' : '' ?>> <span>Active</span></label>
  <div class="actions"><button class="btn">Save</button></div>
 </form>
<?php else: ?>
 <div class="toolbar"><span></span><a class="btn" href="users.php?new=1">+ Add user</a></div>
 <div class="table-wrap"><table class="tbl"><thead><tr><th>User</th><th>Name</th><th>Role</th><th>Active</th><th>Last sign-in</th><th></th></tr></thead><tbody>
 <?php foreach ($users as $u): ?><tr><td><?= e($u['user']) ?></td><td><?= e($u['name'] ?? '') ?></td><td><?= e(ROLES[$u['role']][0] ?? $u['role']) ?></td><td><?= !empty($u['active']) ? '✓' : '—' ?></td><td><?= e(substr((string)($u['last_login'] ?? ''), 0, 16)) ?></td><td><a href="users.php?id=<?= e(rawurlencode($u['id'])) ?>">Edit</a></td></tr><?php endforeach; ?>
 </tbody></table></div>
 <section class="card"><h2>Roles</h2><ul><?php foreach (ROLES as [$n, $d]): ?><li><b><?= e($n) ?></b>: <?= e($d) ?></li><?php endforeach; ?></ul></section>
<?php endif;
admin_foot();

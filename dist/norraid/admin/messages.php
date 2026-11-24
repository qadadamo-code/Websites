<?php
require __DIR__ . '/inc.php';
require_perm('messages');
csrf_check();
if (is_post()) {
    $id = (string)p('id'); $act = (string)p('act');
    if (in_array($act, ['done', 'new', 'delete'], true)) {
        admin_tx('messages', function (&$l) use ($id, $act) {
            if ($act === 'delete') { $l = array_values(array_filter($l, fn($m) => $m['id'] !== $id)); return; }
            foreach ($l as &$m) if ($m['id'] === $id) $m['status'] = $act;
        }, $act, $id);
    }
    go('messages.php');
}
$msgs = nr_load('messages');
admin_head('Messages');
?>
<p class="intro">Messages from the contact form. Reply from your email (<?= e((string)setting('contact_email')) ?>).</p>
<div class="table-wrap"><table class="tbl"><thead><tr><th>Date</th><th>From</th><th>Topic</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody>
<?php foreach (array_slice($msgs, 0, 300) as $m): ?><tr class="<?= ($m['status'] ?? '') === 'new' ? 'is-new' : '' ?>">
 <td><?= e(substr((string)$m['at'], 0, 16)) ?></td><td><?= e($m['name']) ?><br><a href="mailto:<?= e($m['email']) ?>"><?= e($m['email']) ?></a> · <?= e(strtoupper((string)$m['lang'])) ?></td>
 <td><?= badge((string)$m['topic']) ?></td><td class="msg"><?= nl2br(e($m['message'])) ?></td><td><?= badge((string)$m['status']) ?></td>
 <td class="nowrap"><form method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($m['id']) ?>"><button class="linkbtn" name="act" value="<?= ($m['status'] ?? '') === 'new' ? 'done' : 'new' ?>"><?= ($m['status'] ?? '') === 'new' ? 'Mark handled' : 'Mark new' ?></button></form>
 <form method="post" data-confirm="Delete this message?"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($m['id']) ?>"><button class="linkbtn" name="act" value="delete">Delete</button></form></td>
</tr><?php endforeach; ?>
<?php if (!$msgs): ?><tr><td colspan="6" class="muted">No messages yet.</td></tr><?php endif; ?>
</tbody></table></div>
<?php admin_foot();

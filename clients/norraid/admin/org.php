<?php
require __DIR__ . '/inc.php';
require_perm('org');
csrf_check();
$F = [
    'legal_name' => 'Legal name', 'org_number' => 'Organisation number', 'authority' => 'Registering authority (e.g. Skatteverket / Bolagsverket)',
    'registration_date' => 'Registration date', 'address' => 'Registered address', 'representative' => 'Authorised representative',
    'email' => 'Official email', 'approvals' => 'Fundraising approvals (e.g. Svensk Insamlingskontroll)',
];
if (is_post()) {
    $o = org();
    foreach ($F as $k => $_) $o[$k] = str_clean(p($k), 300);
    $o['ninety_account'] = !empty($_POST['ninety_account']);
    $want = (string)p('status') === 'verified';
    $hasDoc = (bool)array_filter(nr_load('documents'), fn($d) => ($d['category'] ?? '') === 'legal' && !empty($d['file']));
    if ($want && ($o['legal_name'] === '' || $o['org_number'] === '' || $o['authority'] === '' || !$hasDoc)) {
        $want = false;
        flash('To show "verified", fill legal name, organisation number and authority, and upload the registration document under Documents (category Legal).', 'warn');
    }
    $o['status'] = $want ? 'verified' : 'pending';
    $o['updated'] = date('Y-m-d');
    nr_write('org', $o);
    audit('update', 'org', 'status=' . $o['status']);
    flash('Saved.');
    go('org.php');
}
$o = org();
admin_head('Legal status');
?>
<p class="intro">Until this is set to verified, the site shows "Registration details pending verification" everywhere and never claims charity status or tax deduction. Only switch to verified with official papers in hand.</p>
<form class="card form" method="post">
 <?= csrf_field() ?>
 <div class="grid">
 <label class="f">Status<select name="status"><?= opts(['pending' => 'Registration details pending verification', 'verified' => 'Verified'], $o['status'] ?? 'pending') ?></select></label>
 <?php foreach ($F as $k => $label): ?><label class="f"><?= e($label) ?><input name="<?= e($k) ?>" value="<?= e((string)($o[$k] ?? '')) ?>"<?= $k === 'registration_date' ? ' type="date"' : '' ?>></label><?php endforeach; ?>
 <label class="f chk"><input type="checkbox" name="ninety_account" value="1"<?= !empty($o['ninety_account']) ? ' checked' : '' ?>> <span>Has a 90-account (Svensk Insamlingskontroll)</span></label>
 </div>
 <p class="muted small">Last updated <?= e((string)($o['updated'] ?? '')) ?></p>
 <div class="actions"><button class="btn">Save</button></div>
</form>
<?php admin_foot();

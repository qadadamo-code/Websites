<?php
require __DIR__ . '/inc.php';
require_perm('settings');
csrf_check();
if (is_post()) {
    $s = settings();
    $pp = trim((string)p('paypal_url'));
    if ($pp !== '' && !preg_match('~^https://(www\.)?paypal\.com/~', $pp)) { flash('The PayPal link must start with https://www.paypal.com/', 'bad'); go('settings.php'); }
    $s['paypal_url'] = $pp;
    $s['recipient_name'] = str_clean(p('recipient_name'), 120);
    $s['currency'] = in_array(p('currency'), ['EUR', 'SEK', 'USD'], true) ? p('currency') : 'EUR';
    $am = array_values(array_filter(array_map('intval', explode(',', (string)p('amounts'))), fn($n) => $n >= 1 && $n <= 10000));
    $s['amounts'] = $am ?: [10, 25, 50, 100, 250];
    $s['custom_amount'] = !empty($_POST['custom_amount']);
    $s['pass_amount'] = !empty($_POST['pass_amount']);
    foreach (['contact_email', 'donate_email', 'mail_from', 'admin_notify_email'] as $k) {
        $v = trim((string)p($k));
        $s[$k] = ($v === '' || filter_var($v, FILTER_VALIDATE_EMAIL)) ? $v : ($s[$k] ?? '');
    }
    $s['show_public_totals'] = !empty($_POST['show_public_totals']);
    $s['search_console'] = preg_replace('/[^A-Za-z0-9_-]/', '', (string)p('search_console'));
    if (!empty($_FILES['qr']['tmp_name']) && is_uploaded_file($_FILES['qr']['tmp_name'])) {
        $info = @getimagesize($_FILES['qr']['tmp_name']);
        if ($info && in_array($info[2], [IMAGETYPE_PNG, IMAGETYPE_JPEG], true)) {
            $name = 'paypal-qr-' . bin2hex(random_bytes(3)) . ($info[2] === IMAGETYPE_PNG ? '.png' : '.jpg');
            if (move_uploaded_file($_FILES['qr']['tmp_name'], NR_UPLOADS . '/media/' . $name)) $s['paypal_qr'] = 'uploads/media/' . $name;
        } else flash('The QR code must be a PNG or JPG image.', 'bad');
    }
    nr_write('settings', $s);
    audit('update', 'settings');
    flash('Saved.');
    go('settings.php');
}
$s = settings();
admin_head('Settings');
?>
<form class="card form" method="post" enctype="multipart/form-data">
 <?= csrf_field() ?>
 <h2>Donations (PayPal)</h2>
 <div class="grid">
  <label class="f full">PayPal donate link<input name="paypal_url" type="url" value="<?= e((string)($s['paypal_url'] ?? '')) ?>"></label>
  <label class="f">Account holder name shown to donors<input name="recipient_name" value="<?= e((string)($s['recipient_name'] ?? '')) ?>"><small class="help">The personal PayPal account that receives the money. Shown on Donate and Transparency.</small></label>
  <label class="f">Currency<select name="currency"><?= opts(['EUR' => 'EUR', 'SEK' => 'SEK', 'USD' => 'USD'], $s['currency'] ?? 'EUR') ?></select></label>
  <label class="f">Suggested amounts<input name="amounts" value="<?= e(implode(', ', (array)($s['amounts'] ?? []))) ?>"></label>
  <label class="f">QR code image<input type="file" name="qr" accept="image/png,image/jpeg"><small class="help">Current: <?= e((string)($s['paypal_qr'] ?? '')) ?></small></label>
  <label class="f chk"><input type="checkbox" name="custom_amount" value="1"<?= !empty($s['custom_amount']) ? ' checked' : '' ?>> <span>Allow a custom amount</span></label>
  <label class="f chk"><input type="checkbox" name="pass_amount" value="1"<?= !empty($s['pass_amount']) ? ' checked' : '' ?>> <span>Pre-fill the amount on PayPal</span></label>
  <label class="f chk"><input type="checkbox" name="show_public_totals" value="1"<?= !empty($s['show_public_totals']) ? ' checked' : '' ?>> <span>Show confirmed donation totals on Transparency</span></label>
 </div>
 <h2>Email</h2>
 <div class="grid">
  <label class="f">Public contact email<input name="contact_email" type="email" value="<?= e((string)($s['contact_email'] ?? '')) ?>"></label>
  <label class="f">Donation questions email<input name="donate_email" type="email" value="<?= e((string)($s['donate_email'] ?? '')) ?>"></label>
  <label class="f">Sender address for site emails<input name="mail_from" type="email" value="<?= e((string)($s['mail_from'] ?? '')) ?>"><small class="help">Must be a mailbox on this domain so emails are not marked as spam.</small></label>
  <label class="f">Send contact-form messages to<input name="admin_notify_email" type="email" value="<?= e((string)($s['admin_notify_email'] ?? '')) ?>"></label>
 </div>
 <h2>Search</h2>
 <div class="grid"><label class="f">Google Search Console verification code<input name="search_console" value="<?= e((string)($s['search_console'] ?? '')) ?>"></label></div>
 <div class="actions"><button class="btn">Save</button></div>
</form>
<?php admin_foot();

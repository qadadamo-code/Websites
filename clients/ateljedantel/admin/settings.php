<?php
require __DIR__ . '/inc.php';
require_perm('settings.edit');
$pair = fn($k, $max = 300) => ['sv' => clean(p($k . '_sv'), $max), 'en' => clean(p($k . '_en'), $max)];
if (posted()) {
    $url = fn($k) => preg_match('~^https://[^\s<>"]+$~', p($k)) ? p($k) : '';
    $hours = [];
    foreach ((array)($_POST['hr'] ?? []) as $h) { $d = ['sv' => clean((string)($h['dsv'] ?? ''), 40), 'en' => clean((string)($h['den'] ?? ''), 40)]; if ($d['sv'] === '') continue; $hours[] = ['d' => $d, 'h' => ['sv' => clean((string)($h['hsv'] ?? ''), 40), 'en' => clean((string)($h['hen'] ?? ''), 40)]]; }
    $email = strtolower(clean(p('email'), 120)); $oemail = strtolower(clean(p('orderEmail'), 120));
    if (!valid_email($email)) { flash(L('Ogiltig e-postadress', 'Invalid email address'), 'bad'); go('settings.php'); }
    ad_tx('settings', function (&$s) use ($pair, $url, $hours, $email, $oemail) {
        $s['address'] = clean(p('address'), 120); $s['city'] = clean(p('city'), 60); $s['phone'] = clean(p('phone'), 30);
        $s['phoneIntl'] = '+' . ltrim(preg_replace('/[^\d]/', '', p('phoneIntl')), '0'); $s['whatsapp'] = preg_replace('/\D/', '', p('whatsapp')); $s['email'] = $email; $s['orderEmail'] = valid_email($oemail) ? $oemail : $email;
        $s['mapUrl'] = $url('mapUrl'); $s['bookingExternal'] = $url('bookingExternal');
        $s['social'] = ['instagram' => $url('instagram'), 'facebook' => $url('facebook'), 'tiktok' => $url('tiktok')];
        $s['tagline'] = $pair('tagline', 80);
        if ($hours) $s['hours'] = $hours;
        $s['shipping'] = ['pickup' => !empty($_POST['pickup']), 'postnord' => max(0, pnum('postnord')), 'freeOver' => max(0, pnum('freeOver')), 'note' => $pair('shipnote', 200)];
        $s['pay'] = [
            'swish' => ['on' => !empty($_POST['swish_on']), 'number' => clean(p('swish_number'), 20), 'name' => clean(p('swish_name'), 60)],
            'bank' => ['on' => !empty($_POST['bank_on']), 'bankgiro' => clean(p('bankgiro'), 20), 'iban' => strtoupper(preg_replace('/\s+/', ' ', clean(p('iban'), 40))), 'bic' => strtoupper(clean(p('bic'), 15)), 'bank' => clean(p('bank'), 60)],
            'store' => ['on' => !empty($_POST['store_on'])],
            'stripe' => ['on' => !empty($_POST['stripe_on']) && $url('stripe_link') !== '', 'link' => $url('stripe_link')],
        ];
        $s['ordersEnabled'] = !empty($_POST['ordersEnabled']);
        $s['orderPrefix'] = strtoupper(preg_replace('/[^A-Za-z]/', '', p('orderPrefix'))) ?: 'AD';
        $s['seo'] = ['title' => $pair('seo_title', 80), 'desc' => $pair('seo_desc', 200)];
        $s['returns'] = $pair('returns', 600);
    });
    log_act(L('Ändrade inställningar', 'Changed settings')); flash(L('Inställningarna är sparade', 'Settings saved')); go('settings.php');
}
$s = settings();
$in = fn($name, $label, $val, $type = 'text', $extra = '') => '<label>' . $label . '<input type="' . $type . '" name="' . $name . '" value="' . e($val) . '"' . $extra . '></label>';
$bi = function ($name, $label, $v, $rows = 0) { $o = ''; foreach (['sv', 'en'] as $l) $o .= '<label>' . $label . ' <span class="hint">' . strtoupper($l) . '</span>' . ($rows ? '<textarea name="' . $name . '_' . $l . '" rows="' . $rows . '">' . e($v[$l] ?? '') . '</textarea>' : '<input name="' . $name . '_' . $l . '" value="' . e($v[$l] ?? '') . '">') . '</label>'; return $o; };
admin_head(L('Inställningar', 'Settings'), 'settings');
?>
<form method="post" data-dirty><?= csrf_field() ?>
<div class="cols">
<div>
  <div class="card" id="pay"><h3><?= L('Betalning', 'Payment') ?></h3>
    <p class="hint" style="margin-top:-6px"><?= L('Kunden skickar sin order och får instruktioner på tack-sidan och i e-posten. Du markerar ordern som betald när pengarna kommit.', 'The customer sends the order and gets instructions on the thank-you page and by email. You mark the order as paid when the money arrives.') ?></p>
    <label class="chk"><input type="checkbox" name="swish_on" value="1" <?= checked($s['pay']['swish']['on'] ?? false) ?>> <b>Swish</b></label>
    <div class="grid2"><?= $in('swish_number', L('Swish-nummer', 'Swish number'), $s['pay']['swish']['number'] ?? '', 'text', ' placeholder="123 456 78 90" inputmode="numeric"') ?><?= $in('swish_name', L('Mottagarnamn', 'Payee name'), $s['pay']['swish']['name'] ?? '') ?></div>
    <label class="chk"><input type="checkbox" name="bank_on" value="1" <?= checked($s['pay']['bank']['on'] ?? false) ?>> <b><?= L('Banköverföring', 'Bank transfer') ?></b></label>
    <div class="grid2"><?= $in('bankgiro', 'Bankgiro', $s['pay']['bank']['bankgiro'] ?? '', 'text', ' placeholder="123-4567"') ?><?= $in('bank', L('Bank', 'Bank'), $s['pay']['bank']['bank'] ?? '') ?><?= $in('iban', 'IBAN', $s['pay']['bank']['iban'] ?? '', 'text', ' placeholder="SE.."') ?><?= $in('bic', 'BIC', $s['pay']['bank']['bic'] ?? '') ?></div>
    <label class="chk"><input type="checkbox" name="store_on" value="1" <?= checked($s['pay']['store']['on'] ?? false) ?>> <b><?= L('Betala i butiken vid hämtning', 'Pay in store on collection') ?></b></label>
    <label class="chk"><input type="checkbox" name="stripe_on" value="1" <?= checked($s['pay']['stripe']['on'] ?? false) ?>> <b><?= L('Kort via betallänk (valfritt)', 'Card via payment link (optional)') ?></b></label>
    <?= $in('stripe_link', L('Betallänk (Stripe, Klarna m.fl.)', 'Payment link (Stripe, Klarna etc.)'), $s['pay']['stripe']['link'] ?? '', 'url', ' placeholder="https://"') ?>
  </div>
  <div class="card"><h3><?= L('Leverans', 'Delivery') ?></h3>
    <label class="chk"><input type="checkbox" name="pickup" value="1" <?= checked($s['shipping']['pickup'] ?? true) ?>> <?= L('Hämta i butiken (gratis)', 'Pickup in store (free)') ?></label>
    <div class="grid2"><?= $in('postnord', L('Frakt PostNord (kr)', 'PostNord shipping (kr)'), $s['shipping']['postnord'] ?? 99, 'text', ' inputmode="decimal"') ?><?= $in('freeOver', L('Fri frakt över (kr, 0 = aldrig)', 'Free shipping over (kr, 0 = never)'), $s['shipping']['freeOver'] ?? 0, 'text', ' inputmode="decimal"') ?></div>
    <div class="grid2"><?= $bi('shipnote', L('Leveranstext', 'Delivery text'), $s['shipping']['note'] ?? []) ?></div>
    <div class="grid2"><?= $bi('returns', L('Retur & ångerrätt', 'Returns'), $s['returns'] ?? [], 3) ?></div>
  </div>
  <div class="card"><h3><?= L('Beställningar', 'Orders') ?></h3>
    <label class="chk"><input type="checkbox" name="ordersEnabled" value="1" <?= checked($s['ordersEnabled'] ?? true) ?>> <?= L('Webbutiken tar emot beställningar', 'The web shop accepts orders') ?></label>
    <p class="hint"><?= L('Stäng av tillfälligt vid semester – kunderna kan då fortfarande se produkter och boka tid.', 'Switch off temporarily during holidays – customers can still browse and book fittings.') ?></p>
    <?= $in('orderPrefix', L('Prefix för ordernummer', 'Order number prefix'), $s['orderPrefix'] ?? 'AD', 'text', ' maxlength="4" style="width:120px"') ?>
  </div>
</div>
<div>
  <div class="card"><h3><?= L('Kontakt', 'Contact') ?></h3>
    <?= $in('address', L('Adress', 'Address'), $s['address']) ?><?= $in('city', L('Postnummer & ort', 'Postcode & city'), $s['city']) ?>
    <div class="grid2"><?= $in('phone', L('Telefon (visas)', 'Phone (shown)'), $s['phone']) ?><?= $in('phoneIntl', L('Telefon internationellt', 'Phone international'), $s['phoneIntl'], 'tel') ?></div>
    <?= $in('whatsapp', L('WhatsApp för bokningar (internationellt, t.ex. 46762757055). Tomt = telefonnumret ovan', 'WhatsApp for bookings (international, e.g. 46762757055). Empty = phone above'), $s['whatsapp'] ?? '', 'tel') ?>
    <?= $in('email', L('E-post (visas)', 'Email (shown)'), $s['email'], 'email', ' required') ?><?= $in('orderEmail', L('E-post för nya ordrar & bokningar', 'Email for new orders & bookings'), $s['orderEmail'] ?? '', 'email') ?>
    <?= $in('mapUrl', L('Kartlänk', 'Map link'), $s['mapUrl'] ?? '', 'url') ?>
    <?= $in('bookingExternal', L('Extern bokningslänk (BokaMera, valfritt)', 'External booking link (BokaMera, optional)'), $s['bookingExternal'] ?? '', 'url') ?>
    <div class="grid2"><?= $bi('tagline', L('Slogan', 'Tagline'), $s['tagline'] ?? []) ?></div>
  </div>
  <div class="card"><h3><?= L('Öppettider', 'Opening hours') ?></h3>
    <div data-rep>
      <?php foreach ($s['hours'] ?? [] as $i => $h): ?><div class="grid4" data-rep-row style="align-items:end"><input name="hr[<?= $i ?>][dsv]" value="<?= e($h['d']['sv']) ?>" aria-label="dag"><input name="hr[<?= $i ?>][hsv]" value="<?= e($h['h']['sv']) ?>" aria-label="tid"><input name="hr[<?= $i ?>][den]" value="<?= e($h['d']['en'] ?? '') ?>" aria-label="day"><div class="row" style="flex-wrap:nowrap"><input name="hr[<?= $i ?>][hen]" value="<?= e($h['h']['en'] ?? '') ?>" aria-label="time"><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm>×</button></div></div><?php endforeach; ?>
      <p class="hint"><?= L('Dag (sv) · Tid (sv) · Dag (en) · Tid (en)', 'Day (sv) · Time (sv) · Day (en) · Time (en)') ?></p>
      <button type="button" class="b b--ghost b--sm" data-rep-add><?= icon('plus') ?> <?= L('Rad', 'Row') ?></button>
      <template><div class="grid4" data-rep-row style="align-items:end"><input name="hr[__i__][dsv]" placeholder="Dag"><input name="hr[__i__][hsv]" placeholder="10:00–17:00"><input name="hr[__i__][den]" placeholder="Day"><div class="row" style="flex-wrap:nowrap"><input name="hr[__i__][hen]" placeholder="10:00–17:00"><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm>×</button></div></div></template>
    </div>
    <p class="hint"><?= L('Tider för onlinebokning ställs in under Bokningar → Öppettider & typer.', 'Online booking hours are set under Bookings → Hours & types.') ?></p>
  </div>
  <div class="card"><h3><?= L('Sociala medier', 'Social media') ?></h3><?= $in('instagram', 'Instagram', $s['social']['instagram'] ?? '', 'url', ' placeholder="https://instagram.com/…"') ?><?= $in('facebook', 'Facebook', $s['social']['facebook'] ?? '', 'url', ' placeholder="https://facebook.com/…"') ?><?= $in('tiktok', 'TikTok', $s['social']['tiktok'] ?? '', 'url') ?></div>
  <div class="card"><h3><?= L('Sökmotorer (SEO)', 'Search engines (SEO)') ?></h3><?= $bi('seo_title', L('Titel', 'Title'), $s['seo']['title'] ?? []) ?><?= $bi('seo_desc', L('Beskrivning', 'Description'), $s['seo']['desc'] ?? [], 2) ?></div>
</div>
</div>
<div class="sticky-save"><button class="b"><?= icon('check') ?> <?= L('Spara inställningar', 'Save settings') ?></button></div>
</form>
<?php admin_foot(); ?>

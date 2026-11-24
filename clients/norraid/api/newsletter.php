<?php
/** Double opt-in subscription. Stores email, language, consent text version, time. */
require __DIR__ . '/_boot.php';
if (!form_token_ok()) reply(false, t('news.error'));
if (trim((string)($_POST['website'] ?? '')) !== '') reply(true, t('news.ok'));   // honeypot
if (rate_limited('nl', 5, 3600)) reply(false, t('news.rate'));
$email = strtolower(str_clean($_POST['email'] ?? '', 200));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || empty($_POST['consent'])) reply(false, t('news.error'));
$sub = nr_tx('subscribers', function (&$list) use ($email) {
    foreach ($list as &$s) {
        if (($s['email'] ?? '') === $email) {
            if (($s['status'] ?? '') === 'confirmed') return ['skip' => true];
            $s['token'] = bin2hex(random_bytes(20)); $s['status'] = 'pending'; $s['lang'] = L(); $s['requested_at'] = now_iso();
            $s['consent'] = ['text' => t('news.consent'), 'lang' => L(), 'at' => now_iso(), 'ip' => ip_hash(), 'source' => 'website form'];
            return $s;
        }
    }
    $s = ['id' => uid('s'), 'email' => $email, 'lang' => L(), 'status' => 'pending', 'token' => bin2hex(random_bytes(20)), 'requested_at' => now_iso(),
          'consent' => ['text' => t('news.consent'), 'lang' => L(), 'at' => now_iso(), 'ip' => ip_hash(), 'source' => 'website form']];
    $list[] = $s;
    return $s;
});
if (empty($sub['skip'])) {
    mail_template($email, 'confirm', L(), ['token' => $sub['token'], 'no_unsub' => true, 'confirm_url' => nr_origin() . u('newsletter/confirm') . '?token=' . $sub['token']]);
}
reply(true, t('news.ok'));

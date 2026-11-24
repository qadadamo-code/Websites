<?php
/* /{lang}/newsletter/confirm?token=…  and  /{lang}/newsletter/unsubscribe?token=… */
require_once NR_ROOT . '/inc/mail.php';
$token = (string)($_GET['token'] ?? '');
$ok = false; $mode = $slug === 'unsubscribe' ? 'unsub' : 'confirm';
if (preg_match('/^[a-f0-9]{40}$/', $token) && in_array($slug, ['confirm', 'unsubscribe'], true)) {
    $ok = nr_tx('subscribers', function (&$list) use ($token, $mode) {
        foreach ($list as &$s) {
            if (!hash_equals((string)($s['token'] ?? ''), $token)) continue;
            if ($mode === 'confirm') {
                if (($s['status'] ?? '') === 'unsubscribed') return false;
                $first = ($s['status'] ?? '') !== 'confirmed';
                $s['status'] = 'confirmed'; $s['confirmed_at'] = $s['confirmed_at'] ?? now_iso(); $s['consent_ip'] = ip_hash();
                $s['_send_welcome'] = $first;
            } else {
                $s['status'] = 'unsubscribed'; $s['unsubscribed_at'] = now_iso();
                $s['_send_unsub'] = true;
            }
            return $s;
        }
        return false;
    });
    if ($ok && !empty($ok['_send_welcome'])) mail_template($ok['email'], 'welcome', $ok['lang'] ?? L(), ['token' => $token]);
    if ($ok && !empty($ok['_send_unsub'])) mail_template($ok['email'], 'unsub', $ok['lang'] ?? L(), ['token' => $token, 'no_unsub' => true]);
    if ($ok) nr_tx('subscribers', function (&$list) { foreach ($list as &$s) { unset($s['_send_welcome'], $s['_send_unsub']); } });
}
page_head(['path' => 'newsletter/' . $slug, 'title' => t('news.title'), 'noindex' => true]);
?>
<section class="page-hero plain"><div class="wrap ph-inner narrow center">
 <?= logo_mark('nf-mark') ?>
 <?php if (!$ok): ?><h1><?= te('news.title') ?></h1><p class="lead"><?= te('news.invalid') ?></p>
 <?php elseif ($mode === 'confirm'): ?><h1><?= te('news.confirmed_title') ?></h1><p class="lead"><?= te('news.confirmed') ?></p>
 <?php else: ?><h1><?= te('news.unsub_title') ?></h1><p class="lead"><?= te('news.unsub') ?></p><?php endif; ?>
 <p><a class="btn btn-forest" href="<?= e(u('')) ?>"><?= te('return.home') ?></a></p>
</div></section>
<?php page_foot();

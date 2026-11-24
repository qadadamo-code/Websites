<?php
/**
 * Multilingual email templates (HTML + plain text) sent with PHP mail().
 * Sender identity comes from settings (mail_from); every list email carries an unsubscribe link.
 */
declare(strict_types=1);

function mail_from(): string {
    $f = trim((string)setting('mail_from'));
    if (filter_var($f, FILTER_VALIDATE_EMAIL)) return $f;
    $host = preg_replace('/^www\./', '', preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost')));
    return 'no-reply@' . $host;
}

/** Render a template in a language. Keys: confirm, welcome, thanks, update, story, report, unsub. Returns [subject, html, text]. */
function mail_render(string $tpl, string $lang, array $v = []): array {
    $prev = L(); set_locale($lang);
    $site = nr_origin() . nr_base();
    $unsub = !empty($v['token']) ? nr_origin() . u('newsletter/unsubscribe') . '?token=' . $v['token'] : '';
    $subject = match ($tpl) {
        'confirm' => t('email.confirm_subject'), 'welcome' => t('email.welcome_subject'), 'thanks' => t('email.thanks_subject'),
        'story' => t('email.story_subject', ['country' => $v['country'] ?? '']), 'report' => t('email.report_subject'),
        'unsub' => t('email.unsub_subject'), default => (string)($v['subject'] ?? t('email.update_subject')),
    };
    $body = match ($tpl) {
        'confirm' => t('email.confirm_body'), 'welcome' => t('email.welcome_body'),
        'thanks' => t('email.thanks_body', ['amount' => $v['amount'] ?? '', 'fund' => $v['fund'] ?? '']),
        'story' => trim(($v['body'] ?? '') . "\n\n" . t('email.story_body', ['source' => $v['source'] ?? ''])),
        'unsub' => t('email.unsub_body'), default => (string)($v['body'] ?? ''),
    };
    $btn = match ($tpl) { 'confirm' => [t('email.confirm_button'), $v['confirm_url'] ?? ''], default => [t('email.button_site'), $v['url'] ?? nr_origin() . u('')] };
    $footer = (!empty($v['no_unsub']) || !$unsub) ? '' : t('email.footer', ['site' => $site, 'unsub' => $unsub]);
    $logo = nr_origin() . nr_base() . 'assets/brand/norraid-logo-horizontal-color.png';
    $dir = dir_attr(); $align = $dir === 'rtl' ? 'right' : 'left';
    $paras = '';
    foreach (preg_split("/\n\s*\n/", (string)$body) as $p) $paras .= '<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#262D2A">' . nl2br(e(trim($p))) . '</p>';
    $html = '<!doctype html><html lang="' . e(LOCALES[$lang][2]) . '" dir="' . $dir . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . e($subject) . '</title></head>'
        . '<body style="margin:0;background:#FAF8F2;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F2"><tr><td align="center" style="padding:24px 12px">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;text-align:' . $align . '">'
        . '<tr><td style="padding:28px 32px 8px"><img src="' . e($logo) . '" width="220" alt="NORRAID AFRICA – Humanity Without Borders" style="display:block;border:0;max-width:100%"></td></tr>'
        . '<tr><td style="padding:16px 32px 8px"><h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#193E38">' . e($subject) . '</h1>' . $paras
        . ($btn[1] ? '<p style="margin:24px 0"><a href="' . e($btn[1]) . '" style="display:inline-block;background:#193E38;color:#FFFFFF;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold">' . e($btn[0]) . '</a></p>' : '')
        . '</td></tr><tr><td style="padding:16px 32px 28px;border-top:1px solid #E8DDCB;font-size:12px;line-height:1.5;color:#5E6B66">'
        . e(t('footer.status')) . '<br>' . ($footer ? e(t('email.sender')) . ' · ' . '<a href="' . e($unsub) . '" style="color:#24877B">' . e(t('email.unsubscribe')) . '</a>' : e(t('email.sender'))) . '</td></tr>'
        . '</table></td></tr></table></body></html>';
    $text = strtoupper('NORRAID AFRICA') . "\n\n" . $subject . "\n\n" . trim((string)$body) . "\n\n" . ($btn[1] ? $btn[0] . ': ' . $btn[1] . "\n\n" : '') . t('footer.status') . "\n" . ($footer ? $footer . "\n" : '');
    set_locale($prev);
    return [$subject, $html, $text];
}

function mail_send(string $to, string $subject, string $html, string $text, string $unsubUrl = ''): bool {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $b = 'nr' . bin2hex(random_bytes(8));
    $from = mail_from();
    $h = [
        'From: =?UTF-8?B?' . base64_encode('NORRAID AFRICA') . '?= <' . $from . '>',
        'Reply-To: ' . (filter_var(setting('contact_email'), FILTER_VALIDATE_EMAIL) ? setting('contact_email') : $from),
        'MIME-Version: 1.0', 'Content-Type: multipart/alternative; boundary="' . $b . '"', 'X-Mailer: NORRAID',
    ];
    if ($unsubUrl) { $h[] = 'List-Unsubscribe: <' . $unsubUrl . '>'; $h[] = 'List-Unsubscribe-Post: List-Unsubscribe=One-Click'; }
    $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
        . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "--$b--";
    $log = ['to' => preg_replace('/(^.).*(@.*$)/', '$1***$2', $to), 'subject' => $subject, 'at' => now_iso()];
    $ok = function_exists('mail') && @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $h), '-f' . $from);
    $log['ok'] = (bool)$ok;
    nr_tx('maillog', function (&$l) use ($log) { array_unshift($l, $log); $l = array_slice($l, 0, 300); });
    return (bool)$ok;
}

function mail_template(string $to, string $tpl, string $lang, array $v = []): bool {
    [$s, $h, $t] = mail_render($tpl, locale_valid($lang) ? $lang : 'en', $v);
    $unsub = (!empty($v['token']) && empty($v['no_unsub'])) ? nr_origin() . u('newsletter/unsubscribe', $lang) . '?token=' . $v['token'] : '';
    return mail_send($to, $s, $h, $t, $unsub);
}

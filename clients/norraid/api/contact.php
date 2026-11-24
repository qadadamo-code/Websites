<?php
require __DIR__ . '/_boot.php';
if (!form_token_ok()) reply(false, t('contact.error'));
if (trim((string)($_POST['website'] ?? '')) !== '') reply(true, t('contact.sent'));
if (rate_limited('contact', 5, 3600)) reply(false, t('news.rate'));
$name = str_clean($_POST['name'] ?? '', 120);
$email = str_clean($_POST['email'] ?? '', 200);
$msg = str_clean($_POST['message'] ?? '', 5000);
$topic = (string)($_POST['topic'] ?? 'general');
if (!in_array($topic, ['general', 'donation', 'partner', 'media', 'privacy'], true)) $topic = 'general';
if ($name === '' || $msg === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(false, t('contact.error'));
$row = ['id' => uid('m'), 'name' => $name, 'email' => $email, 'topic' => $topic, 'message' => $msg, 'lang' => L(), 'at' => now_iso(), 'status' => 'new'];
nr_tx('messages', function (&$l) use ($row) { array_unshift($l, $row); });
$to = trim((string)setting($topic === 'donation' && setting('donate_email') ? 'donate_email' : 'admin_notify_email'));
if (filter_var($to, FILTER_VALIDATE_EMAIL)) {
    $txt = "New message ($topic) from $name <$email>\n\n$msg";
    mail_send($to, 'NORRAID contact: ' . $topic, '<pre style="font-family:Arial;white-space:pre-wrap">' . e($txt) . '</pre>', $txt);
}
reply(true, t('contact.sent'));

<?php
/** Event invitation page: shareable link with RSVP, invitation code and calendar file. */
require __DIR__ . '/inc/core.php';
$ev = find_event((string)($_GET['e'] ?? ''));
$S = settings();
if (!$ev || empty($ev['visible'])) { http_response_code(404); }

if ($ev && isset($_GET['ics'])) {
    $start = strtotime($ev['date'] . ' ' . ($ev['time'] ?: '19:00'));
    $end = $ev['endTime'] ? strtotime($ev['date'] . ' ' . $ev['endTime']) : $start + 3 * 3600;
    if ($end <= $start) $end += 86400;
    $f = fn($t) => gmdate('Ymd\THis\Z', $t);
    $esc = fn($s) => str_replace(["\\", ";", ",", "\n"], ["\\\\", "\;", "\\,", "\\n"], (string)$s);
    header('Content-Type: text/calendar; charset=utf-8');
    header('Content-Disposition: attachment; filename="barcode-' . preg_replace('/[^a-z0-9-]/', '', $ev['slug']) . '.ics"');
    echo "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Barcode Cafe//AR\r\nBEGIN:VEVENT\r\nUID:" . $ev['id'] . "@barcode\r\nDTSTAMP:" . $f(time()) .
        "\r\nDTSTART:" . $f($start) . "\r\nDTEND:" . $f($end) . "\r\nSUMMARY:" . $esc($ev['title'] . ' — ' . ($S['brand'] ?? 'Barcode')) .
        "\r\nLOCATION:" . $esc($ev['place'] ?: ($S['address'] ?? '')) . "\r\nDESCRIPTION:" . $esc($ev['subtitle'] ?? '') . "\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
    exit;
}

$past = $ev && $ev['date'] < today();
$spots = $ev ? event_spots_left($ev) : null;
$open = $ev && !$past && (!isset($ev['rsvpOpen']) || $ev['rsvpOpen']) && $spots !== 0;
$months = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
$days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
$ts = $ev ? strtotime($ev['date']) : time();
$dateAr = $ev ? $days[(int)date('w', $ts)] . ' ' . date('j', $ts) . ' ' . $months[(int)date('n', $ts)] . ' ' . date('Y', $ts) : '';
$cover = $ev && !empty($ev['cover']) ? $ev['cover'] : 'assets/img/latte.jpg';
$maxG = (int)($ev['maxPerGuest'] ?? 4) ?: 4;
header('Cache-Control: no-cache');
?><!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= $ev ? e($ev['title']) . ' | ' : '' ?>دعوة من باركود كافيه</title>
<meta name="description" content="<?= $ev ? e(($ev['subtitle'] ?: $ev['title']) . ' — ' . $dateAr) : 'دعوة من باركود كافيه' ?>">
<meta property="og:title" content="<?= $ev ? e($ev['title']) : 'دعوة من باركود كافيه' ?>">
<meta property="og:description" content="<?= e($dateAr . ($ev && $ev['time'] ? ' · ' . $ev['time'] : '')) ?> — سجّل واحصل على دعوتك">
<meta property="og:image" content="<?= e($cover) ?>">
<meta name="theme-color" content="#140A04">
<link rel="icon" type="image/png" href="assets/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Didact+Gothic&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=<?= BC_VERSION ?>">
<link rel="stylesheet" href="assets/css/event.css?v=<?= BC_VERSION ?>">
</head>
<body class="inv-page">
<div class="inv-bg" style="background-image:url('<?= e($cover) ?>')"></div>
<div class="grain" aria-hidden="true"></div>
<header class="inv-top">
  <a href="./"><img src="assets/brand/word-cream.png" alt="Barcode Cafe"></a>
  <a class="inv-top__menu" href="./#menu">المنيو</a>
</header>

<main class="inv">
<?php if (!$ev || empty($ev['visible'])): ?>
  <section class="inv-card inv-card--empty">
    <h1>الدعوة غير موجودة</h1>
    <p>ربما انتهت الفعالية أو تغيّر الرابط. تابع فعالياتنا القادمة من الصفحة الرئيسية.</p>
    <a class="btn btn--copper" href="./#events">الفعاليات القادمة</a>
  </section>
<?php else: ?>
  <section class="inv-card" id="invCard">
    <div class="inv-card__media"><img src="<?= e($cover) ?>" alt=""></div>
    <div class="inv-card__body">
      <span class="inv-eyebrow latin">YOU'RE INVITED · <?= e(strtoupper(date('d M Y', $ts))) ?></span>
      <span class="inv-kicker">دعوة خاصة من باركود</span>
      <h1 class="inv-title"><?= e($ev['title']) ?></h1>
      <?php if (!empty($ev['subtitle'])): ?><p class="inv-sub"><?= e($ev['subtitle']) ?></p><?php endif; ?>
      <div class="inv-facts">
        <div><span>اليوم</span><b><?= e($dateAr) ?></b></div>
        <?php if (!empty($ev['time'])): ?><div><span>الوقت</span><b class="latin"><?= e($ev['time']) ?><?= !empty($ev['endTime']) ? ' – ' . e($ev['endTime']) : '' ?></b></div><?php endif; ?>
        <div><span>المكان</span><b><?= e($ev['place'] ?: ($S['address'] ?: 'باركود كافيه')) ?></b></div>
        <?php if (!empty($ev['price'])): ?><div><span>الدخول</span><b><?= e($ev['price']) ?></b></div><?php endif; ?>
      </div>
      <?php if (!empty($ev['description'])): ?><div class="inv-desc"><?= nl2br(e($ev['description'])) ?></div><?php endif; ?>
      <?php if ($spots !== null && !$past): ?><p class="inv-spots"><?= $spots ? '<b class="latin">' . (int)$spots . '</b> مكان متبقٍ فقط' : 'اكتمل العدد' ?></p><?php endif; ?>

      <?php if ($open): ?>
      <form class="inv-form" id="rsvpForm" novalidate>
        <input type="hidden" name="event" value="<?= e($ev['slug']) ?>">
        <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="inv-row">
          <label><span>الاسم</span><input name="name" required autocomplete="name" placeholder="اسمك الكريم"></label>
          <label><span>رقم الموبايل</span><input name="phone" required inputmode="tel" class="latin" autocomplete="tel" placeholder="01xxxxxxxxx"></label>
        </div>
        <div class="inv-row">
          <div class="inv-guests"><span>عدد الحضور</span>
            <div class="stepper"><button type="button" data-step="-1">−</button><output class="latin" id="g">1</output><button type="button" data-step="1">+</button></div>
          </div>
          <label><span>ملاحظة (اختياري)</span><input name="note" placeholder="أي شيء تحب نعرفه"></label>
        </div>
        <button class="btn btn--copper btn--block" type="submit">أكّد حضوري واحصل على الدعوة</button>
        <p class="inv-msg" id="rsvpMsg"></p>
      </form>
      <?php elseif ($past): ?>
        <p class="inv-closed">انتهت هذه الفعالية. نراك في القادمة!</p>
      <?php else: ?>
        <p class="inv-closed">التسجيل مغلق حاليًا. تواصل معنا على واتساب لو حابب تنضم لقائمة الانتظار.</p>
        <a class="btn btn--ghost" href="<?= e(wa_link('مرحبًا باركود! أريد الانضمام لقائمة انتظار: ' . $ev['title'])) ?>" target="_blank" rel="noopener">قائمة الانتظار على واتساب</a>
      <?php endif; ?>
    </div>
  </section>

  <section class="inv-ticket" id="ticket" hidden>
    <div class="inv-ticket__main">
      <img src="assets/brand/word-dark.png" alt="" class="inv-ticket__logo">
      <span class="latin inv-ticket__type">INVITATION · ADMIT <b id="tPax">1</b></span>
      <h2 id="tName">—</h2>
      <p><?= e($ev['title']) ?></p>
      <div class="inv-ticket__row latin"><span>DATE<br><b><?= e(date('d/m', $ts)) ?></b></span><span>TIME<br><b><?= e($ev['time'] ?: '--:--') ?></b></span><span>CODE<br><b id="tCode">—</b></span></div>
    </div>
    <div class="inv-ticket__stub"><div id="tBar"></div><span class="latin" id="tCode2"></span></div>
    <div class="inv-ticket__actions">
      <a class="btn btn--copper" href="event.php?e=<?= e(rawurlencode($ev['slug'])) ?>&amp;ics=1">أضفها للتقويم</a>
      <a class="btn btn--ghost" id="tWa" href="#" target="_blank" rel="noopener">أرسل التأكيد لباركود</a>
      <button class="btn btn--ghost" id="tShare" type="button">ادعُ صديقًا</button>
    </div>
    <p class="inv-msg ok">احتفظ بهذه الدعوة واعرض الكود عند الوصول.</p>
  </section>
<?php endif; ?>
</main>

<?php if ($ev && !empty($ev['visible'])): ?>
<script>
(() => {
  const f = document.getElementById("rsvpForm"); if (!f) return;
  let g = 1; const max = <?= $maxG ?>; const TITLE = <?= json_encode($ev['title'], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?>;
  const out = document.getElementById("g"), msg = document.getElementById("rsvpMsg");
  f.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { g = Math.max(1, Math.min(max, g + +b.dataset.step)); out.textContent = g; });
  function bars(str) {
    let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } let s = h >>> 0 || 1;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); let x = 0, out = "";
    const parts = [2, 1, 1, 1, 2]; for (let i = 0; i < 40; i++) parts.push(1 + Math.floor(r() * 3.2)); parts.push(1, 1, 2, 1, 2);
    parts.forEach((w, i) => { if (i % 2 === 0) out += `<rect x="${x}" y="0" width="${w}" height="40"/>`; x += w; });
    return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" fill="#2A1406">${out}</svg>`;
  }
  f.onsubmit = async e => {
    e.preventDefault();
    let ok = true; ["name", "phone"].forEach(n => { const bad = !f[n].value.trim(); f[n].classList.toggle("invalid", bad); if (bad) ok = false; });
    if (!ok) { msg.textContent = "من فضلك اكتب الاسم ورقم الموبايل"; msg.className = "inv-msg bad"; return; }
    const btn = f.querySelector("[type=submit]"); btn.disabled = true; msg.textContent = "جارٍ التأكيد…"; msg.className = "inv-msg";
    try {
      const r = await fetch("api/rsvp.php", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: f.event.value, name: f.name.value, phone: f.phone.value, guests: g, note: f.note.value, website: f.website.value }) }).then(x => x.json());
      if (!r.ok) { msg.textContent = r.msg || "تعذّر التأكيد"; msg.className = "inv-msg bad"; btn.disabled = false; return; }
      const name = f.name.value.trim();
      document.getElementById("tName").textContent = name;
      document.getElementById("tPax").textContent = g;
      document.getElementById("tCode").textContent = r.code; document.getElementById("tCode2").textContent = r.code;
      document.getElementById("tBar").innerHTML = bars(r.code + name);
      const wa = <?= json_encode(wa_link(''), JSON_UNESCAPED_SLASHES) ?>;
      document.getElementById("tWa").href = wa + "?text=" + encodeURIComponent(`مرحبًا باركود 👋\nأكّدت حضوري: ${TITLE}\nالاسم: ${name}\nعدد الحضور: ${g}\nكود الدعوة: ${r.code}`);
      document.getElementById("invCard").querySelector(".inv-form").hidden = true;
      const t = document.getElementById("ticket"); t.hidden = false; t.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch { msg.textContent = "تعذّر الاتصال، حاول مرة أخرى"; msg.className = "inv-msg bad"; btn.disabled = false; }
  };
  document.getElementById("tShare").onclick = async () => {
    const data = { title: document.title, text: "تعال معايا! دعوة من باركود كافيه", url: location.href.split("#")[0] };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else window.open("https://wa.me/?text=" + encodeURIComponent(data.text + "\n" + data.url), "_blank", "noopener");
  };
})();
</script>
<?php endif; ?>
</body>
</html>

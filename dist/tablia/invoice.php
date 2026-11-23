<?php
/**
 * Branded invoice for one order: GET ?o=<order id>&k=<private token>.
 * The dashboard sends this link to the customer on WhatsApp; the page can be printed / saved as PDF
 * or saved / shared as an image.
 */
require __DIR__ . '/inc/core.php';
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, private');
$id = (string)($_GET['o'] ?? ''); $k = (string)($_GET['k'] ?? '');
$o = null;
foreach (bc_load('orders') as $x) if ($x['id'] === $id && !empty($x['track']) && hash_equals($x['track'], $k)) $o = $x;
if (!$o) { http_response_code(404); exit('<!doctype html><meta charset="utf-8"><p style="font-family:sans-serif;text-align:center;margin-top:20vh">الفاتورة مش موجودة</p>'); }
$s = settings();
$h = fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
$n = fn($v) => number_format((float)$v);
$pay = ['cash' => 'كاش', 'card' => 'فيزا', 'instapay' => 'إنستاباي', 'wallet' => 'محفظة'][$o['pay'] ?? ''] ?? '';
$st = ['new' => 'اتسجل', 'preparing' => 'قيد التحضير', 'ready' => 'جاهز', 'done' => 'تم التسليم', 'cancelled' => 'ملغي'][$o['status'] ?? ''] ?? '';
$no = (string)($o['no'] ?? '');
?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>فاتورة #<?= $h($no) ?> · <?= $h($s['brand'] ?? 'طبلية') ?></title>
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#17110E">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="assets/brand/favicon.png">
<style>
:root{--esp:#17110E;--brown:#A3261B;--copper:#F2C230;--glow:#F2C230;--paper:#F6EEDF;--ink:#17110E;--muted:#7D6B60}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;background:var(--esp);background-image:radial-gradient(700px 400px at 50% -10%,rgba(163,38,27,.35),transparent 70%);color:var(--ink);min-height:100vh;padding:28px 16px 40px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.latin{font-family:"Alexandria",sans-serif}
.wrap{max-width:440px;margin:0 auto}
.inv{position:relative;background:var(--paper);border-radius:4px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(0,0,0,.8)}
.inv::after{content:"";position:absolute;inset-inline:0;bottom:0;height:10px;background:radial-gradient(circle at 7px 100%,var(--esp) 6px,transparent 6.5px) 0 0/14px 10px repeat-x}
.inv__top{background:var(--brown);color:var(--paper);padding:26px 24px 22px;display:flex;align-items:center;gap:16px;position:relative}
.inv__top img{width:64px;height:auto;border-radius:14px;background:var(--paper);padding:3px;flex:none}
.inv__top h1{font-family:"Alexandria";font-size:22px;font-weight:800;line-height:1.3}
.inv__top small{display:block;font-family:"Alexandria";font-size:10.5px;letter-spacing:.32em;color:var(--copper);margin-top:2px}
.inv__tag{position:absolute;top:22px;inset-inline-end:22px;text-align:end}
.inv__tag b{display:block;font-family:"Alexandria";font-size:11px;letter-spacing:.28em;color:var(--copper)}
.inv__tag span{font-family:"Alexandria";font-size:22px;font-weight:700;color:var(--paper)}
.inv__body{padding:22px 24px 34px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;font-size:13px}
.meta div{display:flex;flex-direction:column;gap:1px}
.meta small{color:var(--muted);font-size:11.5px}
.meta b{font-weight:500}
.pill{display:inline-block;padding:2px 10px;border-radius:999px;background:var(--brown);color:var(--glow);font-weight:700;font-size:12.5px;width:max-content}
.dash{border:0;border-top:1.5px dashed rgba(23,17,14,.28);margin:18px 0}
.items{width:100%;border-collapse:collapse;font-size:14px}
.items th{font-weight:500;color:var(--muted);font-size:11.5px;text-align:start;padding:0 0 8px}
.items th:last-child,.items td:last-child{text-align:end}
.items td{padding:8px 0;border-bottom:1px solid rgba(23,17,14,.08);vertical-align:top}
.items tr:last-child td{border-bottom:0}
.items .q{font-family:"Alexandria";color:var(--muted);white-space:nowrap;padding-inline:10px}
.items .p{font-family:"Alexandria";font-weight:700;white-space:nowrap}
.sum{display:flex;flex-direction:column;gap:6px;font-size:14px}
.sum div{display:flex;justify-content:space-between}
.sum .disc{color:#A3261B}
.sum b{direction:ltr;unicode-bidi:isolate}
.total{margin-top:12px;display:flex;justify-content:space-between;align-items:center;background:var(--brown);color:var(--paper);border-radius:14px;padding:14px 18px}
.total span{font-size:15px}
.total b{font-family:"Alexandria";font-size:26px;font-weight:700;color:var(--glow);direction:ltr}
.total b small{font-size:12px;color:var(--paper);margin-inline-start:4px}
.note{margin-top:14px;font-size:12.5px;color:var(--muted)}
.foot{text-align:center;margin-top:22px;display:flex;flex-direction:column;align-items:center;gap:8px}
.foot svg{height:46px;fill:var(--brown)}
.foot .no{font-family:"Alexandria";font-size:11px;letter-spacing:.4em;color:var(--muted)}
.foot p{font-size:14px;font-weight:500}
.foot .contact{font-size:12px;color:var(--muted)}
.acts{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
.acts button,.acts a{flex:1;min-width:130px;display:inline-flex;justify-content:center;align-items:center;gap:8px;padding:13px 16px;border-radius:999px;border:1px solid rgba(253,245,209,.35);background:transparent;color:var(--paper);font:inherit;font-size:14px;cursor:pointer;text-decoration:none}
.acts .pri{background:var(--copper);border-color:var(--copper);color:var(--esp);font-weight:700}
.acts svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
@media print{body{background:#fff;padding:0}.acts{display:none}.inv{box-shadow:none;border-radius:0}.inv::after{display:none}.wrap{max-width:none;width:120mm}@page{size:auto;margin:8mm}}
</style></head><body>
<div class="wrap">
  <article class="inv" id="inv">
    <header class="inv__top">
      <img src="assets/brand/badge.webp" alt="">
      <div><h1><?= $h($s['brand'] ?? 'طبلية') ?></h1><small>من مطبخ ماما رحاب</small></div>
      <div class="inv__tag"><b>INVOICE</b><span>#<?= $h($no) ?></span></div>
    </header>
    <div class="inv__body">
      <div class="meta">
        <div><small>التاريخ</small><b class="latin"><?= $h(date('d/m/Y · H:i', strtotime($o['at']))) ?></b></div>
        <div><small>نوع الطلب</small><b><?= $h($o['type']) ?></b></div>
        <?php if (!empty($o['day'])): ?><div><small>التسليم</small><span class="pill latin"><?= $h(date('d/m', strtotime($o['day']))) ?><?= !empty($o['slot']) ? ' · ' . $h($o['slot']) : '' ?></span></div><?php endif; ?>
        <div><small>العميل</small><b><?= $h($o['name']) ?></b></div>
        <?php if (!empty($o['phone'])): ?><div><small>الموبايل</small><b class="latin" dir="ltr" style="text-align:end"><?= $h($o['phone']) ?></b></div><?php endif; ?>
        <div><small>الحالة</small><b><?= $h($st) ?><?= $pay ? ' · مدفوع ' . $h($pay) : '' ?></b></div>
        <?php if (!empty($o['address'])): ?><div style="grid-column:1/-1"><small>العنوان</small><b><?= $h($o['address']) ?></b></div><?php endif; ?>
      </div>
      <hr class="dash">
      <table class="items">
        <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
        <tbody>
        <?php foreach ($o['items'] as $l): ?>
          <tr><td><?= $h($l['name']) ?><?= !empty($l['size']) ? ' <small style="color:var(--muted)">(' . $h($l['size']) . ')</small>' : '' ?></td><td class="q">× <?= (int)$l['qty'] ?></td><td class="p"><?= $n($l['price'] * $l['qty']) ?></td></tr>
        <?php endforeach; ?>
        </tbody>
      </table>
      <hr class="dash">
      <div class="sum">
        <?php if (!empty($o['discount']) || !empty($o['service']) || !empty($o['vat']) || !empty($o['delivery'])): ?>
          <div><span>المجموع</span><b class="latin"><?= $n($o['subtotal']) ?> EGP</b></div>
          <?php if (!empty($o['discount'])): ?><div class="disc"><span>خصم<?= !empty($o['coupon']) ? ' (' . $h($o['coupon']) . ')' : '' ?></span><b class="latin">− <?= $n($o['discount']) ?> EGP</b></div><?php endif; ?>
          <?php if (!empty($o['service'])): ?><div><span>خدمة</span><b class="latin"><?= $n($o['service']) ?> EGP</b></div><?php endif; ?>
          <?php if (!empty($o['vat'])): ?><div><span>ضريبة القيمة المضافة</span><b class="latin"><?= $n($o['vat']) ?> EGP</b></div><?php endif; ?>
          <?php if (!empty($o['delivery'])): ?><div><span>التوصيل<?= !empty($o['zone']) ? ' · ' . $h($o['zone']) : '' ?></span><b class="latin"><?= $n($o['delivery']) ?> EGP</b></div><?php endif; ?>
        <?php endif; ?>
      </div>
      <div class="total"><span>الإجمالي</span><b><?= $n($o['total']) ?><small>EGP</small></b></div>
      <?php if (!empty($o['notes'])): ?><p class="note">ملاحظات: <?= $h($o['notes']) ?></p><?php endif; ?>
      <div class="foot">
        <span class="no">ORDER <?= $h($no) ?></span>
        <p>بالهنا والشفا ✨ من مطبخ ماما رحاب لطبليتك</p>
        <span class="contact"><?= $h(trim(($s['whatsappDisplay'] ?? '') . ($s['address'] ? ' · ' . $s['address'] : ''))) ?></span>
      </div>
    </div>
  </article>
  <div class="acts">
    <button class="pri" id="saveImg" type="button"><svg viewBox="0 0 24 24"><path d="M12 4v12M6 11l6 6 6-6M4 20h16"/></svg><span>حفظ كصورة</span></button>
    <button id="doPrint" type="button"><svg viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/></svg>طباعة / PDF</button>
  </div>
</div>
<script src="assets/vendor/html2canvas.min.js"></script>
<script>
document.getElementById('doPrint').addEventListener('click', () => print());
document.getElementById('saveImg').addEventListener('click', async (ev) => {
  const btn = ev.currentTarget, label = btn.querySelector('span'), h2c = window.html2canvas && (window.html2canvas.default || window.html2canvas.html2canvas || window.html2canvas);
  if (typeof h2c !== 'function') { print(); return; }
  label.textContent = 'بيتجهز…'; btn.disabled = true;
  try {
    await document.fonts.ready;
    const canvas = await h2c(document.getElementById('inv'), { scale: 2, backgroundColor: '#140A04', useCORS: true });
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], 'invoice-<?= $h(preg_replace('/[^A-Za-z0-9]/', '', $no)) ?>.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'فاتورة #<?= $h($no) ?>' }); } catch (_) {} }
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  } catch (_) { print(); }
  label.textContent = 'حفظ كصورة'; btn.disabled = false;
});
<?php if (($_GET['print'] ?? '') === '1'): ?>window.addEventListener('load', () => setTimeout(() => print(), 400));<?php endif; ?>
</script>
</body></html>

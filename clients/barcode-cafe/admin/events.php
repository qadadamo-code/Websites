<?php
require __DIR__ . '/inc.php';
require_admin();
$events = bc_load('events');
usort($events, fn($a, $b) => strcmp($b['date'] . ($b['time'] ?? ''), $a['date'] . ($a['time'] ?? '')));
$t = today();
$up = array_values(array_filter($events, fn($e) => $e['date'] >= $t)); usort($up, fn($a, $b) => strcmp($a['date'], $b['date']));
$past = array_values(array_filter($events, fn($e) => $e['date'] < $t));
$tab = ($_GET['tab'] ?? '') === 'past' ? 'past' : 'up';
$list = $tab === 'past' ? $past : $up;
$months = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
admin_head('الفعاليات والدعوات', 'events', '<a class="b b--primary" href="event.php">' . icon('plus') . ' فعالية جديدة</a>');
?>
<p class="hint" style="margin-bottom:14px">كل فعالية لها صفحة دعوة خاصة برابط تقدر تبعته على واتساب أو تحطه في إنستجرام. الضيف يأكد حضوره ويطلع له كود دعوة، وكل التسجيلات بتظهر هنا.</p>
<nav class="tabs">
  <a href="?tab=up" class="<?= $tab === 'up' ? 'is-on' : '' ?>">القادمة <b><?= count($up) ?></b></a>
  <a href="?tab=past" class="<?= $tab === 'past' ? 'is-on' : '' ?>">السابقة <b><?= count($past) ?></b></a>
</nav>
<?php if (!$list): ?>
  <section class="card"><p class="empty"><?= $tab === 'up' ? 'لا توجد فعاليات قادمة. ' : 'لا توجد فعاليات سابقة.' ?><?php if ($tab === 'up'): ?><a href="event.php">أنشئ أول دعوة</a><?php endif; ?></p></section>
<?php endif; ?>
<div class="ev-list">
<?php foreach ($list as $ev): $n = event_rsvp_count($ev['id']); $cap = (int)($ev['capacity'] ?? 0); $link = '../event.php?e=' . rawurlencode($ev['slug']); ?>
  <article class="ev">
    <div class="ev__cover">
      <?php if (!empty($ev['cover'])): ?><img src="<?= e(src($ev['cover'])) ?>" alt=""><?php else: ?><?= icon('events') ?><?php endif; ?>
      <?php if (empty($ev['visible'])): ?><span class="st st--off">مخفية</span><?php elseif (isset($ev['rsvpOpen']) && !$ev['rsvpOpen']): ?><span class="st st--new">التسجيل مغلق</span><?php else: ?><span class="st st--on">منشورة</span><?php endif; ?>
      <div class="ev__date"><b class="latin"><?= (int)date('j', strtotime($ev['date'])) ?></b><small><?= $months[(int)date('n', strtotime($ev['date']))] ?></small></div>
    </div>
    <div class="ev__body">
      <h3><?= e($ev['title']) ?></h3>
      <p><?= e(trim(($ev['time'] ? $ev['time'] . ' · ' : '') . ($ev['place'] ?? ''), ' ·')) ?></p>
      <p><b style="color:var(--paper)"><?= $n ?></b> ضيف مسجّل<?= $cap ? ' من ' . $cap : '' ?></p>
      <?php if ($cap): ?><div class="ev__meter"><i style="width:<?= min(100, round($n / $cap * 100)) ?>%"></i></div><?php endif; ?>
    </div>
    <div class="ev__foot">
      <a class="b b--sm" href="event.php?id=<?= e($ev['id']) ?>"><?= icon('edit') ?> إدارة</a>
      <a class="b b--sm" href="<?= e($link) ?>" target="_blank"><?= icon('eye') ?> معاينة</a>
      <button class="b b--sm" data-copy-abs="<?= e($link) ?>" data-copy=""><?= icon('copy') ?> نسخ الرابط</button>
      <a class="b b--sm" data-wa-share="<?= e($link) ?>" data-text="<?= e('دعوة: ' . $ev['title']) ?>" href="#" target="_blank"><?= icon('wa') ?> واتساب</a>
    </div>
  </article>
<?php endforeach; ?>
</div>
<?php admin_foot();

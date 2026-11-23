<?php
/** Size chart (guide measurements in cm), shared by the size guide page and the product page modal. */
$rows = [['XS', '32–34', '80–84', '62–66', '88–92'], ['S', '36', '85–88', '67–70', '93–96'], ['M', '38', '89–92', '71–74', '97–100'], ['L', '40', '93–97', '75–79', '101–105'],
    ['XL', '42', '98–102', '80–84', '106–110'], ['2XL', '44', '103–108', '85–90', '111–116'], ['3XL', '46', '109–114', '91–96', '117–122'], ['4XL', '48', '115–120', '97–102', '123–128']];
$shoes = [['36', '23,0'], ['37', '23,7'], ['38', '24,3'], ['39', '25,0'], ['40', '25,7'], ['41', '26,3']];
?>
<h2 class="h2" style="font-size:clamp(30px,3vw,44px);margin-bottom:12px"><?= t('size.title') ?></h2>
<p class="muted"><?= t('size.lead') ?></p>
<div class="tbl-wrap" style="margin:20px 0"><table class="tbl"><thead><tr><th><?= t('size.int') ?></th><th><?= t('size.eu') ?></th><th><?= t('size.bust') ?> (cm)</th><th><?= t('size.waist') ?> (cm)</th><th><?= t('size.hip') ?> (cm)</th></tr></thead>
<tbody><?php foreach ($rows as $r): ?><tr><?php foreach ($r as $i => $c): ?><td><?= $i === 0 ? '<b>' . e($c) . '</b>' : e($c) ?></td><?php endforeach; ?></tr><?php endforeach; ?></tbody></table></div>
<h3 style="font-size:22px;margin:26px 0 10px"><?= t('size.shoes') ?></h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>EU</th><?php foreach ($shoes as $s2): ?><th><?= e($s2[0]) ?></th><?php endforeach; ?></tr></thead><tbody><tr><td><?= lang() === 'en' ? 'Foot (cm)' : 'Fot (cm)' ?></td><?php foreach ($shoes as $s2): ?><td><?= e($s2[1]) ?></td><?php endforeach; ?></tr></tbody></table></div>
<p style="margin-top:18px"><?= t('size.help') ?> <a class="link" href="boka.php"><?= t('nav.book') ?></a></p>

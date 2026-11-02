<?php
require __DIR__ . '/inc/bootstrap.php';
$pageTitle = t('privacy');
$pageClass = 'page-prose';
$noPreloader = true;
$ar = LANG === 'ar';
$email = setting('email');
require __DIR__ . '/inc/header.php';
?>
<article class="prose">
  <p class="eyebrow"><span class="line"></span><?= t('policies') ?></p>
  <h1><?= t('privacy') ?></h1>
  <?php if ($ar): ?>
  <p>في إليجانس بوتيك، خصوصيتك تهمنا. السياسة دي بتوضح البيانات اللي بنجمعها لما تزوري الموقع أو تطلبي منه، وإزاي بنستخدمها.</p>
  <h2>البيانات اللي بنجمعها</h2>
  <ul><li>بيانات الطلب: الاسم، رقم الموبايل، العنوان، والبريد الإلكتروني لو كتبتيه.</li><li>صورة إيصال التحويل لو اخترتي إنستاباي أو فودافون كاش.</li><li>بيانات تقنية بسيطة زي نوع الجهاز والمتصفح لتحسين تجربة الموقع.</li></ul>
  <h2>بنستخدمها في إيه</h2>
  <ul><li>تجهيز طلبك وتوصيله والتواصل معاكِ بخصوصه.</li><li>الرد على استفساراتك وخدمة ما بعد البيع والضمان.</li><li>إرسال العروض والقطع الجديدة لو اشتركتي في النشرة، وتقدري تلغي في أي وقت.</li></ul>
  <h2>مشاركة البيانات</h2>
  <p>مش بنبيع أو نأجر بياناتك لأي جهة. بنشارك فقط اللازم مع شركة الشحن عشان توصل طلبك.</p>
  <h2>حقوقك</h2>
  <p>من حقك تطلبي نسخة من بياناتك أو تعديلها أو مسحها في أي وقت.</p>
  <?php else: ?>
  <p>At Elegance Boutique your privacy matters. This policy explains what we collect when you visit or order, and how we use it.</p>
  <h2>What we collect</h2>
  <ul><li>Order details: name, mobile, address and email if provided.</li><li>Your transfer receipt if you pay by InstaPay or Vodafone Cash.</li><li>Basic technical data such as device and browser type to improve the site.</li></ul>
  <h2>How we use it</h2>
  <ul><li>To prepare, deliver and follow up on your order.</li><li>To answer questions and provide after-sales and warranty service.</li><li>To send new pieces and offers if you subscribe — unsubscribe any time.</li></ul>
  <h2>Sharing</h2>
  <p>We never sell or rent your data. We share only what the courier needs to deliver your order.</p>
  <h2>Your rights</h2>
  <p>You may request a copy of your data, a correction, or deletion at any time.</p>
  <?php endif; ?>
  <?php if ($email): ?><p><?= $ar ? 'للتواصل:' : 'Contact:' ?> <a href="mailto:<?= e($email) ?>" style="color:var(--gold-deep)"><?= e($email) ?></a></p><?php endif; ?>
</article>
<?php require __DIR__ . '/inc/footer.php'; ?>

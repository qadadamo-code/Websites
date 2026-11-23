<?php
require __DIR__ . '/inc/layout.php';
$s = settings(); $en = lang() === 'en';
site_head(t('nav.terms'), ['page' => 'terms']);
$sv = [
 ['Allmänt', 'Dessa villkor gäller för beställningar via ateljedantel.se. Webbutiken drivs av Ateljé Dantel, ' . $s['address'] . ', ' . $s['city'] . '. Kontakt: ' . $s['email'] . ', ' . $s['phone'] . '.'],
 ['Priser', 'Alla priser anges i svenska kronor inklusive moms. Eventuell fraktkostnad visas i kassan innan du skickar din beställning.'],
 ['Beställning', 'När du skickar en beställning får du en bekräftelse via e-post. Beställningen är bindande först när vi har bekräftat lagerstatus och leveranstid. Många plagg är unika exemplar – om ett plagg hunnit säljas i butiken kontaktar vi dig.'],
 ['Betalning', 'Du betalar med Swish, banköverföring' . (!empty($s['pay']['stripe']['on']) ? ', kort via betallänk' : '') . ' eller i butiken vid upphämtning. Betalningsuppgifter skickas i orderbekräftelsen. Varan skickas eller reserveras när betalningen är mottagen.'],
 ['Beställningsvara', 'Plagg märkta Beställningsvara beställs hem från leverantören i din storlek och färg. Vi meddelar leveranstid innan du betalar.'],
 ['Leverans och upphämtning', 'Du kan hämta din order kostnadsfritt i butiken i MVG-gallerian eller få den skickad med PostNord. ' . tr($s['shipping']['note'] ?? '')],
 ['Ångerrätt', 'Enligt distansavtalslagen har du 14 dagars ångerrätt från att du tagit emot varan. Plagget ska vara oanvänt med etiketter kvar. Ångerrätten gäller inte plagg som ändrats, sytts om eller tillverkats efter dina mått. Du står för returfrakten. Återbetalning sker inom 14 dagar från att vi mottagit returen.'],
 ['Reklamation', 'Du har rätt att reklamera fel på varan enligt konsumentköplagen i tre år. Kontakta oss så snart som möjligt efter att du upptäckt felet. Provexemplar och plagg med beskrivna defekter säljs med hänsyn till det och kan inte reklameras för det beskrivna felet.'],
 ['Personuppgifter', 'Vi behandlar dina personuppgifter enligt dataskyddsförordningen (GDPR) och endast för att hantera din beställning, bokning eller förfrågan. Prenumererar du på nyhetsbrevet kan du när som helst avsluta. Du har rätt att begära utdrag, rättelse eller radering genom att kontakta oss.'],
 ['Tvister', 'Vid en tvist följer vi Allmänna reklamationsnämndens (ARN) rekommendationer.'],
];
$enT = [
 ['General', 'These terms apply to orders placed via ateljedantel.se. The online shop is run by Ateljé Dantel, ' . $s['address'] . ', ' . $s['city'] . '. Contact: ' . $s['email'] . ', ' . $s['phone'] . '.'],
 ['Prices', 'All prices are in Swedish kronor including VAT. Any shipping cost is shown at checkout before you place your order.'],
 ['Orders', 'When you place an order you receive a confirmation by email. The order becomes binding once we have confirmed stock and delivery time. Many pieces are one of a kind – if an item has just been sold in store, we will contact you.'],
 ['Payment', 'You pay by Swish, bank transfer' . (!empty($s['pay']['stripe']['on']) ? ', card via payment link' : '') . ' or in store on collection. Payment details are sent in the order confirmation. Items are shipped or reserved once payment has been received.'],
 ['Made to order', 'Items marked Made to order are ordered from the supplier in your size and colour. We tell you the delivery time before you pay.'],
 ['Delivery and collection', 'You can collect your order free of charge in store at MVG-gallerian or have it sent with PostNord. ' . tr($s['shipping']['note'] ?? '')],
 ['Right of withdrawal', 'Under the Swedish Distance Contracts Act you have a 14-day right of withdrawal from receiving the item. It must be unused with tags attached. The right does not apply to items that have been altered or made to your measurements. You pay the return shipping. Refunds are made within 14 days of us receiving the return.'],
 ['Complaints', 'You may complain about faulty goods under the Consumer Sales Act for three years. Contact us as soon as possible after discovering the fault. Sample pieces and items with described flaws are priced accordingly and cannot be returned for the described flaw.'],
 ['Personal data', 'We process your personal data in accordance with the GDPR and only to handle your order, booking or enquiry. You can unsubscribe from the newsletter at any time and ask for access, correction or deletion by contacting us.'],
 ['Disputes', 'In the event of a dispute we follow the recommendations of the National Board for Consumer Disputes (ARN).'],
];
?>
<section class="ph wrap"><nav class="crumbs"><a href="./"><?= t('nav.home') ?></a><span><?= t('nav.terms') ?></span></nav><h1 class="h1" data-lines><?= $en ? 'Terms & privacy' : 'Köpvillkor & integritet' ?></h1></section>
<section class="wrap prose" style="padding-bottom:100px"><?php foreach ($en ? $enT : $sv as [$h, $p]): ?><h2><?= e($h) ?></h2><p><?= e($p) ?></p><?php endforeach; ?></section>
<?php site_foot(); ?>

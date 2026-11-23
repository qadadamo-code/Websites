# -*- coding: utf-8 -*-
"""All facts and copy for alashi.se (Swedish primary, English secondary).
Facts come from the old alashi.se (Wayback snapshots 2021-2025). Nothing here is invented:
no prices, no turnaround times, no opening hours until the owner confirms them."""

BIZ = {
    "name": "Alashi",
    "legal": "Alashi Skrädderi Skomakeri och Kemtvätt AB",
    "orgnr": "559256-1905",
    "street": "Nygatan 22",
    "zip": "903 27",
    "city": "Umeå",
    "region": "Västerbottens län",
    "country": "SE",
    "phone_display": "073-823 00 03",
    "phone_e164": "+46738230003",
    "email": "info@alashi.se",
    "founded": "2013-08",
    "domain": "https://alashi.se",
    "maps": "https://www.google.com/maps/search/?api=1&query=Alashi+Nygatan+22+903+27+Ume%C3%A5",
    "maps_embed": "https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=16&q=Nygatan+22,+903+27+Ume%C3%A5",
    # Fill in when the owner confirms, e.g. [("Mo-Fr","10:00","18:00"),("Sa","11:00","15:00")]
    "hours": [],
}

# ---------------------------------------------------------------- services
SERVICES = [
    {
        "key": "skomakeri",
        "icon": "shoe",
        "slug": {"sv": "skomakare-umea", "en": "shoe-repair-umea"},
        "old": ["services/skomakeri-nyckelservice", "services/skomakeri"],
        "name": {"sv": "Skomakeri", "en": "Shoe repair"},
        "title": {
            "sv": "Skomakare i Umeå – skolagning, halvsulning & klackning | Alashi",
            "en": "Shoe repair in Umeå – resoling, heels & boots | Alashi",
        },
        "desc": {
            "sv": "Skomakare mitt i Umeå på Nygatan 22. Halvsulning av randsydda skor, klackbyte, sulning, sömmar och ombottning av ridstövlar. Över 30 års erfarenhet – välkommen in!",
            "en": "Cobbler in central Umeå (Nygatan 22). Resoling of Goodyear-welted shoes, heel replacement, stitching and riding boot repairs. Over 30 years of experience.",
        },
        "h1": {"sv": "Skomakare i Umeå", "en": "Shoe repair in Umeå"},
        "kicker": {"sv": "Skolagning · Halvsulning · Klackning", "en": "Resoling · Heels · Stitching"},
        "lead": {
            "sv": "Har dina favoritskor blivit slitna eller gått sönder? Hos oss på Nygatan 22 får du hjälp av skomakare med över 30 års erfarenhet – och ärliga råd om vad som lönar sig att laga.",
            "en": "Have your favourite shoes worn out or broken? At Nygatan 22 you get help from cobblers with more than 30 years of experience – and honest advice on what is worth repairing.",
        },
        "short": {
            "sv": "Halvsulning, klackbyte, sömmar och ridstövlar – med noggrannhet och bästa material.",
            "en": "Resoling, heels, stitching and riding boots – done carefully with the best materials.",
        },
        "items": {
            "sv": [
                ("Halvsulning av randsydda skor", "Vår specialitet. Vi byter slitna sulor på kvalitetsskor så att de håller i många år till."),
                ("Klackbyte & klackning", "Nya klackar och klacklappar på dam- och herrskor, kängor och stövlar."),
                ("Sulning & sulskydd", "Hela eller halva sulor, gummisulor och skydd som förlänger livet på nya skor."),
                ("Lagning av sömmar", "Uppsprättade sömmar och lösa partier sys ihop för hand eller maskin."),
                ("Ombottning av ridstövlar", "Vi är specialiserade på att bottna om ridstövlar så att de känns som nya."),
                ("Ändringar & reparationer", "Alla typer av skoreparationer – fråga oss, så tittar vi på dina skor."),
            ],
            "en": [
                ("Resoling of welted shoes", "Our speciality. We replace worn soles on quality shoes so they last for many more years."),
                ("Heel replacement", "New heels and heel tips for women's and men's shoes, boots and ankle boots."),
                ("Soles & sole protectors", "Full or half soles, rubber soles and protectors that extend the life of new shoes."),
                ("Stitching repairs", "Split seams and loose parts sewn back together by hand or machine."),
                ("Riding boot repairs", "We specialise in re-bottoming riding boots so they feel like new."),
                ("Alterations & repairs", "All kinds of shoe repairs – just ask and we will take a look."),
            ],
        },
        "body": {
            "sv": [
                ("Laga i stället för att köpa nytt", "Ett par välgjorda skor kan hålla i decennier om de får rätt omvårdnad. En halvsulning eller ett klackbyte kostar en bråkdel av ett nytt par, och det är bättre för både plånboken och miljön. Vi använder bara material av hög kvalitet och arbetar med noggrannhet i varje steg."),
                ("Specialister på randsydda skor och ridstövlar", "Randsydda skor går att sula om gång på gång – om jobbet görs rätt. Det är ett hantverk vi har arbetat med i över 30 år. Vi gör även ombottning av ridstövlar, ett jobb som kräver erfarenhet och rätt verktyg."),
            ],
            "en": [
                ("Repair instead of buying new", "A pair of well-made shoes can last for decades with the right care. Resoling or new heels cost a fraction of a new pair – better for your wallet and for the planet. We only use high-quality materials and work carefully at every step."),
                ("Specialists in welted shoes and riding boots", "Goodyear-welted shoes can be resoled again and again – if the job is done right. It is a craft we have practised for more than 30 years. We also re-bottom riding boots, a job that requires experience and the right tools."),
            ],
        },
        "faq": {
            "sv": [
                ("Behöver jag boka tid för skolagning?", "Nej. Kom in till butiken på Nygatan 22 med dina skor, så tittar vi på dem direkt och berättar vad som behöver göras."),
                ("Vad kostar det att halvsula eller byta klack?", "Priset beror på skorna och vilket material som behövs. Du får alltid ett pris av oss innan vi börjar arbeta."),
                ("Hur lång tid tar en skoreparation?", "Det beror på jobbet. När du lämnar in skorna får du besked om när de är klara att hämta."),
                ("Lagar ni ridstövlar?", "Ja, vi är specialiserade på ombottning och reparation av ridstövlar."),
            ],
            "en": [
                ("Do I need an appointment for shoe repair?", "No. Bring your shoes to our shop at Nygatan 22 and we will look at them right away and tell you what is needed."),
                ("How much does resoling or a new heel cost?", "It depends on the shoes and the material needed. You always get a price from us before we start."),
                ("How long does a shoe repair take?", "It depends on the job. When you drop off your shoes we tell you when they will be ready."),
                ("Do you repair riding boots?", "Yes, we specialise in re-bottoming and repairing riding boots."),
            ],
        },
    },
    {
        "key": "skradderi",
        "icon": "needle",
        "slug": {"sv": "skraddare-umea", "en": "tailor-umea"},
        "old": ["services/skradderi"],
        "name": {"sv": "Skrädderi", "en": "Tailoring"},
        "title": {
            "sv": "Skräddare i Umeå – ändringssömnad & lagning av kläder | Alashi",
            "en": "Tailor in Umeå – alterations & clothing repairs | Alashi",
        },
        "desc": {
            "sv": "Skrädderi på Nygatan 22 i Umeå. Ändringssömnad, uppläggning, byte av dragkedja, brudklänningar, balklänningar, kostymer, skinnkläder och gardiner. Välkommen in!",
            "en": "Tailor at Nygatan 22, Umeå. Alterations, hemming, zipper replacement, wedding and prom dresses, suits, leather garments and curtains. Walk in any time we are open.",
        },
        "h1": {"sv": "Skräddare i Umeå", "en": "Tailor in Umeå"},
        "kicker": {"sv": "Ändringssömnad · Lagning · Dragkedjor", "en": "Alterations · Repairs · Zippers"},
        "lead": {
            "sv": "Behöver din favoritjacka en ny dragkedja? Ska balklänningen kortas eller kostymen sitta perfekt till den stora dagen? Vårt skrädderi gör alla typer av sömnändringar och lagningar.",
            "en": "Does your favourite jacket need a new zipper? Should the prom dress be shortened, or the suit fit perfectly for the big day? Our tailors handle every kind of alteration and repair.",
        },
        "short": {
            "sv": "Ändringssömnad, uppläggning, dragkedjor, festklänningar, kostymer och skinn.",
            "en": "Alterations, hemming, zippers, formal dresses, suits and leather.",
        },
        "items": {
            "sv": [
                ("Uppläggning & kortning", "Byxor, jeans, kjolar, klänningar och ärmar – kortade och snyggt avslutade."),
                ("Byte av dragkedja", "Ny dragkedja i jackor, byxor, klänningar och väskor."),
                ("Brud- och festklänningar", "Ändringar av brudklänningar, balklänningar och festklänningar inför den stora dagen."),
                ("Kostymer & dräkter", "Inlägg, utlägg och justeringar så att kostymen eller dräkten sitter perfekt."),
                ("Skinn- och läderkläder", "Ändring och lagning av skinnjackor och andra läderplagg."),
                ("Gardiner & lagningar", "Kortning av gardiner, lagning av hål, revor och sömmar."),
            ],
            "en": [
                ("Hemming & shortening", "Trousers, jeans, skirts, dresses and sleeves – shortened and neatly finished."),
                ("Zipper replacement", "New zippers in jackets, trousers, dresses and bags."),
                ("Wedding & formal dresses", "Alterations of wedding dresses, prom dresses and evening gowns."),
                ("Suits & costumes", "Taking in, letting out and adjusting so your suit fits perfectly."),
                ("Leather garments", "Alterations and repairs of leather jackets and other leather clothing."),
                ("Curtains & mending", "Shortening curtains, mending holes, tears and seams."),
            ],
        },
        "body": {
            "sv": [
                ("Kläder som sitter som de ska", "Ett plagg som sitter rätt känns som nytt. Våra skräddare har över 30 års erfarenhet av att sy och ändra allt från vardagsjeans till korsetter, brudklänningar och kostymer. Vi provar, mäter och nålar – och syr med omsorg."),
                ("Inför bal, bröllop och fest", "Är det dags för balen eller bröllopet? Kom in i god tid så hjälper vi dig att få klänningen eller kostymen att sitta perfekt. Vi gör ändringar på festklänningar, brudklänningar, dräkter och kostymer."),
            ],
            "en": [
                ("Clothes that fit the way they should", "A garment that fits right feels like new. Our tailors have more than 30 years of experience sewing and altering everything from everyday jeans to corsets, wedding dresses and suits. We fit, measure and pin – and sew with care."),
                ("Before the prom, wedding or party", "Prom or wedding coming up? Come in early and we will make your dress or suit fit perfectly. We alter formal dresses, wedding dresses, costumes and suits."),
            ],
        },
        "faq": {
            "sv": [
                ("Kan jag lämna in kläder för ändring utan att boka?", "Ja, kom in till oss på Nygatan 22. Vid ändringar som kräver provning nålar vi plagget direkt i butiken."),
                ("Byter ni dragkedja i jackor?", "Ja, vi byter dragkedjor i jackor, byxor, klänningar och mycket mer."),
                ("Ändrar ni brudklänningar och balklänningar?", "Ja. Kom gärna in i god tid före bröllopet eller balen så att vi hinner med provning."),
                ("Vad kostar en ändring?", "Det beror på plagget och jobbet. Du får ett pris när vi har sett plagget."),
            ],
            "en": [
                ("Can I drop off clothes without an appointment?", "Yes, just come to Nygatan 22. For alterations that need a fitting, we pin the garment right there in the shop."),
                ("Do you replace zippers in jackets?", "Yes, we replace zippers in jackets, trousers, dresses and much more."),
                ("Do you alter wedding and prom dresses?", "Yes. Please come in well before the wedding or prom so there is time for a fitting."),
                ("How much does an alteration cost?", "It depends on the garment and the job. You get a price once we have seen it."),
            ],
        },
    },
    {
        "key": "kemtvatt",
        "icon": "hanger",
        "slug": {"sv": "kemtvatt-umea", "en": "dry-cleaning-umea"},
        "old": ["services/kemtvatt"],
        "name": {"sv": "Kemtvätt", "en": "Dry cleaning"},
        "title": {
            "sv": "Kemtvätt i Umeå – skjortor, mattor, gardiner & skinn | Alashi",
            "en": "Dry cleaning in Umeå – shirts, rugs, curtains & leather | Alashi",
        },
        "desc": {
            "sv": "Kemtvätt på Nygatan 22 i Umeå för privatpersoner och företag. Kemtvätt, vittvätt, skjortor, mattor, gardiner och skinn – med miljövänliga maskiner. Lämna in i butiken!",
            "en": "Dry cleaning at Nygatan 22, Umeå, for private customers and businesses: dry cleaning, laundry, shirts, rugs, curtains and leather, using eco-friendly machines.",
        },
        "h1": {"sv": "Kemtvätt i Umeå", "en": "Dry cleaning in Umeå"},
        "kicker": {"sv": "Kemtvätt · Skjortor · Mattor · Gardiner", "en": "Dry cleaning · Shirts · Rugs · Curtains"},
        "lead": {
            "sv": "Har du svåra fläckar som inte går bort i tvättmaskinen? En matta som inte ser så fräsch ut längre? Lämna in hos oss – vi tar emot alla typer av kläder och material.",
            "en": "Stubborn stains that will not come out in the washing machine? A rug that is no longer fresh? Drop it off with us – we accept all kinds of garments and materials.",
        },
        "short": {
            "sv": "Kemtvätt, vittvätt, skjortor, mattor, gardiner och skinn – för privat och företag.",
            "en": "Dry cleaning, laundry, shirts, rugs, curtains and leather – for homes and businesses.",
        },
        "items": {
            "sv": [
                ("Kemtvätt", "Kostymer, dräkter, klänningar, kappor och ömtåliga plagg som inte tål vanlig tvätt."),
                ("Skjortor", "Tvättade och pressade skjortor – för vardag, jobb och fest."),
                ("Mattvätt", "Vi gör din matta fräsch igen."),
                ("Gardiner", "Tvätt av gardiner och textilier från hemmet."),
                ("Skinn & läder", "Rengöring av skinnplagg som kräver varsam behandling."),
                ("Vittvätt & företag", "Vittvätt och tvätt för både privatpersoner och företag."),
            ],
            "en": [
                ("Dry cleaning", "Suits, costumes, dresses, coats and delicate garments that cannot be washed normally."),
                ("Shirts", "Washed and pressed shirts – for everyday, work and parties."),
                ("Rug cleaning", "We make your rug fresh again."),
                ("Curtains", "Cleaning of curtains and home textiles."),
                ("Leather & suede", "Cleaning of leather garments that need careful treatment."),
                ("Laundry & business", "Laundry for both private customers and businesses."),
            ],
        },
        "body": {
            "sv": [
                ("Professionella metoder, miljövänliga maskiner", "Våra medarbetare har arbetat med kemtvätt i många år och använder professionella metoder. Tillsammans med våra miljövänliga tvättmaskiner ger det ett snabbt, effektivt och fint resultat."),
                ("För privatpersoner och företag", "Våra kunder är både privatpersoner och företag. Vi tar emot alla typer av kläder och material – från skjortor och vittvätt till mattor, gardiner och skinn. Välkommen in till butiken för att lämna in!"),
            ],
            "en": [
                ("Professional methods, eco-friendly machines", "Our staff have worked with dry cleaning for many years using professional methods. Together with our eco-friendly machines, that means fast, efficient and beautiful results."),
                ("For homes and businesses", "Our customers are both private individuals and companies. We accept all kinds of garments and materials – from shirts and laundry to rugs, curtains and leather. Welcome to drop off at the shop!"),
            ],
        },
        "faq": {
            "sv": [
                ("Tar ni emot mattor och gardiner?", "Ja, vi tvättar både mattor och gardiner. Lämna in dem i butiken på Nygatan 22."),
                ("Kan företag lämna tvätt hos er?", "Ja, vi har både privatpersoner och företag som kunder. Kontakta oss så berättar vi mer."),
                ("Får ni bort svåra fläckar?", "Vi har lång erfarenhet av fläckborttagning med professionella metoder. Berätta gärna vad fläcken kommer från när du lämnar in plagget."),
                ("Är er kemtvätt miljövänlig?", "Vi använder miljövänliga tvättmaskiner och professionella metoder."),
            ],
            "en": [
                ("Do you clean rugs and curtains?", "Yes, we clean both rugs and curtains. Drop them off at the shop on Nygatan 22."),
                ("Can businesses use your laundry service?", "Yes, our customers include both private individuals and companies. Contact us to learn more."),
                ("Can you remove stubborn stains?", "We have long experience removing stains with professional methods. Tell us what caused the stain when you drop off the garment."),
                ("Is your dry cleaning eco-friendly?", "We use eco-friendly washing machines and professional methods."),
            ],
        },
    },
    {
        "key": "nyckel",
        "icon": "key",
        "slug": {"sv": "nyckelkopiering-umea", "en": "key-cutting-umea"},
        "old": ["services/nyckelservice"],
        "name": {"sv": "Nyckelservice", "en": "Key cutting"},
        "title": {
            "sv": "Nyckelkopiering i Umeå – kopiera nycklar direkt | Alashi",
            "en": "Key cutting in Umeå – copies while you wait | Alashi",
        },
        "desc": {
            "sv": "Nyckelkopiering och nyckelservice på Nygatan 22 i Umeå. Vi kopierar nycklar – även trasiga – med speciella maskiner och erfarna medarbetare. Välkommen in!",
            "en": "Key cutting and key service at Nygatan 22, Umeå. We copy keys – even broken ones – with dedicated machines and experienced staff.",
        },
        "h1": {"sv": "Nyckelkopiering i Umeå", "en": "Key cutting in Umeå"},
        "kicker": {"sv": "Kopiering · Reparation · Trasiga nycklar", "en": "Copies · Repairs · Broken keys"},
        "lead": {
            "sv": "Behöver du en extranyckel, eller göra en kopia på en trasig nyckel? Vi hjälper dig – välkommen in till butiken på Nygatan 22.",
            "en": "Need a spare key, or a copy of a broken key? We can help – welcome to our shop at Nygatan 22.",
        },
        "short": {
            "sv": "Kopiering av nycklar – även trasiga – med speciella maskiner.",
            "en": "Key copies – even from broken keys – on dedicated machines.",
        },
        "items": {
            "sv": [
                ("Nyckelkopiering", "Extranycklar till hemmet, förrådet, brevlådan eller jobbet."),
                ("Kopia av trasig nyckel", "Har nyckeln gått av? Ta med delarna så hjälper vi dig."),
                ("Reparation av nycklar", "Går nyckeln att laga, så lagar vi den."),
                ("Rådgivning", "Osäker på om din nyckel går att kopiera? Ta med den så tittar vi."),
            ],
            "en": [
                ("Key copies", "Spare keys for your home, storage, mailbox or workplace."),
                ("Copy of a broken key", "Has your key snapped? Bring the pieces and we will help."),
                ("Key repairs", "If your key can be repaired, we repair it."),
                ("Advice", "Not sure if your key can be copied? Bring it in and we will check."),
            ],
        },
        "body": {
            "sv": [
                ("Vi underlättar din vardag", "Eftersom vi vill underlätta din vardag har vi öppnat vår egen nyckelservice. Vi har speciella maskiner och erfarna medarbetare som hjälper dig med kopiering och reparation av nycklar."),
                ("Allt på ett ställe", "Kombinera ärendet: lämna in skorna hos skomakaren, kläderna på kemtvätt och kopiera nyckeln – allt på samma ställe, mitt i Umeå."),
            ],
            "en": [
                ("Making everyday life easier", "Because we want to make your everyday life easier, we opened our own key service. We have dedicated machines and experienced staff to help with copying and repairing keys."),
                ("Everything in one place", "Combine your errands: leave your shoes with the cobbler, your clothes at the dry cleaner and copy your key – all in one place in central Umeå."),
            ],
        },
        "faq": {
            "sv": [
                ("Kan ni kopiera en trasig nyckel?", "Ja, ta med alla delar av nyckeln så hjälper vi dig att göra en kopia."),
                ("Behöver jag boka tid för nyckelkopiering?", "Nej, kom in till butiken på Nygatan 22."),
                ("Vilka nycklar kan ni kopiera?", "Ta med nyckeln så berättar vi direkt om vi kan kopiera den."),
            ],
            "en": [
                ("Can you copy a broken key?", "Yes, bring all the pieces of the key and we will help you make a copy."),
                ("Do I need an appointment for key cutting?", "No, just come to the shop at Nygatan 22."),
                ("Which keys can you copy?", "Bring the key and we will tell you right away if we can copy it."),
            ],
        },
    },
]

# ---------------------------------------------------------------- UI strings
T = {
    "sv": {
        "lang": "sv", "locale": "sv_SE", "other": "en",
        "nav_services": "Tjänster", "nav_about": "Om oss", "nav_contact": "Kontakt",
        "call": "Ring oss", "directions": "Hitta hit", "readmore": "Läs mer", "home": "Hem",
        "skip": "Hoppa till innehållet", "menu": "Meny", "close": "Stäng",
        "langname": "Svenska", "switch": "English",
        "tagline": "Skrädderi · Skomakeri · Nyckelservice · Kemtvätt",
        "since": "I Umeå sedan 2013",
        "address": "Adress", "phone": "Telefon", "email": "E-post", "hours": "Öppettider",
        "hours_tbd": "Ring oss för aktuella öppettider.",
        "days": {"Mo": "Måndag", "Tu": "Tisdag", "We": "Onsdag", "Th": "Torsdag", "Fr": "Fredag", "Sa": "Lördag", "Su": "Söndag", "Mo-Fr": "Måndag–fredag"},
        "map_btn": "Visa karta", "map_note": "Kartan laddas från Google när du klickar.",
        "faq": "Vanliga frågor", "services_all": "Alla tjänster",
        "what": "Det här hjälper vi dig med", "how": "Så går det till",
        "steps": [("Lämna in", "Kom in till butiken på Nygatan 22 – ingen tidsbokning behövs."), ("Vi bedömer", "Vi tittar på jobbet, ger råd och berättar vad det kostar innan vi börjar."), ("Hämta", "Du får besked om när det är klart. Hämta och gå därifrån nöjd.")],
        "cta_h": "Välkommen in till oss på Nygatan 22",
        "cta_p": "Ta med det som behöver lagas, tvättas eller kopieras. Vi tittar på det direkt.",
        "other_services": "Fler tjänster hos Alashi",
        "footer_about": "Skrädderi, skomakeri, nyckelservice och kemtvätt mitt i Umeå sedan 2013. Ett team med över 30 års erfarenhet.",
        "privacy": "Integritetspolicy", "rights": "Alla rättigheter förbehållna.",
        "made": "Webbplats av",
        "notfound_h": "Sidan kunde inte hittas", "notfound_p": "Sidan du letar efter finns inte längre. Här är vägen tillbaka.",
        "intro_sub": "Skrädderi · Skomakeri · Nyckel · Kemtvätt",
    },
    "en": {
        "lang": "en", "locale": "en_GB", "other": "sv",
        "nav_services": "Services", "nav_about": "About", "nav_contact": "Contact",
        "call": "Call us", "directions": "Directions", "readmore": "Read more", "home": "Home",
        "skip": "Skip to content", "menu": "Menu", "close": "Close",
        "langname": "English", "switch": "Svenska",
        "tagline": "Tailoring · Shoe repair · Key cutting · Dry cleaning",
        "since": "In Umeå since 2013",
        "address": "Address", "phone": "Phone", "email": "Email", "hours": "Opening hours",
        "hours_tbd": "Call us for current opening hours.",
        "days": {"Mo": "Monday", "Tu": "Tuesday", "We": "Wednesday", "Th": "Thursday", "Fr": "Friday", "Sa": "Saturday", "Su": "Sunday", "Mo-Fr": "Monday–Friday"},
        "map_btn": "Show map", "map_note": "The map loads from Google when you click.",
        "faq": "Frequently asked questions", "services_all": "All services",
        "what": "What we can help you with", "how": "How it works",
        "steps": [("Drop off", "Come to our shop at Nygatan 22 – no appointment needed."), ("We assess", "We look at the job, give advice and tell you the price before we start."), ("Pick up", "We tell you when it is ready. Collect it and leave happy.")],
        "cta_h": "Welcome to our shop on Nygatan 22",
        "cta_p": "Bring whatever needs repairing, cleaning or copying. We will take a look right away.",
        "other_services": "More services at Alashi",
        "footer_about": "Tailoring, shoe repair, key cutting and dry cleaning in central Umeå since 2013. A team with more than 30 years of experience.",
        "privacy": "Privacy policy", "rights": "All rights reserved.",
        "made": "Website by",
        "notfound_h": "Page not found", "notfound_p": "The page you are looking for no longer exists. Here is the way back.",
        "intro_sub": "Tailoring · Shoes · Keys · Dry cleaning",
    },
}

PAGES = {  # non-service page slugs
    "home": {"sv": "", "en": ""},
    "about": {"sv": "om-oss", "en": "about"},
    "contact": {"sv": "kontakt", "en": "contact"},
    "privacy": {"sv": "integritetspolicy", "en": "privacy"},
}

HOME = {
    "sv": {
        "title": "Alashi – Skomakare, skräddare & kemtvätt i Umeå | Nygatan 22",
        "desc": "Alashi på Nygatan 22 i Umeå: skomakeri, skrädderi, ändringssömnad, kemtvätt och nyckelkopiering under ett tak. Över 30 års erfarenhet. Ingen tidsbokning – välkommen in!",
        "eyebrow": "Nygatan 22 · Umeå",
        "h1a": "Skomakare, skräddare",
        "h1b": "& kemtvätt i Umeå",
        "lead": "Vi lagar skor, ändrar kläder, tvättar det som inte går i maskinen och kopierar dina nycklar – allt under ett tak, mitt i centrala Umeå. Ett team med över 30 års erfarenhet.",
        "marquee": ["Halvsulning", "Klackbyte", "Ridstövlar", "Uppläggning", "Byte av dragkedja", "Brudklänningar", "Kostymer", "Skinnkläder", "Kemtvätt", "Skjortor", "Mattvätt", "Gardiner", "Nyckelkopiering"],
        "services_h": "Fyra hantverk. En adress.",
        "services_p": "Lämna in skorna, kläderna och tvätten och kopiera nyckeln – i samma ärende.",
        "picker_h": "Vad behöver du hjälp med?",
        "picker_p": "Välj vad du har med dig, så ser du vad vi kan göra.",
        "picker": [
            ("Skor & stövlar", "skomakeri", ["Halvsulning", "Klackbyte", "Sömmar", "Ridstövlar"]),
            ("Kläder", "skradderi", ["Uppläggning", "Dragkedja", "Festklänning", "Kostym"]),
            ("Tvätt & textil", "kemtvatt", ["Kemtvätt", "Skjortor", "Mattor", "Gardiner"]),
            ("Nycklar", "nyckel", ["Kopiering", "Trasig nyckel", "Reparation"]),
        ],
        "about_h": "Ett hantverk som lever vidare",
        "about_p": "Alashi startade i Umeå i augusti 2013. Vårt team har över 30 års erfarenhet av att sy och laga skor och kläder – och vi jobbar med hjärtat för att ge varje kund bästa möjliga resultat. Därför kommer våra kunder tillbaka, år efter år.",
        "stats": [("2013", "Öppnade i Umeå"), ("30+", "Års erfarenhet"), ("4", "Hantverk under ett tak")],
        "spec_h": "Det vi är extra bra på",
        "specs": [("Halvsulning av randsydda skor", "Kvalitetsskor som håller i decennier."), ("Ombottning av ridstövlar", "Ett specialjobb som kräver erfarenhet."), ("Brud- och balklänningar", "Perfekt passform inför den stora dagen.")],
        "faq": [
            ("Behöver jag boka tid?", "Nej, du är välkommen in till butiken på Nygatan 22 utan tidsbokning."),
            ("Vad kostar det?", "Priset beror på jobbet. Vi tittar alltid på det först och ger dig ett pris innan vi börjar."),
            ("Var ligger Alashi?", "Du hittar oss på Nygatan 22, 903 27 Umeå – mitt i centrala Umeå."),
            ("Tar ni emot både privatpersoner och företag?", "Ja, vi hjälper både privatpersoner och företag, till exempel med kemtvätt och skjortor."),
        ],
    },
    "en": {
        "title": "Alashi – Shoe repair, tailor & dry cleaning in Umeå | Nygatan 22",
        "desc": "Alashi at Nygatan 22, Umeå: shoe repair, tailoring and alterations, dry cleaning and key cutting under one roof. Over 30 years of experience. No appointment needed.",
        "eyebrow": "Nygatan 22 · Umeå, Sweden",
        "h1a": "Shoe repair, tailor",
        "h1b": "& dry cleaning in Umeå",
        "lead": "We repair shoes, alter clothes, clean what cannot go in the machine and copy your keys – all under one roof in central Umeå. A team with more than 30 years of experience.",
        "marquee": ["Resoling", "Heels", "Riding boots", "Hemming", "Zipper replacement", "Wedding dresses", "Suits", "Leather", "Dry cleaning", "Shirts", "Rug cleaning", "Curtains", "Key cutting"],
        "services_h": "Four crafts. One address.",
        "services_p": "Drop off shoes, clothes and laundry and copy your key – in one trip.",
        "picker_h": "What do you need help with?",
        "picker_p": "Choose what you have with you to see what we can do.",
        "picker": [
            ("Shoes & boots", "skomakeri", ["Resoling", "Heels", "Stitching", "Riding boots"]),
            ("Clothes", "skradderi", ["Hemming", "Zipper", "Formal dress", "Suit"]),
            ("Laundry & textiles", "kemtvatt", ["Dry cleaning", "Shirts", "Rugs", "Curtains"]),
            ("Keys", "nyckel", ["Copies", "Broken key", "Repair"]),
        ],
        "about_h": "A craft that lives on",
        "about_p": "Alashi opened in Umeå in August 2013. Our team has more than 30 years of experience sewing and repairing shoes and clothes – and we work with heart to give every customer the best possible result. That is why our customers keep coming back.",
        "stats": [("2013", "Opened in Umeå"), ("30+", "Years of experience"), ("4", "Crafts under one roof")],
        "spec_h": "What we do best",
        "specs": [("Resoling welted shoes", "Quality shoes that last for decades."), ("Riding boot re-bottoming", "A specialist job that takes experience."), ("Wedding & prom dresses", "A perfect fit for the big day.")],
        "faq": [
            ("Do I need an appointment?", "No, you are welcome to visit our shop at Nygatan 22 without booking."),
            ("How much does it cost?", "It depends on the job. We always look first and give you a price before we start."),
            ("Where is Alashi?", "You will find us at Nygatan 22, 903 27 Umeå, in central Umeå."),
            ("Do you serve both individuals and businesses?", "Yes, we help both private customers and companies, for example with dry cleaning and shirts."),
        ],
    },
}

ABOUT = {
    "sv": {
        "title": "Om oss – Alashi skrädderi & skomakeri i Umeå sedan 2013",
        "desc": "Alashi Skrädderi, Skomakeri, Nyckelservice och Kemtvätt startade i Umeå 2013. Ett team med över 30 års erfarenhet av skor och kläder på Nygatan 22.",
        "h1": "Om Alashi",
        "lead": "En affär i Umeå som startade i augusti 2013 – med ett team som har över 30 års erfarenhet av att sy och laga skor och kläder.",
        "paras": [
            "Vårt team har nöje att jobba fullt med hjärtat och ge kunderna bästa möjliga resultat. Därför har vi kunnat skapa nöjda kunder som alltid kommer tillbaka till oss – och det är därför vi finns kvar. Sedan 2013 har affären gett oss goda minnen, bred kompetens och lång erfarenhet.",
            "Vi erbjuder alla typer av sömnändringar och lagningar, till exempel av brudklänningar, festklänningar, dräkter, kostymer, korsetter, jackor och skinnkläder.",
            "Inom skomakeri gör vi alla typer av skoreparationer och ändringar med noggrannhet och höga krav på kvalitet. Därför använder vi bara de bästa materialen. Vi är specialiserade på halvsulning av randsydda skor och ombottning av ridstövlar.",
            "Dessutom har vi kemtvätt för privatpersoner och företag, och en egen nyckelservice – så att du kan göra flera ärenden på samma ställe.",
        ],
    },
    "en": {
        "title": "About Alashi – tailor & cobbler in Umeå since 2013",
        "desc": "Alashi tailoring, shoe repair, key cutting and dry cleaning opened in Umeå in 2013. A team with more than 30 years of experience at Nygatan 22.",
        "h1": "About Alashi",
        "lead": "A shop in Umeå that opened in August 2013 – with a team that has more than 30 years of experience sewing and repairing shoes and clothes.",
        "paras": [
            "Our team loves to work with heart and give customers the best possible result. That is how we have built a base of happy customers who keep coming back – and why we are still here. Since 2013 the shop has given us good memories, broad skills and long experience.",
            "We offer every kind of alteration and repair, for example of wedding dresses, formal dresses, costumes, suits, corsets, jackets and leather garments.",
            "In shoe repair we handle all kinds of repairs and alterations with precision and high standards. That is why we only use the best materials. We specialise in resoling Goodyear-welted shoes and re-bottoming riding boots.",
            "We also offer dry cleaning for private customers and businesses, and our own key service – so you can do several errands in one place.",
        ],
    },
}

CONTACT = {
    "sv": {
        "title": "Kontakt – Alashi, Nygatan 22, Umeå | 073-823 00 03",
        "desc": "Kontakta Alashi skrädderi, skomakeri, kemtvätt och nyckelservice. Nygatan 22, 903 27 Umeå. Telefon 073-823 00 03, e-post info@alashi.se.",
        "h1": "Kontakta oss",
        "lead": "Ring, mejla eller kom förbi butiken. Ingen tidsbokning behövs.",
        "form_h": "Skicka ett meddelande",
        "f_name": "Namn", "f_phone": "Telefon", "f_msg": "Vad behöver du hjälp med?", "f_send": "Skicka via e-post",
        "f_note": "Formuläret öppnar ditt e-postprogram. Inga uppgifter sparas på webbplatsen.",
    },
    "en": {
        "title": "Contact – Alashi, Nygatan 22, Umeå | +46 73 823 00 03",
        "desc": "Contact Alashi tailoring, shoe repair, dry cleaning and key service. Nygatan 22, 903 27 Umeå. Phone +46 73 823 00 03, email info@alashi.se.",
        "h1": "Contact us",
        "lead": "Call, email or visit the shop. No appointment needed.",
        "form_h": "Send a message",
        "f_name": "Name", "f_phone": "Phone", "f_msg": "What do you need help with?", "f_send": "Send by email",
        "f_note": "The form opens your email app. No data is stored on this website.",
    },
}

PRIVACY = {
    "sv": {
        "title": "Integritetspolicy | Alashi",
        "desc": "Så hanterar Alashi personuppgifter på alashi.se.",
        "h1": "Integritetspolicy",
        "paras": [
            "Den här webbplatsen använder inga spårningscookies och samlar inte in personuppgifter i sig själv.",
            "Om du kontaktar oss via e-post eller telefon använder vi dina uppgifter enbart för att svara dig och utföra ditt ärende. Uppgifterna sparas inte längre än nödvändigt.",
            "Kartan på webbplatsen laddas från Google först när du klickar på den. Då gäller Googles integritetspolicy.",
            "Personuppgiftsansvarig är Alashi Skrädderi Skomakeri och Kemtvätt AB (org.nr 559256-1905), Nygatan 22, 903 27 Umeå. Kontakta oss på info@alashi.se om du har frågor.",
        ],
    },
    "en": {
        "title": "Privacy policy | Alashi",
        "desc": "How Alashi handles personal data on alashi.se.",
        "h1": "Privacy policy",
        "paras": [
            "This website uses no tracking cookies and does not collect personal data by itself.",
            "If you contact us by email or phone, we only use your details to reply and carry out your request, and keep them no longer than necessary.",
            "The map on this website only loads from Google when you click it. Google's privacy policy then applies.",
            "The data controller is Alashi Skrädderi Skomakeri och Kemtvätt AB (reg. no. 559256-1905), Nygatan 22, 903 27 Umeå. Contact info@alashi.se with any questions.",
        ],
    },
}

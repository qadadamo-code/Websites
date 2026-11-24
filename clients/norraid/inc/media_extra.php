<?php
/** Extra licensed Wikimedia Commons photos shipped with the code (merged into the media library when missing). */
function nr_media_extra(): array {
    $c = fn($id, $country, $file, $w, $h, $artist, $lic, $licUrl, $date, $title) => [
        'id' => $id, 'file' => '', 'country' => $country, 'w' => $w, 'h' => $h,
        'src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/' . $file . '/1280px-' . basename($file),
        'page' => 'https://commons.wikimedia.org/wiki/File:' . basename($file),
        'license' => $lic, 'license_url' => $licUrl, 'artist' => $artist, 'copyright' => $artist, 'date' => $date,
        'title' => $title, 'attribution_required' => true, 'status' => 'published',
        'permission' => 'Creative Commons licence on Wikimedia Commons',
    ];
    $list = [
        $c('sd_health', 'sudan', 'd/df/IRC-Arzt_in_Sudan.jpg', 7008, 4672, 'IRCDECOMMS', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', '2024-03-25', 'A doctor examines a young displaced person in Gedaref, Sudan'),
        $c('sd_school', 'sudan', 'e/e4/%D8%B7%D8%A7%D8%A8%D9%88%D8%B1_%D8%A7%D9%84%D8%B5%D8%A8%D8%A7%D8%AD2025.jpg', 5062, 3374, 'Nani salah', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', '2025-11-05', 'Morning assembly at a school in Omdurman, Sudan'),
        $c('sd_farchana', 'sudan', '5/5b/Darfurians_refugees_in_Eastern_Chad.jpg', 4288, 2848, 'European Commission DG ECHO', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0', '2011-12-07', 'Darfuri refugee families in Farchana camp, eastern Chad'),
        $c('drc_water_bunia', 'drc', '9/9b/Keeping_the_water_pumping_%287364843064%29.jpg', 4032, 3024, 'Oxfam East Africa', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', '2012-03-25', 'A water treatment unit supplying clean water in Bunia, DR Congo'),
        $c('drc_nyanzale', 'drc', 'b/b4/Nyanzale_displaced_persons_camp_children.jpg', 3008, 2000, 'Julien Harneis', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0', '2007-03-01', 'Children in the Nyanzale displacement camp, North Kivu'),
        $c('ss_bor_market', 'south-sudan', '8/89/Merol_Market%2C_Bor_Town%2C_Jonglei_State%2C_South_Sudan.jpg', 3648, 2736, 'Mr leroy playpus (Tuttle)', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0', '2009-08-15', 'Merol Market in Bor Town, Jonglei State, South Sudan'),
        $c('ss_minkaman_buckets', 'south-sudan', '7/7e/Minkaman%2C_Awerial_County%2C_South_Sudan_%2812046026265%29.jpg', 2200, 1492, 'Oxfam East Africa', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', '2014-01-13', 'Displaced families receive buckets for clean water in Awerial County, South Sudan'),
    ];
    $out = [];
    foreach ($list as $m) $out[$m['id']] = $m;
    return $out;
}
/** Photos used where the stored data has none: country need sections and stories. */
const NR_SECTION_PHOTO = [
    'sudan' => ['health' => 'sd_health', 'education' => 'sd_school'],
    'drc' => ['water' => 'drc_water_bunia'],
    'south-sudan' => ['displacement' => 'ss_minkaman_buckets'],
];
const NR_STORY_PHOTO = ['sudan' => 'sd_farchana', 'drc' => 'drc_nyanzale', 'south-sudan' => 'ss_bor_market'];

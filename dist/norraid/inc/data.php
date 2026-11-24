<?php
/** Read helpers for CMS content (all editable from the dashboard). */
declare(strict_types=1);

const COUNTRY_IDS = ['sudan', 'drc', 'south-sudan'];
const STAT_CATEGORIES = ['in_need', 'targeted', 'reached', 'context'];
const IMPACT_METRICS = ['families', 'meals', 'children', 'medical', 'relief_packages', 'water', 'shelter', 'projects'];

function settings(): array { return nr_load('settings'); }
function setting(string $k, $def = '') { $s = settings(); return $s[$k] ?? $def; }
function org(): array { return nr_load('org'); }
function org_verified(): bool { return (org()['status'] ?? 'pending') === 'verified'; }

function countries(): array {
    $out = [];
    foreach (nr_load('countries') as $c) if (!empty($c['id'])) $out[$c['id']] = $c;
    return $out;
}
function country(string $id): ?array { return countries()[$id] ?? null; }
function country_name(string $id): string { return t("country.$id.name"); }

function sources(): array {
    $out = [];
    foreach (nr_load('sources') as $s) $out[$s['id']] = $s;
    return $out;
}

/** Published statistics, optionally filtered. Withdrawn stats never show. */
function stats(?string $country = null, ?string $category = null, ?string $metric = null): array {
    $out = [];
    foreach (nr_load('stats') as $s) {
        if (($s['status'] ?? '') !== 'published') continue;
        if ($country && ($s['country'] ?? '') !== $country) continue;
        if ($category && ($s['category'] ?? '') !== $category) continue;
        if ($metric && ($s['metric'] ?? '') !== $metric) continue;
        $out[] = $s;
    }
    usort($out, fn($a, $b) => ($a['order'] ?? 50) <=> ($b['order'] ?? 50));
    return $out;
}
function stat_one(string $country, string $metric): ?array { return stats($country, null, $metric)[0] ?? null; }
function stat_label(array $s): string {
    $custom = loc($s['label'] ?? '');
    return $custom !== '' ? $custom : t('metric.' . ($s['metric'] ?? 'custom'));
}
function stat_value(array $s): string {
    $v = (float)($s['value'] ?? 0);
    return match ($s['unit'] ?? 'people') {
        'people' => people_short($v),
        'percent' => num($v, fmod($v, 1) ? 1 : 0) . '%',
        'usd' => t('num.usd_billion', ['n' => num($v / 1e9, 2)]),
        default => num($v, fmod($v, 1) ? 1 : 0),
    };
}

/* ---------- media ---------- */
function media_all(): array {
    $out = [];
    foreach (nr_load('media') as $m) $out[$m['id']] = $m;
    return $out;
}
function media(string $id): ?array { return media_all()[$id] ?? null; }
/** Local copy if it was imported, otherwise the licensed remote original. */
function media_url(array $m, int $w = 1600): string {
    if (!empty($m['file']) && is_file(NR_UPLOADS . '/media/' . basename($m['file']))) {
        $f = basename($m['file']);
        if ($w <= 900 && is_file(NR_UPLOADS . '/media/sm-' . $f)) $f = 'sm-' . $f;
        return nr_base() . 'uploads/media/' . rawurlencode($f);
    }
    $src = media_src($m);
    if ($w <= 900) $src = preg_replace('~/1280px-~', '/960px-', $src);
    return $src;
}
/** Wikimedia only renders standard thumbnail widths (…960, 1280, 1920…); 1600px is refused, so map it to 1280px. */
function media_src(array $m): string {
    return (string)preg_replace('~(upload|thumb)\.wikimedia\.org/(.+)/1600px-~', '$1.wikimedia.org/$2/1280px-', (string)($m['src'] ?? ''));
}
function media_alt(array $m): string {
    $k = 'media.' . $m['id'];
    $a = t($k);
    return $a !== $k ? (string)$a : loc($m['alt'] ?? $m['title'] ?? '');
}
/** "Photo: Oxfam East Africa / CC BY 2.0" with links (required by the licences). */
function media_credit(array $m): string {
    $who = e($m['artist'] ?? '');
    $lic = e($m['license'] ?? '');
    $licLink = !empty($m['license_url']) ? '<a href="' . e($m['license_url']) . '" rel="license noopener" target="_blank">' . $lic . '</a>' : $lic;
    $src = !empty($m['page']) ? ' · <a href="' . e($m['page']) . '" rel="noopener" target="_blank">' . te('media.source') . '</a>' : '';
    $date = !empty($m['date']) ? ' · ' . e(substr((string)$m['date'], 0, 4)) : '';
    return te('media.photo') . ' ' . $who . ' · ' . $licLink . $date . $src;
}
function img(string $id, string $class = '', int $w = 1600, bool $eager = false, string $sizes = '100vw'): string {
    $m = media($id);
    if (!$m) return '';
    $big = media_url($m, 1600);
    $sm = media_url($m, 900);
    $srcset = $sm !== $big ? ' srcset="' . e($sm) . ' 960w, ' . e($big) . ' 1280w" sizes="' . e($sizes) . '"' : '';
    return '<img class="' . e($class) . '" src="' . e($w <= 900 ? $sm : $big) . '"' . $srcset . ' alt="' . e(media_alt($m)) . '"'
        . ($eager ? ' fetchpriority="high"' : ' loading="lazy"') . ' decoding="async" width="' . (int)($m['w'] ?? 1600) . '" height="' . (int)($m['h'] ?? 1000) . '">';
}
function figure(string $id, string $class = '', int $w = 1600, string $sizes = '100vw'): string {
    $m = media($id);
    if (!$m) return '';
    return '<figure class="' . e($class) . '">' . img($id, '', $w, false, $sizes) . '<figcaption class="credit">' . media_credit($m) . '</figcaption></figure>';
}

/* ---------- stories ---------- */
function stories(?string $country = null, int $limit = 0): array {
    $out = [];
    foreach (nr_load('stories') as $s) {
        if (($s['status'] ?? '') !== 'approved') continue;
        if ($country && ($s['country'] ?? '') !== $country) continue;
        $out[] = $s;
    }
    usort($out, fn($a, $b) => strcmp((string)($b['published'] ?? ''), (string)($a['published'] ?? '')));
    return $limit ? array_slice($out, 0, $limit) : $out;
}
function story(string $slug): ?array {
    foreach (stories() as $s) if (($s['slug'] ?? '') === $slug) return $s;
    return null;
}
function story_text(array $s, string $field): string {
    $k = 'stories.' . $s['slug'] . '.' . $field;
    $v = t($k);
    if (is_string($v) && $v !== $k) return $v;
    return loc($s[$field] ?? '');
}
function story_list(array $s, string $field): array {
    $k = 'stories.' . $s['slug'] . '.' . $field;
    $v = t($k);
    if (is_array($v)) return $v;
    $f = $s[$field] ?? [];
    $f = is_array($f) && isset($f[L()]) ? $f[L()] : ($f['en'] ?? $f);
    return is_array($f) ? $f : [];
}

/* ---------- impact / achievements ---------- */
/** Only verified + published achievements count. Scenario (x30) figures are never stored here. */
function achievements(?string $country = null): array {
    $out = [];
    foreach (nr_load('achievements') as $a) {
        if (($a['status'] ?? '') !== 'published' || empty($a['verified'])) continue;
        if ($country && ($a['country'] ?? '') !== $country) continue;
        $out[] = $a;
    }
    usort($out, fn($a, $b) => strcmp((string)($b['period_end'] ?? ''), (string)($a['period_end'] ?? '')));
    return $out;
}
function impact_totals(?string $country = null): array {
    $tot = array_fill_keys(IMPACT_METRICS, 0);
    $has = false;
    foreach (achievements($country) as $a) {
        $m = $a['metric'] ?? '';
        if (isset($tot[$m])) { $tot[$m] += (float)($a['value'] ?? 0); $has = true; }
    }
    return $has ? $tot : [];
}

function documents(?string $category = null): array {
    $out = [];
    foreach (nr_load('documents') as $d) {
        if (empty($d['published'])) continue;
        if ($category && ($d['category'] ?? '') !== $category) continue;
        $out[] = $d;
    }
    return $out;
}

/** Confirmed donations only (entered by a finance reviewer from PayPal records). */
function donation_totals(): array {
    $sum = 0.0; $n = 0; $byFund = [];
    foreach (nr_load('donations') as $d) {
        if (($d['status'] ?? '') !== 'confirmed') continue;
        $sum += (float)$d['amount']; $n++;
        $byFund[$d['fund'] ?? 'general'] = ($byFund[$d['fund'] ?? 'general'] ?? 0) + (float)$d['amount'];
    }
    return ['sum' => $sum, 'count' => $n, 'by_fund' => $byFund];
}

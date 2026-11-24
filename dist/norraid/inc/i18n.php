<?php
/**
 * Languages: locale routes (/en, /sv, ...), detection, translation lookup.
 * Text lives in lang/<code>.json (native translations, no runtime machine translation).
 * Translators can override any key from the dashboard (storage/i18n_overrides.json).
 */
declare(strict_types=1);

const LOCALES = [
    'en' => ['English', 'ltr', 'en-GB'],
    'sv' => ['Svenska', 'ltr', 'sv-SE'],
    'fr' => ['Français', 'ltr', 'fr-FR'],
    'nl' => ['Nederlands', 'ltr', 'nl-NL'],
    'de' => ['Deutsch', 'ltr', 'de-DE'],
    'es' => ['Español', 'ltr', 'es-ES'],
    'it' => ['Italiano', 'ltr', 'it-IT'],
    'pt' => ['Português', 'ltr', 'pt-PT'],
    'da' => ['Dansk', 'ltr', 'da-DK'],
    'nb' => ['Norsk bokmål', 'ltr', 'nb-NO'],
    'fi' => ['Suomi', 'ltr', 'fi-FI'],
    'pl' => ['Polski', 'ltr', 'pl-PL'],
    'ar' => ['العربية', 'rtl', 'ar'],
];
/** Country (ISO-2) -> language, used only when the browser offers no supported language. */
const COUNTRY_LANG = [
    'SE' => 'sv', 'GB' => 'en', 'IE' => 'en', 'FR' => 'fr', 'BE' => 'nl', 'NL' => 'nl', 'DE' => 'de', 'AT' => 'de',
    'ES' => 'es', 'IT' => 'it', 'PT' => 'pt', 'DK' => 'da', 'NO' => 'nb', 'FI' => 'fi', 'PL' => 'pl', 'LU' => 'fr', 'CH' => 'de',
];
/** Languages whose browser preference decides inside a multilingual country. */
const COUNTRY_CHOICES = ['BE' => ['nl', 'fr', 'de'], 'FI' => ['fi', 'sv'], 'CH' => ['de', 'fr', 'it'], 'LU' => ['fr', 'de']];

function locale_valid(string $l): bool { return isset(LOCALES[$l]); }

/** Best supported language from Accept-Language (q-weighted), or ''. Maps no/nn -> nb. */
function locale_from_browser(?array $only = null): string {
    $h = strtolower((string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''));
    $cands = [];
    foreach (explode(',', $h) as $i => $part) {
        $p = explode(';', trim($part));
        $tag = trim($p[0]);
        if ($tag === '') continue;
        $q = 1.0;
        if (isset($p[1]) && preg_match('/q=([0-9.]+)/', $p[1], $m)) $q = (float)$m[1];
        $base = explode('-', $tag)[0];
        if (in_array($base, ['no', 'nn'], true)) $base = 'nb';
        $cands[] = [$base, $q - $i * 0.001];
    }
    usort($cands, fn($a, $b) => $b[1] <=> $a[1]);
    foreach ($cands as [$base]) if (locale_valid($base) && (!$only || in_array($base, $only, true))) return $base;
    return '';
}

/** Country from a reverse proxy / CDN header, if one is configured. Never from guessing. */
function visitor_country(): string {
    foreach (['HTTP_CF_IPCOUNTRY', 'HTTP_X_COUNTRY_CODE', 'HTTP_X_GEO_COUNTRY', 'GEOIP_COUNTRY_CODE'] as $k) {
        $v = strtoupper(trim((string)($_SERVER[$k] ?? '')));
        if (preg_match('/^[A-Z]{2}$/', $v)) return $v;
    }
    return '';
}

/** Order: saved choice (cookie) > browser language > country default > English. */
function locale_detect(): string {
    $c = (string)($_COOKIE['nr_lang'] ?? '');
    if (locale_valid($c)) return $c;
    $country = visitor_country();
    if ($country && isset(COUNTRY_CHOICES[$country])) {
        $b = locale_from_browser(COUNTRY_CHOICES[$country]);
        if ($b) return $b;
    }
    $b = locale_from_browser();
    if ($b) return $b;
    if ($country && isset(COUNTRY_LANG[$country])) return COUNTRY_LANG[$country];
    return 'en';
}

function locale_remember(string $l): void {
    if (!headers_sent() && locale_valid($l) && ($_COOKIE['nr_lang'] ?? '') !== $l) {
        setcookie('nr_lang', $l, ['expires' => time() + 365 * 86400, 'path' => nr_base(), 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
    }
}

$GLOBALS['NR_LOCALE'] = 'en';
function L(): string { return $GLOBALS['NR_LOCALE']; }
function set_locale(string $l): void { $GLOBALS['NR_LOCALE'] = locale_valid($l) ? $l : 'en'; }
function dir_attr(): string { return LOCALES[L()][1]; }
function is_rtl(): bool { return dir_attr() === 'rtl'; }

function lang_table(string $l): array {
    static $t = [];
    if (isset($t[$l])) return $t[$l];
    $f = NR_ROOT . "/lang/$l.json";
    $data = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    $flat = [];
    $walk = function ($arr, $prefix) use (&$walk, &$flat) {
        foreach ($arr as $k => $v) {
            $key = $prefix === '' ? (string)$k : "$prefix.$k";
            if (is_array($v) && array_keys($v) !== range(0, count($v) - 1)) $walk($v, $key);
            else $flat[$key] = $v;
        }
    };
    $walk($data, '');
    $ov = nr_load('i18n_overrides')[$l] ?? [];
    foreach ($ov as $k => $v) if (is_string($v) && $v !== '') $flat[$k] = $v;
    return $t[$l] = $flat;
}

/** Translate a key; falls back to English, then to the key itself. {name} placeholders are replaced (escaped by caller). */
function t(string $key, array $vars = []) {
    $v = lang_table(L())[$key] ?? lang_table('en')[$key] ?? $key;
    if (is_string($v) && $vars) foreach ($vars as $k => $r) $v = str_replace('{' . $k . '}', (string)$r, $v);
    return $v;
}
/** Escaped translation. */
function te(string $key, array $vars = []): string { return e(t($key, $vars)); }
/** Translation that is a list (paragraphs, bullets). */
function tl(string $key): array { $v = t($key); return is_array($v) ? $v : ($v === $key ? [] : [$v]); }
/** Whether a key has a native translation in the current language (used to mark English fallbacks). */
function t_has(string $key): bool { return isset(lang_table(L())[$key]); }

/** Pick the current language from a CMS field {en:..., sv:...} (or a plain string). */
function loc($field): string {
    if (is_string($field)) return $field;
    if (!is_array($field)) return '';
    foreach ([L(), 'en'] as $l) if (!empty($field[$l]) && is_string($field[$l])) return $field[$l];
    foreach ($field as $v) if (is_string($v) && $v !== '') return $v;
    return '';
}

/** Locale-aware numbers: 33.7 -> "33,7" in sv/de/..., Western digits 0-9 everywhere (incl. Arabic). */
function num($n, int $dec = 0): string {
    $comma = in_array(L(), ['sv', 'fr', 'nl', 'de', 'es', 'it', 'pt', 'da', 'nb', 'fi', 'pl'], true);
    $thou = match (L()) { 'sv', 'fr', 'nb', 'fi', 'pl' => "\u{202F}", 'de', 'nl', 'es', 'it', 'pt', 'da' => '.', default => ',' };
    return number_format((float)$n, $dec, $comma ? ',' : '.', $thou);
}
/** 33700000 -> "33.7 million" in the current language. */
function people_short(float $v): string {
    if ($v >= 1e6) {
        $m = $v / 1e6;
        return t('num.million', ['n' => num($m, fmod($m * 10, 10) == 0.0 ? 0 : 1)]);
    }
    if ($v >= 1e3) return num($v, 0);
    return num($v, 0);
}
function date_l(string $iso): string {
    $ts = strtotime($iso);
    if (!$ts) return e($iso);
    $months = t('months');
    $m = is_array($months) ? ($months[(int)date('n', $ts) - 1] ?? date('M', $ts)) : date('M', $ts);
    return (int)date('j', $ts) . ' ' . $m . ' ' . date('Y', $ts);
}

/** URL inside the current (or given) language. */
function u(string $path = '', ?string $l = null): string {
    $path = trim($path, '/');
    return nr_base() . ($l ?? L()) . '/' . ($path === '' ? '' : $path . '/');
}

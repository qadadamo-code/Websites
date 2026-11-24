<?php
/**
 * Impact data import (CSV, or Excel saved as CSV). Rows are imported as UNVERIFIED drafts; a Finance Reviewer verifies each one with evidence.
 * The optional ×30 scenario is an internal planning view only: it is computed on screen and never stored or published.
 */
require __DIR__ . '/inc.php';
require_perm('impact');
csrf_check();
$cols = ['country', 'metric', 'value', 'period_start', 'period_end', 'location', 'spent', 'title_en'];
$preview = null; $scenario = null; $errors = [];
if (isset($_GET['template'])) {
    header('Content-Type: text/csv; charset=utf-8'); header('Content-Disposition: attachment; filename="norraid-impact-template.csv"');
    echo "\xEF\xBB\xBF" . implode(',', $cols) . "\nsudan,meals,0,2027-01-01,2027-01-31,Kassala,0,Example row: replace with real verified data\n"; exit;
}

function parse_csv_upload(): array {
    $f = $_FILES['csv']['tmp_name'] ?? '';
    if (!$f || !is_uploaded_file($f)) return [];
    $raw = (string)file_get_contents($f, false, null, 0, 2 * 1024 * 1024);
    $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
    $first = strtok($raw, "\n");
    $delim = substr_count((string)$first, ';') > substr_count((string)$first, ',') ? ';' : ',';
    $rows = [];
    foreach (preg_split('/\r\n|\n|\r/', $raw) as $line) if (trim($line) !== '') $rows[] = str_getcsv($line, $delim);
    return $rows;
}
function norm_rows(array $rows, array $cols, array &$errors): array {
    if (!$rows) return [];
    $head = array_map(fn($h) => strtolower(trim((string)$h)), array_shift($rows));
    $out = [];
    foreach ($rows as $n => $r) {
        $a = [];
        foreach ($cols as $c) { $i = array_search($c, $head, true); $a[$c] = $i === false ? '' : trim((string)($r[$i] ?? '')); }
        $line = $n + 2;
        if (!in_array($a['country'], COUNTRY_IDS, true)) { $errors[] = "Line $line: country must be one of " . implode(', ', COUNTRY_IDS); continue; }
        if (!in_array($a['metric'], IMPACT_METRICS, true)) { $errors[] = "Line $line: metric must be one of " . implode(', ', IMPACT_METRICS); continue; }
        $v = str_replace([' ', ','], ['', '.'], $a['value']);
        if (!is_numeric($v) || (float)$v < 0) { $errors[] = "Line $line: value is not a number"; continue; }
        $a['value'] = (float)$v;
        $a['spent'] = is_numeric(str_replace(',', '.', $a['spent'])) ? (float)str_replace(',', '.', $a['spent']) : null;
        foreach (['period_start', 'period_end'] as $d) if ($a[$d] !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $a[$d])) { $errors[] = "Line $line: $d must be YYYY-MM-DD"; continue 2; }
        $out[] = $a;
    }
    return $out;
}

if (is_post()) {
    $act = (string)p('act');
    $rows = norm_rows(parse_csv_upload(), $cols, $errors);
    if ($act === 'import' && $rows && !$errors) {
        admin_tx('achievements', function (&$l) use ($rows) {
            foreach ($rows as $a) {
                array_unshift($l, ['id' => uid('ac-'), 'country' => $a['country'], 'metric' => $a['metric'], 'value' => $a['value'], 'title' => $a['title_en'] !== '' ? ['en' => str_clean($a['title_en'], 300)] : [],
                    'period_start' => $a['period_start'], 'period_end' => $a['period_end'], 'location' => str_clean($a['location'], 200), 'spent' => $a['spent'],
                    'evidence' => '', 'photo' => '', 'verified' => false, 'verified_by' => '', 'status' => 'draft', 'imported' => now_iso(), 'updated_by' => me()['user']]);
            }
        }, 'import', '', count($rows) . ' rows as unverified drafts');
        flash(count($rows) . ' rows imported as unverified drafts. Verify each one with evidence under Impact data before publishing.');
        go('crud.php?t=achievements');
    }
    if ($act === 'preview') $preview = $rows;
    if ($act === 'scenario') {
        $factor = max(1, min(100, (int)p('factor', 30)));
        $base = $rows ?: array_map(fn($a) => $a, nr_load('achievements'));
        $scenario = ['factor' => $factor, 'tot' => []];
        foreach ($base as $a) { $m = $a['metric'] ?? ''; if (in_array($m, IMPACT_METRICS, true)) $scenario['tot'][$m] = ($scenario['tot'][$m] ?? 0) + (float)$a['value'] * $factor; }
        audit('scenario_view', 'achievements', "x$factor (not stored)");
    }
}
admin_head('Impact import');
?>
<p class="intro">Upload a CSV (in Excel: File → Save As → CSV UTF-8). Columns: <code><?= e(implode(', ', $cols)) ?></code>. Imported rows start as unverified drafts and never appear on the site until verified with evidence and published.</p>
<p><a class="btn ghost" href="import.php?template=1">Download template</a></p>
<?php if ($errors): ?><div class="flash bad"><b>Fix these lines and upload again:</b><ul><?php foreach (array_slice($errors, 0, 30) as $er): ?><li><?= e($er) ?></li><?php endforeach; ?></ul></div><?php endif; ?>
<form class="card form" method="post" enctype="multipart/form-data">
 <?= csrf_field() ?>
 <label class="f full">CSV file<input type="file" name="csv" accept=".csv,text/csv" required></label>
 <div class="actions"><button class="btn ghost" name="act" value="preview">Preview</button> <button class="btn" name="act" value="import">Import as drafts</button></div>
</form>
<?php if ($preview !== null): ?>
<div class="table-wrap"><table class="tbl"><thead><tr><?php foreach ($cols as $c): ?><th><?= e($c) ?></th><?php endforeach; ?></tr></thead><tbody>
<?php foreach (array_slice($preview, 0, 100) as $r): ?><tr><?php foreach ($cols as $c): ?><td><?= e((string)$r[$c]) ?></td><?php endforeach; ?></tr><?php endforeach; ?>
</tbody></table></div><p class="muted"><?= count($preview) ?> valid rows.</p>
<?php endif; ?>

<section class="card internal">
 <h2>Internal planning scenario <?= badge('internal_only') ?></h2>
 <p>Multiplies a CSV (or the current impact rows) by a factor, for planning only. The result is shown here once, is <b>not saved</b> and is <b>never published</b>. Do not share it as a result.</p>
 <form method="post" enctype="multipart/form-data" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="scenario">
  <label>Factor <input type="number" name="factor" value="30" min="1" max="100"></label>
  <label>CSV (optional) <input type="file" name="csv" accept=".csv,text/csv"></label>
  <button class="btn ghost">Show scenario</button></form>
 <?php if ($scenario): ?>
  <div class="kpis scenario"><?php foreach (IMPACT_METRICS as $m): ?><div><b><?= e(number_format((float)($scenario['tot'][$m] ?? 0))) ?></b><span><?= te('imetric.' . $m) ?> × <?= (int)$scenario['factor'] ?> (scenario)</span></div><?php endforeach; ?></div>
 <?php endif; ?>
</section>
<?php admin_foot();

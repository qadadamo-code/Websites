<?php
/** Generic list / edit / delete for list-shaped stores. Each type declares its fields and its publishing rules. */
require __DIR__ . '/inc.php';

$metricKeys = array_keys((array)(json_decode((string)file_get_contents(NR_ROOT . '/lang/en.json'), true)['metric'] ?? []));
$TYPES = [
    'stats' => [
        'title' => 'Statistics', 'perm' => 'stats', 'store' => 'stats', 'id' => 'id',
        'intro' => 'Every figure needs a source, a year and the date you checked it. Keep "in need", "targeted" and "reached" separate. Withdrawn figures never show on the site.',
        'cols' => ['country', 'category', 'metric', 'value', 'year', 'source', 'verified', 'status'],
        'fields' => [
            'country' => ['label' => 'Country', 'type' => 'select', 'options' => country_opts(), 'required' => true],
            'category' => ['label' => 'Category', 'type' => 'select', 'options' => ['in_need' => 'People in need', 'targeted' => 'People targeted', 'reached' => 'People reached (verified only)', 'context' => 'Context figure']],
            'metric' => ['label' => 'Metric', 'type' => 'select', 'options' => array_combine($metricKeys, $metricKeys), 'help' => 'Use "custom" with your own label below.'],
            'value' => ['label' => 'Value', 'type' => 'number', 'required' => true, 'help' => 'Full number, e.g. 33700000 for 33.7 million.'],
            'unit' => ['label' => 'Unit', 'type' => 'select', 'options' => ['people' => 'People', 'number' => 'Number', 'percent' => 'Percent', 'usd' => 'US dollars']],
            'year' => ['label' => 'Year of the data', 'type' => 'number', 'required' => true],
            'source' => ['label' => 'Source', 'type' => 'select', 'options' => source_opts(), 'blank' => true],
            'verified' => ['label' => 'Date you checked the source', 'type' => 'date'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['draft' => 'Draft', 'published' => 'Published', 'withdrawn' => 'Withdrawn']],
            'order' => ['label' => 'Order', 'type' => 'number'],
            'label' => ['label' => 'Custom label (optional)', 'type' => 'loc'],
            'note' => ['label' => 'Note shown under the figure (optional)', 'type' => 'loc'],
        ],
        'rules' => function (array $r): ?string {
            if (($r['status'] ?? '') === 'published' && (empty($r['source']) || empty($r['verified']) || empty($r['year']))) return 'A published figure needs a source, a year and a verified date. Saved as draft.';
            if (($r['status'] ?? '') === 'published' && ($r['category'] ?? '') === 'reached') return 'People reached can only be published from verified field data. Saved as draft; use Impact data for verified results.';
            return null;
        },
    ],
    'sources' => [
        'title' => 'Sources', 'perm' => 'stats', 'store' => 'sources', 'id' => 'id', 'id_editable' => true,
        'intro' => 'Official sources behind the statistics and stories. Shown on the public Sources page.',
        'cols' => ['id', 'org', 'title', 'published', 'verified'],
        'fields' => [
            'id' => ['label' => 'Short id', 'required' => true, 'pattern' => '[a-z0-9-]+', 'help' => 'Lowercase letters, numbers and dashes.'],
            'org' => ['label' => 'Organisation', 'required' => true],
            'title' => ['label' => 'Title', 'required' => true, 'wide' => true],
            'url' => ['label' => 'Link', 'input' => 'url', 'required' => true, 'wide' => true],
            'published' => ['label' => 'Published', 'type' => 'date'],
            'verified' => ['label' => 'Last checked', 'type' => 'date'],
        ],
    ],
    'stories' => [
        'title' => 'Stories', 'perm' => 'stories', 'store' => 'stories', 'id' => 'id',
        'intro' => 'Only real stories: either from a credited third-party source, or our own with written consent. Never invent people, quotes or photos. Approved stories appear on the site.',
        'cols' => ['slug', 'country', 'kind', 'published', 'status'],
        'fields' => [
            'slug' => ['label' => 'URL slug', 'required' => true, 'pattern' => '[a-z0-9-]+'],
            'country' => ['label' => 'Country', 'type' => 'select', 'options' => country_opts()],
            'kind' => ['label' => 'Type', 'type' => 'select', 'options' => ['third_party' => 'Third-party story (credited source)', 'own' => 'Our own story (needs consent)']],
            'source' => ['label' => 'Source (third-party)', 'type' => 'select', 'options' => source_opts(), 'blank' => true],
            'consent' => ['label' => 'Written consent on file (own stories)', 'type' => 'check'],
            'consent_doc' => ['label' => 'Consent document (kept private)', 'type' => 'doc', 'help' => 'Stored in uploads/docs; do not publish it as a document.'],
            'media' => ['label' => 'Photo', 'type' => 'select', 'options' => media_opts(), 'blank' => true, 'help' => 'Use a licensed photo. No identifiable beneficiary without consent, no AI images of real people.'],
            'published' => ['label' => 'Date', 'type' => 'date'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['draft' => 'Draft', 'review' => 'In review', 'approved' => 'Approved (public)', 'archived' => 'Archived']],
            'cta' => ['label' => 'Show donate button under the story', 'type' => 'check'],
            'title' => ['label' => 'Title', 'type' => 'loc'],
            'summary' => ['label' => 'Summary', 'type' => 'loclong'],
            'context' => ['label' => 'Context', 'type' => 'loclong'],
            'needs' => ['label' => 'Needs', 'type' => 'loclong'],
        ],
        'rules' => function (array $r): ?string {
            if (($r['status'] ?? '') !== 'approved') return null;
            if (($r['kind'] ?? '') === 'third_party' && empty($r['source'])) return 'A third-party story needs a credited source before it is approved. Saved as "In review".';
            if (($r['kind'] ?? '') === 'own' && empty($r['consent'])) return 'Our own stories need written consent before they are approved. Saved as "In review".';
            return null;
        },
        'fallback_status' => 'review',
    ],
    'achievements' => [
        'title' => 'Impact data', 'perm' => 'impact', 'store' => 'achievements', 'id' => 'id',
        'intro' => 'Verified results only. A row counts on the public Impact page only when it is verified AND published. Until then the site shows "Impact reports coming soon".',
        'cols' => ['country', 'metric', 'value', 'period_end', 'verified', 'status'],
        'fields' => [
            'country' => ['label' => 'Country', 'type' => 'select', 'options' => country_opts(), 'required' => true],
            'metric' => ['label' => 'Metric', 'type' => 'select', 'options' => array_combine(IMPACT_METRICS, array_map(fn($m) => t('imetric.' . $m), IMPACT_METRICS))],
            'value' => ['label' => 'Value', 'type' => 'number', 'required' => true],
            'title' => ['label' => 'Activity', 'type' => 'loc'],
            'period_start' => ['label' => 'Period start', 'type' => 'date'],
            'period_end' => ['label' => 'Period end', 'type' => 'date'],
            'location' => ['label' => 'Location'],
            'spent' => ['label' => 'Amount spent (EUR)', 'type' => 'number'],
            'evidence' => ['label' => 'Evidence (receipt, partner report…)', 'type' => 'doc', 'options' => doc_opts()],
            'photo' => ['label' => 'Photo', 'type' => 'select', 'options' => media_opts(), 'blank' => true],
            'verified' => ['label' => 'Verified against evidence', 'type' => 'check'],
            'verified_by' => ['label' => 'Verified by', 'type' => 'readonly'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['draft' => 'Draft', 'published' => 'Published']],
        ],
        'rules' => function (array $r): ?string {
            if (($r['status'] ?? '') === 'published' && (empty($r['verified']) || empty($r['evidence']))) return 'Only verified rows with evidence can be published. Saved as draft.';
            return null;
        },
        'before_save' => function (array $r, array $old): array {
            if (!empty($r['verified']) && empty($old['verified'])) { $r['verified_by'] = (me()['user'] ?? '') . ' · ' . date('Y-m-d'); }
            if (empty($r['verified'])) $r['verified_by'] = '';
            return $r;
        },
    ],
    'donations' => [
        'title' => 'Donations', 'perm' => 'donations', 'store' => 'donations', 'id' => 'id',
        'intro' => '"Intent" rows are logged when a visitor clicks through to PayPal. They are NOT donations. Add confirmed donations from your PayPal records; only confirmed rows count anywhere.',
        'cols' => ['at', 'type', 'fund', 'amount', 'currency', 'status'],
        'filters' => ['type' => ['intent' => 'Intents', 'record' => 'Records']],
        'fields' => [
            'type' => ['label' => 'Type', 'type' => 'select', 'options' => ['record' => 'Record from PayPal', 'intent' => 'Click-through intent']],
            'at' => ['label' => 'Date', 'type' => 'date', 'required' => true],
            'fund' => ['label' => 'Fund', 'type' => 'select', 'options' => ['general' => 'General fund'] + country_opts()],
            'amount' => ['label' => 'Amount', 'type' => 'number', 'required' => true],
            'currency' => ['label' => 'Currency', 'type' => 'select', 'options' => ['EUR' => 'EUR', 'SEK' => 'SEK', 'USD' => 'USD', 'GBP' => 'GBP', 'NOK' => 'NOK', 'DKK' => 'DKK']],
            'paypal_ref' => ['label' => 'PayPal transaction id'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['unconfirmed' => 'Unconfirmed', 'confirmed' => 'Confirmed', 'refunded' => 'Refunded']],
            'note' => ['label' => 'Internal note', 'type' => 'textarea'],
        ],
        'rules' => function (array $r): ?string {
            if (($r['status'] ?? '') === 'confirmed' && (($r['type'] ?? '') !== 'record' || empty($r['paypal_ref']))) return 'Only a record with a PayPal transaction id can be confirmed. Saved as unconfirmed.';
            return null;
        },
        'fallback_status' => 'unconfirmed',
        'new_defaults' => ['type' => 'record', 'status' => 'unconfirmed', 'currency' => 'EUR'],
    ],
    'documents' => [
        'title' => 'Documents', 'perm' => 'documents', 'store' => 'documents', 'id' => 'id',
        'intro' => 'Registration papers, statements, reports and partner agreements. Published documents are listed on the Transparency and Impact pages.',
        'cols' => ['title', 'category', 'date', 'published'],
        'fields' => [
            'title' => ['label' => 'Title', 'type' => 'loc', 'required' => true],
            'category' => ['label' => 'Category', 'type' => 'select', 'options' => ['legal' => 'Legal / registration', 'statement' => 'Financial statement', 'report' => 'Impact report', 'partner' => 'Partner', 'policy' => 'Policy', 'other' => 'Other']],
            'date' => ['label' => 'Date', 'type' => 'date'],
            'file' => ['label' => 'File', 'type' => 'doc'],
            'published' => ['label' => 'Published on the site', 'type' => 'check'],
        ],
        'rules' => function (array $r): ?string { return (!empty($r['published']) && empty($r['file'])) ? 'Upload a file before publishing. Saved unpublished.' : null; },
        'unpublish' => 'published',
    ],
];

$t = (string)($_GET['t'] ?? '');
if (!isset($TYPES[$t])) go('index.php');
$T = $TYPES[$t];
require_perm($T['perm']);
csrf_check();
$store = $T['store'];
$rows = nr_load($store);
$id = (string)($_GET['id'] ?? '');

function find_row(array $rows, string $id): ?array { foreach ($rows as $r) if ((string)($r['id'] ?? '') === $id) return $r; return null; }

if (is_post()) {
    $act = (string)p('act');
    if ($act === 'delete') {
        $did = (string)p('id');
        admin_tx($store, function (&$l) use ($did) { $l = array_values(array_filter($l, fn($r) => (string)($r['id'] ?? '') !== $did)); }, 'delete', $did);
        flash('Deleted.');
        go('crud.php?t=' . $t);
    }
    if ($act === 'save') {
        $old = $id !== '' ? (find_row($rows, $id) ?? []) : [];
        $row = $old;
        foreach ($T['fields'] as $name => $f) $row[$name] = field_value($name, $f, $old[$name] ?? null);
        if (!empty($T['id_editable'])) {
            $row['id'] = preg_replace('/[^a-z0-9-]/', '', strtolower((string)$row['id']));
            if ($row['id'] === '') { flash('The id is required.', 'bad'); go('crud.php?t=' . $t . '&id=' . rawurlencode($id) . ($id ? '' : '&new=1')); }
            if ($row['id'] !== $id && find_row($rows, $row['id'])) { flash('That id is already used.', 'bad'); go('crud.php?t=' . $t . '&new=1'); }
        } elseif (empty($row['id'])) $row['id'] = uid(substr($t, 0, 2) . '-');
        if (isset($row['slug'])) {
            $row['slug'] = preg_replace('/[^a-z0-9-]/', '', strtolower((string)$row['slug']));
            foreach ($rows as $r) if (($r['slug'] ?? '') === $row['slug'] && ($r['id'] ?? '') !== $row['id']) { flash('That slug is already used by another story.', 'bad'); go('crud.php?t=' . $t . '&id=' . rawurlencode($id)); }
        }
        if (isset($T['before_save'])) $row = $T['before_save']($row, $old);
        if (isset($T['rules']) && ($msg = $T['rules']($row))) {
            if (isset($T['unpublish'])) $row[$T['unpublish']] = false;
            else $row['status'] = $T['fallback_status'] ?? 'draft';
            flash($msg, 'warn');
        }
        $row['updated'] = now_iso();
        $row['updated_by'] = me()['user'] ?? '';
        $key = $id;
        admin_tx($store, function (&$l) use ($row, $key) {
            foreach ($l as $i => $r) if ($key !== '' && (string)($r['id'] ?? '') === $key) { $l[$i] = $row; return; }
            array_unshift($l, $row);
        }, $id === '' ? 'create' : 'update', (string)$row['id'], (string)($row['status'] ?? ''));
        flash('Saved.');
        go('crud.php?t=' . $t . '&id=' . rawurlencode((string)$row['id']));
    }
}

admin_head($T['title']);
if ($id !== '' || isset($_GET['new'])) {
    $row = $id !== '' ? find_row($rows, $id) : ($T['new_defaults'] ?? []);
    if ($row === null) { echo '<p class="flash bad">Not found.</p>'; admin_foot(); exit; }
    ?>
    <p><a href="crud.php?t=<?= e($t) ?>">← All <?= e(strtolower($T['title'])) ?></a></p>
    <form class="card form" method="post" enctype="multipart/form-data" action="crud.php?t=<?= e($t) ?><?= $id !== '' ? '&id=' . e(rawurlencode($id)) : '' ?>">
     <?= csrf_field() ?><input type="hidden" name="act" value="save">
     <div class="grid">
      <?php foreach ($T['fields'] as $name => $f) echo field_input($name, $f, $row[$name] ?? (($f['type'] ?? '') === 'check' ? false : '')); ?>
     </div>
     <?php if (!empty($row['updated'])): ?><p class="muted small">Last change: <?= e(substr((string)$row['updated'], 0, 16)) ?> by <?= e((string)($row['updated_by'] ?? '')) ?></p><?php endif; ?>
     <div class="actions"><button class="btn">Save</button></div>
    </form>
    <?php if ($id !== ''): ?>
    <form method="post" class="danger-zone" data-confirm="Delete this item? This cannot be undone (a backup is made every 6 hours).">
     <?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($id) ?>">
     <button class="btn danger">Delete</button>
    </form>
    <?php endif;
} else {
    $f = [];
    foreach (($T['filters'] ?? []) as $k => $map) if (isset($_GET[$k]) && isset($map[$_GET[$k]])) $f[$k] = $_GET[$k];
    $q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
    $list = array_values(array_filter($rows, function ($r) use ($f, $q) {
        foreach ($f as $k => $v) if (($r[$k] ?? '') !== $v) return false;
        return $q === '' || str_contains(mb_strtolower(json_encode($r, JSON_UNESCAPED_UNICODE)), $q);
    }));
    $total = count($list);
    $page = max(1, (int)($_GET['page'] ?? 1));
    $list = array_slice($list, ($page - 1) * 50, 50);
    ?>
    <p class="intro"><?= e($T['intro']) ?></p>
    <div class="toolbar">
     <form method="get"><input type="hidden" name="t" value="<?= e($t) ?>"><input type="search" name="q" value="<?= e((string)($_GET['q'] ?? '')) ?>" placeholder="Search"><?php foreach (($T['filters'] ?? []) as $k => $map): ?><select name="<?= e($k) ?>"><?= opts($map, $_GET[$k] ?? '', true) ?></select><?php endforeach; ?><button class="btn ghost">Filter</button></form>
     <a class="btn" href="crud.php?t=<?= e($t) ?>&new=1">+ Add</a>
    </div>
    <?php if ($t === 'donations'): $tot = donation_totals(); $intents = count(array_filter($rows, fn($r) => ($r['type'] ?? '') === 'intent')); ?>
     <div class="kpis"><div><b><?= e(number_format($tot['sum'], 2)) ?></b><span>Confirmed total (mixed currencies are added as entered)</span></div><div><b><?= (int)$tot['count'] ?></b><span>Confirmed donations</span></div><div><b><?= $intents ?></b><span>Click-through intents (not money)</span></div></div>
     <p><a class="btn ghost" href="export.php?what=donations&_csrf=<?= e(csrf()) ?>">Export CSV</a></p>
    <?php endif; ?>
    <div class="table-wrap"><table class="tbl"><thead><tr><?php foreach ($T['cols'] as $c): ?><th><?= e($T['fields'][$c]['label'] ?? ucfirst($c)) ?></th><?php endforeach; ?><th></th></tr></thead><tbody>
    <?php foreach ($list as $r): ?><tr>
     <?php foreach ($T['cols'] as $c): $v = $r[$c] ?? ''; ?>
      <td><?php
        if ($c === 'status' || $c === 'type' || $c === 'category' || $c === 'kind') echo badge((string)$v);
        elseif (is_bool($v) || in_array($c, ['published', 'verified'], true) && !is_string($v)) echo $v ? '✓' : '—';
        elseif (is_array($v)) echo e(loc($v));
        elseif ($c === 'value' || $c === 'amount') echo e(is_numeric($v) ? number_format((float)$v, fmod((float)$v, 1) ? 2 : 0) : (string)$v);
        elseif ($c === 'country') echo e($v ? country_name((string)$v) : '');
        elseif ($c === 'at') echo e(substr((string)$v, 0, 10));
        else echo e(mb_strimwidth((string)$v, 0, 70, '…'));
      ?></td>
     <?php endforeach; ?>
     <td><a href="crud.php?t=<?= e($t) ?>&id=<?= e(rawurlencode((string)($r['id'] ?? ''))) ?>">Edit</a></td>
    </tr><?php endforeach; ?>
    <?php if (!$list): ?><tr><td colspan="<?= count($T['cols']) + 1 ?>" class="muted">Nothing here yet.</td></tr><?php endif; ?>
    </tbody></table></div>
    <?php if ($total > 50): ?><p class="pager"><?php for ($i = 1; $i <= ceil($total / 50); $i++): ?><a href="?<?= e(http_build_query(array_merge($_GET, ['page' => $i]))) ?>"<?= $i === $page ? ' aria-current="page"' : '' ?>><?= $i ?></a><?php endfor; ?></p><?php endif;
}
admin_foot();

import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
svg = (R/'assets/img/logo.svg').read_text()
vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
g = re.search(r'class="lg-g"[^>]* d="([^"]+)"', svg).group(1)
d = re.search(r'class="lg-d"[^>]* d="([^"]+)"', svg).group(1)
sym = (f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="lg" viewBox="{vb}">'
       f'<path fill="var(--lg-g,#1f9a45)" fill-rule="evenodd" d="{g}"/>'
       f'<path fill="var(--lg-d,#4a4a4c)" fill-rule="evenodd" d="{d}"/></symbol></svg>')
use = f'<svg class="lg" viewBox="{vb}" role="img" aria-label="Crepe One"><use href="#lg"/></svg>'
t = (R/'src/index.tpl.html').read_text().replace('{{LOGO}}', use).replace('<body>', '<body>\n' + sym, 1)
(R/'index.html').write_text(t)
print('ok', len(t))

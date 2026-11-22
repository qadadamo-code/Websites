import pathlib
root=pathlib.Path(__file__).resolve().parent.parent
logo=pathlib.Path('/tmp/zz/logo.svg').read_text() if pathlib.Path('/tmp/zz/logo.svg').exists() else (root/'src/logo-anim.svg').read_text()
(root/'src/logo-anim.svg').write_text(logo)
t=(root/'src/index.tpl.html').read_text()
t=t.replace('{{LOGO}}',logo).replace('{{LOGO_SMALL}}',logo)
(root/'index.html').write_text(t)
print('built',len(t))

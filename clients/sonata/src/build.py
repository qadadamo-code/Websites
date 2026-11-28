import re,os
H=os.path.dirname(os.path.abspath(__file__))
svg=open(os.path.join(H,'../assets/img/logo.svg')).read()
vb=re.search(r'viewBox="([^"]+)"',svg).group(1)
d=re.search(r' d="([^"]+)"',svg).group(1)
subs=['M'+s for s in d.split('M') if s]
paths=f'<path fill-rule="evenodd" fill="currentColor" d="{d}"/>'
intro='<g class="il-stroke">'+''.join(f'<path d="{s}"/>' for s in subs)+'</g>'+f'<path class="il-fill" fill-rule="evenodd" d="{d}"/>'
t=open(os.path.join(H,'index.tpl.html')).read()
t=t.replace('{{VB}}',vb).replace('{{PATHS_INTRO}}',intro).replace('{{PATHS}}',paths)
open(os.path.join(H,'../index.html'),'w').write(t)
print('ok',vb,len(subs))

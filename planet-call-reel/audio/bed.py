"""Music bed (FluidR3 marimba/pizz + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) synced to timeline.json.
python3 -I bed.py <sfx_kit> <sf_dir> <timeline.json> <out.wav>"""
import sys, json, subprocess, numpy as np
SFX, SF, TL, OUT = sys.argv[1:5]
T = json.load(open(TL)); SR = 44100; DUR = T['TOTAL']; N = int(SR*DUR)
music = np.zeros((N,2),np.float32); sfx = np.zeros((N,2),np.float32); _c={}
def load(p):
    if p not in _c:
        raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
        _c[p]=np.frombuffer(raw,np.float32).reshape(-1,2).copy()
    return _c[p]
def place(bus,a,t,g=1.0,pan=0.0,maxlen=None,fade=0.05):
    if maxlen:
        a=a[:int(maxlen*SR)].copy(); f=min(int(fade*SR),len(a)); a[-f:]*=np.linspace(1,0,f)[:,None]
    i=int(round(t*SR))
    if i<0: a=a[-i:]; i=0
    if i>=N: return
    n=min(len(a),N-i); l=np.cos((pan+1)*np.pi/4)*np.sqrt(2); r=np.sin((pan+1)*np.pi/4)*np.sqrt(2)
    bus[i:i+n,0]+=a[:n,0]*g*l; bus[i:i+n,1]+=a[:n,1]*g*r
_d=json.load(open(SFX+'/sounds.json')); _d=_d if isinstance(_d,list) else _d.get('sounds',[]); meta={s['id']:s for s in _d}
def S(name,t,g=1.0,pan=0.0,sync=False,maxlen=None):
    s=meta[name]; place(sfx,load(SFX+'/'+s['file']),t-(s['sync']['at'] if sync else 0),g,pan,maxlen,0.15)
def note(inst,n,t,g=1.0,pan=0.0,ln=None): place(music,load(f'{SF}/{inst}/{n}.mp3'),t,g,pan,ln,0.06)
def drum(f,t,g=1.0,pan=0.0): place(music,load(f'{SF}/ds/{f}'),t,g,pan)

# ---- SFX ----
S('phone-ring-classic',0.05,0.9,maxlen=1.85)
S('click-latch-firm',1.9,0.9); S('whoosh-fast-soft',1.92,0.5)
S('move-spring',2.15,0.35)
PH=T['PH']
for p in PH:
    for w in p['w']:
        if any(k in w['cls'] for k in ('big','huge','pill')):
            S('pop-small-in' if 'huge' not in w['cls'] else 'pop-medium-in', w['t'], 0.35)
si=T['signIn']; S('whoosh-medium-soft',si,0.5); S('move-spring',si+0.35,0.4); S('impact-light-firm',si+0.4,0.4)
S('whoosh-fast-soft',T['signOut'],0.45)
pi=T['priceIn']; S('whoosh-fast-medium',pi-0.1,0.5)
for i in range(4): S('pop-medium-in',pi+0.25+i*0.12,0.5,pan=(-0.4 if i%2==0 else 0.4))
S('pop-large-in',pi+0.42,0.6); S('pop-small-in',pi+0.85,0.45)
old=20.25+8.48/1.1; S('swish-medium',old,0.45); S('notification-failure-pluck',old+0.05,0.35)
S('notification-success-sparkle',20.25+10.04/1.1,0.35)
S('whoosh-fast-soft',T['priceOut'],0.45)
hu=T['hangup']; S('zip-out-medium',hu,0.55); S('impact-medium-firm',hu+0.02,0.5)
gi=T['giftIn']; S('whoosh-medium-soft',gi,0.45); S('impact-medium-soft',gi+0.6,0.7); S('move-bounce',gi+0.6,0.25)
S('celebration-popper',gi+1.25,0.6); S('shimmer-medium-sparkle',gi+1.3,0.45)
S('sting-playful-long',T['endIn'],0.7)

# ---- MUSIC 104bpm, from pickup to gift ----
B=60/104; t0=2.0; t1=gi+1.2
prog=[('C3',['E4','G4','C5']),('A2',['E4','A4','C5']),('F2',['F4','A4','C5']),('G2',['D4','G4','B4'])]
bar=0; t=t0
while t<t1:
    root,ch=prog[bar%4]
    for b in range(4):
        tb=t+b*B
        if tb>=t1: break
        if b in (0,2): note('pizzicato_strings',root,tb,0.55,ln=B*0.9); drum('bd.wav',tb,0.32)
        if b==3: note('pizzicato_strings',root[0]+'3' if root.endswith('2') else root,tb+B/2,0.35,ln=B*0.4)
        if b in (1,3): drum('cp.wav',tb,0.12,0.1)
        for h in (0,0.5): drum('hh.wav',tb+h*B,0.10 if h else 0.07,-0.2)
        # marimba offbeat stabs
        for k,n in enumerate(ch): note('marimba',n,tb+B/2,0.16,pan=(k-1)*0.3,ln=B*0.45)
    if bar%2==1:  # little marimba lick
        lick=['G5','E5','D5','C5'] if bar%4==1 else ['A5','G5','E5','G5']
        for k,n in enumerate(lick): note('marimba',n,t+3*B+k*B/4,0.12)
    bar+=1; t+=4*B
fo=int(0.5*SR); i1=int(t1*SR); music[i1:i1+fo]*=np.linspace(1,0,fo)[:,None]; music[i1+fo:]=0
fi=int(0.3*SR); i0=int(t0*SR); music[i0:i0+fi]*=np.linspace(0,1,fi)[:,None]
mix=music*0.8+sfx
pk=np.abs(mix).max(); mix=mix/max(pk,1e-6)*0.89
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s16le',OUT],input=mix.astype(np.float32).tobytes(),check=True)
# separate stems too
for nm,bus in (('music',music*0.8/max(pk,1e-6)*0.89),('sfx',sfx/max(pk,1e-6)*0.89)):
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s16le',OUT.replace('.wav',f'-{nm}.wav')],input=bus.astype(np.float32).tobytes(),check=True)
print('ok',DUR)

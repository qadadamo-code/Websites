import sys, subprocess, json, numpy as np
SFX, SF, DS, VO, OUT = sys.argv[1:6]
SR=44100; DUR=37.0; N=int(SR*DUR)
music=np.zeros((N,2),np.float32); drums=np.zeros((N,2),np.float32); sfx=np.zeros((N,2),np.float32)
_c={}
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
    n=min(len(a),N-i)
    l=np.cos((pan+1)*np.pi/4)*np.sqrt(2); r=np.sin((pan+1)*np.pi/4)*np.sqrt(2)
    bus[i:i+n,0]+=a[:n,0]*g*l; bus[i:i+n,1]+=a[:n,1]*g*r
_d=json.load(open(SFX+'/sounds.json')); _d=_d if isinstance(_d,list) else _d.get('sounds',[])
META={s['id']:s for s in _d if isinstance(s,dict)}
def S(name,t,g=1.0,pan=0.0,sync=False,maxlen=None):
    s=META[name]; st=t-(s.get('sync',{}).get('at',0) if sync else 0)
    place(sfx,load(SFX+'/'+s['file']),st,g,pan,maxlen=maxlen)
def note(inst,n,t,g=1.0,pan=0.0,length=None): place(music,load(f'{SF}/{inst}/{n}.mp3'),t,g,pan,maxlen=length,fade=0.12)
def drum(p,t,g=1.0,pan=0.0): place(drums,load(DS+'/'+p),t,g,pan)
B=0.5
KICK='clubkick/1.wav'; CLAP='cp/HANDCLP0.wav'; HAT='hh/000_hh3closedhh.wav'; OHAT='hh/007_hh3openhh.wav'
CH=[(['A3','C4','E4','G4'],'A2'),(['F3','A3','C4','E4'],'F2'),(['C4','E4','G4','D5'],'C3'),(['G3','D4','G4','A4'],'G2')]
def bars(t0,t1,mode='full'):
    t=t0;k=0
    while t<t1-1e-6:
        bar=int(round((t-t0)/(4*B)))%4; chord,bass=CH[bar] if mode!='sad' else CH[0 if (k//8)%2==0 else 1]
        beat=k%4
        if mode=='full':
            drum(KICK,t,0.85)
            if beat in (1,3): drum(CLAP,t,0.35,0.1)
            drum(OHAT,t+B/2,0.2,0.25); drum(HAT,t+B*.25,0.07,-0.3); drum(HAT,t+B*.75,0.07,-0.3)
            note('synth_bass_1',bass,t+B/2,0.55,length=0.22)
            if beat in (0,2):
                for i,n in enumerate(chord): note('electric_piano_1',n,t+B/2+i*.008,0.2,(-.3,-.1,.1,.3)[i],length=0.35)
        else:
            drum(HAT,t+B/2,0.1,0.25)
            if beat==0: note('synth_bass_1',bass,t,0.35,length=1.6)
            if beat in (0,2): note('electric_piano_1',chord[(k//2)%4],t+B/2,0.14,0.2,length=0.5)
        if beat==0:
            for n in chord[:3]: note('pad_2_warm',n,t,0.12 if mode=='full' else 0.16,length=2.0)
        t+=B;k+=1
for n in ['A3','C4','E4']: note('pad_2_warm',n,0.0,0.16,length=1.0)
bars(0.5,4.5)
bars(5.3,14.3,'sad')
bars(15.02,25.82)
bars(25.82,31.3)
bars(31.5,35.5)
for i,n in enumerate(['A3','C4','E4','G4','C5']): note('electric_piano_1',n,35.5+i*.04,0.24,length=1.5)
for n in ['A3','E4','C5']: note('pad_2_warm',n,35.5,0.16,length=1.5)
note('synth_bass_1','A2',35.5,0.5,length=1.2)
# SFX
for i in range(14): S('keyboard-letter-soft' if i%3 else 'keyboard-letter-medium',0.25+i*0.09,0.45,((i*37)%7-3)/10)
S('pop-small-in',1.6,0.5); S('pop-small-in',1.78,0.4)
S('notification-failure-minor',2.6,0.45); S('pop-medium-in',3.3,0.45)
S('cinematic-slam-big',4.52,0.55); S('bass-sub-drop-short',4.52,0.6)
S('whoosh-fast-soft',5.05,0.4)
for t in [5.45,8.78,10.38,12.85]: S('notification-message-out-soft',t,0.5)
for t in [9.78,11.28]: S('click-tap-soft',t,0.4)
S('pop-small-in',7.15,0.35); S('pop-small-in',9.78,0.35); S('tone-ding-low',11.6,0.3)
S('notification-failure-thud',13.9,0.55)
S('riser-1s-strong',14.0,0.4)
S('impact-medium-firm',15.02,0.6); S('shimmer-short-sparkle',15.1,0.45); S('whoosh-medium-soft',15.75,0.4)
S('pop-small-in',15.7,0.35); S('click-toggle-on-soft',18.42,0.4); S('click-toggle-on-soft',19.26,0.4); S('click-toggle-on-soft',20.0,0.4)
S('swipe-medium-soft',20.75,0.4); S('pop-small-in',20.9,0.35)
S('click-button-medium',22.65,0.6); S('swish-soft',23.1,0.4); S('notification-message-in-clear',23.45,0.6)
S('notification-success-chime',24.9,0.4)
S('impact-deep-soft',25.82,0.55); S('whoosh-fast-medium',25.7,0.35); S('pop-large-in',26.0,0.45)
for i in range(4): S('pop-small-bubble',26.8+i*.2,0.3)
S('riser-1s-soft',27.3,0.3); S('impact-light-firm',28.3,0.55); S('notification-success-sparkle',29.6,0.4)
S('pop-small-in',30.5,0.3); S('pop-small-in',30.8,0.3)
S('whoosh-medium-soft',31.4,0.35); S('pop-large-in',31.75,0.5); S('notification-success-warm',33.3,0.35)
vo=load(VO); voN=np.zeros((N,2),np.float32); off=int(0.3*SR); n=min(len(vo),N-off); voN[off:off+n]=vo[:n]
env=np.abs(voN).mean(1); k=int(0.12*SR); env=np.convolve(env,np.ones(k)/k,'same'); duck=1-0.45*np.clip(env/0.05,0,1)
bed=(music+drums)*0.75*duck[:,None]
mix=bed+sfx*0.8+voN*1.15
fo=int(0.8*SR); mix[-fo:]*=np.linspace(1,0,fo)[:,None]
mix=np.tanh(mix*1.1)/np.tanh(1.1)
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-af','loudnorm=I=-14:TP=-1.0','-ar','44100','-c:a','aac','-b:a','192k',OUT],input=mix.astype(np.float32).tobytes(),check=True)

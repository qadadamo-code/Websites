import sys,subprocess,json,numpy as np
A='/tmp/claude-0/w/aud/';SR=44100;DUR=41.0;N=int(SR*DUR);O=0.25
music=np.zeros((N,2),np.float32);sfx=np.zeros((N,2),np.float32);C={}
d=json.load(open(A+'sounds.json'));d=d if isinstance(d,list) else d.get('sounds',[]);M={s['id']:s for s in d}
def load(p):
  if p not in C:
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    C[p]=np.frombuffer(raw,np.float32).reshape(-1,2).copy()
  return C[p]
def place(bus,a,t,g=1.,pan=0.,maxlen=None):
  if maxlen:
    a=a[:int(maxlen*SR)].copy();f=min(int(.08*SR),len(a));a[-f:]*=np.linspace(1,0,f)[:,None]
  i=int(round(t*SR))
  if i<0:a=a[-i:];i=0
  if i>=N:return
  n=min(len(a),N-i);l=np.cos((pan+1)*np.pi/4)*np.sqrt(2);r=np.sin((pan+1)*np.pi/4)*np.sqrt(2)
  bus[i:i+n,0]+=a[:n,0]*g*l;bus[i:i+n,1]+=a[:n,1]*g*r
def S(name,v,g=1.,pan=0.):place(sfx,load(A+'sfx/'+M[name]['file']),v+O,g,pan)
def note(inst,n,t,g=1.,pan=0.,length=None):place(music,load(f'{A}sf/{inst}/{n}.mp3'),t,g,pan,maxlen=length)
def drum(p,t,g=1.,pan=0.):place(music,load(A+'ds/'+p),t,g,pan)
KICK,HAT,OHAT,CLAP,SN='808bd/BD5010.WAV','linnhats/1.wav','linnhats/4.wav','cp/HANDCLP0.wav','808sd/SD0010.WAV'
CH={'C':(['C4','G4','C5','G4','E5','G4','C5','E5'],'C2'),'F':(['F4','A4','C5','A4','F5','A4','C5','F5'],'F2'),'G':(['G4','B4','D5','B4','G5','B4','D5','G5'],'G2'),'Am':(['A4','C5','E5','C5','A5','E5','C5','E5'],'A2'),'Dm':(['D4','F4','A4','F4','D5','A4','F4','A4'],'D2')}
B=0.5
# Part 1 tension 0..16.45: Am Am F F Dm Dm Am Am (each chord 2s), sparse pizz + EP pad hits + soft kick
t=0.0;prog=['Am','Am','F','F','Dm','Dm','Am','Am']
end1=16.2+O
while t<end1-1e-6:
  ch=prog[int(t//2)%8];arp,bass=CH[ch];k=int(round(t/0.25))
  if k%8==0: note('pizzicato_strings',bass,t,.7); note('electric_piano_1',arp[0].replace('5','4'),t,.25,length=1.8)
  if k%4==2: note('pizzicato_strings',arp[1].replace('5','3').replace('4','3'),t,.32,.3)
  if k%2==0 and t>5.7: drum(HAT,t,.12,.3)
  if k%4==0 and t>5.7: drum(KICK,t,.45)
  t+=0.25
# Part 2 bright 16.45..41
st=16.2+O;prog2=['C','G','Am','F'];t=st;k=0
while t<DUR-1.2:
  ch=prog2[int((t-st)//2)%4];arp,bass=CH[ch]
  note('marimba',arp[k%8],t,.3*(1 if k%2==0 else .75),.25 if k%2 else -.25,length=.45)
  if k%4==0: note('pizzicato_strings',bass,t,.6); note('acoustic_bass',bass,t,.45,length=.45)
  if k%2==0: drum(KICK,t,.6) if k%4==0 else None
  if k%4==2: drum(CLAP,t,.35)
  drum(HAT if k%2 else OHAT,t,.13 if k%2 else .09,.2)
  t+=0.25;k+=1
# final chord
note('marimba','C5',DUR-1.2,.35);note('marimba','E5',DUR-1.2,.3);note('pizzicato_strings','C2',DUR-1.2,.6)
# fade music end
f=int(1.0*SR);music[-f:]*=np.linspace(1,0,f)[:,None]
# SFX (VO times)
S('keyboard-typing-quick-short',0.0,.35)
S('pop-small-in',1.5,.5);S('pop-small-in',1.7,.5)
S('swish-medium' if 'swish-medium' in M else 'whoosh-fast-medium',2.4,.4)
S('notification-failure-thud',3.0,.5)
S('impact-heavy-hard',4.5,.8);S('cinematic-slam-big',4.5,.35)
S('whoosh-fast-medium',5.5,.45)
S('notification-message-in-clear',7.1,.5)
S('notification-message-out-soft',9.45,.55);S('notification-message-out-soft',11.4,.55)
S('notification-failure-thud',15.4,.6)
S('riser-1s-soft',15.2,.4)
S('appear-burst',16.2,.7);S('shimmer-medium-sparkle',16.3,.45)
S('whoosh-medium-medium',19.2,.35)
S('pop-medium-in',20.9,.45);S('pop-medium-in',21.6,.45);S('pop-medium-in',22.24,.45)
S('click-tap-firm',23.0,.7)
S('notification-success-ding-ding',23.75,.55)
S('notification-success-chime',25.75,.5)
S('whoosh-fast-medium',26.9,.5)
S('swipe-fast-firm',27.3,.5)
S('appear-burst',30.25,.55)
S('whoosh-fast-medium',31.3,.5)
S('data-countup-medium',32.2,.45);S('money-register',33.2,.6);S('celebration-confetti',33.2,.4)
S('pop-medium-in',35.5,.5);S('sting-bright-short',36.0,.45)
bed=music*0.42+sfx*0.9
raw=bed.astype(np.float32).tobytes()
open('/tmp/claude-0/w/aud/bed.f32','wb').write(raw)
print('ok')

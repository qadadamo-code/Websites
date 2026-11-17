import sys,subprocess,json,numpy as np
V=sys.argv[1];W='/home/user/w/';A=W+'aud/';T=json.load(open(W+'timing.json'))[V]
SR=44100;O=0.5;DUR=38.0;N=int(SR*DUR)
music=np.zeros((N,2),np.float32);sfx=np.zeros((N,2),np.float32);C={}
def load(p):
  if p not in C:
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    C[p]=np.frombuffer(raw,np.float32).reshape(-1,2).copy()
  return C[p]
def place(bus,a,t,g=1.,pan=0.,maxlen=None,fade=.08):
  if maxlen:
    a=a[:int(maxlen*SR)].copy();f=min(int(fade*SR),len(a));a[-f:]*=np.linspace(1,0,f)[:,None]
  i=int(round(t*SR))
  if i<0:a=a[-i:];i=0
  if i>=N:return
  n=min(len(a),N-i);l=np.cos((pan+1)*np.pi/4)*np.sqrt(2);r=np.sin((pan+1)*np.pi/4)*np.sqrt(2)
  bus[i:i+n,0]+=a[:n,0]*g*l;bus[i:i+n,1]+=a[:n,1]*g*r
def S(name,t,g=1.,pan=0.):place(sfx,load(A+'sfx/'+name+'.wav'),t+O,g,pan)
def note(inst,n,t,g=1.,pan=0.,length=None,fade=.4):place(music,load(f'{A}sf/{inst}/{n}.mp3'),t,g,pan,maxlen=length,fade=fade)
def drum(p,t,g=1.,pan=0.):place(music,load(A+'ds/'+p),t,g,pan)
BAR=2.4;BT=BAR/4
CH=[('D2',['D3','A3','F4','C5'],['A4','D5','E5','F5','E5','C5','A4','F4']),
    ('Bb2',['Bb2','F3','D4','A4'],['F4','A4','C5','D5','C5','A4','F4','D4']),
    ('G2',['G2','D3','Bb3','F4'],['D4','G4','Bb4','A4','G4','F4','D4','Bb3']),
    ('A2',['A2','E3','A3','Db4'],['E4','A4','Db4','E4','G4','E4','Db4','A3'])]
s3=T['s3']+O;s4=T['s4']+O;s7=T['s7']+O;endm=DUR-2.2
t=0.0;b=0
while t<endm-0.01:
  bass,pad,arp=CH[b%4]
  for k,n in enumerate(pad): note('string_ensemble_1',n,t,.20 if t<s4 else .24,(k-1.5)*.25,length=BAR+.3,fade=.6)
  note('contrabass',bass,t,.35 if t>=s3 else .22,length=BAR,fade=.5)
  # piano: sparse in intro, eighths later
  for j in range(8):
    tt=t+j*BAR/8
    if tt>=endm:break
    if t<s3 and j%2: continue
    note('acoustic_grand_piano',arp[j],tt,(.16 if t<s3 else .13)*(1 if j%2==0 else .75),.3 if j%2 else -.3,length=1.2,fade=.5)
    if t>=s4 and j%2==1: note('orchestral_harp',arp[(j+3)%8].replace('3','4'),tt+BAR/16,.08,.4,length=.8)
  if t>=s3:
    for q in range(4):
      tq=t+q*BT
      if q in(0,) or (q==2 and t>=s4): drum('bd.wav',tq,.55)
      if q in(1,3) and t>=s4: drum('rim.wav',tq,.18,.1)
      drum('hh.wav',tq+BT/2,.07,.25)
      if t>=s4: drum('hh.wav',tq,.045,-.25)
  t+=BAR;b+=1
# final resolve
for k,n in enumerate(['D3','A3','F4','A4','D5']): note('string_ensemble_1',n,endm,.24,(k-2)*.2,length=2.2,fade=1.2)
note('acoustic_grand_piano','D4',endm,.2);note('acoustic_grand_piano','A4',endm,.15);note('acoustic_grand_piano','F5',endm,.12)
note('contrabass','D2',endm,.35,length=2.0,fade=1.)
f=int(1.4*SR);music[-f:]*=np.linspace(1,0,f)[:,None]
f=int(1.2*SR);music[:f]*=np.linspace(0,1,f)[:,None]
# SFX
S('shimmer-medium-sparkle',-0.3,.35)
S('whoosh-slow-soft',T['s2']-.3,.35)
for i,dt in enumerate([0.5,1.1,1.8,2.5,3.1]): S('pop-small-in',T['s2']+dt,.28,(-1)**i*.3)
S('reverse-whoosh-medium-soft',T['s3']-.8,.4)
S('appear-materialise',T['s3'],.4)
S('keyboard-typing-quick-short',T['s3']+.6,.25)
S('notification-message-in-clear',T['s3c']+.3,.35)
S('notification-success-chime',T['s3d']+.2,.3)
S('riser-2s-soft',T['s4']-1.8,.3)
S('boom-hit-soft',T['s4'],.45);S('shimmer-medium-sparkle',T['s4']+.05,.35)
for k in ['c1','c2','c3','c4']: S('pop-medium-in',T[k],.3)
S('whoosh-medium-soft',T['s5']-.2,.35);S('appear-materialise',T['s5']+.1,.3)
S('whoosh-medium-soft',T['s6']-.2,.35)
S('data-countup-medium',T['s6b']-.4,.3);S('impact-deep-soft',T['s6b']+.5,.4);S('shimmer-medium-sparkle',T['s6b']+.5,.3)
S('whoosh-slow-soft',T['s7']-.3,.3);S('sting-bright-short',T['s7']+.3,.3)
# VO + ducking
vo=load(W+T['vo']);vb=np.zeros((N,2),np.float32);place(vb,vo,O,1.0)
env=np.abs(vb).mean(1);k=int(.25*SR);env=np.convolve(env,np.ones(k)/k,'same');duck=1-.45*np.clip(env/ (env.max()*.25),0,1)
mixd=music*duck[:,None]*0.9+sfx*0.8+vb*1.0
pk=np.abs(mixd).max();mixd=mixd/pk*0.89
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af','loudnorm=I=-14:TP=-1.2:LRA=9','-ar','44100',W+f'out/mix-{V}.wav'],input=mixd.astype(np.float32).tobytes(),check=True)
print('ok',V)

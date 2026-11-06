import numpy as np, wave
SR=44100; D=18.0; N=int(SR*D)
L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(3)
BEAT=0.5; OFF=0.45
def put(sig,t,g=1.0,pan=0.0):
    i=int(t*SR)
    if i>=N: return
    n=min(len(sig),N-i); L[i:i+n]+=sig[:n]*g*(1-max(0,pan)); R[i:i+n]+=sig[:n]*g*(1+min(0,pan))
def env(n,a,d): t=np.arange(n)/SR; return np.minimum(1,t/max(a,1e-5))*np.exp(-t/d)
def kick(g=1):
    n=int(0.45*SR); t=np.arange(n)/SR; f=48+120*np.exp(-t*28)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.001,0.16); s+=rng.normal(0,1,n)*env(n,0.0005,0.004)*0.15
    return np.tanh(s*1.6)*g
def hat(d=0.02):
    n=int(0.08*SR); x=rng.normal(0,1,n); x=x-np.convolve(x,np.ones(4)/4,'same'); return x*env(n,0.0005,d)*0.25
def clap():
    n=int(0.3*SR); x=rng.normal(0,1,n); x=x-np.convolve(x,np.ones(6)/6,'same'); e=np.zeros(n); idx=np.arange(n)
    for o in (0,0.011,0.022):
        k=int(o*SR); e[k:]+=env(n-k,0.0005,0.006)
    e+=env(n,0.002,0.07)*0.6; return x*e*0.5
def pluck(freq,dur=0.9):
    n=int(dur*SR); p=int(SR/freq); buf=list(rng.uniform(-1,1,p)); out=np.zeros(n)
    for i in range(n):
        j=i%p; out[i]=buf[j]; buf[j]=0.4975*(buf[j]+buf[(j+1)%p])
    return out*env(n,0.002,dur*0.6)
def sub(freq,dur):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.sin(2*np.pi*freq*t)+0.3*np.sin(4*np.pi*freq*t)
    e=np.minimum(1,t/0.01)*np.minimum(1,(dur-t)/0.05); return np.tanh(s*1.4)*e*0.45
def pad(freqs,dur):
    n=int(dur*SR); t=np.arange(n)/SR; s=sum(np.sin(2*np.pi*f*t+np.sin(2*np.pi*0.3*t)*0.5) for f in freqs)/len(freqs)
    return s*np.minimum(1,t/0.6)*np.minimum(1,(dur-t)/0.6)*0.18
def impact():
    n=int(1.6*SR); t=np.arange(n)/SR; f=35+80*np.exp(-t*12)
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.001,0.5); x=np.convolve(rng.normal(0,1,n),np.ones(60)/60,'same')*env(n,0.001,0.35)*3
    return np.tanh((s+x)*1.5)*0.9
def riser(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.normal(0,1,n)
    lo=np.convolve(x,np.ones(40)/40,'same'); hi=x-np.convolve(x,np.ones(3)/3,'same')
    m=(t/dur); y=lo*(1-m)+hi*m
    return y*m**2*1.8
A=110.0; hz=lambda s:A*2**(s/12)
SC=[0,1,4,5,7,8,10,12,13,16,17,19]
put(pad([hz(0),hz(7),hz(12),hz(16)],4.2),0.0,0.9)
for k in range(8):
    t=OFF-0.5+k*BEAT
    if t>0: put(hat(0.012),t,0.5,0.3)
put(pluck(hz(12),1.2),0.45,0.35,-0.3); put(pluck(hz(13),1.2),1.45,0.3,0.3); put(pluck(hz(16),1.2),2.45,0.3,-0.3)
put(riser(0.9),3.05,0.25)
for i in range(9):
    t=3.95+i*BEAT
    if t<8.45: put(kick(),t,0.9); put(hat(),t+0.25,0.6,0.25)
    if i<8: put(pluck(hz(12+SC[i]),0.7),t,0.45,(-0.3 if i%2 else 0.3)); put(sub(hz(-12 if i<4 else -9),0.45),t,0.8)
    if i in (2,6): put(clap(),t,0.6)
put(riser(1.1),7.35,0.6)
put(impact(),8.45,1.0)
put(pad([hz(-12),hz(-5),hz(0)],1.3),8.45,1.2)
for k in range(4):
    t=9.65+k*0.42
    put(kick(),t,0.9); put(hat(),t+0.21,0.6,0.2)
    if k%2: put(clap(),t,0.7)
    put(sub(hz(-12+[0,0,3,5][k]),0.4),t,0.85)
put(pluck(hz(24),0.6),10.35,0.4); put(pluck(hz(28),0.6),10.35,0.3,0.3)
put(riser(0.4),10.95,0.5)
put(impact(),11.35,0.9)
for k in range(3):
    t=11.35+k*0.5; put(kick(),t,0.85); put(hat(),t+0.25,0.5)
    put(pluck(hz([12,16,19][k]),0.6),t+0.25,0.35,0.2)
put(riser(0.6),12.25,0.5)
put(impact(),12.85,0.7)
put(pad([hz(0),hz(4),hz(7),hz(12)],5.0),12.85,1.0)
melody=[12,13,16,17,19,17,16,13]
for k in range(10):
    t=12.85+k*0.5
    if t>16.9: break
    put(kick(),t,0.85); put(hat(),t+0.25,0.6,0.25)
    if k%2: put(clap(),t,0.65)
    put(sub(hz(-12 if k<4 else -7),0.45),t,0.8)
    if k<8: put(pluck(hz(melody[k]),0.5),t+0.25,0.3,(-0.25 if k%2 else 0.25))
put(impact(),15.65,0.5)
for s in (0,4,7,12,16): put(pluck(hz(s),2.2),16.85,0.35)
put(kick(1.1),16.85,1.0)
M=np.stack([L,R],1); M/=np.max(np.abs(M)); M*=0.8
fade=np.ones(N); fs=int(17.3*SR); fade[fs:]=np.linspace(1,0,N-fs); M*=fade[:,None]
w=wave.open('assets/music-local.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((M*32767).astype(np.int16).tobytes()); w.close()

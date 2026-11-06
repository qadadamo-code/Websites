import numpy as np, wave
SR=44100; D=18.0; out=np.zeros(int(SR*D))
rng=np.random.default_rng(7)
def add(sig,t,g=1.0):
    i=int(t*SR); n=min(len(sig),len(out)-i); out[i:i+n]+=sig[:n]*g
def env(n,a=0.001,d=0.03):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
def key():
    n=int(0.05*SR); t=np.arange(n)/SR
    s=rng.normal(0,1,n)*env(n,0.0005,0.006)*0.6 + np.sin(2*np.pi*rng.uniform(1800,2600)*t)*env(n,0.0005,0.004)*0.3 + np.sin(2*np.pi*rng.uniform(140,190)*t)*env(n,0.001,0.012)*0.5
    return s
def pop(f0=520,f1=900,dur=0.12):
    n=int(dur*SR); t=np.arange(n)/SR; f=np.linspace(f0,f1,n)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.045)
def whoosh(dur=0.45,rise=True):
    n=int(dur*SR); x=rng.normal(0,1,n); 
    # simple moving-average lowpass with varying window
    y=np.convolve(x,np.ones(30)/30,'same'); e=np.sin(np.linspace(0,np.pi,n))**2
    return y*e*(np.linspace(0.3,1,n) if rise else np.linspace(1,0.3,n))*2.2
def thump(f=60,dur=0.35):
    n=int(dur*SR); t=np.arange(n)/SR; f=f*(1+2*np.exp(-t*30))
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.001,0.12)
def click():
    n=int(0.04*SR); return (rng.normal(0,1,n)*env(n,0.0003,0.003)+np.sin(2*np.pi*3000*np.arange(n)/SR)*env(n,0.0003,0.006))*0.8
L1='إحنا مو بس\nشركة تسويق.'; L2='إحنا\nفريقك...'
def typing(text,a,b,g=0.55):
    for n in range(1,len(text)+1):
        t=a+(n/len(text))*(b-a)
        if text[n-1] not in ' \n': add(key(),t,g)
typing(L1,0.35,1.9)
for k in range(10): add(key(),2.55+k*0.045,0.35)   # backspace burst
typing(L2,3.1,3.75)
for i in range(8): add(pop(420+i*40,760+i*50),3.95+i*0.5,0.55)
add(whoosh(0.4),8.05,0.5); add(thump(55),8.45,0.9)
typing('يعني باختصار.',8.53,9.2,0.5)
add(thump(70,0.25),9.73,0.7); add(pop(300,1400,0.18),10.35,0.5)
add(whoosh(0.35),11.0,0.45); add(thump(50,0.5),11.35,1.0)
add(whoosh(0.5),12.5,0.4); add(pop(700,1500,0.15),13.27,0.5)
typing('PLANET',13.45,13.95,0.5)
add(pop(500,1000,0.14),14.6,0.45)
add(click(),15.65,0.9); add(pop(900,1800,0.2),15.7,0.4)
out=out/np.max(np.abs(out))*0.85
w=wave.open('assets/sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()

# Sound design from CC0 UI SFX (uisfx, CC0-1.0), placed on the reel's cut points.
import subprocess,numpy as np,wave
SR=44100; D=18.0; N=int(SR*D); out=np.zeros(N); rng=np.random.default_rng(11)
def load(name,rate=1.0):
    af=f'asetrate={int(SR*rate)},aresample={SR}' if rate!=1 else 'anull'
    b=subprocess.run(['ffmpeg','-v','error','-i',f'assets/sfx-cc0/{name}.mp3','-ac','1','-af',af,'-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,np.float32).astype(float)
cache={}
def snd(name,rate=1.0):
    k=(name,round(rate,3))
    if k not in cache: cache[k]=load(name,rate)
    return cache[k]
def add(sig,t,g=1.0):
    i=int(t*SR); n=min(len(sig),N-i); out[i:i+n]+=sig[:n]*g
L1='إحنا مو بس\nشركة تسويق.'; L2='إحنا\nفريقك...'
def typing(text,a,b,g=0.9):
    for n in range(1,len(text)+1):
        if text[n-1] in ' \n': continue
        t=a+(n/len(text))*(b-a)
        nm='studio-typing' if n%3 else 'cinematic-typing'
        add(snd(nm,float(rng.choice([0.94,0.97,1.0,1.03,1.06]))),t,g*rng.uniform(0.75,1.0))
typing(L1,0.35,1.9)
for k in range(9): add(snd('mechanical-typing',1.1),2.56+k*0.05,0.5)
typing(L2,3.1,3.75)
for i in range(8): add(snd('studio-open',2**(i/12)),3.95+i*0.5,1.1)
add(snd('cinematic-swipe'),8.40,1.0)
typing('يعني باختصار.',8.53,9.2,0.8)
add(snd('studio-expand',0.85),9.73-0.089,1.0)
add(snd('glass-select'),10.35-0.124,0.9)
add(snd('cinematic-swipe',1.1),11.32,0.9)
add(snd('dreamy-bonus'),11.47-0.178,0.9)
add(snd('cinematic-swipe',0.9),12.80,0.8)
add(snd('studio-expand'),13.27-0.089,1.0)
typing('PLANET',13.45,13.95,0.8)
add(snd('scifi-open'),14.6,0.9)
add(snd('mechanical-press'),15.65,1.0)
add(snd('glass-success'),15.73-0.22,0.9)
out=out/np.max(np.abs(out))*0.9
w=wave.open('assets/sfx2.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()

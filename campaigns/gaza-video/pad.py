# Soft ambient pad + gentle melody for the Gaza campaign video. Usage: python3 pad.py <seconds> out.wav
import numpy as np, wave, sys
sr=44100;D=float(sys.argv[1]);t=np.arange(int(sr*D))/sr;out=np.zeros((len(t),2))
def n2f(n):return 440*2**((n-69)/12)
base=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]
L=6.25;prog=[base[i%4] for i in range(int(D/L)+1)];prog[-1]=base[0]
for ci,ch in enumerate(prog):
  s=int(ci*L*sr);e=min(len(t),int((ci+1)*L*sr+2*sr))
  if s>=len(t):break
  tt=np.arange(e-s)/sr;env=np.minimum(1,tt/2.2)*np.exp(-np.maximum(0,tt-L)/0.9)
  for k,n in enumerate(ch):
    f=n2f(n-12 if k==0 else n)
    sig=sum(np.sin(2*np.pi*f*(1+d)*tt+ph)/h for h,(d,ph) in [(1,(0,0)),(1.6,(0.003,1)),(2.2,(-0.003,2))])+0.15*np.sin(2*np.pi*f*2*tt)
    pan=0.35+0.3*(k/3);out[s:e,0]+=sig*env*(1-pan)*0.10;out[s:e,1]+=sig*env*pan*0.10
mel=[76,74,72,77,76,72,74,71]
for i,st in enumerate(np.arange(1.5,D-2,2.5)):
  n=mel[i%8];s=int(st*sr);tt=np.arange(int(4*sr))/sr;e=min(len(t),s+len(tt));tt=tt[:e-s]
  f=n2f(n);env=(1-np.exp(-tt*60))*np.exp(-tt*1.1)
  sig=(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*2)+0.1*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*3))*env*0.12
  out[s:e,0]+=sig*0.55;out[s:e,1]+=sig*0.45
for d,g in [(0.113,0.35),(0.171,0.3),(0.263,0.25),(0.389,0.2)]:
  k=int(d*sr);rev=np.zeros_like(out)
  for rep in range(6):
    sh=k*(rep+1)
    if sh<len(out):rev[sh:]+=out[:-sh]*(g**(rep+1))
  out+=rev[:,::-1]*0.5
out*=np.minimum(1,np.minimum(t/2.5,(D-t)/3.5))[:,None];out/=np.abs(out).max()/0.7
w=wave.open(sys.argv[2],'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype('<i2').tobytes());w.close()

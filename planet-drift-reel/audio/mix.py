"""Planet reel 10 soundtrack (13s): synthesized pad + engine/screech + CC0 SFX (wyzowl/sfx-kit).
Run: python3 -I mix.py <sfx_kit_dir> <out.wav>"""
import sys, json, subprocess, numpy as np
SFX, OUT = sys.argv[1:3]
SR = 44100; DUR = 13.0; N = int(SR * DUR)
bus = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(7)
_c = {}
def load(p):
    if p not in _c:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[p]
def place(a, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    if n <= 0: return
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    if a.ndim == 1: a = np.stack([a, a], 1)
    bus[i:i + n, 0] += a[:n, 0] * g * l; bus[i:i + n, 1] += a[:n, 1] * g * r
d = json.load(open(SFX + '/sounds.json')); d = d if isinstance(d, list) else d.get('sounds', [])
META = {s['id']: s for s in d if isinstance(s, dict)}
def S(name, t, g=1.0, pan=0.0, sync=False):
    s = META[name]; st = t - (s.get('sync', {}).get('at', 0) if sync else 0)
    place(load(SFX + '/' + s['file']), st, g, pan)

def lp(x, fc):  # one-pole lowpass, fc may be array
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def env(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; out = 0
    for dd in (-det, 0, det): out = out + 2 * ((t * f * (1 + dd)) % 1) - 1
    return out / 3
def hz(m): return 440 * 2 ** ((m - 69) / 12)

# ---- pad: dark (0-5.1) then bright (5.1-13) ----
def pad(notes, t0, t1, g, fc0, fc1, a=0.8, r=1.2):
    n = int((t1 - t0) * SR); x = np.zeros(n)
    for m in notes: x += saw(hz(m), n, 0.004)
    x = lp(lp(x, np.linspace(fc0, fc1, n)), np.linspace(fc0, fc1, n) * 1.5)
    x *= env(n, a, r) * g / len(notes) ** 0.5
    place(np.stack([x, np.roll(x, 400)], 1).astype(np.float32), t0)
pad([45, 52, 57, 59, 64], 0.0, 2.65, 0.22, 300, 900, 1.2, 0.6)       # A minor add9
pad([41, 48, 53, 57, 64], 2.6, 5.08, 0.22, 500, 1500, 0.1, 0.12)     # Fmaj7 rising
pad([48, 55, 60, 64, 67, 71], 5.15, 13.0, 0.2, 900, 1300, 0.25, 2.2) # Cmaj7 bright
# sub drones
def sub(f, t0, t1, g):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * f * t) * env(n, 0.3, 0.5) * g
    place(x.astype(np.float32), t0)
sub(55, 0.0, 2.7, 0.16); sub(43.65, 2.6, 5.1, 0.18); sub(65.4, 5.12, 12.8, 0.14)

# ---- engine rev + tire screech for the car entrance ----
n = int(1.6 * SR); t = np.arange(n) / SR
f = 70 + 120 * np.exp(-t * 3) + 30 * np.exp(-((t - 0.05) ** 2) / 0.003)
ph = 2 * np.pi * np.cumsum(f) / SR
eng = (np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.4 + np.sin(3 * ph + 0.3) * 0.2)
eng = lp(eng, 1200 * np.exp(-t * 2) + 250) * np.exp(-t * 2.2) * np.minimum(1, t / 0.03)
place((eng * 0.5).astype(np.float32), 5.02, pan=0.3)
n = int(0.75 * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
car_f = 2300 + 500 * np.sin(2 * np.pi * 9 * t)
bp = lp(noise, car_f + 400) - lp(noise, car_f - 400)
bp += 0.5 * np.sin(2 * np.pi * np.cumsum(car_f) / SR)
scr = bp * np.exp(-t * 4.5) * np.minimum(1, t / 0.02)
place((scr * 0.12).astype(np.float32), 5.12, pan=-0.2)

# ---- SFX ----
S('reverse-whoosh-medium-soft', 0.0, 0.35)
S('shimmer-long-soft', 0.18, 0.35, 0.3)
S('whoosh-slow-soft', 0.2, 0.45, 0.4)
S('impact-light-firm', 1.1, 0.55); S('tone-ding-low', 1.1, 0.35); S('bass-808-short', 1.1, 0.4)
S('shimmer-short-soft', 1.12, 0.25, -0.3)
S('whoosh-fast-medium', 2.15, 0.55, -0.4)
S('swish-medium', 2.5, 0.4, 0.6)
for i, tt in enumerate([2.62, 2.695, 2.77, 2.845]):
    S('swipe-fast-soft', tt, 0.45, -0.6 + i * 0.4); S('foley-card-slide', tt + 0.05, 0.25, -0.6 + i * 0.4)
S('impact-medium-soft', 3.1, 0.35)
S('riser-1s-strong', 4.1, 0.45)
S('whoosh-fast-hard', 4.45, 0.5, 0.6)
S('reverse-whoosh-short-strong', 5.1, 0.5, sync=True)
S('boom-hit-strong', 5.1, 0.7); S('cinematic-slam-big', 5.1, 0.35)
S('whoosh-medium-soft', 5.25, 0.5, -0.2)
S('impact-medium-firm', 5.95, 0.3); S('click-snap-soft', 6.0, 0.35)
for i in range(3): S(f'tone-step-{i + 1}', 6.58 + i * 0.2, 0.28, (i - 1) * 0.3)
S('whoosh-medium-soft', 7.35, 0.35, 0.3)
S('pop-medium-in', 8.32, 0.5); S('sting-minimal-long', 8.36, 0.4)
S('shimmer-medium-soft', 8.75, 0.25)

# ---- master ----
x = bus.copy(); peak = np.abs(x).max(); x = np.tanh(x / max(peak, 1e-6) * 1.4) * 0.9
fo = int(0.9 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
raw = (x * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), OUT], input=raw, check=True)
print('ok', OUT)

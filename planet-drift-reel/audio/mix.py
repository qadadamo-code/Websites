"""Planet reel 10 soundtrack (13s): synthesized pad + engine/screech + CC0 SFX (wyzowl/sfx-kit).
Run: python3 -I mix.py <sfx_kit_dir> <out.wav>"""
import sys, json, subprocess, numpy as np
SFX, MUS, OUT = sys.argv[1:4]
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

# ---- music bed: Mixkit 'Sci-Fi Score' (#102, Mixkit free license), drop at 19.55s aligned to the 5.1s cut ----
M = load(MUS)[int(14.45 * SR):int(14.45 * SR) + N].copy()
fi = int(0.35 * SR); M[:fi] *= np.linspace(0, 1, fi)[:, None]
place(M, 0.0, 0.85)
# ---- SFX ----
S('reverse-whoosh-medium-soft', 0.0, 0.245)
S('shimmer-long-soft', 0.18, 0.245, 0.3)
S('whoosh-slow-soft', 0.2, 0.315, 0.4)
S('impact-light-firm', 1.1, 0.385); S('bass-808-short', 1.1, 0.28)
S('shimmer-short-soft', 1.12, 0.175, -0.3)
S('whoosh-fast-medium', 2.15, 0.385, -0.4)
S('swish-medium', 2.5, 0.28, 0.6)
for i, tt in enumerate([2.62, 2.695, 2.77, 2.845]):
    S('swipe-fast-soft', tt, 0.45, -0.6 + i * 0.4); S('foley-card-slide', tt + 0.05, 0.25, -0.6 + i * 0.4)
S('impact-medium-soft', 3.1, 0.245)
S('riser-1s-strong', 4.1, 0.315)
S('whoosh-fast-hard', 4.45, 0.35, 0.6)
S('reverse-whoosh-short-strong', 5.1, 0.35, sync=True)
S('boom-hit-strong', 5.1, 0.49); S('cinematic-slam-big', 5.1, 0.245)
S('whoosh-medium-soft', 5.25, 0.35, -0.2)
S('impact-medium-firm', 5.95, 0.21); S('click-snap-soft', 6.0, 0.245)

S('whoosh-medium-soft', 7.35, 0.245, 0.3)
S('pop-medium-in', 8.32, 0.35)
S('shimmer-medium-soft', 8.75, 0.175)

# ---- master ----
x = bus.copy(); peak = np.abs(x).max(); x = np.tanh(x / max(peak, 1e-6) * 1.15) * 0.92
fo = int(0.9 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
raw = (x * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), OUT], input=raw, check=True)
print('ok', OUT)

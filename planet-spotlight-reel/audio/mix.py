"""Soundtrack for the Planet spotlight reel (10s, 120 BPM, hits locked to the torch moves).
Drums: Dirt-Samples. SFX: wyzowl/sfx-kit (CC0). Pad + sub are synthesised here.
Run: python3 -I mix.py <sfx_kit_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, DS, OUT = sys.argv[1:4]
SR = 44100; DUR = 10.0; N = int(SR * DUR)
bus = {k: np.zeros((N, 2), np.float32) for k in ('mus', 'drm', 'sfx')}
_c = {}
def load(p):
    if p not in _c:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[p]
def place(b, a, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    if n <= 0: return
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[b][i:i + n, 0] += a[:n, 0] * g * l; bus[b][i:i + n, 1] += a[:n, 1] * g * r
d = json.load(open(SFX + '/sounds.json')); d = d if isinstance(d, list) else d['sounds']
META = {s['id']: s['file'] for s in d}
S = lambda name, t, g=1.0, pan=0.0: place('sfx', load(SFX + '/' + META[name]), t, g, pan)
D = lambda p, t, g=1.0, pan=0.0: place('drm', load(DS + '/' + p), t, g, pan)

def tone(freqs, t0, dur, g, att=0.4, rel=1.5, det=0.004, bright=3):
    n = int((dur + rel) * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / att) * np.where(tt < dur, 1, np.exp(-(tt - dur) / (rel / 4)))
    out = np.zeros((n, 2), np.float32)
    for f in freqs:
        for k, (dd, pan) in enumerate(((-det, -0.5), (det, 0.5), (0, 0))):
            w = sum(np.sin(2 * np.pi * f * (1 + dd) * h * tt) / h ** 1.6 for h in range(1, bright + 1))
            out[:, 0] += w * env * (1 - pan) * 0.5; out[:, 1] += w * env * (1 + pan) * 0.5
    place('mus', out / len(freqs) * g, t0)
def sub(f, t0, dur, g):
    n = int(dur * SR); tt = np.arange(n) / SR
    fr = f * (1 + 0.9 * np.exp(-tt * 30)); ph = 2 * np.pi * np.cumsum(fr) / SR
    w = np.tanh(np.sin(ph) * 1.6) * np.exp(-tt * 2.2) * np.minimum(1, tt / 0.004)
    place('mus', np.stack([w, w], 1).astype(np.float32) * g, t0)

nt = lambda m: 440 * 2 ** ((m - 69) / 12)
# --- intro: toss, cap spins, lands, switch on
S('whoosh-fast-medium', 0.0, 0.7)
S('impact-light-soft', 0.14, 0.5)
S('move-spin', 0.22, 0.35, 0.2)
S('impact-light-firm', 0.93, 0.8)
S('click-latch-firm', 1.0, 1.0); S('click-latch-medium', 1.066, 0.6)
tone([nt(45), nt(52)], 0.25, 0.75, 0.10, att=0.7, rel=0.3, bright=2)   # low drone before the light
# --- beat 120 BPM from the switch-on, kicks on every beat
B = 0.5
beats = [1.10 + k * B for k in range(12)]           # 1.10 .. 6.60
for i, t in enumerate(beats):
    D('clubkick/1.wav', t, 0.85)
    if i % 2 == 1: D('cp/HANDCLP0.wav', t, 0.32, 0.1)
    D('hh/000_hh3closedhh.wav', t + 0.25, 0.14, -0.3)
    if i % 2 == 0: D('hh/007_hh3openhh.wav', t + 0.25, 0.08, 0.3)
    sub(nt([33, 33, 29, 31][(i // 2) % 4]), t, 0.45, 0.42)
# pad chords (Am - F - C - G), two beats each
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 67]]
for j in range(6):
    tone([nt(m) for m in CH[j % 4]], 1.10 + j * 1.0, 0.95, 0.16, att=0.06, rel=0.4)
# light arp sparkle on the 8ths
ARP = [69, 72, 76, 72, 69, 76, 79, 76]
for k in range(22):
    t = 1.10 + k * 0.25
    if t > 6.55: break
    tone([nt(ARP[k % 8] + 12)], t, 0.08, 0.05, att=0.004, rel=0.25, bright=2)
# --- swings & text reveals
for t, g in ((1.48, 0.55), (2.66, 0.7), (3.78, 0.65), (4.80, 0.7), (5.86, 0.6), (6.14, 0.4)):
    S('whoosh-fast-hard', t, g, 0.0)
for t in (1.58, 2.90, 3.94, 5.07):
    S('appear-flip-quick', t, 0.35, -0.2); S('pop-small-in', t + 0.1, 0.3, 0.3)
# --- the reveal
S('reverse-whoosh-short-soft', 6.28, 0.7)
S('cinematic-drum-big', 6.72, 0.9); S('boom-hit-strong', 6.72, 0.55)
tone([nt(m) for m in (45, 57, 60, 64, 71)], 6.72, 2.4, 0.22, att=0.02, rel=2.6, bright=3)
tone([nt(81), nt(88)], 6.72, 1.6, 0.05, att=0.01, rel=2.0, bright=1)
S('pop-small-in', 7.05, 0.25); S('pop-small-in', 7.35, 0.2); S('click-button-soft', 7.7, 0.4)

mix = bus['mus'] * 0.9 + bus['drm'] * 0.9 + bus['sfx'] * 0.85
fo = int(0.6 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix * 1.1) * 0.9
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', OUT], input=mix.astype(np.float32).tobytes(), check=True)
print('peak', float(np.abs(mix).max()))

"""Builds the 15s soundtrack: original music (sampled marimba/pizz/glock + CC0 drums) synced to the cuts, plus CC0 SFX.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>
"""
import sys, subprocess, numpy as np
from scipy.signal import fftconvolve, butter, lfilter

SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100
DUR = 15.0
N = int(SR * DUR)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)
_cache = {}


def load(path):
    if path in _cache:
        return _cache[path]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    _cache[path] = a
    return a


def place(bus, a, t, gain=1.0, pan=0.0, maxlen=None, fade=0.0):
    if maxlen:
        a = a[: int(maxlen * SR)].copy()
        if fade:
            f = int(fade * SR); f = min(f, len(a))
            a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(round(t * SR))
    if i < 0:
        a = a[-i:]; i = 0
    if i >= N:
        return
    n = min(len(a), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[i:i + n, 0] += a[:n, 0] * gain * l
    bus[i:i + n, 1] += a[:n, 1] * gain * r


def S(name, t, gain=1.0, pan=0.0, sync=None):
    """SFX from the kit by id; if sync is given, t is the moment the sound's sync point should land."""
    import json
    global _meta
    try:
        _meta
    except NameError:
        _d = json.load(open(SFX + '/sounds.json')); _d = _d if isinstance(_d, list) else _d.get('sounds', []); _meta = {s['id']: s for s in _d if isinstance(s, dict)}
    s = _meta[name]
    start = t - (s['sync']['at'] if sync else 0)
    place(sfx, load(SFX + '/' + s['file']), start, gain, pan)


def note(inst, n, t, gain=1.0, pan=0.0, length=None):
    place(music, load(f'{SF}/{inst}/{n}.mp3'), t, gain, pan, maxlen=length, fade=0.08 if length else 0)


def drum(path, t, gain=1.0, pan=0.0):
    place(music, load(DS + '/' + path), t, gain, pan)


B = 0.5  # 120 bpm
KICK = '808bd/BD5010.WAV'
HAT = 'linnhats/1.wav'
OHAT = 'linnhats/4.wav'

# ---------------- MUSIC ----------------
# intro (0-4): sparse kalimba/glock answering the UI moves
note('kalimba', 'C5', 0.55, 0.35, -0.2)
note('kalimba', 'G5', 0.62, 0.25, 0.2)
note('glockenspiel', 'E6', 1.62, 0.22, 0.3)
note('kalimba', 'E5', 1.72, 0.3, -0.2)
note('glockenspiel', 'G6', 2.06, 0.25, 0.2)
note('glockenspiel', 'G6', 2.31, 0.22, -0.2)
note('pizzicato_strings', 'C3', 2.5, 0.45)
note('pizzicato_strings', 'G2', 3.0, 0.45)
# riser into the drop: marimba 16ths climbing + crescendo
riser = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6']
for i, n in enumerate(riser):
    t = 3.25 + i * 0.0625
    note('marimba', n, t, 0.18 + 0.32 * i / len(riser), -0.4 + 0.8 * i / len(riser), length=0.5)

# groove sections
CH = {
    'C': (['C4', 'G4', 'C5', 'G4', 'E5', 'G4', 'C5', 'E5'], 'C2', ['C5', 'E5', 'G5']),
    'F': (['F4', 'A4', 'C5', 'A4', 'F5', 'A4', 'C5', 'F5'], 'F2', ['C5', 'F5', 'A5']),
    'G': (['G4', 'B4', 'D5', 'B4', 'G5', 'B4', 'D5', 'G5'], 'G2', ['D5', 'G5', 'B5']),
    'Am': (['A4', 'C5', 'E5', 'C5', 'A5', 'E5', 'C5', 'E5'], 'A2', ['C5', 'E5', 'A5']),
}
# (start, chord, beats, energy)
plan = [(4.0, 'C', 4, 1), (6.0, 'F', 2, 1), (7.0, 'G', 2, 1),
        (8.5, 'C', 4, 2), (10.5, 'Am', 2, 3), (11.5, 'F', 1, 3)]
for st, ch, beats, en in plan:
    arp, bass, _ = CH[ch]
    for k in range(beats * 2):  # 8th notes
        t = st + k * 0.25
        n = arp[k % 8]
        g = 0.42 if k % 2 == 0 else 0.3
        if en == 3: g *= 0.75
        note('marimba', n, t, g, -0.25 if k % 2 else 0.25, length=0.45)
    # pizz bass: beat 1 and the "and" of 2
    for off in [0, 0.75, 1.5]:
        if off < beats * B:
            bn = bass[:-1] + '3' if off == 0.75 else bass
            note('pizzicato_strings', bn, st + off, 0.7 if en < 3 else 0.55)

# drums 4.0 - 11.95
t = 4.0
while t < 11.95:
    beat = round((t - 4.0) / B)
    night = t >= 10.5
    if beat % 2 == 0 and not night:
        drum(KICK, t, 0.7)
    if beat % 2 == 1:
        S('click-clap-medium' if not night else 'click-clap-soft', t, 0.55 if not night else 0.35, 0.1)
    drum(HAT, t + 0.25, 0.16, 0.3)
    if not night:
        drum(HAT, t, 0.09, -0.3)
    if beat % 4 == 3:
        S('click-snap-soft', t + 0.375, 0.3, -0.35)
    t += B
# fill into the city (8.0-8.5) and accent on the cut
for i in range(4):
    S('click-snap-medium', 8.0 + i * 0.125, 0.25 + 0.06 * i, (-1) ** i * 0.3)
drum(OHAT, 8.5, 0.3)
drum(KICK, 8.62, 0.8)
# city melody on glockenspiel (day)
mel = [(8.62, 'G5'), (8.87, 'E5'), (9.12, 'G5'), (9.37, 'A5'), (9.62, 'G5'), (10.0, 'C6'), (10.25, 'D6'), (10.37, 'E6')]
for t0, n in mel:
    note('glockenspiel', n, t0, 0.32, 0.2)
# night: celesta twinkles
for t0, n in [(10.6, 'E6'), (10.85, 'C6'), (11.1, 'G5'), (11.35, 'A5'), (11.6, 'C6'), (11.85, 'E6')]:
    note('celesta', n, t0, 0.4, -0.2 if t0 % 0.5 else 0.2)
# hit on the cut to the logo toggle
note('pizzicato_strings', 'C3', 12.0, 0.6)
note('marimba', 'G5', 12.0, 0.25)
# end chord (lands with the logo)
for i, n in enumerate(['C4', 'E4', 'G4', 'C5', 'E5', 'G5']):
    note('marimba', n, 13.02 + i * 0.03, 0.34)
note('pizzicato_strings', 'C2', 13.02, 0.7)
note('glockenspiel', 'C6', 13.15, 0.3, 0.3)
note('glockenspiel', 'G6', 13.3, 0.22, -0.3)

# ---------------- SFX ----------------
S('pop-medium-in', 0.04, 0.5)
for i in range(3):
    S('pop-small-in', 0.12 + i * 0.06, 0.35, (-0.5, 0.2, 0.6)[i])
S('swipe-fast-soft', 0.3, 0.45, -0.2)
S('click-toggle-on-firm', 0.555, 0.9, 0.2, sync=True)
S('whoosh-medium-soft', 1.28, 0.55, 0, sync=True)
S('click-latch-soft', 1.5, 0.5, sync=True)
S('pop-large-in', 1.6, 0.55)
S('time-clock-fast', 1.75, 0.22)
for i, tt in enumerate([1.72, 1.82, 1.92]):
    S('pop-small-in', tt, 0.3, (-0.4, 0.3, 0.5)[i])
S('time-timer', 2.05, 0.75, 0, sync=True)
S('reverse-whoosh-medium-soft', 3.93, 0.5, 0, sync=True)
S('pop-large-in', 3.96, 0.7)
S('appear-burst', 4.0, 0.35)
for i in range(7):
    S(('pop-small-in', 'pop-medium-in', 'pop-small-bubble')[i % 3], 4.04 + i * 0.035, 0.3, (-0.8 + 0.27 * i))
for ft in [4.38, 4.58, 4.72, 4.85, 4.96, 5.06]:
    S('appear-flip-quick', ft + 0.2, 0.55, 0.1, sync=True)
S('whoosh-fast-medium', 5.15, 0.5, sync=True)
S('pop-large-in', 5.2, 0.55)
S('whoosh-slow-soft', 5.95, 0.4, -0.3, sync=True)
for d in range(10):
    S('appear-flip-quick', 5.45 + 0.075 * d + 0.25, 0.42 - 0.02 * d, -0.6 + 0.13 * d, sync=True)
for i in range(4):
    S('pop-small-in', 5.32 + i * 0.05, 0.25, (-0.7, 0.7, 0.6, 0)[i])
for i, tt in enumerate([7.17, 7.28, 7.39, 7.5, 7.61]):
    S('pop-medium-bubble', tt, 0.35 - 0.04 * i, (-1) ** i * 0.4)
S('whoosh-medium-soft', 7.5, 0.35, 0.3, sync=True)
S('move-zoom-in', 8.6, 0.6, 0, sync=True)
blds = [8.70, 8.78, 8.86, 8.74, 8.92, 9.00, 9.13, 9.25, 9.06, 9.19, 9.31, 9.37, 9.45, 9.56, 9.62, 9.68, 9.74, 9.80, 9.86]
for i, tt in enumerate(sorted(set(round(x, 2) for x in blds))):
    S(('pop-medium-in', 'pop-large-in', 'pop-small-in')[i % 3], tt + 0.08, 0.32, (-0.6 + 1.2 * ((i * 7) % 10) / 10))
S('transform-grow', 8.7, 0.3, 0.3)
S('whoosh-slow-soft', 10.6, 0.35, 0, sync=True)
S('shimmer-medium-soft', 10.82, 0.45, -0.2)
S('transform-morph', 10.85, 0.35, 0.3)
S('shimmer-short-bright', 11.05, 0.3, 0.3)
for i in range(7):
    S('data-tick', 10.98 + i * 0.08, 0.35, (-1) ** i * 0.5)
S('swish-hard', 11.98, 0.55, 0, sync=True)
S('pop-medium-in', 12.05, 0.55)
S('pop-small-in', 12.11, 0.35, -0.7)
S('pop-small-in', 12.17, 0.35, 0.7)
S('swipe-fast-firm', 12.36, 0.45)
S('click-toggle-on-firm', 12.6, 0.9, 0.2, sync=True)
S('whoosh-medium-medium', 12.95, 0.5, 0, sync=True)
S('sting-playful-short', 13.1, 0.75, 0, sync=True)
S('zip-in-soft', 13.75, 0.45, 0.6, sync=True)
S('pop-small-in', 13.5, 0.3, -0.3)
S('click-toggle-soft', 14.12, 0.45, -0.7, sync=True)
for i in range(3):
    S('pop-small-in', 13.57 + i * 0.07, 0.22, (-0.6, -0.3, 0.2)[i])

# ---------------- MIX ----------------
# small room reverb on music
rng = np.random.default_rng(1)
L = int(SR * 1.1)
env = np.exp(-np.linspace(0, 6.5, L))
ir = np.stack([rng.standard_normal(L) * env, rng.standard_normal(L) * env], 1).astype(np.float32)
b, a = butter(2, 6000 / (SR / 2))
ir = lfilter(b, a, ir, axis=0)
ir /= np.abs(ir).sum(0).max() / 6
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
mus = music + wet * 0.22
# gentle low cut on music, a little glue
b, a = butter(2, 45 / (SR / 2), 'high'); mus = lfilter(b, a, mus, axis=0)
mix = mus * 0.9 + sfx * 1.0
# fade the very end
f = int(0.4 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
# soft limiter
peak = np.abs(mix).max()
mix = mix / peak * 1.25
mix = np.tanh(mix) / np.tanh(1.25) * 0.93
import soundfile as sf
sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_16')
print('peak', peak, 'written', OUT)

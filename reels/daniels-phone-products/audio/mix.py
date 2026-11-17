"""Soundtrack for the Daniel's Phone product reel (34.4s, 140 BPM half-time) v4: original modern trap/pop bed
(pitched 808 bass, FluidR3 EP + pizzicato hook + pad, Dirt-Samples drums, light SFX) + CC0 SFX (wyzowl/sfx-kit) on every cut.
Run: python3 -I mix.py <sfx_kit_dir> <FluidR3_GM_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 34.4; N = int(SR * DUR)
music = np.zeros((N, 2), np.float32); drums = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
_c = {}
def load(p):
    if p not in _c:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[p]
def place(bus, a, t, g=1.0, pan=0.0, maxlen=None, fade=0.05):
    if maxlen:
        a = a[:int(maxlen * SR)].copy(); f = min(int(fade * SR), len(a)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    if i >= N: return
    n = min(len(a), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[i:i + n, 0] += a[:n, 0] * g * l; bus[i:i + n, 1] += a[:n, 1] * g * r
_d = json.load(open(SFX + '/sounds.json')); _d = _d if isinstance(_d, list) else _d.get('sounds', [])
META = {s['id']: s for s in _d if isinstance(s, dict) and 'file' in s}
def S(name, t, g=1.0, pan=0.0, sync=False):
    s = META[name]; st = t - (s.get('sync', {}).get('at', 0) if sync else 0)
    place(sfx, load(SFX + '/' + s['file']), st, g, pan)
def note(inst, n, t, g=1.0, pan=0.0, length=None):
    place(music, load(f'{SF}/{inst}-mp3/{n}.mp3'), t, g, pan, maxlen=length, fade=0.12)
def drum(p, t, g=1.0, pan=0.0):
    place(drums, load(DS + '/' + p), t, g, pan)



BPM = 140; B = 60 / BPM; BAR = 4 * B
KICK = 'clubkick/1.wav'; KICK2 = '808bd/BD0025.WAV'; CLAP = 'cp/HANDCLP0.wav'; CP8 = '808/CP.WAV'
SN = 'sn/ST0T0S7.wav'; HAT = 'hh/000_hh3closedhh.wav'; HAT8 = '808/CH.WAV'; OHAT = 'hh/007_hh3openhh.wav'
NOTE = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(n): return 440 * 2 ** ((NOTE[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)
# --- pitched 808 from the sfx kit
_808 = load(SFX + '/' + META['bass-808-long']['file']).mean(1)
seg_ = _808[int(.05 * SR):int(.6 * SR)]; sp = np.abs(np.fft.rfft(seg_ * np.hanning(len(seg_)))); fr = np.fft.rfftfreq(len(seg_), 1 / SR)
m = (fr > 30) & (fr < 120); F0 = fr[m][sp[m].argmax()]
def b808(n, t, g=0.7, length=1.0):
    r = hz(n) / F0; x = np.interp(np.arange(0, len(_808) - 1, r), np.arange(len(_808)), _808)[:int(length * SR)].astype(np.float32)
    f = min(int(.06 * SR), len(x)); x[-f:] *= np.linspace(1, 0, f)
    x = np.tanh(x * 1.6) / np.tanh(1.6)
    place(bass, np.stack([x, x], 1), t, g)
bass = np.zeros((N, 2), np.float32)
# A minor: Am - F - Dm - E   (harmonic minor colour on E)
CH = [(['A3', 'C4', 'E4'], 'A1'), (['F3', 'A3', 'C4'], 'F1'), (['D3', 'F3', 'A3'], 'D2'), (['E3', 'Ab3', 'B3'], 'E1')]
HOOK = [('E5', 0), ('C5', .5), ('A4', 1), ('B4', 1.5), ('C5', 2), ('D5', 2.5), ('C5', 3), ('B4', 3.5),
        ('A4', 4), ('C5', 4.5), ('F5', 5), ('E5', 5.75), ('D5', 6), ('C5', 6.5), ('B4', 7), ('Ab4', 7.5)]

def section(t0, t1, hook=True, lite=False):
    t = t0; bar = 0
    while t < t1 - 1e-6:
        chord, root = CH[bar % 4]
        # half-time drums: kick 1 + 2.5 (+ 4.75 every other bar), snare/clap on 3
        for o, g in ((0, .9), (1.5, .7)) + (((3.5, .55),) if bar % 2 else ()):
            if t + o * B < t1: drum(KICK, t + o * B, g); drum(KICK2, t + o * B, g * .35)
        if t + 2 * B < t1: drum(CLAP, t + 2 * B, .5, .05); drum(SN, t + 2 * B, .28, -.05); drum(CP8, t + 2 * B, .2)
        # hats: 8ths, with 16th / triplet rolls at bar ends
        for s in range(8):
            if t + s * B / 2 < t1: drum(HAT8 if s % 2 else HAT, t + s * B / 2, .11 if s % 2 else .14, (-.2, .2)[s % 2])
        if bar % 2 and not lite:
            for s in range(6): drum(HAT, t + 3 * B + s * B / 6, .07 + .01 * s, .3)
        if bar % 4 == 3 and not lite: drum(OHAT, t + 3.5 * B, .12, .3)
        # 808: root on 1, slide-ish re-hit on 2.5
        b808(root, t, .75, length=1.5 * B - .02)
        b808(root, t + 1.5 * B, .6, length=2.5 * B - .02)
        # chords: pad + EP stabs
        for i, n in enumerate(chord): note('pad_2_warm', n, t, .08, (-.5, 0, .5)[i], length=BAR + .1)
        for o in (0, 1.5, 3) if not lite else (0,):
            for i, n in enumerate(chord): note('electric_piano_1', n, t + o * B + i * .005, .14, (-.3, 0, .3)[i], length=.35)
        t += BAR; bar += 1
    if hook:
        h = t0
        while h < t1 - 1e-6:
            for n, o in HOOK:
                if h + o * B < t1 - .05: note('pizzicato_strings', n, h + o * B, .26, .15, length=.3); note('electric_piano_1', n, h + o * B, .08, -.15, length=.25)
            h += 2 * BAR

# ---- intro 0-2.6 (logo)
for n in ['A2', 'E3', 'A3', 'C4']: note('pad_2_warm', n, 0.0, 0.16, length=2.7)
for i, n in enumerate(['A4', 'C5', 'E5', 'A5']): note('orchestral_harp', n, 0.3 + i * 0.08, 0.22, length=1.6)
b808('A1', 0.3, 0.6, length=1.8)
S('riser-2s-soft', 2.6, 0.35, sync=True); S('reverse-whoosh-long-soft', 2.6, 0.35, sync=True)
# ---- main
section(2.6, 18.6, hook=False)          # verse: groove, no hook
for n in CH[3][0]: note('pad_2_warm', n, 18.6, 0.14, length=1.1)   # break
b808('E1', 18.6, .5, length=.9)
S('riser-1s-strong', 19.6, 0.4, sync=True)
section(19.6, 30.4, hook=True)          # drop: + pizzicato hook
# ---- outro 30.4
drum(KICK, 30.4, 0.95); drum(KICK2, 30.4, 0.5); S('cinematic-drum-big', 30.4, 0.35)
b808('A1', 30.4, 0.7, length=2.2)
for n in ['A2', 'E3', 'A3', 'C4', 'E4']: note('pad_2_warm', n, 30.4, 0.15, length=4.0)
for i, n in enumerate(['A3', 'C4', 'E4', 'A4']): note('electric_piano_1', n, 30.4 + i * 0.03, 0.2, length=2.0)
for n, o in HOOK[:4]: note('pizzicato_strings', n, 31.0 + o * B, 0.22, 0.1, length=0.4)
for i, n in enumerate(['A4', 'C5', 'E5', 'A5']): note('orchestral_harp', n, 32.6 + i * 0.08, 0.15, length=1.8)

# ---- light SFX (only key moments)
S('impact-deep-soft', 0.3, 0.5); S('shimmer-short-sparkle', 0.4, 0.3)
CUTS = [4.0, 7.4, 10.4, 13.4, 16.6, 19.6, 23.0, 26.0, 27.6, 30.4]
for i, c in enumerate(CUTS): S(['whoosh-fast-medium', 'swish-medium'][i % 2], c - 0.15, 0.22, (-0.3, 0.3)[i % 2])
S('pop-small-in', 4.45, 0.25); S('pop-medium-in', 15.1, 0.25); S('pop-small-in', 20.0, 0.25)
S('pop-medium-in', 23.35, 0.22); S('pop-medium-in', 24.1, 0.22); S('pop-small-in', 28.9, 0.22)
S('shimmer-short-sparkle', 30.55, 0.35)

# ---- mix: light sidechain of music+pad under the kick
kick_t = []
env = np.ones(N, np.float32)
def norm(x, peak):
    m = np.abs(x).max(); return x * (peak / m) if m > 0 else x
mix = norm(music, 0.5) + norm(bass, 0.6) + norm(drums, 0.6) + norm(sfx, 0.35)
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
mix = norm(mix, 0.92).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', OUT], input=mix.tobytes(), check=True)
print('ok', OUT, 'F0', round(F0, 1))

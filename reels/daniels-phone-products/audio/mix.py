"""Soundtrack for the Daniel's Phone product reel (49.5s, 120 BPM): original trap-pop bed
(FluidR3 EP / pad / synth bass / sitar hook + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) on every cut.
Run: python3 -I mix.py <sfx_kit_dir> <FluidR3_GM_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 49.5; N = int(SR * DUR)
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

B = 0.5; BAR = 2.0
KICK = 'clubkick/1.wav'; KICK2 = '808bd/BD0025.WAV'; CLAP = 'cp/HANDCLP0.wav'; SN = 'sn/ST0T0S7.wav'
HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
# A harmonic minor flavour: Am - F - G - E
CH = [(['A3', 'C4', 'E4'], 'A1', 'A2'), (['F3', 'A3', 'C4'], 'F1', 'F2'), (['G3', 'B3', 'D4'], 'G1', 'G2'), (['Ab3', 'B3', 'E4'], 'E1', 'E2')]
HOOK = [('A4', 0), ('B4', .25), ('C5', .5), ('E5', 1.0), ('D5', 1.5), ('C5', 1.75), ('B4', 2.0), ('C5', 2.5), ('B4', 2.75), ('Ab4', 3.0), ('B4', 3.5)]

def groove(t0, t1, full=True, hook=True):
    t = t0; k = 0
    while t < t1 - 1e-6:
        bar = int(round((t - 3.5) / BAR)) % 4; chord, sub, bass = CH[bar]; beat = k % 4
        if full:
            if beat == 0: drum(KICK, t, 0.9); drum(KICK2, t, 0.35)
            if beat == 2 and k % 8 != 6: drum(KICK, t + B * 0.75, 0.6)
            if beat in (1, 3): drum(CLAP, t, 0.45, 0.08); drum(SN, t, 0.22, -0.08)
            for s in range(4 if full else 2):
                drum(HAT, t + s * B / 4, 0.09 if s % 2 else 0.13, 0.25 if s % 2 else -0.2)
            if beat == 3 and (k // 4) % 2 == 1:
                for s in range(3): drum(HAT, t + B * 0.5 + s * B / 6, 0.08, 0.3)
            drum(OHAT, t + B / 2, 0.12, 0.3)
            note('synth_bass_1', sub, t, 0.55, length=0.42)
            note('synth_bass_1', bass, t + B * 0.5, 0.35, length=0.2)
        else:
            if beat == 0: drum(KICK, t, 0.45)
            drum(HAT, t + B / 2, 0.08, 0.2)
        if beat == 0:
            for i, n in enumerate(chord): note('pad_2_warm', n, t, 0.11, (-0.4, 0, 0.4)[i], length=2.1)
        if beat in (0, 2) and full:
            for i, n in enumerate(chord): note('electric_piano_1', n, t + B / 2 + i * 0.006, 0.16, (-0.3, 0, 0.3)[i], length=0.3)
        t += B; k += 1
    if hook:
        h = t0
        while h < t1 - 3.9:
            if int(round((h - 3.5) / BAR)) % 4 in (0,):
                for n, o in HOOK: note('sitar', n, h + o, 0.32, 0.15, length=0.45)
            h += BAR

# ---- intro 0-3.5
for n in ['A2', 'E3', 'A3', 'C4']: note('pad_2_warm', n, 0.0, 0.16, length=3.6)
for i, n in enumerate(['A4', 'E5', 'A5']): note('orchestral_harp', n, 0.3 + i * 0.12, 0.22, length=1.5)
note('synth_bass_1', 'A1', 0.3, 0.5, length=1.2)
for i, (n, o) in enumerate(HOOK[:6]): note('sitar', n, 1.4 + o * 0.9, 0.26, 0.1, length=0.5)
# ---- main
groove(3.5, 27.5)
groove(27.5, 29.0, full=False, hook=False)
groove(29.0, 45.0)
# ---- outro
for n in ['A2', 'E3', 'A3', 'C4', 'E4']: note('pad_2_warm', n, 45.0, 0.15, length=4.3)
for i, n in enumerate(['A3', 'C4', 'E4', 'A4', 'C5']): note('electric_piano_1', n, 45.0 + i * 0.05, 0.22, length=2.5)
note('synth_bass_1', 'A1', 45.0, 0.6, length=1.6)
drum(KICK, 45.0, 0.9); drum(KICK2, 45.0, 0.5)
for n, o in HOOK[:4]: note('sitar', n, 46.2 + o, 0.26, 0.1, length=0.5)
for t in np.arange(45.5, 48.5, 0.5): drum(HAT, t, 0.05, 0.2)
for i, n in enumerate(['A4', 'E5', 'A5', 'C6']): note('orchestral_harp', n, 47.2 + i * 0.09, 0.16, length=2)

# ---- SFX
S('impact-deep-soft', 0.3, 0.6); S('shimmer-short-sparkle', 0.45, 0.4)
S('riser-2s-soft', 1.45, 0.4)
S('boom-hit-medium', 3.5, 0.55); S('whoosh-fast-medium', 3.35, 0.4)
CUTS = [5.5, 10.5, 15, 19.5, 24, 29, 34, 38.5, 41, 45]
for i, c in enumerate(CUTS):
    S(['whoosh-fast-medium', 'swish-medium', 'whoosh-medium-soft', 'zip-in-medium'][i % 4], c - 0.18, 0.42, (-0.3, 0.3)[i % 2])
    S('impact-light-firm' if i % 2 else 'impact-medium-soft', c, 0.35)
S('pop-small-in', 6.15, 0.4)                         # Q625 tag
S('click-toggle-medium', 10.9, 0.45); S('pop-medium-in', 15.4, 0.4)  # chips
for i in range(12): S('click-tap-soft', 19.7 + i * 0.22, 0.12 + 0.02 * (i % 3))  # 360 counter ticks
S('pop-medium-in', 21.8, 0.4); S('appear-flip-quick', 24.0, 0.4)
S('riser-1s-strong', 27.6, 0.45); S('swipe-medium-firm', 27.55, 0.4)
S('pop-small-in', 29.55, 0.4)
for i in range(10): S('click-tap-soft', 30.4 + i * 0.2, 0.12)
S('pop-medium-in', 34.5, 0.4); S('pop-medium-in', 35.6, 0.4)
S('swipe-fast-firm', 38.45, 0.4)
S('pop-small-in', 42.8, 0.4)
S('shimmer-short-sparkle', 45.2, 0.45); S('boom-hit-soft', 45.0, 0.5)
S('pop-small-in', 46.05, 0.35)

# ---- mix
def norm(x, peak):
    m = np.abs(x).max(); return x * (peak / m) if m > 0 else x
mix = norm(music, 0.55) + norm(drums, 0.62) + norm(sfx, 0.5)
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix = norm(mix, 0.92).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', OUT], input=mix.tobytes(), check=True)
print('ok', OUT)

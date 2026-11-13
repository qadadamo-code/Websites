"""Soundtrack for the Planet intro reel (15s): original deep-house bed (FluidR3 EP/pad/bass + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) synced to the typing.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 11.4; N = int(SR * DUR)
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
META = {s['id']: s for s in _d if isinstance(s, dict)}
def S(name, t, g=1.0, pan=0.0, sync=False, maxlen=None):
    s = META[name]; st = t - (s.get('sync', {}).get('at', 0) if sync else 0)
    place(sfx, load(SFX + '/' + s['file']), st, g, pan, maxlen=maxlen)
def note(inst, n, t, g=1.0, pan=0.0, length=None):
    place(music, load(f'{SF}/{inst}/{n}.mp3'), t, g, pan, maxlen=length, fade=0.12)
def drum(p, t, g=1.0, pan=0.0):
    place(drums, load(DS + '/' + p), t, g, pan)


B = 60/105
KICK = 'clubkick/2.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
CH = [(['A3', 'C4', 'E4', 'G4'], 'A2'), (['F3', 'A3', 'C4', 'E4'], 'F2'), (['C4', 'E4', 'G4', 'D5'], 'C3'), (['G3', 'D4', 'G4', 'A4'], 'G2')]
def groove(t0, t1, start_bar=0, kick=True, g=1.0):
    t = t0; k = 0
    while t < t1 - 1e-6:
        bar = (start_bar + k // 4) % 4; chord, bass = CH[bar]; beat = k % 4
        if kick: drum(KICK, t, 0.9 * g)
        if beat in (1, 3): drum(CLAP, t, 0.38 * g, 0.1)
        drum(HAT, t + B / 2, 0.16 * g, 0.25); drum(HAT, t + B * 0.25, 0.06 * g, -0.3); drum(HAT, t + B * 0.75, 0.07 * g, -0.3)
        note('synth_bass_1', bass, t + B / 2, 0.55 * g, length=0.24)
        if beat in (0, 2):
            for i, n in enumerate(chord): note('electric_piano_1', n, t + B / 2 + i * 0.008, 0.19 * g, (-0.3, -0.1, 0.1, 0.3)[i], length=0.36)
        if beat == 0:
            for n in chord[:3]: note('pad_2_warm', n, t, 0.1 * g, length=4 * B)
        t += B; k += 1
for n in ['A3', 'E4']: note('pad_2_warm', n, 0.0, 0.12, length=0.6)
groove(0.48, 3.35)
# break 3.35-3.9 then drop on the eye
groove(3.9, 9.45, start_bar=0)
for i, n in enumerate(['A3', 'C4', 'E4', 'G4', 'C5']): note('electric_piano_1', n, 9.56 + i * 0.03, 0.2, length=1.8)
for n in ['A3', 'E4', 'C5']: note('pad_2_warm', n, 9.5, 0.15, length=1.9)
note('synth_bass_1', 'A2', 9.56, 0.45, length=1.0)

S('digital-glitch-subtle', 0.12, 0.55); S('digital-glitch-clear', 0.32, 0.45)
def typ(t0, n, dt, g=0.5, kind='keyboard-letter-soft'):
    for i in range(n): S(kind if i % 3 else kind.replace('soft', 'medium'), t0 + i * dt, g * (0.85 + 0.15 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 10)
typ(0.5, 5, 0.07, 0.55)
S('pop-small-bubble', 0.8, 0.45)
S('impact-light-soft', 1.05, 0.45); typ(1.05, 3, 0.035, 0.5)
S('keyboard-return-soft', 1.45, 0.35)
S('swipe-fast-soft', 1.65, 0.35)
typ(1.65, 10, 0.045, 0.42)
S('swish-soft', 2.35, 0.3)
typ(2.55, 5, 0.055, 0.3)
typ(2.9, 7, 0.042, 0.45)
S('riser-1s-soft', 3.9, 0.45, sync=True)
S('pop-small-in', 3.6, 0.5); S('whoosh-fast-soft', 3.65, 0.4)
S('impact-deep-firm', 3.9, 0.6); S('bass-sub-drop-short', 3.9, 0.45)
S('pop-medium-bubble', 4.04, 0.4)
S('appear-materialise', 4.68, 0.3)
S('whoosh-fast-medium', 4.86, 0.45, 0.4)
S('reverse-whoosh-short-soft', 5.3, 0.5, sync=True)
typ(5.35, 12, 0.021, 0.4)
S('writing-pen-tick', 5.88, 0.4)
typ(6.35, 12, 0.015, 0.22)
typ(6.55, 13, 0.02, 0.38)
typ(6.9, 13, 0.0075, 0.18)
typ(7.0, 10, 0.02, 0.38)
S('notification-error-soft', 7.3, 0.25)
typ(7.42, 5, 0.035, 0.4)
S('swish-soft', 7.66, 0.4)
S('appear-dissolve', 7.8, 0.3)
S('pop-small-in', 8.0, 0.5)
S('whoosh-medium-soft', 8.15, 0.4)
S('impact-medium-soft', 8.4, 0.45)
for i in range(4): S('click-tap-soft', 8.58 + i * 0.19, 0.35, (-0.3, 0.1, -0.1, 0.3)[i])
S('whoosh-slow-soft', 9.33, 0.3)
txt = 'THE PLANET CO.'
for i, c in enumerate(txt):
    if c != ' ': S('keyboard-letter-firm' if i % 2 else 'keyboard-letter-medium', 9.56 + i * 0.045, 0.38, ((i * 3) % 5 - 2) / 8)
S('shimmer-short-soft', 10.2, 0.3)

mix = music * 0.9 + drums * 0.8 + sfx * 1.0
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.9 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

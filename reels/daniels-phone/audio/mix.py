"""Soundtrack for the Planet intro reel (15s): original deep-house bed (FluidR3 EP/pad/bass + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) synced to the typing.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 15.0; N = int(SR * DUR)
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

B = 0.5
KICK = 'clubkick/1.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
CH = [(['A3', 'C4', 'E4', 'G4'], 'A2'), (['F3', 'A3', 'C4', 'E4'], 'F2'), (['C4', 'E4', 'G4', 'D5'], 'C3'), (['G3', 'D4', 'G4', 'A4'], 'G2')]
# intro pad
for n in ['A3', 'C4', 'E4']: note('pad_2_warm', n, 0.0, 0.18, length=1.6)
# groove from 1.45, bar = 4 beats = 2s
def bars(t0, t1, kick=True):
    t = t0; k = 0
    while t < t1 - 1e-6:
        bar = int(round((t - 1.45) / (4 * B))) % 4; chord, bass = CH[bar]
        beat = k % 4
        if kick: drum(KICK, t, 0.85)
        if beat in (1, 3) and kick: drum(CLAP, t, 0.35, 0.1)
        drum(OHAT if kick else HAT, t + B / 2, 0.22 if kick else 0.12, 0.25)
        drum(HAT, t + B * 0.25, 0.07, -0.3); drum(HAT, t + B * 0.75, 0.07, -0.3)
        # bass: root on the off-beat (deep house)
        note('synth_bass_1', bass, t + B / 2, 0.55 if kick else 0.3, length=0.22)
        # EP stab on the off-beat of beat 1 and 3, pad on bar start
        if beat in (0, 2):
            for i, n in enumerate(chord): note('electric_piano_1', n, t + B / 2 + i * 0.008, 0.2, (-0.3, -0.1, 0.1, 0.3)[i], length=0.35)
        if beat == 0:
            for n in chord[:3]: note('pad_2_warm', n, t, 0.12, length=2.0)
        t += B; k += 1
bars(1.45, 4.3)
bars(4.3, 5.45, kick=False)
bars(5.45, 9.12)
bars(9.12, 10.2, kick=False)
bars(10.2, 11.95)
# end: soft chord + EP sparkle
for i, n in enumerate(['A3', 'C4', 'E4', 'G4', 'C5']): note('electric_piano_1', n, 13.3 + i * 0.04, 0.24, length=1.7)
for n in ['A3', 'E4', 'C5']: note('pad_2_warm', n, 12.3, 0.16, length=2.7)
note('synth_bass_1', 'A2', 13.3, 0.5, length=1.2)
for t in np.arange(12.45, 14.4, 0.25): drum(HAT, t, 0.05, 0.2)

# ---- SFX ----
S('digital-glitch-subtle', 0.14, 0.5); S('digital-glitch-clear', 0.34, 0.45)
S('impact-light-soft', 0.5, 0.5)
def typ(t0, n, rate, g=0.55, kind='keyboard-letter-soft'):
    for i in range(n): S(kind if i % 3 else kind.replace('soft', 'medium'), t0 + i / rate, g * (0.85 + 0.15 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 10)
typ(0.5, 5, 10)
S('shimmer-short-sparkle', 1.1, 0.45)
S('bass-sub-drop-short', 1.45, 0.6); S('impact-medium-soft', 1.45, 0.4)
typ(1.55, 4, 26, 0.5)
S('move-zoom-out', 2.0, 0.5)
typ(2.3, 14, 22, 0.45)
typ(3.1, 14, 40, 0.3)
typ(3.58, 13, 36, 0.42)
S('pop-small-in', 3.95, 0.6); S('swipe-medium-soft', 4.02, 0.45)
S('appear-flip-quick', 4.3, 0.45); S('impact-deep-soft', 4.3, 0.5)
S('pop-medium-bubble', 4.42, 0.4)
S('whoosh-fast-medium', 4.95, 0.45, 0.4)
S('reverse-whoosh-short-soft', 5.5, 0.55, sync=True)
S('impact-light-firm', 5.5, 0.45)
roles = [('أحدث الأجهزة', 26, 0.3, 50), ('كل الإكسسوارات', 32, 0.25, 52), ('صيانة لكل جهاز', 32, 0.25, 52), ('بدّل قديمك', 30, 0.35, 0)]
s = 5.62
for w, cps, hold, de in roles:
    n = len(w); typ(s, n, cps, 0.42)
    b = s + n / cps; c = b + hold
    if de: typ(c, n, de, 0.25)
    d = c + n / de if de else c; s = d + 0.03
    last_c = c
S('swish-soft', last_c, 0.5)
S('appear-dissolve', 9.12, 0.35)
S('pop-small-in', 9.32, 0.55); S('click-tap-soft', 9.66, 0.5)
S('riser-1s-soft', 10.2, 0.4, sync=True)
S('whoosh-medium-soft', 9.7, 0.45)
S('impact-deep-firm', 10.2, 0.55); S('boom-hit-soft', 10.2, 0.35)
for i in range(4): S('click-tap-soft', 10.35 + i * 0.3, 0.4, (-0.3, 0.1, -0.1, 0.3)[i])
S('whoosh-slow-soft', 11.85, 0.4)
txt = "DANIEL'S PHONE."
for i, ch in enumerate(txt):
    if ch != ' ': S('keyboard-letter-firm' if i % 2 else 'keyboard-letter-medium', 12.4 + i * 0.055, 0.42, ((i * 3) % 5 - 2) / 8)
S('sting-tech-short', 13.3, 0.5)
S('notification-success-sparkle', 13.35, 0.25)

# ---- mix ----
mix = music * 0.9 + drums * 0.8 + sfx * 1.0
# fades
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

"""Soundtrack for Planet reel 4 (30s, 123 BPM): original deep-house bed (FluidR3 EP/pad/bass + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) synced to the typing.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 30.0; N = int(SR * DUR)
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


B = 60 / 123
KICK = 'clubkick/1.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'; SN = 'hh/011_hh3snare1.wav'
CH = [(['A3', 'C4', 'E4', 'G4'], 'A1', 'A2'), (['F3', 'A3', 'C4', 'E4'], 'F1', 'F2'), (['C4', 'E4', 'G4', 'B4'], 'C2', 'C3'), (['G3', 'B3', 'D4', 'G4'], 'G1', 'G2')]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]
def groove(t0, t1, kick=True, chords=True, arp=False, brass=False, clap=True, g=1.0):
    k = int(round(t0 / B))
    while k * B < t1 - 1e-6:
        t = k * B; beat = k % 4; chord, b1, b2 = CH[(k // 4) % 4]
        if kick: drum(KICK, t, 0.9 * g)
        if clap and beat in (1, 3): drum(CLAP, t, 0.42 * g, 0.1)
        drum(OHAT, t + B / 2, 0.2 * g, 0.25); drum(HAT, t + B * 0.25, 0.07 * g, -0.3); drum(HAT, t + B * 0.75, 0.07 * g, -0.3)
        note('synth_bass_1', b2 if k % 2 else b1, t + B / 2, 0.55 * g, length=0.2)
        note('synth_bass_1', b2, t + B * 0.75, 0.3 * g, length=0.12)
        if chords and beat in (0, 2):
            for i, n in enumerate(chord): note('electric_piano_1', n, t + B / 2 + i * 0.006, 0.17 * g, (-0.3, -0.1, 0.1, 0.3)[i], length=0.3)
        if brass and beat == 0:
            for n in chord[:3]: note('synth_brass_1', n, t, 0.10 * g, length=0.25)
        if arp:
            for j in range(2):
                n = chord[ARP[(k * 2 + j) % 8]]; n = n[:-1] + str(int(n[-1]) + 1)
                note('orchestral_harp', n, t + j * B / 2, 0.14 * g, 0.35 if j else -0.35, length=0.3)
        if beat == 0 and chords:
            for n in chord[:3]: note('pad_2_warm', n, t, 0.09 * g, length=4 * B)
        k += 1
# arrangement (cuts land on beats)
for n in ['A3', 'E4']: note('pad_2_warm', n, 0, 0.12, length=2)
groove(0.0, 8.29, chords=False, arp=True, clap=True, g=0.9)
groove(8.29, 16.59, chords=True, arp=False, brass=True)
groove(16.59, 23.41, chords=True, arp=True, brass=False)
for i in range(16): drum(SN, 23.41 + i * B / 8 * 4 * (1 - i / 40) / 2, 0.15 + i * 0.025, 0)
note('synth_bass_1', 'A1', 24.39, 0.6, length=0.6)
groove(24.88, 28.05, chords=True, arp=True, brass=True)
for i, n in enumerate(['A3', 'C4', 'E4', 'G4', 'C5']): note('electric_piano_1', n, 28.1 + i * 0.03, 0.25, length=1.8)
for n in ['A3', 'E4', 'C5']: note('pad_2_warm', n, 28.05, 0.16, length=1.9)
note('synth_bass_1', 'A1', 28.1, 0.55, length=1.0); drum(KICK, 28.1, 0.9)

# ---- SFX ----
S('impact-light-soft', 0.0, 0.4); S('swish-soft', 0.7, 0.4)
S('pop-medium-in', 0.98, 0.45); S('impact-medium-soft', 0.98, 0.35); S('swipe-fast-soft', 1.78, 0.45)
S('move-zoom-in', 2.05, 0.4); S('data-countup-medium', 2.2, 0.32)
S('swipe-medium-firm', 4.05, 0.45); S('reverse-whoosh-short-soft', 4.8, 0.4)
S('appear-materialise', 5.0, 0.35)
for i in range(7): S('pop-small-in', 5.15 + i * 0.32, 0.32, ((i * 3) % 5 - 2) / 5)
S('data-bar-grow', 5.85, 0.3); S('whoosh-fast-medium', 8.1, 0.4) if 'whoosh-fast-medium' in META else None
for i, t in enumerate([8.75, 9.6, 10.8, 13.3, 14.45, 15.0, 15.55]): S('swipe-fast-soft', t - 0.05, 0.4, (-0.3, 0.3)[i % 2]); S('click-snap-soft', t + 0.12, 0.3)
S('whoosh-slow-soft', 12.55, 0.35) if 'whoosh-slow-soft' in META else None
S('swish-hard', 16.55, 0.4); S('impact-medium-firm', 16.9, 0.45); S('pop-large-in', 17.42, 0.45)
for i in range(6): S('click-snap-medium', 17.88 + i * 0.07, 0.35, ((i * 2) % 5 - 2) / 4)
S('swish-medium', 18.45, 0.4)
for i, t in enumerate([18.75, 19.05, 19.35, 19.7]): S('foley-paper-slide', t, 0.35, (-0.2, 0.2)[i % 2])
for i in range(9): S('notification-message-in-soft' if i % 2 else 'pop-small-bubble', 20.32 + i * 0.09, 0.22, ((i * 5) % 7 - 3) / 5)
S('pop-medium-bubble', 21.3, 0.4); S('swish-medium', 21.95, 0.4)
S('pop-small-in', 22.15, 0.4); S('impact-heavy-firm', 22.55, 0.4); S('impact-heavy-firm', 22.85, 0.4); S('pop-large-bubble', 23.0, 0.4)
S('swipe-medium-soft', 23.3, 0.35); S('riser-1s-strong', 23.4, 0.35)
S('boom-hit-strong', 24.45, 0.45); S('shimmer-short-bright', 24.47, 0.35)
S('boom-drop-medium', 24.9, 0.4)
import random; random.seed(4)
for i in range(18): S(random.choice(['foley-plastic-touch', 'foley-wood-touch', 'pop-small-out']), 25.6 + random.random() * 2.5, 0.18, random.uniform(-0.6, 0.6))
S('reverse-whoosh-short-strong', 27.75, 0.4, sync=True); S('impact-deep-hard', 28.1, 0.5); S('sting-bright-short', 28.35, 0.35)
S('click-tap-soft', 28.7, 0.35)

mix = music * 0.9 + drums * 0.8 + sfx * 1.0
fi = int(0.01 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

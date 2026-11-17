"""Soundtrack for the Planet Swiss-intro reel (30s, 112.5 BPM, cuts on the beat).
Original minimal house bed (FluidR3 GM samples + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit).
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 30.0; N = int(SR * DUR)
B = 60 / 112.5
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
    place(music, load(f'{SF}/{inst}/{n}.mp3'), t, g, pan, maxlen=length, fade=0.1)
def drum(p, t, g=1.0, pan=0.0):
    place(drums, load(DS + '/' + p), t, g, pan)

KICK = 'clubkick/1.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
bt = lambda k: k * B
# progression, one chord per bar (4 beats): Am9 - Fmaj7 - C - G
CH = [(['A3', 'C4', 'E4', 'G4', 'B4'], 'A1', 'A2'), (['F3', 'A3', 'C4', 'E4', 'G4'], 'F2', 'F2'), (['C4', 'E4', 'G4', 'B4', 'D5'], 'C2', 'C3'), (['G3', 'B3', 'D4', 'A4', 'E5'], 'G2', 'G2')]
ARP = [0, 2, 4, 3, 1, 3, 2, 4]

def section(k0, k1, kick=True, clap=True, hats=1, bass=True, keys=True, arp=False, pad=True, gain=1.0):
    for k in range(k0, k1):
        t = bt(k); bar = (k // 4) % 4; chord, bl, bh = CH[bar]; beat = k % 4
        if kick: drum(KICK, t, 0.9 * gain)
        if clap and beat in (1, 3): drum(CLAP, t, 0.33 * gain, 0.08)
        if hats >= 1: drum(OHAT, t + B / 2, 0.17 * gain, 0.25)
        if hats >= 2:
            drum(HAT, t + B / 4, 0.08 * gain, -0.3); drum(HAT, t + 3 * B / 4, 0.08 * gain, -0.3)
        if hats >= 3: drum(HAT, t, 0.06 * gain, 0.35)
        if bass:
            note('synth_bass_1', bh, t + B / 2, 0.5 * gain, length=0.24)
            if beat == 0: note('synth_bass_1', bl, t, 0.35 * gain, length=0.3)
        if keys and beat in (0, 2):
            for i, n in enumerate(chord[:4]): note('electric_piano_1', n, t + B / 2 + i * 0.006, 0.16 * gain, (-0.3, -0.1, 0.1, 0.3)[i], length=0.32)
        if pad and beat == 0:
            for n in chord[:3]: note('pad_2_warm', n, t, 0.1 * gain, length=4 * B)
        if arp:
            for s in range(2):
                n = chord[ARP[(k * 2 + s) % 8]]
                note('marimba', n, t + s * B / 2, 0.22 * gain, ((k * 2 + s) % 5 - 2) / 6, length=0.3)

# 0 - 2 beats: dark grid, drone + swell
for n in ['A2', 'E3', 'A3']: note('pad_3_polysynth', n, 0.0, 0.12, length=1.2)
S('riser-1s-soft', bt(2), 0.45, sync=True)
# 2 - 11: hello / name / silhouette, light groove
section(2, 11, kick=True, clap=False, hats=1, bass=True, keys=True, pad=True, gain=0.8)
# 11 - 15: four role cards (cut every beat)
section(11, 15, kick=True, clap=True, hats=2, bass=True, keys=True, gain=0.95)
# 15 - 17: name card, breath
section(15, 17, kick=False, clap=False, hats=1, bass=False, keys=True, pad=True, gain=0.7)
# 17 - 38: creativity / icons / wheel
section(17, 25, kick=True, clap=True, hats=2, arp=True, gain=0.9)
section(25, 27, kick=False, clap=False, hats=1, bass=True, arp=True, gain=0.85)
section(27, 38, kick=True, clap=True, hats=2, arp=True, gain=0.95)
# 38 - 40: build (clap roll + riser)
for i in range(16): drum(CLAP, bt(38) + i * B / 8, 0.12 + 0.025 * i, ((i % 4) - 1.5) / 5)
S('riser-1s-strong', bt(40), 0.55, sync=True)
# 40 - 48: drop, rapid montage
section(40, 48, kick=True, clap=True, hats=3, arp=True, gain=1.12)
# 48 - end: outro
for i, n in enumerate(['A3', 'C4', 'E4', 'G4', 'B4']): note('electric_piano_1', n, bt(48) + i * 0.03, 0.22, length=2.2)
for n in ['A2', 'E3', 'A3', 'C4']: note('pad_2_warm', n, bt(48), 0.14, length=4.2)
note('synth_bass_1', 'A1', bt(48), 0.5, length=1.6)
section(48, 52, kick=True, clap=False, hats=1, bass=True, keys=False, pad=False, gain=0.72)
for i, n in enumerate(['A3', 'E4', 'G4', 'C5']): note('electric_piano_1', n, bt(52) + i * 0.04, 0.18, length=2.2)
for n in ['F3', 'A3', 'C4', 'E4']: note('pad_2_warm', n, bt(52), 0.12, length=2.3)

# ---------------- SFX
def typ(t0, n, rate, g=0.45, kind='keyboard-letter-soft'):
    for i in range(n): S(kind if i % 3 else kind.replace('soft', 'medium'), t0 + i / rate, g * (0.85 + 0.15 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 10)
S('digital-blip-subtle', 0.15, 0.35); S('click-tap-soft', 0.55, 0.3)
typ(1.1, 5, 9)
S('pop-small-in', 1.78, 0.45)
S('impact-light-soft', 2.0, 0.5)
S('swipe-medium-soft', 2.5, 0.4)
typ(2.78, 14, 16, 0.38)
typ(3.45, 16, 40, 0.18)
S('whoosh-fast-soft', 3.95, 0.5); S('impact-deep-soft', 4.08, 0.45)
typ(4.55, 8, 48, 0.2)
S('swish-soft', 5.33, 0.4); typ(5.36, 10, 26, 0.38)
for i in range(4): S('impact-light-firm', 5.87 + i * B, 0.42); S('click-snap-soft', 5.87 + i * B, 0.25, (-0.2, 0.2, -0.1, 0.1)[i])
S('appear-flip-quick', 8.0, 0.35)
S('move-zoom-out', 8.62, 0.45)
S('whoosh-medium-soft', 9.0, 0.4)
S('pop-small-in', 9.1, 0.35); S('click-mouse-soft', 9.6, 0.45); S('click-mouse-soft', 10.0, 0.45)
for i in range(4): S('pop-small-bubble', 10.5 + i * 0.07, 0.3, (-0.3, -0.1, 0.1, 0.3)[i])
for i in range(6): S('click-tap-soft', 11.0 + i * 0.32, 0.32, ((i % 3) - 1) / 3)
S('swipe-fast-soft', 12.9, 0.4); S('pop-medium-in', 13.12, 0.4)
S('move-zoom-out', 13.95, 0.4)
for k in range(28, 40):
    S('mechanical-ratchet-light', 14.6 + (k - 28) * B, 0.16, -0.2, maxlen=0.18)
S('shimmer-short-soft', 20.25, 0.35)
for i in range(31):
    S('mechanical-shutter-light' if i % 2 == 0 else 'click-snap-soft', 21.33 + i * B / 4, 0.16, ((i % 5) - 2) / 6, maxlen=0.12)
S('impact-deep-firm', 21.33, 0.55); S('boom-hit-soft', 21.33, 0.3)
S('reverse-whoosh-short-soft', 25.6, 0.4, sync=True)
S('impact-deep-soft', 25.6, 0.45)
S('transform-grow', 25.95, 0.35)
typ(26.6, 30, 38, 0.17)
S('swipe-slow-soft', 27.35, 0.3)
S('sting-minimal-short', 28.1, 0.45)
S('notification-success-soft', 28.3, 0.2)

mix = music * 0.9 + drums * 0.78 + sfx * 1.0
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fs = int(28.6 * SR); fo = N - fs; mix[fs:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

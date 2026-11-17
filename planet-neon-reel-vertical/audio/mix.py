"""Soundtrack for the Planet neon reel (37.8s, 96 BPM ambient-electronic).
Original bed from FluidR3 GM samples + Dirt-Samples drums, CC0 SFX from wyzowl/sfx-kit.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 37.8; N = int(SR * DUR)
B = 60 / 96
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
    place(music, load(f'{SF}/{inst}-mp3/{n}.mp3'), t, g, pan, maxlen=length, fade=0.15)
def drum(p, t, g=1.0, pan=0.0, maxlen=None):
    place(drums, load(DS + '/' + p), t, g, pan, maxlen=maxlen)
KICK = 'clubkick/1.wav'; SUB = '808bd/BD0050.WAV'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
bt = lambda k: k * B
# Dmaj9 - Bm9 - Gmaj7 - Aadd9  (one chord per bar)
CH = [(['D4', 'F#4', 'A4', 'C#5', 'E5'], 'D2'), (['B3', 'D4', 'F#4', 'A4', 'C#5'], 'B1'), (['G3', 'B3', 'D4', 'F#4', 'A4'], 'G1'), (['A3', 'C#4', 'E4', 'B4', 'E5'], 'A1')]
def fix(n): return n.replace('#', 'b').replace('C#', 'Db') if '#' in n else n
FLAT = {'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'}
def nn(n):
    for k, v in FLAT.items():
        if n.startswith(k): return v + n[len(k):]
    return n
ARP = [0, 2, 4, 1, 3, 2, 4, 3]
def bars(k0, k1, kick=0, hats=0, bass=False, keys=False, pad=True, arp=False, clap=False, gain=1.0):
    for k in range(k0, k1):
        t = bt(k); bar = (k // 4) % 4; chord, bl = CH[bar]; beat = k % 4
        if pad and beat == 0:
            for i, n in enumerate(chord[:4]): note('pad_7_halo', nn(n), t, 0.09 * gain, (-0.4, -0.1, 0.1, 0.4)[i], length=4 * B + 0.4)
            note('pad_2_warm', nn(chord[0]).replace('4', '3'), t, 0.08 * gain, length=4 * B + 0.4)
        if kick == 1 and beat in (0, 2): drum(KICK, t, 0.8 * gain)
        if kick == 2: drum(KICK, t, 0.85 * gain)
        if kick == 3: drum(KICK, t, 0.9 * gain); drum(KICK, t + B * 0.75, 0.45 * gain) if beat in (1, 3) else None
        if clap and beat in (1, 3): drum(CLAP, t, 0.28 * gain, 0.1)
        if hats >= 1: drum(OHAT, t + B / 2, 0.12 * gain, 0.25)
        if hats >= 2:
            for s in (1, 3): drum(HAT, t + s * B / 4, 0.07 * gain, -0.3)
        if bass:
            note('synth_bass_1', nn(bl).replace('1', '2') if bl.endswith('1') else nn(bl), t, 0.42 * gain, length=B * 0.9)
            note('synth_bass_1', nn(bl).replace('1', '2') if bl.endswith('1') else nn(bl), t + B * 0.5, 0.28 * gain, length=B * 0.35)
        if keys and beat in (0, 2):
            for i, n in enumerate(chord[:4]): note('electric_piano_1', nn(n), t + i * 0.008, 0.12 * gain, (-0.3, -0.1, 0.1, 0.3)[i], length=1.0)
        if arp:
            for s in range(4):
                n = chord[ARP[(k * 4 + s) % 8]]
                note('celesta', nn(n).replace('3', '5').replace('4', '5') if s % 2 else nn(n), t + s * B / 4, 0.12 * gain, ((k * 4 + s) % 5 - 2) / 5, length=0.35)

# ---------- music arrangement (bars are 4 beats = 2.5 s)
bars(0, 12, pad=True, gain=0.9)                         # 0-7.5   ambient intro
bars(4, 12, keys=True, gain=0.7)
bars(12, 28, kick=1, hats=1, bass=True, keys=True, gain=0.85)    # 7.5-17.5
bars(28, 31, pad=True, keys=True, arp=True, gain=0.8)            # 17.5-19.4 blob, airy
bars(31, 37, kick=3, hats=1, bass=True, pad=True, gain=0.95)     # 19.4-23.1 pulse (heartbeat)
bars(37, 50, kick=2, hats=2, bass=True, keys=True, arp=True, clap=True, gain=1.0)  # 23.1-31.2
bars(50, 53, kick=0, hats=2, bass=False, pad=True, arp=True, gain=0.9)            # 31.2-33 build
for i in range(12): drum(CLAP, 31.6 + i * (1.4 / 12) * (1 - i / 30), 0.1 + 0.02 * i, ((i % 4) - 1.5) / 5)
# 33.0 hit
drum(KICK, 33.0, 1.0); drum(SUB, 33.0, 0.7)
bars(53, 56, kick=2, hats=2, bass=True, pad=True, arp=True, clap=True, gain=1.05)  # 33.1-35
# logo sting 35.15
for i, n in enumerate(['D3', 'A3', 'D4', 'Gb4', 'A4', 'E5']): note('electric_piano_1', n, 35.15 + i * 0.02, 0.2, (i - 2.5) / 6, length=2.6)
for n in ['D3', 'A3', 'Gb4', 'A4']: note('pad_7_halo', n, 35.15, 0.16, length=2.65)
note('synth_bass_1', 'D2', 35.15, 0.45, length=2.0)
for i, n in enumerate(['A5', 'D6', 'Gb6', 'A6']): note('celesta', n, 35.3 + i * 0.12, 0.12, (i - 1.5) / 4, length=1.2)

# ---------- SFX
def typ(t0, t1, n, g=0.32):
    for i in range(n):
        S('keyboard-letter-soft' if i % 3 else 'keyboard-letter-medium', t0 + (t1 - t0) * i / max(1, n - 1), g * (0.8 + 0.2 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 12)
S('riser-1s-soft', 0.0, 0.25)
typ(0.03, 0.78, 13, 0.36); S('move-zoom-out', 0.8, 0.3); typ(1.0, 1.5, 9, 0.22)
S('appear-dissolve', 1.84, 0.35)
S('pop-small-in', 2.02, 0.45); S('transform-stretch', 2.2, 0.3); typ(2.36, 2.98, 10, 0.24)
S('shimmer-short-soft', 2.7, 0.3) if 'shimmer-short-soft' in META else None
S('swish-soft', 3.3, 0.3)
S('pop-small-bubble', 3.52, 0.3); S('whoosh-fast-soft', 4.03, 0.3); S('impact-light-soft', 4.12, 0.35); S('click-tap-soft', 4.24, 0.25); S('click-tap-soft', 4.33, 0.2)
S('swipe-medium-soft', 4.5, 0.3); typ(4.98, 5.5, 9, 0.24)
S('transform-shrink', 5.72, 0.3); S('click-toggle-on-soft', 6.08, 0.5)
S('whoosh-medium-soft', 6.68, 0.4)
S('writing-marker-draw', 7.0, 0.18, maxlen=0.6); S('appear-materialise', 7.45, 0.3)
typ(7.6, 8.75, 12, 0.24)
S('whoosh-fast-medium', 9.35, 0.35); S('swish-soft', 9.4, 0.3)
S('click-hover-soft', 10.0, 0.25); S('click-hover-soft', 10.25, 0.25); S('click-mouse-medium', 10.62, 0.5)
S('pop-medium-bubble', 10.8, 0.45)
S('transform-morph', 11.0, 0.3); S('pop-small-in', 11.25, 0.3)
for i in range(9): S('pop-small-bubble', 11.27 + i * 0.045, 0.18, ((i % 3) - 1) / 3)
typ(11.45, 12.4, 10, 0.22)
S('transform-shrink', 13.2, 0.3); S('faller-1s-soft', 13.3, 0.2)
S('appear-flip-slow', 13.48, 0.3); S('swish-soft', 14.42, 0.3); typ(14.55, 15.2, 12, 0.22)
S('whoosh-fast-soft', 16.15, 0.35); S('impact-light-soft', 16.33, 0.3)
S('move-zoom-out', 16.85, 0.3)
S('transform-inflate', 17.55, 0.35); typ(17.85, 18.55, 11, 0.22)
S('reverse-whoosh-short-soft', 19.4, 0.45, sync=True); S('move-zoom-in', 19.0, 0.3)
typ(21.2, 21.95, 9, 0.3); S('boom-hit-soft', 21.2, 0.25)
S('click-snap-soft', 22.87, 0.3); S('writing-pen-draw', 23.15, 0.2, maxlen=0.5)
typ(24.0, 24.55, 10, 0.22); S('click-hover-medium', 24.6, 0.3); S('swipe-fast-soft', 24.85, 0.3)
S('transform-grow', 25.45, 0.35); typ(25.75, 26.8, 13, 0.22)
S('transform-shrink', 27.3, 0.3); S('swish-soft', 27.6, 0.25)
S('transform-morph', 28.4, 0.3); typ(29.0, 29.95, 10, 0.22)
S('swipe-slow-soft', 30.75, 0.3)
S('riser-2s-soft', 33.0, 0.4, sync=True)
S('impact-deep-firm', 33.02, 0.5); S('appear-burst', 33.05, 0.3)
for i in range(7): S('click-snap-soft', 33.3 + [3, 0, 5, 1, 6, 2, 4].index(i) * 0.08, 0.2, ((i % 3) - 1) / 3)
S('reverse-whoosh-short-soft', 35.15, 0.4, sync=True); S('impact-medium-soft', 35.15, 0.4)
S('notification-success-soft', 35.35, 0.15) if 'notification-success-soft' in META else None

mix = music * 0.95 + drums * 0.7 + sfx * 0.95
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fs = int(36.6 * SR); fo = N - fs; mix[fs:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

"""Soundtrack for the Planet clock reel (11.75s, one hit per second like the reference).
Local only: FluidR3 GM soundfont + Dirt-Samples drums + wyzowl/sfx-kit (CC0).
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 11.75; N = int(SR * DUR)
bus = {k: np.zeros((N, 2), np.float32) for k in ('m', 'd', 's')}
_c = {}
def load(p):
    if p not in _c:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[p]
def place(b, a, t, g=1.0, pan=0.0, maxlen=None, fade=0.05):
    if maxlen:
        a = a[:int(maxlen * SR)].copy(); f = min(int(fade * SR), len(a)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    if i >= N: return
    n = min(len(a), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[b][i:i + n, 0] += a[:n, 0] * g * l; bus[b][i:i + n, 1] += a[:n, 1] * g * r
_d = json.load(open(SFX + '/sounds.json')); _d = _d if isinstance(_d, list) else _d.get('sounds', [])
META = {s['id']: s for s in _d if isinstance(s, dict)}
def S(name, t, g=1.0, pan=0.0, sync=False, maxlen=None):
    s = META[name]; st = t - (s.get('sync', {}).get('at', 0) if sync else 0)
    place('s', load(SFX + '/' + s['file']), st, g, pan, maxlen=maxlen)
def note(inst, n, t, g=1.0, pan=0.0, length=None):
    place('m', load(f'{SF}/{inst}-mp3/{n}.mp3'), t, g, pan, maxlen=length, fade=0.15)
def drum(p, t, g=1.0, pan=0.0, maxlen=None):
    place('d', load(DS + '/' + p), t, g, pan, maxlen=maxlen)

HITS = [1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.4]
CH = [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'C4'], ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'B3', 'D4']]
MEL = ['E5', 'A5', 'C6', 'E5', 'G5', 'C6', 'B5', 'E6']
# intro: tick-tock before the first move
for i, t in enumerate([0.2, 0.7]):
    S('mechanical-ratchet-light', t, 0.22, 0.15 if i % 2 else -0.15, maxlen=0.12)
note('pad_2_warm', 'A2', 0.0, 0.16, length=1.4); note('pad_2_warm', 'E3', 0.0, 0.12, length=1.4)
drum('808bd/BD0010.WAV', 0.2, 0.5)
for k, t in enumerate(HITS):
    ch = CH[(k // 2) % 4]
    drum('808bd/BD0010.WAV', t, 0.85); drum('clubkick/1.wav', t, 0.55)
    if k % 2 == 1: drum('cp/HANDCLP0.wav', t, 0.28, 0.06)
    note('synth_bass_1', ch[0], t, 0.42, length=0.8)
    if k % 2 == 0:
        for i, n in enumerate(ch): note('pad_2_warm', n, t, 0.12, (-0.3, -0.1, 0.1, 0.3)[i], length=2.1)
    note('celesta', MEL[k], t + 0.02, 0.2, (k % 3 - 1) * 0.25, length=0.9)
    # hand whip + tick, icon pop, label typing
    S('swish-soft', t - 0.16, 0.28, maxlen=0.3)
    S('mechanical-ratchet-light', t, 0.3, maxlen=0.14)
    if k < 7:
        S('pop-small-in', t - 0.05, 0.32, (k % 3 - 1) * 0.3)
        for j in range(5): S('keyboard-letter-soft', t + 0.05 + j * 0.06, 0.12, 0.2 - j * 0.1, maxlen=0.08)
    # off-beat clock tock
    if t + 0.5 < 8.9: S('click-tap-soft', t + 0.5, 0.18, 0.2, maxlen=0.1)
    drum('hh/000_hh3closedhh.wav', t + 0.5, 0.1, -0.25)
# full circle: all lit, riser into the flood
S('shimmer-short-soft', 8.62, 0.35) if 'shimmer-short-soft' in META else None
S('riser-1s-soft', 9.5, 0.5, sync=True)
S('transform-fill', 9.05, 0.3)
# end card hit
S('impact-deep-firm', 9.5, 0.6); S('boom-hit-soft', 9.5, 0.35)
drum('808bd/BD0010.WAV', 9.5, 0.9)
for i, n in enumerate(['A2', 'E3', 'A3', 'C4', 'E4']): note('pad_7_halo', n, 9.5, 0.12, (-0.4, -0.2, 0, 0.2, 0.4)[i], length=2.25)
note('synth_bass_1', 'A1', 9.5, 0.45, length=1.6)
note('celesta', 'A5', 9.52, 0.22); note('celesta', 'E6', 9.86, 0.18, 0.2)
S('pop-medium-in', 9.84, 0.4)
S('notification-success-soft', 10.12, 0.22) if 'notification-success-soft' in META else None

mix = bus['m'] * 1.0 + bus['d'] * 0.8 + bus['s'] * 1.0
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fs = int(10.9 * SR); mix[fs:] *= np.linspace(1, 0, N - fs)[:, None] ** 1.5
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

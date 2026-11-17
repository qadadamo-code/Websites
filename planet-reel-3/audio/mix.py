"""Soundtrack for Planet reel 3 (18.7s): original minimal tension beat (FluidR3 + Dirt-Samples) + CC0 SFX (wyzowl/sfx-kit) synced to the edit.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 18.7; N = int(SR * DUR)
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
def drum(p, t, g=1.0, pan=0.0):
    place(drums, load(DS + '/' + p), t, g, pan)

B = 0.5
KICK = 'clubkick/1.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'; B808 = '808/' + sorted(__import__('os').listdir(DS + '/808'))[0]
# minor progression D minor: Dm Bb Gm A
CH = [(['D4', 'F4', 'A4'], 'D2'), (['D4', 'F4', 'Bb4'], 'Bb1'), (['D4', 'G4', 'Bb4'], 'G1'), (['Db4', 'E4', 'A4'], 'A1')]
def section(t0, t1, level):
    """level 0: ticking only, 1: + kick/bass, 2: + clap + plucks"""
    t = t0; k = 0
    while t < t1 - 1e-6:
        bar = int(t // 2) % 4; chord, bass = CH[bar]; beat = k % 4
        for s in range(4):
            drum(HAT, t + s * B / 4, (0.10 if s == 2 else 0.05) * (1.0 if level else 0.8), 0.3 if s % 2 else -0.2)
        if level >= 1:
            if beat in (0, 2) or (beat == 3 and bar % 2): drum(KICK, t, 0.8)
            note('synth_bass_1', bass, t, 0.5, length=0.42)
        if level >= 2:
            if beat in (1, 3): drum(CLAP, t, 0.32, 0.1)
            if beat in (0, 2):
                for i, n in enumerate(chord): note('pizzicato_strings', n, t + B / 2 + i * 0.01, 0.22, (-0.3, 0, 0.3)[i], length=0.3)
        if beat == 0:
            for n in chord: note('pad_8_sweep', n.replace('4', '3'), t, 0.10, length=2.0)
        t += B; k += 1

section(0.0, 1.0, 0)
section(1.0, 4.1, 1)
section(4.1, 6.6, 2)
section(6.6, 9.0, 1)
section(9.12, 10.1, 2)
section(10.1, 12.6, 2)
section(12.6, 14.3, 1)
for n in ['D3', 'F3', 'A3', 'D4']: note('pad_8_sweep', n, 14.3, 0.14, length=4.3)
for i, n in enumerate(['D5', 'F5', 'A5', 'D6']): note('celesta', n, 14.45 + i * 0.12, 0.3, length=1.2)
for t in np.arange(14.3, 18.2, 0.25): drum(HAT, t, 0.04, 0.2)
note('synth_bass_1', 'D2', 14.3, 0.5, length=1.4)
for i, n in enumerate(['A4', 'D5', 'F5', 'A5', 'D6']): note('celesta', n, 17.35 + i * 0.07, 0.26, length=1.2)

# ---- SFX ----
def typ(t0, n, rate, g=0.45, kind='keyboard-letter-soft'):
    for i in range(n): S(kind if i % 3 else kind.replace('soft', 'medium'), t0 + i / rate, g * (0.85 + 0.15 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 10)
# S1
S('whoosh-fast-medium', 0.0, 0.6, -0.4); S('foley-glass-touch', 0.5, 0.55); S('foley-glass-slide', 0.6, 0.3)
typ(0.22, 6, 26); typ(0.42, 8, 22)
S('reverse-whoosh-short-soft', 0.95, 0.5, sync=True)
S('digital-glitch-clear', 1.0, 0.45); S('impact-deep-firm', 1.0, 0.55); S('bass-808-short', 1.0, 0.5)
S('shimmer-short-bright', 1.08, 0.25)
S('move-zoom-in', 2.15, 0.5); S('whoosh-medium-soft', 2.2, 0.4)
typ(2.95, 8, 30, 0.4); typ(3.15, 7, 30, 0.45)
S('swish-soft', 3.3, 0.3)
# S2
S('whoosh-fast-soft', 3.95, 0.5); S('impact-medium-soft', 4.1, 0.45)
S('pop-medium-in', 4.18, 0.5); typ(4.36, 2, 18, 0.5)
S('cinematic-slam-big', 4.88, 0.55); S('bass-rumble-short', 4.88, 0.5); S('foley-wood-touch', 4.95, 0.4); S('notification-failure-thud', 5.0, 0.3)
typ(5.05, 5, 24, 0.42); typ(5.3, 4, 22, 0.5)
S('writing-highlighter', 5.55, 0.4)
# S3
S('whoosh-fast-soft', 6.5, 0.5); S('foley-paper-slide', 6.62, 0.55)
typ(6.78, 8, 20, 0.42)
S('pop-small-in', 7.3, 0.45); S('writing-marker-draw', 7.5, 0.6, maxlen=0.45)
typ(8.1, 9, 16, 0.42)
S('riser-1s-soft', 9.05, 0.45, sync=True)
S('props-page-turn', 9.0, 0.6); S('foley-paper-touch', 9.05, 0.5)
S('cinematic-slam-massive', 9.12, 0.6); S('boom-hit-medium', 9.12, 0.45); S('bass-sub-drop-short', 9.12, 0.5)
S('faller-1s-soft', 9.2, 0.3)
# S4
S('whoosh-medium-medium', 10.0, 0.45); S('impact-light-firm', 10.12, 0.45)
for i in range(6): S('foley-wood-slide' if i % 2 else 'foley-card-slide', 10.14 + i * 0.05, 0.25, (i - 3) / 4)
S('foley-glass-slide', 10.42, 0.55); S('whoosh-fast-soft', 10.42, 0.35, 0.4)
typ(10.72, 6, 26, 0.45); typ(10.86, 7, 28, 0.45)
S('digital-scan-subtle', 11.0, 0.25)
# S5
S('whoosh-fast-medium', 12.5, 0.5); S('impact-medium-firm', 12.62, 0.45)
S('mechanical-lock-light', 12.75, 0.5); S('mechanical-ratchet-light', 13.1, 0.35); S('click-latch-firm', 13.55, 0.45)
typ(13.45, 7, 22, 0.42); S('writing-highlighter', 13.75, 0.35)
# S6
S('reverse-whoosh-medium-soft', 14.32, 0.5, sync=True); S('move-zoom-in', 14.3, 0.45)
S('foley-paper-touch', 14.85, 0.45)
typ(14.6, 18, 34, 0.36)
S('pop-large-in', 16.05, 0.5)
url = 'www.theplanetco.com'
for i, ch in enumerate(url): S('keyboard-letter-firm' if i % 2 else 'keyboard-letter-medium', 16.45 + i / 26, 0.42, ((i * 3) % 5 - 2) / 8)
typ(17.3, 18, 30, 0.32)
S('sting-tech-short', 17.25, 0.4); S('notification-success-sparkle', 17.95, 0.25)

mix = music * 0.85 + drums * 0.8 + sfx * 1.0
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

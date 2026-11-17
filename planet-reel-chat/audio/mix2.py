"""Soundtrack for the Planet chat reel (30s): original deep-house bed (FluidR3 EP/pad/bass + Dirt-Samples drums) + CC0 SFX (wyzowl/sfx-kit) synced to the typing.
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

B = 0.5

B = 0.5
KICK = 'clubkick/1.wav'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'
CH = [(['A3', 'C4', 'E4', 'G4'], 'A2'), (['F3', 'A3', 'C4', 'E4'], 'F2'), (['C4', 'E4', 'G4', 'D5'], 'C3'), (['G3', 'D4', 'G4', 'A4'], 'G2')]
MEL = ['E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5', 'G4']
def bars(t0, t1, kick=True, clap=True, bass=True, lead=False, ep=True):
    t = t0
    while t < t1 - 1e-6:
        k = int(round(t / B)); bar = (k // 4) % 4; chord, bs = CH[bar]; beat = k % 4
        if kick: drum(KICK, t, 0.85)
        if beat in (1, 3) and clap: drum(CLAP, t, 0.35, 0.1)
        drum(OHAT if kick else HAT, t + B / 2, 0.2 if kick else 0.12, 0.25)
        drum(HAT, t + B * 0.25, 0.06, -0.3); drum(HAT, t + B * 0.75, 0.06, -0.3)
        if bass: note('synth_bass_1', bs, t + B / 2, 0.55 if kick else 0.3, length=0.22)
        if ep and beat in (0, 2):
            for i, n in enumerate(chord): note('electric_piano_1', n, t + B / 2 + i * 0.008, 0.2, (-0.3, -0.1, 0.1, 0.3)[i], length=0.35)
        if beat == 0:
            for n in chord[:3]: note('pad_2_warm', n, t, 0.12, length=2.0)
        if lead:
            note('lead_8_bass__lead', MEL[(k * 2) % 8], t, 0.07, 0.2, length=0.2)
            note('lead_8_bass__lead', MEL[(k * 2 + 1) % 8], t + B / 2, 0.06, -0.2, length=0.2)
        t += B
# arrangement (cuts: chat 0-12.62, title 12.62, ai 14.6, drop 16.83, code 22.65, head 24.65, eye 26.9, end 27.65)
for n in ['A3', 'C4', 'E4']: note('pad_2_warm', n, 0.0, 0.16, length=3.0)
bars(0.0, 3.0, kick=False, clap=False, bass=False)
bars(3.0, 9.0)
bars(9.0, 12.5, lead=True)
bars(12.5, 14.5, lead=True)
bars(14.5, 16.5, kick=False, clap=False)
bars(17.0, 22.5, lead=True)
bars(22.5, 24.5, clap=False)
bars(24.5, 26.5, kick=False, clap=False, bass=False, ep=False)
for n in ['A2', 'E3']: note('pad_2_warm', n, 26.9, 0.2, length=0.9)
for i, n in enumerate(['A3', 'C4', 'E4', 'G4', 'C5']): note('electric_piano_1', n, 27.65 + i * 0.04, 0.26, length=2.2)
for n in ['A3', 'E4', 'C5']: note('pad_2_warm', n, 27.65, 0.16, length=2.3)
note('synth_bass_1', 'A2', 27.65, 0.55, length=1.4); drum(KICK, 27.65, 0.9)
for t in np.arange(28.0, 29.6, 0.25): drum(HAT, t, 0.05, 0.2)

# ---- SFX ----
def typ(t0, n, rate, g=0.5, kind='keyboard-letter-soft'):
    for i in range(n): S(kind if i % 3 else kind.replace('soft', 'medium'), t0 + i / rate, g * (0.85 + 0.15 * ((i * 7) % 3) / 2), ((i * 37) % 7 - 3) / 10)
for t in (0.0, 0.55, 1.25, 2.0): S('notification-message-out-soft', t, 0.6, 0.15)
S('move-zoom-out', 2.55, 0.5)
S('notification-message-in-soft', 4.85, 0.6, -0.3)
S('whoosh-fast-medium', 8.85, 0.45); S('notification-message-in-clear', 9.0, 0.55, -0.2)
S('impact-light-firm', 12.62, 0.5); S('whoosh-medium-soft', 12.55, 0.4)
for i in range(4): S('pop-small-in', 12.67 + i * 0.07, 0.35, (-0.4, -0.6, 0.5, 0.1)[i])
S('swipe-medium-soft', 14.6, 0.45)
typ(14.85, 22, 22, 0.42)
S('click-mouse-firm', 16.2, 0.65); S('notification-message-out-clear', 16.35, 0.4)
S('reverse-whoosh-short-strong', 16.83, 0.5, sync=True); S('appear-burst', 16.85, 0.45); S('boom-hit-soft', 16.83, 0.45)
S('pop-medium-in', 17.35, 0.5); S('pop-medium-in', 17.5, 0.45); S('click-hover-soft', 17.75, 0.4)
S('whoosh-fast-soft', 18.0, 0.45); S('swipe-fast-soft', 18.55, 0.45)
S('pop-large-in', 19.0, 0.45); S('click-mouse-firm', 19.88, 0.6)
S('swish-soft', 20.45, 0.4)
for i, t in enumerate((20.5, 20.62, 20.8)): S('click-tap-soft', t, 0.4)
S('shimmer-short-bright', 21.2, 0.35); S('tone-step-3', 21.4, 0.3)
S('whoosh-fast-soft', 21.65, 0.4)
typ(22.68, 40, 36, 0.32, 'keyboard-letter-soft')
S('riser-2s-soft', 24.65, 0.45, sync=True)
S('impact-medium-firm', 24.65, 0.55); S('bass-808-short', 24.65, 0.4)
S('move-zoom-out', 24.95, 0.4)
typ(25.0, 12, 34, 0.45); typ(25.62, 12, 52, 0.3)
S('appear-materialise', 25.85, 0.35); S('faller-1s-soft', 26.0, 0.3); S('pop-small-bubble', 26.32, 0.6); S('pop-small-in', 26.45, 0.3)
S('bass-sub-drop-medium', 26.9, 0.6); S('mechanical-shutter-light', 26.92, 0.35)
S('whoosh-medium-medium', 27.4, 0.45)
S('sting-tech-long', 27.65, 0.5); S('notification-success-sparkle', 27.75, 0.25)

mix = music * 0.9 + drums * 0.8 + sfx * 1.0
fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.3) * 0.89
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

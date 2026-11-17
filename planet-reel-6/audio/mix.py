"""Soundtrack for Planet reel 6 (9.7s): original dark trap beat (Dirt-Samples drums + FluidR3 pad) and CC0 SFX (wyzowl/sfx-kit) synced to every cut.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 9.7; N = int(SR * DUR)
music = np.zeros((N, 2), np.float32); drums = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
_c = {}
def load(p, rate=1.0):
    k = (p, rate)
    if k not in _c:
        af = ['-af', f'asetrate={int(SR*rate)},aresample={SR}'] if rate != 1.0 else []
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, *af, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[k] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[k]
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
def S(name, t, g=1.0, pan=0.0, sync=False, maxlen=None, rate=1.0):
    s = META[name]; st = t - (s.get('sync', {}).get('at', 0) if sync else 0)
    place(sfx, load(SFX + '/' + s['file'], rate), st, g, pan, maxlen=maxlen)
def note(inst, n, t, g=1.0, pan=0.0, length=None):
    place(music, load(f'{SF}/{inst}/{n}.mp3'), t, g, pan, maxlen=length, fade=0.15)
def drum(p, t, g=1.0, pan=0.0, rate=1.0, maxlen=None):
    place(drums, load(DS + '/' + p, rate), t, g, pan, maxlen=maxlen)

KICK = '808bd/BD0010.WAV'; SNARE = '808sd/SD0010.WAV'; CLAP = 'cp/HANDCLP0.wav'
HAT = '808hc/HC00.WAV'; OHAT = '808oh/OH00.WAV'
B = 0.70   # beat (trap, half-time feel); drop lands on 1.96
T0 = 1.96
# ---- intro: dark drone + riser ----
for n in ['A2', 'E3', 'A3']: note('pad_3_polysynth', n, 0.0, 0.16, length=1.9)
for n in ['A3', 'C4', 'E4']: note('pad_2_warm', n, 0.24, 0.12, length=1.6)
# ---- groove 1.96 -> 7.70 ----
BASS = ['A1', 'A1', 'F1', 'G1']
t = T0; k = 0
while t < 7.69:
    bar = int((t - T0 + 1e-6) // (4 * B)); beat = k % 4
    if beat == 0 or (beat == 2 and bar % 2 == 0): drum(KICK, t, 1.0)
    if beat == 1 and k % 8 == 5: drum(KICK, t + B * 0.5, 0.8)
    if beat in (1, 3): drum(SNARE, t, 0.55, 0.05); drum(CLAP, t, 0.35, -0.05)
    # hats: 8ths with 16th/32nd rolls at bar ends
    for s in range(2):
        drum(HAT, t + s * B / 2, 0.30 if s == 0 else 0.22, 0.2)
    if beat == 3:
        for r in range(4): drum(HAT, t + B / 2 + r * B / 8, 0.16 + r * 0.03, -0.2)
    if beat == 0:
        ch = [('A2', 'C3', 'E3'), ('A2', 'C3', 'E3'), ('F2', 'A2', 'C3'), ('G2', 'B2', 'D3')][bar % 4]
        for i, n in enumerate(ch): note('pad_3_polysynth', n, t, 0.11, (-0.3, 0, 0.3)[i], length=4 * B)
    if beat in (0, 2):
        note('synth_bass_2', BASS[(k // 4) % 4], t, 0.55, length=B * 1.6)
    t += B; k += 1
# ---- end card: chord + tail ----
for i, n in enumerate(['A3', 'C4', 'E4', 'A4']): note('pad_2_warm', n, 7.70, 0.22, length=2.0)
note('synth_bass_2', 'A1', 7.70, 0.6, length=1.6)
for i, n in enumerate(['E5', 'A5', 'C6']): note('celesta', n, 8.05 + i * 0.09, 0.18, length=1.2)

# ---- SFX synced to cuts ----
S('digital-glitch-subtle', 0.0, 0.55)
S('click-snap-firm', 0.08, 0.35); S('click-snap-medium', 0.16, 0.3)
S('bass-sub-drop-short', 0.24, 0.7); S('impact-deep-soft', 0.24, 0.55)
S('riser-1s-soft', 0.96, 0.35, sync=True)
S('digital-scan-clear', 0.44, 0.55); S('digital-interference', 0.46, 0.25, maxlen=0.25)
S('digital-glitch-clear', 0.70, 0.55)
S('impact-medium-firm', 0.96, 0.55); S('whoosh-fast-soft', 0.92, 0.35)
S('foley-plastic-slide', 1.22, 0.45)
S('click-button-firm', 1.66, 0.45); S('notification-message-in-soft', 1.72, 0.22)
S('reverse-whoosh-short-strong', 1.96, 0.55, sync=True)
S('boom-hit-strong', 1.96, 0.65); S('cinematic-drum-big', 1.96, 0.4)
S('keyboard-letter-firm', 2.16, 0.5); S('keyboard-letter-medium', 2.20, 0.45)
S('keyboard-typing-quick-short', 2.26, 0.5, maxlen=0.48)
S('keyboard-return-firm', 2.78, 0.5); S('keyboard-typing-quick-short', 2.84, 0.4, maxlen=0.22)
S('whoosh-fast-soft', 3.06, 0.4); S('pop-small-in', 3.14, 0.3)
S('writing-pencil-draw', 3.56, 0.45, maxlen=0.14)
S('keyboard-typing-quick-short', 3.69, 0.45, maxlen=0.30)
S('mechanical-switch-light', 4.00, 0.6); S('appear-burst', 4.03, 0.3)
S('mechanical-ratchet-light', 4.40, 0.35); S('foley-wood-slide', 4.42, 0.45)
S('foley-wood-slide', 4.72, 0.4)
S('foley-glass-touch', 4.93, 0.4)
S('mechanical-latch-heavy', 5.18, 0.5)
S('whoosh-medium-soft', 5.60, 0.4)
S('mechanical-ratchet-heavy', 6.04, 0.45)
S('props-drip', 6.24, 0.4); S('props-splash', 6.40, 0.2)
S('mechanical-ratchet-light', 6.66, 0.4)
S('mechanical-shutter-heavy', 7.02, 0.5)
S('mechanical-shutter-light', 7.27, 0.45)
S('click-button-firm', 7.56, 0.6); S('digital-power-up', 7.52, 0.3, maxlen=0.2)
S('cinematic-slam-big', 7.70, 0.55); S('boom-drop-strong', 7.70, 0.5)
S('sting-tech-long', 7.74, 0.4)
S('shimmer-medium-sparkle', 8.05, 0.3)

# ---- mix ----
mix = music * 0.85 + drums * 0.9 + sfx * 1.0
# pre-drop dip (like the reference: near-silence just before the hit)
a, b = int(1.72 * SR), int(1.96 * SR); mix[a:b] *= np.linspace(1, 0.35, b - a)[:, None]
fi = int(0.01 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.9 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.4) * 0.9
mix.astype(np.float32).tofile(OUT + '.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', OUT + '.raw', '-af', 'loudnorm=I=-13:TP=-1.0:LRA=9', '-ar', str(SR), OUT], check=True)
print('ok', peak)

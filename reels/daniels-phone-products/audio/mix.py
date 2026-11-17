"""Soundtrack for the Daniel's Phone product reel (34.4s, 128 BPM) v3: original future-house bed
(FluidR3 saw stabs / pizzicato arps / pad / synth bass + Dirt-Samples drums, sidechain pump) + CC0 SFX (wyzowl/sfx-kit) on every cut.
Run: python3 -I mix.py <sfx_kit_dir> <FluidR3_GM_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 34.4; N = int(SR * DUR)
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


BPM = 128; B = 60 / BPM; BAR = 4 * B
KICK = 'clubkick/3.wav'; KICK2 = '808bd/BD0025.WAV'; CLAP = 'cp/HANDCLP0.wav'; CP8 = '808/CP.WAV'
HAT = '808/CH.WAV'; OHAT = 'hh/007_hh3openhh.wav'; SN = 'sn/ST0T0S7.wav'; RS = '808/RS.WAV'
REV = 'bass3/85056__zgump__reverse-bass-01.wav'
# C minor: Cm - Ab - Eb - Bb
CH = [(['C4', 'Eb4', 'G4'], 'C2'), (['Ab3', 'C4', 'Eb4'], 'Ab1'), (['Bb3', 'Eb4', 'G4'], 'Eb2'), (['Bb3', 'D4', 'F4'], 'Bb1')]
ARP = [0, 1, 2, 1, 2, 0, 1, 2]
LEAD = [('G5', 0, .4), ('Eb5', .5, .3), ('F5', 1, .3), ('G5', 1.5, .9), ('Bb5', 2.5, .3), ('G5', 3, .3), ('F5', 3.5, .4)]
kicks = []

def section(t0, t1, lead=False):
    t = t0; k = 0
    while t < t1 - 1e-6:
        ci = (k // 4) % 4; chord, bass = CH[ci]; beat = k % 4
        drum(KICK, t, 0.85); kicks.append(t)
        if beat == 0: drum(KICK2, t, 0.3)
        if beat in (1, 3): drum(CLAP, t, 0.4, 0.06); drum(CP8, t, 0.25, -0.06)
        drum(OHAT, t + B / 2, 0.11, 0.25)
        for s in (1, 3): drum(HAT, t + s * B / 4, 0.12, -0.2)
        if beat == 3 and (k // 4) % 2: drum(RS, t + B * .75, 0.2, 0.3)
        note('synth_bass_1', bass, t + B / 2, 0.5, length=B * 0.45)
        note('synth_bass_1', bass, t + B * .75, 0.3, length=B * 0.2)
        if beat == 0:
            for i, n in enumerate(chord): note('pad_2_warm', n, t, 0.09, (-0.5, 0, 0.5)[i], length=BAR + .1)
        # offbeat saw stabs
        if beat in (0, 2):
            for i, n in enumerate(chord): note('lead_2_sawtooth', n, t + B / 2 + i * .004, 0.07, (-0.35, 0, 0.35)[i], length=0.14)
        # pizzicato 8th arp, one octave up
        for s in range(2):
            n = chord[ARP[(beat * 2 + s) % 8]]; n = n[:-1] + str(int(n[-1]) + 1)
            note('pizzicato_strings', n, t + s * B / 2, 0.22, (0.3, -0.3)[s], length=0.25)
        t += B; k += 1
    if lead:
        h = t0
        while h < t1 - 2 * BAR + 1e-6:
            for n, o, d in LEAD: note('lead_2_sawtooth', n, h + o * B, 0.12, 0.1, length=d * B + 0.05)
            h += 2 * BAR

# ---- intro 0-2.6 (logo)
for n in ['C3', 'G3', 'C4', 'Eb4']: note('pad_2_warm', n, 0.0, 0.16, length=2.7)
for i, n in enumerate(['C5', 'G5', 'C6', 'Eb6']): note('orchestral_harp', n, 0.3 + i * 0.08, 0.2, length=1.4)
note('synth_bass_1', 'C2', 0.3, 0.45, length=1.0)
place(drums, load(DS + '/' + REV), 2.6 - len(load(DS + '/' + REV)) / SR, 0.5)
for i in range(8): drum(SN, 1.6 + i * B / 4, 0.08 + 0.03 * i)
# ---- main
section(2.6, 18.6)
# break 18.6-19.6: pad + snare roll riser
for n in CH[3][0]: note('pad_2_warm', n, 18.6, 0.13, length=1.1)
for i in range(16): drum(SN, 18.6 + i * (1.0 / 16), 0.06 + 0.012 * i, 0.0)
section(19.6, 30.4, lead=True)
# ---- outro 30.4
drum(KICK, 30.4, 0.95); drum(KICK2, 30.4, 0.55); drum(CLAP, 30.4, 0.35)
for n in ['C3', 'G3', 'C4', 'Eb4', 'G4']: note('pad_2_warm', n, 30.4, 0.15, length=4.0)
for i, n in enumerate(['C4', 'Eb4', 'G4', 'C5']): note('lead_2_sawtooth', n, 30.4 + i * 0.01, 0.08, length=0.5)
note('synth_bass_1', 'C2', 30.4, 0.55, length=1.4)
for i, (n, o, d) in enumerate(LEAD[:4]): note('pizzicato_strings', n, 31.2 + o * B, 0.22, 0.1, length=0.4)
for i, n in enumerate(['C5', 'Eb5', 'G5', 'C6']): note('orchestral_harp', n, 32.4 + i * 0.08, 0.16, length=1.8)

# sidechain pump on music
env = np.ones(N, np.float32); tt = np.arange(int(0.3 * SR)) / SR; dip = 1 - 0.55 * np.exp(-tt / 0.09)
for kt in kicks:
    i = int(kt * SR); n = min(len(dip), N - i)
    if n > 0: env[i:i + n] = np.minimum(env[i:i + n], dip[:n])
music *= env[:, None]

# ---- SFX
S('impact-deep-soft', 0.3, 0.6); S('shimmer-short-sparkle', 0.4, 0.4)
S('boom-hit-medium', 2.6, 0.5)
CUTS = [4.0, 7.4, 10.4, 13.4, 16.6, 19.6, 23.0, 26.0, 27.6, 30.4]
for i, c in enumerate(CUTS):
    S(['whoosh-fast-medium', 'swish-medium', 'whoosh-medium-soft', 'zip-in-medium'][i % 4], c - 0.15, 0.4, (-0.3, 0.3)[i % 2])
    S('impact-light-firm' if i % 2 else 'impact-medium-soft', c, 0.3)
S('pop-small-in', 4.45, 0.4)
S('click-toggle-medium', 7.65, 0.45); S('pop-medium-in', 10.65, 0.4)
for i in range(10): S('click-tap-soft', 13.5 + i * 0.17, 0.12 + 0.02 * (i % 3))
S('pop-medium-in', 15.1, 0.4); S('appear-flip-quick', 16.6, 0.4)
S('swipe-medium-firm', 18.6, 0.4)
S('pop-small-in', 20.0, 0.4)
for i in range(8): S('click-tap-soft', 20.6 + i * 0.17, 0.12)
S('pop-medium-in', 23.35, 0.4); S('pop-medium-in', 24.1, 0.4)
S('swipe-fast-firm', 25.95, 0.4)
S('pop-small-in', 28.9, 0.4)
S('shimmer-short-sparkle', 30.55, 0.45); S('boom-hit-soft', 30.4, 0.5)

# ---- mix
def norm(x, peak):
    m = np.abs(x).max(); return x * (peak / m) if m > 0 else x
mix = norm(music, 0.55) + norm(drums, 0.62) + norm(sfx, 0.5)
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = norm(mix, 0.92).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', OUT], input=mix.tobytes(), check=True)
print('ok', OUT)

"""Music + SFX bed (46 s) for the marketing reel, synced to scene.js cues. The voice-over is added later.
Run: python3 -I mix.py <sfx_kit_dir> <soundfont_dir> <dirt_samples_dir> <out.wav>
Sources: SFX = wyzowl/sfx-kit (CC0); notes = gleitz/midi-js-soundfonts FluidR3_GM; drums = tidalcycles/Dirt-Samples.
"""
import sys, subprocess, json, numpy as np
from scipy.signal import fftconvolve, butter, lfilter

SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100
DUR = 46.0
N = int(SR * DUR)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)
_cache = {}
_d = json.load(open(SFX + '/sounds.json')); _d = _d if isinstance(_d, list) else _d.get('sounds', [])
META = {s['id']: s for s in _d if isinstance(s, dict)}


def load(path):
    if path not in _cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _cache[path] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _cache[path]


def place(bus, a, t, gain=1.0, pan=0.0, maxlen=None, fade=0.0):
    if maxlen:
        a = a[: int(maxlen * SR)].copy()
        if fade:
            f = min(int(fade * SR), len(a)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(round(t * SR))
    if i < 0: a = a[-i:]; i = 0
    if i >= N: return
    n = min(len(a), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[i:i + n, 0] += a[:n, 0] * gain * l
    bus[i:i + n, 1] += a[:n, 1] * gain * r


def S(name, t, gain=1.0, pan=0.0, sync=False):
    s = META.get(name)
    if not s:
        print('missing sfx', name); return
    place(sfx, load(SFX + '/' + s['file']), t - (s['sync']['at'] if sync else 0), gain, pan)


def note(inst, n, t, gain=1.0, pan=0.0, length=None):
    place(music, load(f'{SF}/{inst}/{n}.mp3'), t, gain, pan, maxlen=length, fade=0.08 if length else 0)


def drum(path, t, gain=1.0, pan=0.0):
    place(music, load(DS + '/' + path), t, gain, pan)


B = 0.5  # 120 bpm
KICK, HAT, OHAT = '808bd/BD5010.WAV', 'linnhats/1.wav', 'linnhats/4.wav'
CH = {
    'C': (['C4', 'G4', 'C5', 'G4', 'E5', 'G4', 'C5', 'E5'], 'C2'),
    'F': (['F4', 'A4', 'C5', 'A4', 'F5', 'A4', 'C5', 'F5'], 'F2'),
    'G': (['G4', 'B4', 'D5', 'B4', 'G5', 'B4', 'D5', 'G5'], 'G2'),
    'Am': (['A4', 'C5', 'E5', 'C5', 'A5', 'E5', 'C5', 'E5'], 'A2'),
    'Dm': (['D4', 'F4', 'A4', 'F4', 'D5', 'A4', 'F4', 'A4'], 'D2'),
}


def groove(st, en, chords, energy=1, drums=True, arp_gain=0.32):
    """chords: list of chord names, each lasts 2 beats (1 s)."""
    t = st; k = 0
    while t < en - 1e-6:
        ch = chords[int((t - st) // 1.0) % len(chords)]
        arp, bass = CH[ch]
        note('marimba', arp[k % 8], t, arp_gain * (1.0 if k % 2 == 0 else .75), .25 if k % 2 else -.25, length=.45)
        if k % 4 == 0:
            note('pizzicato_strings', bass, t, .6)
            if energy >= 2: note('acoustic_bass', bass, t, .45, length=.45)
        if k % 4 == 3 and energy >= 2:
            note('pizzicato_strings', bass[:-1] + '3', t, .35)
        if drums:
            beat = k // 2
            if k % 2 == 0:
                if beat % 2 == 0: drum(KICK, t, .55 + .1 * energy)
                else: S('click-clap-medium', t, .3 + .1 * energy, .1)
                drum(HAT, t, .07, -.3)
            else:
                drum(HAT, t, .12 + .03 * energy, .3)
        t += .25; k += 1


# ---------------- MUSIC ----------------
groove(0.0, 9.5, ['C', 'C', 'F', 'G'], energy=1, drums=True, arp_gain=.28)
# problem gets sad: sparse minor
groove(9.5, 12.0, ['Am', 'Dm'], energy=1, drums=False, arp_gain=.2)
for i, n in enumerate(['G3', 'F3', 'E3', 'D3']):  # deflating pizz for "no sales"
    note('pizzicato_strings', n, 12.3 + i * .38, .55)
note('pizzicato_strings', 'C3', 13.82, .5)
# competitor: lively
groove(14.2, 17.3, ['C', 'F', 'G', 'C'], energy=2)
# break: thinking + riser into the steps
for i, n in enumerate(['E5', 'G5', 'C6']):
    note('glockenspiel', n, 18.4 + i * .25, .25)
riser = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6']
for i, n in enumerate(riser):
    note('marimba', n, 19.1 + i * .0643, .15 + .3 * i / len(riser), -.4 + .8 * i / len(riser), length=.4)
groove(20.0, 25.84, ['C', 'Am', 'F', 'G'], energy=2)
groove(25.84, 32.1, ['C', 'Am', 'F', 'G'], energy=3)
# call: hold
note('pizzicato_strings', 'G2', 32.1, .5); note('marimba', 'D5', 32.1, .2)
# results: celebratory
groove(33.3, 36.8, ['F', 'G', 'C', 'C'], energy=3)
for t0, n in [(33.8, 'G5'), (34.05, 'E5'), (34.3, 'G5'), (34.55, 'A5'), (34.8, 'G5'), (35.3, 'C6'), (35.55, 'D6'), (35.8, 'E6'), (36.3, 'G6')]:
    note('glockenspiel', n, t0, .3, .2)
# offer
groove(37.0, 38.0, ['Am'], energy=1, drums=False, arp_gain=.2)
for i, n in enumerate(['C3', 'G3', 'C4', 'E4', 'G4', 'C5']):
    note('marimba', n, 38.04 + i * .02, .4)
note('pizzicato_strings', 'C2', 38.04, .8)
groove(38.5, 43.4, ['C', 'F', 'G', 'C'], energy=3)
for i, n in enumerate(['C4', 'E4', 'G4', 'C5', 'E5', 'G5']):
    note('marimba', n, 43.4 + i * .03, .38)
note('pizzicato_strings', 'C2', 43.4, .7)
note('glockenspiel', 'C6', 43.55, .3, .3); note('glockenspiel', 'G6', 43.7, .22, -.3)

# ---------------- SFX ----------------
S('appear-burst', 0.02, .45); S('pop-large-in', 0.1, .6)
S('whoosh-medium-soft', 1.3, .5, 0, sync=True); S('pop-medium-in', 1.45, .5)
for i, tt in enumerate([3.0, 3.25, 3.5]): S('pop-small-bubble', tt, .55, (-.3, 0, .3)[i])
S('pop-large-bubble', 5.12, .6, -.3)
for i in range(3): S('click-tap-soft', 6.5 + i * .25, .3)
S('click-button-firm', 7.36, .9); S('notification-success-soft', 7.42, .45)
S('money-notes', 7.8, .7); S('money-coins-pour', 8.05, .45); S('data-countup-medium', 7.9, .35)
for i in range(13): S('notification-message-in-soft' if i % 2 else 'notification-message-in-clear', 9.0 + i * .2, .5 - .02 * i, (-1) ** i * .3)
S('notification-attention-soft', 11.64, .6)
S('notification-failure-deflate', 12.32, .7)
S('whoosh-slow-soft', 13.0, .35, -.4, sync=True)
S('whoosh-fast-medium', 14.6, .6, 0, sync=True)
for i in range(4): S('pop-small-in', 15.4 + i * .3, .3, .5)
S('pop-large-in', 17.74, .6); S('swish-hard', 17.98, .55, 0, sync=True)
S('pop-large-in', 18.42, .55)
for i in range(4): S('click-toggle-on-firm', 19.58 + i * .1, .6, (-.3, -.1, .1, .3)[i])
S('impact-medium-firm', 20.0, .7); S('pop-medium-in', 20.06, .5)
S('shimmer-medium-soft', 20.9, .5)
for i in range(3): S('pop-medium-in', 21.42 + i * .12, .45, (-.5, 0, .5)[i])
S('whoosh-medium-soft', 22.5, .5, 0, sync=True); S('pop-medium-in', 22.42, .45)
for i in range(3): S('swipe-fast-soft', 22.95 + i * .45, .45)
S('impact-light-firm', 24.22, .7); S('notification-success-sparkle', 24.32, .5)
S('pop-medium-in', 25.86, .45)
for i in range(3): S('whoosh-fast-soft', 27.0 + i * .2, .45, (-.5, 0, .5)[i], sync=True); S('pop-medium-bubble', 27.25 + i * .2, .45)
S('notification-failure-knock', 28.32, .55)
S('pop-medium-in', 29.18, .45); S('pop-large-in', 29.25, .5)
for i in range(6): S('data-bar-grow', 29.65 + i * .12, .45, -.5 + .2 * i)
S('mechanical-ratchet-light', 31.4, .6); S('data-chart-reveal', 31.5, .4)
S('phone-ring-modern', 32.12, .55)
S('click-button-firm', 32.86, .8); S('notification-success-clear', 32.9, .5)
S('whoosh-medium-medium', 33.35, .5, 0, sync=True)
S('data-countup-long', 33.8, .35)
S('money-register', 35.25, .55)
S('celebration-popper', 36.42, .6); S('celebration-confetti', 36.5, .5)
S('whoosh-medium-medium', 36.95, .6, 0, sync=True)
S('pop-large-in', 37.22, .5); S('pop-large-in', 37.6, .55)
S('cinematic-slam-big', 38.04, .75); S('boom-hit-medium', 38.04, .5)
S('whoosh-fast-soft', 39.2, .35, 0, sync=True)
S('pop-medium-in', 39.68, .5)
S('pop-large-in', 40.3, .6); S('notification-success-chime', 40.4, .4)
S('sting-bright-short', 43.4, .5, 0, sync=True)

# ---------------- MIX ----------------
rng = np.random.default_rng(1)
L = int(SR * 1.0)
env = np.exp(-np.linspace(0, 6.5, L))
ir = np.stack([rng.standard_normal(L) * env, rng.standard_normal(L) * env], 1).astype(np.float32)
b, a = butter(2, 6000 / (SR / 2)); ir = lfilter(b, a, ir, axis=0)
ir /= np.abs(ir).sum(0).max() / 6
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
mus = music + wet * .2
b, a = butter(2, 45 / (SR / 2), 'high'); mus = lfilter(b, a, mus, axis=0)
mix = mus * .55 + sfx * .8
f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
peak = np.abs(mix).max()
mix = mix / peak * 1.1
mix = np.tanh(mix) / np.tanh(1.1) * .7
import soundfile as sf
sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_16')
print('peak', peak, 'written', OUT)

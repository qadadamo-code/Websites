"""Sound design for the Planet focus reel (10.6s). Synth bed (numpy) + CC0 SFX from wyzowl/sfx-kit.
Run: python3 -I mix.py <sfx_kit_dir> <out.wav>"""
import sys, json, subprocess, numpy as np
SFX, OUT = sys.argv[1:3]
SR = 44100; DUR = 10.6; N = int(SR * DUR)
bus = np.zeros((N, 2), np.float32); bed = np.zeros((N, 2), np.float32)
_c = {}
d = json.load(open(SFX + '/sounds.json')); d = d['sounds'] if isinstance(d, dict) else d
META = {s['id']: s for s in d}
def load(name):
    if name not in _c:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SFX + '/' + META[name]['file'], '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _c[name] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _c[name]
def S(name, t, g=1.0, pan=0.0, end=False, maxlen=None):
    a = load(name)
    if maxlen: a = a[:int(maxlen * SR)].copy(); f = min(len(a), int(0.03 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    if end: t -= len(a) / SR
    i = int(round(t * SR));
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    if n <= 0: return
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bus[i:i + n, 0] += a[:n, 0] * g * l; bus[i:i + n, 1] += a[:n, 1] * g * r

tt = np.arange(N) / SR
# --- bed: dark drone + heartbeat sub pulses on a 0.5s grid, silent gaps where the reference drops out
drone = (np.sin(2 * np.pi * 49 * tt) * 0.5 + np.sin(2 * np.pi * 73.5 * tt + 0.3) * 0.22 + np.sin(2 * np.pi * 98 * tt) * 0.12)
drone *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * tt)
env = np.clip(tt / 0.4, 0, 1) * np.where(tt < 7.55, 1.0, 0.0)
gap = np.ones(N); gap[(tt > 1.68) & (tt < 1.96)] = 0.25; gap[(tt > 3.99) & (tt < 4.05)] = 0.1
bed[:, 0] += drone * env * gap * 0.10; bed[:, 1] += drone * env * gap * 0.10
def pulse(t, g=1.0, f0=62):
    i = int(t * SR); L = int(0.42 * SR); x = np.arange(L) / SR
    w = np.sin(2 * np.pi * (f0 * x + 40 * (1 - np.exp(-x * 30)) / 30)) * np.exp(-x * 9) * g
    n = min(L, N - i); bed[i:i + n, 0] += w[:n]; bed[i:i + n, 1] += w[:n]
rng = np.random.default_rng(3)
def tick(t, g=0.05):
    i = int(t * SR); L = int(0.03 * SR); w = rng.standard_normal(L) * np.exp(-np.arange(L) / SR * 180) * g
    w = np.diff(np.concatenate([[0], w]))  # bright
    n = min(L, N - i); bed[i:i + n, 0] += w[:n] * 0.8; bed[i:i + n, 1] += w[:n] * 1.2
k = 0.0
while k < 7.5:
    if not (1.68 < k < 1.96) and not (3.99 < k < 4.05):
        pulse(k, 0.42 if int(round(k * 2)) % 2 == 0 else 0.28)
    k += 0.5
for j in range(int(2.16 / 0.125), int(4.0 / 0.125)): tick(j * 0.125, 0.06 if j % 2 else 0.035)
for j in range(int(4.92 / 0.125), int(7.36 / 0.125)): tick(j * 0.125, 0.05 if j % 2 else 0.03)

# --- SFX on the cuts
S('boom-hit-soft', 0.0, 0.7); S('digital-glitch-clear', 0.04, 0.5); S('digital-glitch-subtle', 0.20, 0.45, -0.3); S('digital-glitch-subtle', 0.28, 0.4, 0.3)
S('whoosh-fast-soft', 0.36, 0.5); S('writing-pen-tick', 0.58, 0.8); S('swish-hard', 0.72, 0.6)
S('impact-heavy-hard', 0.80, 0.8); S('digital-glitch-clear', 0.84, 0.45); S('digital-glitch-subtle', 0.96, 0.5); S('digital-glitch-subtle', 1.04, 0.5)
S('click-tap-firm', 1.18, 1.0); S('phone-vibrate-hand', 1.40, 0.6); S('click-latch-firm', 1.50, 1.0)
S('mechanical-ratchet-light', 1.64, 0.9); S('data-countup-short', 1.66, 0.35); S('data-number-land', 1.92, 0.6)
S('impact-heavy-firm', 1.96, 0.7); S('whoosh-fast-medium', 1.94, 0.4)
S('keyboard-typing-quick-medium', 2.16, 0.55, 0.2); S('keyboard-return-firm', 2.48, 0.8); S('keyboard-typing-quick-short', 2.78, 0.5, -0.2); S('keyboard-return-medium', 3.04, 0.7)
S('swish-medium', 3.08, 0.5); S('writing-pencil-draw', 3.10, 0.7, maxlen=0.95); S('swish-soft', 3.36, 0.5); S('keyboard-typing-quick-short', 3.68, 0.55)
S('mechanical-switch-heavy', 4.04, 1.0); S('digital-static', 4.04, 0.35, maxlen=0.18); S('whoosh-fast-soft', 4.08, 0.5)
S('swipe-fast-firm', 4.40, 0.8); S('click-tap-medium', 4.58, 0.9); S('mechanical-slider-light', 4.72, 0.7)
S('foley-paper-slide', 4.92, 0.7); S('foley-card-touch', 5.10, 0.8); S('foley-card-touch', 5.28, 0.7); S('foley-card-touch', 5.42, 0.7)
S('click-clip-firm', 5.52, 0.9); S('click-clip-medium', 5.72, 0.9); S('click-clip-firm', 5.92, 0.8); S('click-clip-soft', 6.04, 0.8)
S('whoosh-medium-soft', 6.08, 0.5); S('foley-paper-touch', 6.14, 0.6)
S('mechanical-ratchet-heavy', 6.60, 0.9); S('mechanical-shutter-heavy', 6.84, 1.0); S('mechanical-shutter-light', 7.10, 0.9); S('mechanical-shutter-light', 7.22, 0.8)
S('click-button-firm', 7.38, 1.0); S('digital-power-up', 7.40, 0.35, maxlen=0.25)
S('riser-1s-strong', 7.58, 0.45, end=True); S('reverse-whoosh-short-strong', 7.60, 0.6, end=True)
# --- end card
S('cinematic-drum-big', 7.60, 0.9); S('boom-hit-strong', 7.60, 0.6); S('shimmer-medium-bright', 7.66, 0.35); S('sting-tech-short', 7.70, 0.45)
S('pop-medium-in', 7.80, 0.4); S('pop-medium-in', 7.94, 0.35); S('pop-medium-in', 8.08, 0.35)

mix = bed + bus
# soft clip + fade tail
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
f = int(0.6 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
raw = (np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', str(SR), OUT], input=raw, check=True)
print('ok', OUT)

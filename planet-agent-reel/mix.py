import numpy as np, subprocess, glob, os, wave
SR = 44100; DUR = 38.0
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768
def sfx(n): return load(glob.glob(f'assets/sfx/sounds/**/{n}.wav', recursive=True)[0])
out = np.zeros((int(SR * DUR), 2), np.float32)
def add(x, t, g=1.0, maxlen=None):
    if maxlen: x = x[:int(maxlen * SR)].copy(); f = min(len(x), int(.04 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); j = min(len(out), i + len(x)); out[i:j] += x[:j - i] * g
# music
m = load('assets/stock/m162.mp3')[:len(out)]
env = np.ones(len(m)); fi = int(.25 * SR); env[:fi] = np.linspace(0, 1, fi)
fo = int(2.2 * SR); env[-fo:] = np.linspace(1, 0, fo) ** 1.5
out[:len(m)] += m * env[:, None] * 0.5
# sfx
typ = sfx('keyboard-typing-quick-short'); ret = sfx('keyboard-return-soft'); pop = sfx('pop-small-in'); popb = sfx('pop-small-bubble')
wh = sfx('whoosh-fast-soft'); whm = sfx('whoosh-medium-soft'); rwh = sfx('reverse-whoosh-short-soft'); tick = sfx('data-tick')
clk = sfx('click-mouse-soft'); ok = sfx('notification-success-soft'); sting = sfx('sting-tech-short'); swipe = sfx('swipe-fast-soft')
add(rwh, 0.55, .5); add(tick, 1.05, .5)
for t in (2.45, 4.8, 9.3, 11.38, 32.62): add(whm, t, .55)
for i in range(6): add(tick, 3.0 + i * .27 + .32, .45)
add(typ, 5.05, .45, .55); add(ret, 5.62, .5)
for i in range(8): add(tick, 5.95 + i * .27, .25)
add(ok, 8.3, .35)
add(pop, 9.55, .5)
for k in range(7): add(popb, 9.8 + k * .09, .22)
CASES = [(12.0, 'حوّل تصويرنا لريلز'), (16.9, 'خلّي كل تصميم على هوية البراند'), (20.0, 'اعمل فيديو عن قصة البراند'), (23.05, 'صمّم موقع لمطعمي'), (26.35, 'اعمل تطبيق لعملائي'), (29.4, 'اعمل 12 إعلان نجرّبهم')]
for T, p in CASES:
    td = min(.75, .035 * len(p) + .1)
    add(typ, T, .4, td); add(ret, T + td + .05, .55); add(pop, T + td + .18, .35); add(wh, T + td + .3, .35)
add(swipe, 12.0 + .75 + .32 + 2.1, .4)        # C1 scan
add(swipe, 16.9 + 1.85, .35); add(clk, 16.9 + 2.47, .5); add(ok, 16.9 + 2.6, .25)
add(clk, 23.05 + 2.62, .55); add(ok, 23.05 + 2.72, .3)
for i in range(12): add(popb, 29.4 + .95 + i * .06, .15)
add(sting, 33.35, .45); add(clk, 33.75, .4)
out = np.tanh(out * 1.05) * 0.92
w = wave.open('audio.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok', out.shape, float(np.abs(out).max()))

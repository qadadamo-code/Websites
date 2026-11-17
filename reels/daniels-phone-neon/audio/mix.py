"""Soundtrack for the Daniel's Phone neon ident (37.8s, 100 BPM): ambient-electronic bed
(FluidR3 pad + EP arps + synth bass, soft Dirt-Samples groove from 19.4s) + UI SFX (typing ticks, whooshes, clicks) + CC0 SFX (wyzowl/sfx-kit) on every cut.
Run: python3 -I mix.py <sfx_kit_dir> <FluidR3_GM_dir> <dirt_samples_dir> <out.wav>"""
import sys, subprocess, json, numpy as np
SFX, SF, DS, OUT = sys.argv[1:5]
SR = 44100; DUR = 37.8; N = int(SR * DUR)
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




BPM = 100; B = 60 / BPM; BAR = 4 * B
KICK = 'clubkick/1.wav'; KICK2 = '808bd/BD0025.WAV'; CLAP = 'cp/HANDCLP0.wav'; HAT = 'hh/000_hh3closedhh.wav'; OHAT = 'hh/007_hh3openhh.wav'; RS = '808/RS.WAV'
# Am(add9) - Fmaj7 - C(add9) - G6, two bars each
CH = [(['A3', 'C4', 'E4', 'B4'], 'A1'), (['F3', 'A3', 'C4', 'E4'], 'F1'), (['C4', 'E4', 'G4', 'D5'], 'C2'), (['G3', 'B3', 'D4', 'E4'], 'G1')]
def chord_at(t): return CH[int(t // (2 * BAR)) % 4]
# pad + sub, whole piece until the logo
t = 0.0
while t < 33.4 - 1e-6:
    ch, root = chord_at(t + .01)
    for i, n in enumerate(ch): note('pad_2_warm', n, t, .07, (-.6, -.2, .2, .6)[i], length=2 * BAR + .3)
    note('synth_bass_1', root, t, .32, length=2 * BAR - .1)
    t += 2 * BAR
# EP arpeggio 8ths, gentle ping-pong, enters at 2.0, fuller from 11.0
t = 2.0; k = 0
while t < 33.4 - 1e-6:
    ch, _ = chord_at(t); n = ch[[0, 2, 1, 3, 2, 1][k % 6]]; n = n[:-1] + str(int(n[-1]) + 1)
    g = .07 if t < 11 else .1
    note('electric_piano_1', n, t, g, (-.45, .45)[k % 2], length=.5)
    t += B / 2; k += 1
# soft groove 19.4-33.4
t = 19.4; k = 0
while t < 33.4 - 1e-6:
    beat = k % 4
    if beat in (0, 2): drum(KICK, t, .6 if beat == 0 else .45); drum(KICK2, t, .25)
    if beat in (1, 3): drum(CLAP, t, .28, .05)
    drum(HAT, t + B / 2, .08, .25); drum(HAT, t, .05, -.2)
    if beat == 3 and (k // 4) % 2: drum(RS, t + B * .75, .15, .3)
    t += B; k += 1
for i in range(16): drum(HAT, 32.0 + i * (1.4 / 16), .04 + .01 * i, .1)   # build into logo
# logo hit 33.4 -> settle 35.0
drum(KICK, 33.4, .9); drum(KICK2, 33.4, .6); S('cinematic-drum-big', 33.4, .45); S('bass-sub-drop-medium', 33.4, .4)
for n in ['A2', 'E3', 'A3', 'C4', 'E4', 'B4']: note('pad_2_warm', n, 33.4, .13, length=4.4)
note('synth_bass_1', 'A1', 33.4, .45, length=3.0)
for i, n in enumerate(['A4', 'C5', 'E5', 'B5', 'E6']): note('orchestral_harp', n, 35.0 + i * .07, .16, length=2.2)
for i, n in enumerate(['A3', 'C4', 'E4', 'B4']): note('electric_piano_1', n, 35.0 + i * .02, .15, length=2.4)

# ---- SFX
CUTS = [2.0, 3.3, 4.6, 6.8, 7.3, 9.3, 10.7, 11.0, 13.3, 17.0, 17.8, 19.4, 22.9, 26.0, 27.4, 28.4, 31.0, 33.4]
for i, c in enumerate(CUTS):
    S(['whoosh-medium-soft', 'swish-medium', 'whoosh-fast-medium'][i % 3], c - .12, .18, (-.35, .35)[i % 2])
TYPE = [(0.05, 1.35, 'كل شي بيبلّش من موبايلك.'), (2.45, .4, 'أحدث الأجهزة'), (4.75, .45, 'شحن سريع.'), (7.4, .8, 'وكل الإكسسوارات.'),
        (11.2, .5, 'كل الماركات'), (11.75, .4, 'بمكان واحد'), (14.4, .5, 'فحص دقيق لجهازك.'), (18.1, .7, 'تصليح شاشات وبطاريات'), (20.75, .7, 'وصيانة لكل الأجهزة'),
        (24.0, .45, 'حماية لجهازك'), (26.35, .6, 'كفرات وشاشات حماية.'), (29.0, .7, 'وسماعات بصوت نقي.')]
for a, d, s in TYPE:
    for i, ch in enumerate(s):
        if ch != ' ': S('click-tap-soft', a + d * (i + .5) / len(s), .09 + .03 * ((i * 7) % 3) / 2, (.15, -.15)[i % 2])
S('pop-small-in', 2.0, .3); S('appear-flip-quick', 2.2, .25); S('shimmer-short-sparkle', 3.35, .3); S('pop-medium-in', 3.75, .3); S('shimmer-short-sparkle', 4.25, .22)
S('click-toggle-medium', 5.75, .35); S('shimmer-short-sparkle', 6.1, .25); S('reverse-whoosh-medium-soft', 7.3, .25, sync=True)
S('swipe-fast-soft', 9.3, .3); S('click-button-soft', 10.35, .45); S('impact-light-firm', 10.7, .25)
S('reverse-whoosh-long-soft', 13.9, .22, sync=True); S('shimmer-short-sparkle', 16.3, .3)
S('appear-flip-quick', 17.8, .3); S('reverse-whoosh-long-strong', 19.4, .3, sync=True); S('impact-medium-soft', 19.4, .25)
S('click-mouse-soft', 23.3, .35); S('click-mouse-soft', 24.9, .4); S('shimmer-short-sparkle', 26.0, .25)
S('swipe-medium-soft', 27.4, .25); S('riser-2s-soft', 33.4, .35, sync=True); S('shimmer-short-sparkle', 35.0, .35)

def norm(x, peak):
    m = np.abs(x).max(); return x * (peak / m) if m > 0 else x
mix = norm(music, 0.55) + norm(drums, 0.5) + norm(sfx, 0.42)
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix = norm(mix, 0.9).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', OUT], input=mix.tobytes(), check=True)
print('ok', OUT)

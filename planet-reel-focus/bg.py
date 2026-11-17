"""Build the live-action background track (graded stock frames) for the Planet focus reel.
Run: python3 -I bg.py <clips_dir> <out_dir>
Each EDL row: t0, t1, clip id, source in (s), speed, zoom start, zoom end, focus x, focus y.
Clip ids are Mixkit free-licence stock videos (mixkit.co, free for commercial use).
Rows with clip None are left black (rendered shots are drawn by index.html)."""
import sys, os, subprocess
from PIL import Image, ImageFilter, ImageEnhance
CLIPS, OUT = sys.argv[1:3]
FPS = 30; DUR = 10.6; W, H = 1920, 1080
EDL = [
    (0.00, 0.36, '17702', 1.4, 1.0, 1.12, 1.32, .47, .50),   # eye macro
    (0.36, 0.56, '39839', 2.0, 1.0, 1.10, 1.16, .45, .45),   # dark office wide
    (0.56, 0.72, '46768', 5.1, 1.0, 1.25, 1.35, .70, .60),   # pen on notebook
    (0.72, 0.80, '46768', 7.2, 3.0, 1.60, 1.30, .75, .70),   # whip
    (0.80, 1.16, '41645', 0.8, 1.0, 1.12, 1.22, .62, .45),   # focused face
    (1.16, 1.28, '4915', 6.2, 1.0, 1.55, 1.65, .55, .62),    # phone screen
    (1.28, 1.40, None),
    (1.40, 1.48, '247', 9.0, 1.0, 1.20, 1.25, .55, .55),     # phone dark
    (1.48, 1.64, '14669', 2.6, 1.0, 1.30, 1.45, .55, .45),   # phone in hand
    (1.64, 1.96, None),                                      # growth dial (render)
    (1.96, 2.16, '48017', 1.5, 1.0, 1.45, 1.60, .52, .50),   # iris
    (2.16, 2.32, '17450', 23.3, 1.0, 1.15, 1.25, .55, .55),  # laptop dark
    (2.32, 2.48, '41268', 5.0, 1.0, 1.20, 1.30, .50, .50),   # fingers close
    (2.48, 2.76, '1781', 5.0, 1.0, 1.05, 1.12, .45, .50),    # hands typing
    (2.76, 3.08, '41646', 3.8, 1.0, 1.30, 1.40, .60, .50),   # keyboard close
    (3.08, 3.36, '785', 0.8, 1.0, 1.25, 1.35, .45, .45),     # tablet drawing
    (3.36, 3.56, '799', 4.6, 1.0, 2.10, 2.30, .40, .80),     # pen
    (3.56, 3.68, '785', 7.5, 1.0, 1.50, 1.60, .45, .45),     # drawing close
    (3.68, 4.00, '4907', 3.8, 1.0, 1.10, 1.20, .50, .50),    # typing
    (4.00, 4.04, None),
    (4.04, 4.24, '21065', 0.4, 1.0, 2.60, 2.90, .535, .40),  # lighter flame
    (4.24, 4.40, '21065', 2.1, 1.0, 1.30, 1.35, .53, .45),   # lighter wide
    (4.40, 4.56, '48010', 3.6, 1.0, 1.20, 1.30, .45, .50),   # eyes + screen glow
    (4.56, 4.72, '4915', 11.2, 1.0, 2.00, 2.15, .50, .62),   # phone close
    (4.72, 4.92, '48626', 2.3, 2.0, 1.35, 1.15, .62, .55),   # lens tube slide
    (4.92, 6.60, None),                                      # campaign board (render)
    (6.60, 6.84, '2378', 3.2, 2.5, 1.30, 1.40, .50, .55),    # focus ring
    (6.84, 7.08, '2374', 3.1, 1.6, 1.20, 1.35, .50, .50),    # aperture
    (7.08, 7.36, '50635', 2.3, 1.0, 1.55, 1.75, .45, .30),   # photographer
    (7.36, DUR, None),                                       # ring + end card (render)
]
os.makedirs(OUT, exist_ok=True)
GRADE = ('eq=contrast=1.18:brightness=-0.05:saturation=0.72:gamma=0.92,'
         'colorbalance=rs=-0.10:gs=-0.02:bs=0.12:rm=-0.06:gm=0.02:bm=0.06:rh=-0.02:gh=0.03:bh=0.03,'
         'curves=all=0/0 0.12/0.06 0.5/0.47 1/0.96,vignette=PI/4.2')
black = Image.new('RGB', (W, H), (4, 7, 12))
n = round(DUR * FPS)
done = set()
for row in EDL:
    t0, t1 = row[:2]
    i0, i1 = round(t0 * FPS), round(t1 * FPS)
    if row[2] is None:
        for i in range(i0, i1): black.save(f'{OUT}/f{i:05d}.jpg', quality=93); done.add(i)
        continue
    _, _, cid, sin, sp, z0, z1, fx, fy = row
    cnt = i1 - i0
    tmp = f'{OUT}/_tmp'; os.makedirs(tmp, exist_ok=True)
    for f in os.listdir(tmp): os.remove(f'{tmp}/{f}')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(sin), '-i', f'{CLIPS}/{cid}.mp4',
                    '-vf', f'setpts=PTS/{sp},fps={FPS},{GRADE}', '-frames:v', str(cnt), '-q:v', '2', f'{tmp}/g%04d.jpg'], check=True)
    got = sorted(os.listdir(tmp))
    for k in range(cnt):
        im = Image.open(f'{tmp}/{got[min(k, len(got) - 1)]}')
        u = k / max(1, cnt - 1); z = z0 + (z1 - z0) * (u * u * (3 - 2 * u))
        w, h = im.size; cw, ch = w / z, h / z
        x = min(max(fx * w - cw / 2, 0), w - cw); y = min(max(fy * h - ch / 2, 0), h - ch)
        im = im.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        im.save(f'{OUT}/f{i0 + k:05d}.jpg', quality=93); done.add(i0 + k)
missing = [i for i in range(n) if i not in done]
print('frames', n, 'missing', missing[:10])

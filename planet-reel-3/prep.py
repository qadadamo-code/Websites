import sys
from PIL import Image, ImageFilter
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
for n in ['glasses','pen','magnifier','key','notepad','booklet','column','capital']:
    im = Image.open(f'{src}/{n}.png').convert('RGB')
    a = np.asarray(im).astype(np.float32)
    small = im.resize((max(8,im.width//8), max(8,im.height//8)), Image.BILINEAR)
    bg = small.filter(ImageFilter.MaxFilter(31 if n in ('column','capital') else 15)).filter(ImageFilter.GaussianBlur(6)).resize(im.size, Image.BICUBIC)
    b = np.asarray(bg).astype(np.float32)
    out = (np.clip(a / np.maximum(b, 1) * 1.01, 0, 1) * np.array([244,244,242],np.float32)).astype(np.uint8)
    h_, w_ = out.shape[:2]
    e = 0.06 if n in ('column','capital') else 0.16
    yy = np.minimum(np.arange(h_), np.arange(h_)[::-1]) / (h_ * e)
    xx = np.minimum(np.arange(w_), np.arange(w_)[::-1]) / (w_ * e)
    m = np.clip(np.minimum(yy[:, None], xx[None, :]), 0, 1); m = (m * m * (3 - 2 * m))[..., None]
    out = (out * m + np.array([244, 244, 242], np.float32) * (1 - m)).astype(np.uint8)
    scale = 2 if n not in ('column','capital') else 1.5
    Image.fromarray(out).resize((int(im.width*scale), int(im.height*scale)), Image.LANCZOS).save(f'{dst}/{n}.jpg', quality=93)
    print(n, im.size, b.mean())

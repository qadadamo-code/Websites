"""Planet reel 6: shot-for-shot re-edit of a 7.7s fast-cut creator reel, rebuilt with
Mixkit free-licence footage, Planet client sites keyed into screens, navy/mint grade,
and a Planet end card.  Run inside the sandbox:  python3 -I build.py <clipdir1080> <clipdir720> <assets> <endframes> <out.mp4>"""
import sys, subprocess, os, numpy as np, cv2
C1080, C720, ASSETS, ENDDIR, OUT = sys.argv[1:6]
W, H, FPS = 1920, 1080, 25
MINT = np.array([0xB4, 0xC5, 0x92], np.float32) / 255  # BGR of #92C5B4
NAVY = np.array([0x59, 0x36, 0x14], np.float32) / 255  # BGR of #143659
rng = np.random.default_rng(7)

def src(i):
    p = f'{C1080}/{i}.mp4'
    return p if os.path.exists(p) else f'{C720}/{i}.mp4'

def frames(i, t, n, speed=1.0):
    dur = n / FPS * speed + 0.3
    vf = f'setpts=PTS/{speed},fps={FPS},scale={W}:{H}:flags=lanczos'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src(i), '-t', str(dur), '-vf', vf,
                          '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    if len(a) < n: a = np.concatenate([a, np.repeat(a[-1:], n - len(a), 0)])
    return [f.astype(np.float32) / 255 for f in a[:n]]

def zoom(f, s, cx=0.5, cy=0.5, dx=0, dy=0):
    if abs(s - 1) < 1e-4 and dx == 0 and dy == 0: return f
    M = np.float32([[s, 0, (1 - s) * cx * W + dx], [0, s, (1 - s) * cy * H + dy]])
    return cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = 1 - 0.55 * np.clip((((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2) - 0.25, 0, 1)[..., None]

def grade(f, exp=1.0, sat=0.88, tint=1.0):
    f = np.clip(f * exp, 0, 1)
    f = f ** 1.12
    f = f * f * (3 - 2 * f) * 0.55 + f * 0.45            # S-curve, crushed blacks
    l = f.mean(2, keepdims=True)
    f = l + (f - l) * sat
    sh = (1 - l) ** 3
    f = f * (1 - 0.30 * sh * tint) + NAVY * 0.30 * sh * tint   # navy shadows
    hi = np.clip(l - 0.6, 0, 1) * 1.2
    f = f + (MINT - 0.85) * 0.10 * hi * tint                  # faint mint in highlights
    f = f * VIG
    f = f + rng.normal(0, 0.012, (H, W, 1)).astype(np.float32)
    return np.clip(f, 0, 1)

# ---------- green-screen screens ----------
def scr(name):
    return cv2.imread(f'{ASSETS}/screens/{name}').astype(np.float32) / 255

def key(f):
    hsv = cv2.cvtColor((f * 255).astype(np.uint8), cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (33, 70, 50), (92, 255, 255))
    return m

def order(pts):
    pts = np.array(pts, np.float32); s = pts.sum(1); d = np.diff(pts, axis=1)[:, 0]
    return np.float32([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]])  # tl,tr,br,bl

def quad_from_mask(m):
    k = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    cs, _ = cv2.findContours(k, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cs, key=cv2.contourArea); hull = cv2.convexHull(c)
    for e in np.linspace(0.01, 0.1, 40):
        ap = cv2.approxPolyDP(hull, e * cv2.arcLength(hull, True), True)
        if len(ap) == 4: return order(ap[:, 0]), k
    r = cv2.boxPoints(cv2.minAreaRect(c)); return order(r), k

def comp_screen(f, img, quad, fill_mask, glow=0.0):
    h, w = img.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), quad)
    warped = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(fill_mask.astype(np.float32) / 255, (5, 5), 0)[..., None]
    # despill fringe
    g = f.copy(); mx = np.maximum(g[..., 0], g[..., 2]); g[..., 1] = np.minimum(g[..., 1], mx)
    out = g * (1 - a) + warped * 1.05 * a
    if glow:
        bl = cv2.GaussianBlur(warped * a, (0, 0), 40); out = out + bl * glow
    return np.clip(out, 0, 1)

def screen_shot(f, imgname, cache={}):
    img = cache.setdefault(imgname, scr(imgname))
    m = key(f); q, k = quad_from_mask(m)
    fill = np.zeros((H, W), np.uint8); cv2.fillConvexPoly(fill, q.astype(np.int32), 255)
    fill = cv2.bitwise_and(fill, cv2.dilate(k, np.ones((5, 5), np.uint8)))
    fill = np.maximum(fill, cv2.erode(fill, np.ones((9, 9), np.uint8)))
    return comp_screen(f, img, q, fill, glow=0.12)

# laptop (screen runs off the top/left of frame): reference quad, tracked by bottom/left edges of the key
LAP_REF = None
def laptop_shot(f, imgname):
    global LAP_REF
    img = scr(imgname)
    m = key(f)
    cols = np.arange(150, 800, 10); bot = []
    for x in cols:
        c = np.nonzero(m[:, x])[0]; bot.append(c.max() if len(c) else np.nan)
    bot = np.array(bot, float); ok = ~np.isnan(bot)
    kb, cb = np.polyfit(cols[ok], bot[ok], 1)
    rows = np.arange(220, 520, 10); lef = []
    for y in rows:
        r = np.nonzero(m[y])[0]; lef.append(r.min() if len(r) else np.nan)
    lef = np.array(lef, float); ok = ~np.isnan(lef)
    kl, cl = np.polyfit(rows[ok], lef[ok], 1)
    # intersection: y = kb*x+cb ; x = kl*y+cl
    y0 = (kb * cl + cb) / (1 - kb * kl); x0 = kl * y0 + cl
    ang = np.arctan(kb)
    ux, uy = np.cos(ang), np.sin(ang)                  # along bottom edge
    L = 1003 / np.cos(np.arctan(0.374)) * np.cos(ang) / np.cos(ang)  # width along edge
    L = 1003
    br = (x0 + ux * L, y0 + uy * L)
    vx, vy = -kl, -1.0; n = np.hypot(vx, vy); vx, vy = vx / n * 700, vy / n * 700
    q = np.float32([[x0 + vx, y0 + vy], [br[0] + vx, br[1] + vy], br, (x0, y0)])
    k = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    return comp_screen(f, img, q, k, glow=0.10)

# ---------- silhouette + x-ray ----------
def sil_mask():
    f = frames(42838, float(os.environ.get('SILT', '8.85')), 1)[0]
    l = f.mean(2); m = (l < 0.35).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = (lab == big).astype(np.uint8) * 255
    ys, xs = np.nonzero(m); top = ys.min()
    hx = xs[ys < top + 300].mean()
    s = float(os.environ.get('SILS', '0.56'))
    M = np.float32([[s, 0, W * 0.5 - hx * s + 30], [0, s, H * 0.25 - top * s]])
    m = cv2.warpAffine(m, M, (W, H), flags=cv2.INTER_LINEAR)
    # replace the cropped neck with shoulders
    ys, xs = np.nonzero(m > 128); b = ys.max()
    yn = b - 40
    row = np.nonzero(m[yn] > 128)[0]; nl, nr = row.min(), row.max()
    pts = np.int32([[nl, yn - 20], [nr, yn - 20], [nr + 40, yn + 40], [nr + 300, yn + 150], [nr + 380, H + 5],
                    [nl - 330, H + 5], [nl - 240, yn + 160], [nl - 20, yn + 60]])
    sh = np.zeros_like(m); cv2.fillPoly(sh, [pts], 255)
    sh = cv2.GaussianBlur(sh, (0, 0), 25); sh = ((sh > 127) * 255).astype(np.uint8)
    m = np.maximum(m, sh)
    return cv2.GaussianBlur(m, (3, 3), 0).astype(np.float32) / 255

def circle_bg(t):
    cx, cy, r = W * 0.5, H * 0.485, H * 0.40
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    inner = np.clip(1 - d, 0, 1)
    disk = 1 / (1 + np.exp(np.clip((d - 1) * 60, -50, 50)))
    col_c = np.array([0.80, 0.86, 0.66]) ; col_e = np.array([0.42, 0.55, 0.28])  # BGR mint light->deep
    base = col_e + (col_c - col_e) * (inner ** 0.7)[..., None]
    glow = np.exp(-np.clip(d - 1, 0, None) * 6)[..., None] * 0.20
    bg = np.array([0.035, 0.03, 0.02]) + (MINT * 0.5) * glow
    out = bg * (1 - disk[..., None]) + base * disk[..., None] * (0.85 + 0.15 * np.sin(t * 9))
    return out.astype(np.float32)

def xray_pattern(mask):
    hm = mask > 0.5
    ys, xs = np.nonzero(hm); top = ys.min()
    pat = np.zeros((H, W), np.float32)
    # brain: iso-contours of smooth noise inside an ellipse at the head
    hx = xs[ys < top + 120].mean(); hy = top + 105
    def contours(sig, levels, thr):
        nz = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), sig)
        nz = (nz - nz.min()) / (nz.max() - nz.min())
        bands = (((nz * levels) % 1) < thr).astype(np.uint8) * 255
        cs, _ = cv2.findContours(bands, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        img = np.zeros((H, W), np.float32)
        cv2.drawContours(img, cs, -1, 1.0, 2, cv2.LINE_AA)
        return img
    ell = ((xx - hx) / 120) ** 2 + ((yy - hy) / 88) ** 2 < 1
    pat += contours(11, 5, 0.5) * ell * 0.85
    pat += contours(30, 3, 0.5) * (~ell) * 0.22
    # spine line
    for y in range(int(hy + 80), H, 2):
        cv2.circle(pat, (int(hx + 40 + (y - hy) * 0.15), y), 3, 1.0, -1)
    # outline glow
    edge = cv2.morphologyEx((hm * 255).astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((5, 5), np.uint8)).astype(np.float32) / 255
    pat = np.clip(pat * hm + edge * 0.8, 0, 1)
    return pat

def sil_frame(mask, pat, t, xr):
    bg = circle_bg(t)
    jitter = int(np.sin(t * 40) * 2)
    m = np.roll(mask, jitter, 1)[..., None]
    f = bg * (1 - m) + np.array([0.02, 0.018, 0.012], np.float32) * m
    if xr > 0:
        p = np.roll(pat, jitter, 1)
        ys = np.nonzero(mask > 0.5)[0]; top, bot = ys.min(), H
        reveal = (yy < top + (bot - top) * min(1, xr * 1.6)).astype(np.float32)
        p = p * reveal * (0.75 + 0.25 * (rng.random() > 0.2))
        glow = cv2.GaussianBlur(p, (0, 0), 5) * 0.9 + cv2.GaussianBlur(p, (0, 0), 18) * 0.7
        col = np.array([0.80, 0.95, 0.55], np.float32)  # bright mint (BGR)
        f = f + (p[..., None] * 1.2 + glow[..., None]) * col
    return np.clip(f, 0, 1)

def bar(f, t, x0=640, x1=1250, yc=388, h=116):
    out = f.copy()
    sh = int(rng.integers(-14, 14))
    y0, y1 = yc - h // 2, yc + h // 2
    col = np.array([0.72, 0.86, 0.50], np.float32)
    region = out[y0:y1, x0 + sh:x1 + sh]
    out[y0:y1, x0 + sh:x1 + sh] = np.clip(region * 0.35 + col * 0.85, 0, 1)
    # chromatic slices
    out[y0 - 6:y0, x0 + sh + 30:x1 + sh + 30] = np.clip(out[y0 - 6:y0, x0 + sh + 30:x1 + sh + 30] + col * 0.4, 0, 1)
    g = cv2.GaussianBlur(np.clip(out - f, 0, 1), (0, 0), 14)
    return np.clip(out + g * 0.8, 0, 1)

# ---------- edit decision list (start, end, clip, src_t, speed, z0, z1, cx, cy, exp, special) ----------
EDL = [
    (0.00, 0.24, 17702, 4.40, 1.0, 1.18, 1.26, 0.52, 0.45, 0.62, 'flicker'),
    (0.24, 0.44, 'SIL', 0, 1, 1.00, 1.02, .5, .5, 1, ''),
    (0.44, 0.70, 'XRAY', 0, 1, 1.02, 1.05, .5, .5, 1, ''),
    (0.70, 0.96, 100112, 1.55, 1.0, 1.05, 1.10, 0.47, 0.38, 0.95, 'bar'),
    (0.96, 1.20, 100117, 2.85, 1.0, 1.10, 1.16, 0.55, 0.40, 0.95, ''),
    (1.20, 1.64, 41638, 1.00, 1.0, 1.05, 1.12, 0.5, 0.5, 0.80, ''),
    (1.64, 1.96, 100069, 2.00, 1.0, 1.55, 1.62, 0.56, 0.42, 0.85, 'phone'),
    (1.96, 2.16, 13189, 5.50, 1.0, 1.10, 1.14, 0.5, 0.5, 0.80, ''),
    (2.16, 2.24, 41268, 4.50, 1.0, 1.10, 1.12, 0.5, 0.5, 0.75, ''),
    (2.24, 2.76, 100321, 1.00, 1.0, 1.00, 1.06, 0.4, 0.4, 0.82, 'laptop'),
    (2.76, 3.08, 51609, 3.00, 1.0, 1.10, 1.18, 0.6, 0.5, 0.95, ''),
    (3.08, 3.56, 100088, 2.00, 1.0, 1.02, 1.10, 0.5, 0.5, 0.80, 'tablet'),
    (3.56, 3.68, 785, 2.40, 1.0, 1.25, 1.28, 0.62, 0.45, 0.80, ''),
    (3.68, 4.00, 4827, 2.60, 1.0, 1.05, 1.10, 0.5, 0.5, 0.75, ''),
    (4.00, 4.40, 21065, 1.20, 1.0, 2.30, 2.45, 0.53, 0.40, 1.00, ''),
    (4.40, 4.72, 772, 3.50, 1.0, 1.05, 1.10, 0.5, 0.5, 0.80, ''),
    (4.72, 4.92, 776, 9.00, 1.0, 1.15, 1.18, 0.5, 0.55, 0.75, ''),
    (4.92, 5.16, 3572, 0.90, 1.0, 1.05, 1.10, 0.45, 0.5, 0.85, ''),
    (5.16, 5.64, 3572, 2.55, 1.0, 1.15, 1.22, 0.45, 0.4, 0.85, ''),
    (5.64, 6.04, 4043, 5.40, 1.0, 1.05, 1.10, 0.5, 0.5, 0.85, ''),
    (6.04, 6.20, 48529, 5.40, 1.0, 1.15, 1.18, 0.55, 0.5, 1.00, ''),
    (6.20, 6.64, 88007, 30.0, 1.0, 1.10, 1.16, 0.5, 0.45, 0.85, ''),
    (6.64, 7.00, 48529, 11.0, 1.0, 1.30, 1.40, 0.62, 0.5, 1.00, ''),
    (7.00, 7.25, 46351, 2.30, 1.0, 1.20, 1.26, 0.6, 0.5, 1.20, ''),
    (7.25, 7.50, 48010, 3.60, 1.0, 1.10, 1.16, 0.5, 0.5, 1.00, ''),
    (7.50, 7.70, 21516, 2.20, 1.0, 1.15, 1.25, 0.55, 0.5, 1.00, 'start'),
]
END0, END1 = 7.70, 9.70

def main():
    TOT = int(round(END1 * FPS))
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
    smask = sil_mask(); pat = xray_pattern(smask)
    written = 0
    only = os.environ.get('ONLY')
    for (t0, t1, cid, st, sp, z0, z1, cx, cy, ex, spec) in EDL:
        a, b = int(round(t0 * FPS)), int(round(t1 * FPS)); n = b - a
        if cid in ('SIL', 'XRAY'):
            fr = [None] * n
        else:
            fr = frames(cid, st, n, sp)
        for k in range(n):
            u = k / max(1, n - 1); t = (a + k) / FPS
            if cid == 'SIL': f = sil_frame(smask, pat, t, 0)
            elif cid == 'XRAY': f = sil_frame(smask, pat, t, (k + 1) / n)
            else:
                f = fr[k]
                if spec == 'laptop': f = laptop_shot(f, 'laptop.jpg')
                elif spec == 'tablet': f = screen_shot(f, 'tablet.jpg')
                elif spec == 'phone': f = screen_shot(f, 'phone.jpg')
            f = zoom(f, z0 + (z1 - z0) * u, cx, cy)
            if cid not in ('SIL', 'XRAY'):
                f = grade(f, ex)
            else:
                f = np.clip(f * VIG + rng.normal(0, 0.012, (H, W, 1)).astype(np.float32), 0, 1)
            if spec == 'bar': f = bar(f, t)
            if spec == 'flicker' and k in (2, 4): f = np.clip(f * 1.9 + 0.08, 0, 1)
            if spec == 'start' and k == n - 1: f = np.clip(f * 1.6 + 0.35, 0, 1)
            enc.stdin.write((f * 255 + 0.5).astype(np.uint8).tobytes()); written += 1
        print('seg', t0, cid, flush=True)
    # end card frames rendered by Playwright (PNG sequence)
    nend = TOT - written
    for k in range(nend):
        p = f'{ENDDIR}/e{k:03d}.png'
        im = cv2.imread(p)
        if im is None: im = np.zeros((H, W, 3), np.uint8)
        f = im.astype(np.float32) / 255
        f = np.clip(f + rng.normal(0, 0.008, (H, W, 1)).astype(np.float32), 0, 1)
        enc.stdin.write((f * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait(); print('done', TOT)

if __name__ == '__main__':
    main()

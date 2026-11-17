"""Builds the phone (social profile grid) and tablet (brand board) screen images.
python3 -I make_screens.py <assets_dir> <font_bold.ttf> <font_regular.ttf>"""
import sys
from PIL import Image, ImageDraw, ImageFont
A, FB, FR = sys.argv[1:4]
NAVY = (20, 54, 89); MINT = (146, 197, 180); INK = (14, 21, 32)

def cover(im, w, h):
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s + 1), int(im.height * s + 1)), Image.LANCZOS)
    x = (im.width - w) // 2; y = int((im.height - h) * 0.2); return im.crop((x, y, x + w, y + h))

# ---- phone: social profile managed by Planet ----
W, H = 585, 1266
p = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(p)
fb = lambda s: ImageFont.truetype(FB, s); fr = lambda s: ImageFont.truetype(FR, s)
d.text((24, 40), '9:41', font=fb(24), fill=INK)
d.text((24, 96), 'theplanetco', font=fb(34), fill=INK)
d.ellipse((232, 104, 256, 128), fill=(56, 151, 240)); d.line([(238, 116), (243, 122), (251, 110)], fill='white', width=3)
# avatar
d.ellipse((24, 160, 164, 300), fill=NAVY); d.ellipse((30, 166, 158, 294), outline=MINT, width=6)
d.text((70, 186), 'P', font=fb(84), fill=MINT)
for i, (n, l) in enumerate([('248', 'posts'), ('36.4K', 'followers'), ('312', 'following')]):
    x = 210 + i * 125
    d.text((x, 190), n, font=fb(30), fill=INK); d.text((x, 230), l, font=fr(20), fill=(90, 98, 110))
d.text((24, 320), 'Planet | Full-service marketing agency', font=fb(21), fill=INK)
d.text((24, 352), 'Marketing · Social · Branding · Web · Apps', font=fr(20), fill=(70, 80, 95))
d.text((24, 384), 'theplanetco.com', font=fb(20), fill=(0, 55, 107))
d.rounded_rectangle((24, 428, 290, 476), 10, fill=(56, 151, 240)); d.text((120, 438), 'Follow', font=fb(22), fill='white')
d.rounded_rectangle((300, 428, 561, 476), 10, fill=(239, 239, 239)); d.text((380, 438), 'Message', font=fb(22), fill=INK)
d.line((0, 500, W, 500), fill=(230, 230, 230), width=2)
tiles = ['01', '03', '05', '07', '09', '11', '13', '15', '17', '19', '21', '23']
tw = (W - 4) // 3; th = int(tw * 1.33)
for k, t in enumerate(tiles):
    im = Image.open(f'{A}/work/s{t}.jpg').convert('RGB')
    x = (k % 3) * (tw + 2); y = 504 + (k // 3) * (th + 2)
    if y > H: break
    p.paste(cover(im, tw, th), (x, y))
p.save(f'{A}/screens/phone.jpg', quality=92)

# ---- tablet: brand identity board ----
W, H = 1440, 960
b = Image.new('RGB', (W, H), (246, 244, 239)); d = ImageDraw.Draw(b)
icon = Image.open(f'{A}/work/brand-icon.jpg').convert('RGB').resize((560, 560), Image.LANCZOS)
b.paste(icon, (60, 60))
d.text((60, 650), 'BRAND IDENTITY', font=fb(30), fill=INK)
d.text((60, 696), 'Logo · Colors · Typography · Guidelines', font=fr(26), fill=(90, 98, 110))
sw = [((52, 44, 230), '#342CE6'), ((214, 245, 66), '#D6F542'), ((14, 21, 32), '#0E1520'), ((255, 255, 255), '#FFFFFF')]
for i, (c, h) in enumerate(sw):
    x = 680 + i * 180
    d.rounded_rectangle((x, 60, x + 160, 300), 18, fill=c, outline=(220, 220, 220), width=2)
    d.text((x + 10, 312), h, font=fb(24), fill=INK)
d.text((680, 380), 'Aa', font=fb(170), fill=INK)
d.text((930, 420), 'Display Bold', font=fb(36), fill=INK)
d.text((930, 470), 'Body Regular 0123456789', font=fr(28), fill=(90, 98, 110))
# mockups row: business card + phone tile
d.rounded_rectangle((680, 640, 1060, 860), 20, fill=(52, 44, 230))
sm = icon.resize((140, 140)); b.paste(sm, (720, 680))
d.text((880, 715), 'Store', font=fb(40), fill='white')
d.rounded_rectangle((1090, 640, 1380, 860), 20, fill=(214, 245, 66))
d.text((1120, 720), 'Guidelines', font=fb(34), fill=INK)
b.save(f'{A}/screens/tablet.jpg', quality=92)
print('ok')

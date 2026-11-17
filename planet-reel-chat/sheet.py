from PIL import Image
import sys
out=sys.argv[1]; fs=sys.argv[2:]
ims=[Image.open(f).resize((480,270)) for f in fs]
cols=3
W=Image.new('RGB',(480*cols,270*((len(ims)+cols-1)//cols)))
for i,im in enumerate(ims): W.paste(im,((i%cols)*480,(i//cols)*270))
W.save(out,quality=78)

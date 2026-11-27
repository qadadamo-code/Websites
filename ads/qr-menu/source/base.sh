set -e
# segments: clip offset start end
S="c1 0 0 1.94
c2 0.3 1.94 5.6
c1 2.8 5.6 7.3
c3 0.5 7.3 9.1
c4 0.6 9.1 11.2
X 0 11.2 14.9
c5 0 14.9 18.4
c6 1.0 18.4 20.9
X 0 20.9 33.5
c7 0.5 33.5 35.0
X 0 35.0 38.1
c8 1.5 38.1 40.5
X 0 40.5 46.0"
inputs=""; filt=""; n=0; i=0
while read c off a b; do d=$(python3 -c "print(round($b-$a,4))")
 if [ "$c" = X ]; then filt="$filt color=c=0x0a1d33:s=1080x1920:r=30:d=$d,format=yuv420p,setsar=1[v$n];"
 else inputs="$inputs -i $c.mp4"; filt="$filt [$i:v]trim=start=$off:duration=$d,setpts=PTS-STARTPTS,fps=30,scale=1080:1920,setsar=1,format=yuv420p,zoompan=z='1+0.0006*on':d=1:s=1080x1920:fps=30[v$n];"; i=$((i+1)); fi
 n=$((n+1)); done <<< "$S"
cat=""; for k in $(seq 0 $((n-1))); do cat="$cat[v$k]"; done
ffmpeg -loglevel error -y $inputs -filter_complex "$filt ${cat}concat=n=$n:v=1:a=0[out]" -map "[out]" -c:v libx264 -crf 16 -preset fast -r 30 base.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 base.mp4

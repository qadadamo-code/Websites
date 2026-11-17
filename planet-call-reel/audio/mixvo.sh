#!/bin/bash
# run in a dir containing vo/{r1,o1,r2,o2,r3,o3}.mp3, reel-silent.mp4, bed-music.flac, bed-sfx.flac
set -e
S=1.1
declare -A AT=( [r1]=2.2 [o1]=6.85 [r2]=12.6 [o2]=17.9 [r3]=20.25 [o3]=30.85 )
inputs=""; fc=""; i=0; labels=""
for k in r1 o1 r2 o2 r3 o3; do
  inputs="$inputs -i vo/$k.mp3"
  ms=$(python3 -c "print(int(${AT[$k]}*1000))")
  if [[ $k == r* ]]; then eq="highpass=f=280,lowpass=f=3800,equalizer=f=1800:t=q:w=1.2:g=3,acompressor=threshold=0.1:ratio=3,volume=1.15"; else eq="highpass=f=80,acompressor=threshold=0.12:ratio=2.5,volume=1.1"; fi
  fc="$fc[$i:a]aresample=44100,atempo=$S,$eq,aformat=channel_layouts=stereo,adelay=${ms}|${ms},apad=whole_dur=39[v$i];"
  labels="$labels[v$i]"; i=$((i+1))
done
fc="$fc${labels}amix=inputs=6:normalize=0,asplit=2[vo][vosc];"
fc="$fc[6:a][vosc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[mduck];"
fc="$fc[mduck]volume=0.55[m];[7:a]volume=0.8[s];[vo][m][s]amix=inputs=3:normalize=0,alimiter=limit=0.9,atrim=0:39[out]"
ffmpeg -v error -y $inputs -i bed-music.flac -i bed-sfx.flac -filter_complex "$fc" -map "[out]" -c:a pcm_s16le mix.wav
ffmpeg -v error -y -i reel-silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart planet-call-reel.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 planet-call-reel.mp4

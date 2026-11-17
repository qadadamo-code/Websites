# Planet focus reel (10.6s, 1920x1080)
Copies the edit of IG reel DedyVJxoi18 (rapid macro "focus" montage) with Planet Creative Marketing content.
1. python3 -I bg.py <mixkit_clips_dir> <bg_dir>  (graded Mixkit free-licence stock, ids in bg.py)
2. ln -s <bg_dir> bg && node render.js <frames_dir> 0 10.6 30  (overlays, dial, campaign board, end card)
3. python3 -I audio/mix.py <sfx-kit_dir> mix.wav  (wyzowl/sfx-kit CC0 + numpy bed), then mux with ffmpeg.

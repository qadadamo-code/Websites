#!/bin/sh
# Builds the preview (in place, noindex) and the production copy dist/gmsakerhet-com (gmsakerhet.com).
set -e
cd "$(dirname "$0")/.."
python3 src/build.py
OUT=../../dist/gmsakerhet-com
rm -rf "$OUT"; mkdir -p "$OUT"
GMS_OUT="$(cd "$OUT" && pwd)" GMS_PREFIX=/ python3 src/build.py
cp -r assets contact.php "$OUT"/
rm -f "$OUT"/assets/photos/_fetch.php
cp src/htaccess.prod "$OUT"/.htaccess
# preview copies on web.theplanetco.com
for d in ../../dist/gmsakerhet ../../site/public/gmsakerhet; do
  mkdir -p "$d"; tar --exclude=./src -cf - . | (cd "$d" && tar -xf -)
done
echo ok

#!/usr/bin/env bash
# Builds the React front end and assembles the deployable site/ folder (static + PHP).
# storage/ and uploads/ are created by PHP on the server and are never shipped.
set -euo pipefail
cd "$(dirname "$0")"
(cd app && npx vite build)
rm -rf site && cp -r build-web site
cp -r php/api php/admin php/inc php/data site/
cp php/.htaccess site/.htaccess
rm -rf site/storage site/uploads
echo "site/ ready"

#!/usr/bin/env bash
#
# Cloudflare Pages build script for the Double Paws Flutter web app.
#
# Cloudflare's build image does not ship the Flutter SDK, so we install it
# here, then build the web bundle. Point the Pages project at this script:
#
#   Build command:      bash scripts/cf-pages-build.sh
#   Build output dir:   flutter_mobile/build/web
#   Root directory:     (leave as the repo root)
#
# The backend URL is baked in at build time via --dart-define. Override it by
# setting an API_BASE_URL environment variable in the Pages project settings.
# Pin a Flutter version with FLUTTER_REF (defaults to the stable channel).

set -euo pipefail

FLUTTER_REF="${FLUTTER_REF:-stable}"
FLUTTER_HOME="${FLUTTER_HOME:-$HOME/flutter}"
API_BASE_URL="${API_BASE_URL:-https://pet-doublepaws-production.up.railway.app/api}"

if [ ! -x "$FLUTTER_HOME/bin/flutter" ]; then
  echo "==> Installing Flutter SDK ($FLUTTER_REF)..."
  git clone --depth 1 -b "$FLUTTER_REF" https://github.com/flutter/flutter.git "$FLUTTER_HOME"
fi

export PATH="$FLUTTER_HOME/bin:$PATH"

echo "==> Flutter version"
flutter --version
flutter config --no-analytics >/dev/null 2>&1 || true
flutter config --enable-web >/dev/null 2>&1 || true

cd "$(dirname "$0")/../flutter_mobile"

echo "==> Fetching packages"
flutter pub get

echo "==> Building web (API_BASE_URL=$API_BASE_URL)"
flutter build web --release --dart-define=API_BASE_URL="$API_BASE_URL"

echo "==> Done. Output: flutter_mobile/build/web"

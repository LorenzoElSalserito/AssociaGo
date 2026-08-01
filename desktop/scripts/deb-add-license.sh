#!/bin/bash
# Repack a .deb adding the license under /usr/share/doc/<pkg>/copyright.
# Must run under fakeroot so extracted/added files keep root:root ownership.
set -euo pipefail

DEB="$1"
LICENSE_SRC="$2"
PKG="associago-desktop"
DOC_REL="usr/share/doc/${PKG}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

dpkg-deb -R "$DEB" "$WORK"

install -d -m 0755 "$WORK/${DOC_REL}"
install -m 0644 "$LICENSE_SRC" "$WORK/${DOC_REL}/LICENSE"

# Keep md5sums consistent (dpkg -V / integrity checks).
MD5_FILE="$WORK/DEBIAN/md5sums"
if [ -f "$MD5_FILE" ]; then
  grep -vF "${DOC_REL}/LICENSE" "$MD5_FILE" > "${MD5_FILE}.tmp" || true
  mv "${MD5_FILE}.tmp" "$MD5_FILE"
  ( cd "$WORK" && md5sum "${DOC_REL}/LICENSE" >> "DEBIAN/md5sums" )
fi

dpkg-deb -b "$WORK" "$DEB" >/dev/null
echo "[deb-add-license] done: $DEB"

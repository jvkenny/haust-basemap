#!/bin/zsh
# Sync the basemap server's files to the host that serves them, then restart it there.
# Settings come from .deploy.env (not in git):
#   BASEMAP_HOST=<ssh alias>            where to deploy
#   BASEMAP_RESTART='<remote command>'  how to restart the server on that host
# Tiles are not synced; put <area>.pmtiles in the server's TILES_DIR yourself.
set -e
cd "$(dirname "$0")"
[ -f .deploy.env ] && source ./.deploy.env
: ${BASEMAP_HOST:?set BASEMAP_HOST in .deploy.env}
node styles/build.mjs
ssh -n $BASEMAP_HOST 'mkdir -p ~/basemap ~/basemap-data/tiles'
rsync -az --delete web styles fonts sprites examples README.md AGENTS.md LICENSE $BASEMAP_HOST:basemap/
[ -n "$BASEMAP_RESTART" ] && ssh -n $BASEMAP_HOST "$BASEMAP_RESTART"

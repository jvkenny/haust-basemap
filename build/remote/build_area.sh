#!/bin/bash
# Runs on a Linux build host with Java 21+ and ~20 GB of RAM to spare. Builds ~/basemap/<area>.pmtiles with Planetiler.
#   ~/basemap/build_area.sh north-america      (any Geofabrik area name Planetiler knows)
# Start it inside tmux: tmux new -d -s basemap '~/basemap/build_area.sh north-america'
# Progress: tail -c 300 ~/basemap/<area>.log    Done marker: ~/basemap/<area>.done
set -e
AREA=${1:?area}
cd ~/basemap
rm -f "$AREA.done" "$AREA.failed"
[ -f planetiler.jar ] || curl -fsL -o planetiler.jar \
  https://github.com/onthegomap/planetiler/releases/latest/download/planetiler.jar
if java -Xmx20g -jar planetiler.jar --area="$AREA" --download \
     --download-dir=data/sources --tmpdir=data/tmp \
     --storage=mmap --nodemap-type=sparsearray \
     --output="$AREA.pmtiles" --languages=en --maxzoom=14 --force > "$AREA.log" 2>&1; then
  ls -l "$AREA.pmtiles" > "$AREA.done"; date >> "$AREA.done"
else
  date > "$AREA.failed"
fi

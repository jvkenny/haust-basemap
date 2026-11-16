#!/bin/bash
# Build a tileset with Windows-native Java from inside WSL, on a Windows drive.
# Use this when the WSL virtual disk sits on a full system drive: nothing here touches it.
#   WORK=/mnt/g/basemap ./build_area_windows.sh north-america
# Start it inside tmux. Progress: tail -c 300 $WORK/<area>.log   Done marker: $WORK/<area>.done
AREA=${1:?area}
WORK=${WORK:-/mnt/g/basemap}
JAVA=${JAVA_EXE:-/mnt/c/Program Files/Common Files/Oracle/Java/javapath/java.exe}
cd "$WORK" || exit 1
rm -f "$AREA.done" "$AREA.failed"
[ -f planetiler.jar ] || curl -fsL -o planetiler.jar \
  https://github.com/onthegomap/planetiler/releases/latest/download/planetiler.jar
if "$JAVA" -Xmx24g -jar planetiler.jar --area="$AREA" --download \
     --download-dir=data/sources --tmpdir=data/tmp \
     --storage=mmap --nodemap-type=sparsearray \
     --output="$AREA.pmtiles" --languages=en --maxzoom=14 --force > "$AREA.log" 2>&1; then
  ls -l "$AREA.pmtiles" > "$AREA.done"; date >> "$AREA.done"
else
  date > "$AREA.failed"
fi

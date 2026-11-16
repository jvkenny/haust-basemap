#!/bin/zsh
# Build a Haust basemap tileset (OpenMapTiles schema) with Planetiler.
#
#   build/build_tiles.sh check <area>     show what the build needs vs what this machine has
#   build/build_tiles.sh <area>           build tiles/<area>.pmtiles
#
# Areas: chicagoland | illinois | us | north-america
#
# Environment:
#   BASEMAP_WORK     where downloads and Planetiler temp files go (default: ./data).
#                    Must be a real local or external disk, never a cloud-synced folder:
#                    Planetiler memory-maps its temp files.
#   BASEMAP_STATES   folder holding illinois/indiana/wisconsin .osm.pbf for the chicagoland pilot
#                    (Geofabrik state extracts; default ../timeline-map/.osrm).
#   BASEMAP_ARCHIVE  if set, the finished .pmtiles is copied there (e.g. Google Drive).
set -e
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"

CMD=build; [ "$1" = check ] && { CMD=check; shift; }
AREA=${1:?usage: build_tiles.sh [check] <chicagoland|illinois|us|north-america>}
WORK=${BASEMAP_WORK:-$PWD/data}
GEOFABRIK=https://download.geofabrik.de
STATES=${BASEMAP_STATES:-../timeline-map/.osrm}

# NEED_GB = rough free disk needed in $WORK (download + node map + features + output).
# These are planning estimates, not measurements; `check` compares them to what is free.
case $AREA in
  chicagoland)   SRC=local;                              BBOX=-88.95,41.15,-86.90,42.75; NEED_GB=4;   XMX=6g ;;
  illinois)      SRC=north-america/us/illinois;          BBOX=;                          NEED_GB=8;   XMX=8g ;;
  us)            SRC=north-america/us;                   BBOX=;                          NEED_GB=90;  XMX=16g ;;
  north-america) SRC=north-america;                      BBOX=;                          NEED_GB=140; XMX=16g ;;
  *) echo "unknown area: $AREA"; exit 1 ;;
esac

FREE_GB=$(df -g "$WORK" 2>/dev/null | awk 'NR==2{print $4}')
RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
echo "area=$AREA  work=$WORK  free=${FREE_GB}GB  need~${NEED_GB}GB  ram=${RAM_GB}GB  heap=$XMX"
if [ "${FREE_GB:-0}" -lt "$NEED_GB" ]; then
  echo "NOT ENOUGH DISK: $WORK has ${FREE_GB}GB free, this build needs about ${NEED_GB}GB."
  echo "Point BASEMAP_WORK at a disk with room (an external SSD works well)."
  [ $CMD = build ] && exit 1
fi
case "$WORK" in *CloudStorage*|*"Google Drive"*|*OneDrive*|*Dropbox*)
  echo "BASEMAP_WORK is a cloud-synced folder; use a local or external disk."; exit 1 ;; esac
[ $CMD = check ] && exit 0

mkdir -p "$WORK/sources" "$WORK/tmp" tiles
[ -f build/planetiler.jar ] || curl -fL -o build/planetiler.jar \
  https://github.com/onthegomap/planetiler/releases/latest/download/planetiler.jar

if [ $SRC = local ]; then
  # Chicagoland pilot: clip the three state extracts already on this Mac and merge them.
  OSM="$WORK/chicagoland.osm.pbf"
  for s in illinois indiana wisconsin; do
    osmium extract -b $BBOX --strategy smart -O -o "$WORK/$s-clip.osm.pbf" "$STATES/$s.osm.pbf"
  done
  osmium merge -O -o "$OSM" "$WORK"/*-clip.osm.pbf && rm "$WORK"/*-clip.osm.pbf
else
  OSM="$WORK/sources/${SRC##*/}-latest.osm.pbf"
  # -C - resumes a partial download; Geofabrik extracts are updated daily.
  [ -f "$OSM.done" ] || { curl -fL -C - -o "$OSM" "$GEOFABRIK/$SRC-latest.osm.pbf" && touch "$OSM.done"; }
fi

# Large builds keep the node map and feature store on disk instead of in the heap.
BIG=(); [ $NEED_GB -ge 50 ] && BIG=(--storage=mmap --nodemap-type=sparsearray)
java -Xmx$XMX -jar build/planetiler.jar \
  --osm-path="$OSM" ${BBOX:+--bounds=$BBOX} \
  --download --download-dir="$WORK/sources" --tmpdir="$WORK/tmp" \
  --output="$WORK/$AREA.pmtiles" --languages=en --maxzoom=14 --force $BIG \
  2>&1 | tee "build/planetiler-$AREA.log"

mv "$WORK/$AREA.pmtiles" "tiles/$AREA.pmtiles" 2>/dev/null || true
ls -lh "tiles/$AREA.pmtiles"
if [ -n "$BASEMAP_ARCHIVE" ]; then
  mkdir -p "$BASEMAP_ARCHIVE" && cp "tiles/$AREA.pmtiles" "$BASEMAP_ARCHIVE/" && echo "archived to $BASEMAP_ARCHIVE"
fi

#!/bin/sh
# plex claim fix: LSIO skips claim if an (empty) PlexOnlineToken attr exists.
# Runs as ShadowAero on .188. Only the docker-run step can touch /config (uid 999).
CLAIM="$1"
if [ -z "$CLAIM" ]; then
  echo "usage: plexclaimfix.sh claim-XXXX"
  exit 1
fi

# 1. stop+remove plex container so prefs file stops being rewritten
docker rm -f PlexHW >/dev/null 2>&1

# 2. edit Preferences.xml inside a throwaway container (runs as root, image already local)
docker run --rm --entrypoint sh -v /volume1/docker/plexhw:/config lscr.io/linuxserver/plex:latest -c "
P='/config/Library/Application Support/Plex Media Server/Preferences.xml'
cp \"\$P\" \"\$P.bak-clfix\"
echo BEFORE:
grep -o 'PlexOnlineToken=.[^> ]*' \"\$P\" | tail -1
sed -i 's/ PlexOnlineToken=\"\"//' \"\$P\"
echo AFTERCOUNT:
grep -c 'PlexOnlineToken' \"\$P\" || true
"

# 3. inject claim env into compose (idempotent) and boot
sed -i "/- PLEX_CLAIM=/d" /volume1/docker/plexhw/docker-compose.yml
sed -i "s|- VERSION=docker|- VERSION=docker\n      - PLEX_CLAIM=$CLAIM|" /volume1/docker/plexhw/docker-compose.yml
grep -n "PLEX_CLAIM" /volume1/docker/plexhw/docker-compose.yml
docker compose -f /volume1/docker/plexhw/docker-compose.yml up -d 2>&1 | tail -n 3

# 4. wait for boot + claim handshake, then show init log
sleep 30
docker logs --since 45s PlexHW 2>&1 | grep -iE "claim|start|done|error" | tail -n 8
docker exec nginx-proxy-manager curl -s -m 8 http://192.168.76.188:32400/identity | grep -o 'claimed=.'
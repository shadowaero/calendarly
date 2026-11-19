#!/bin/bash
# RECON runner for project 'navidrome' (from DXP inspect 2026-10-11)
docker network inspect 'navidrome_default' >/dev/null 2>&1 || docker network create 'navidrome_default'
docker run -d --name 'Navidrome' --restart 'always' --network-alias 'navidrome' --env 'ND_MUSICFOLDER=/music' --env 'ND_DATAFOLDER=/data' --env 'ND_CONFIGFILE=/data/navidrome.toml' --env 'ND_PORT=4533' --env 'PUID=999' --env 'PGID=10' --env 'ND_ENABLEINSIGHTSCOLLECTOR=false' --env 'ND_ENABLEDOWNLOADS=false' --env 'ND_ENABLEWEBPENCODING=true' --publish '4533:4533/tcp' --volume '/volume1/docker/navidrome:/data' --volume '/volume1/Einstein/Music:/music' --network 'navidrome_default' --entrypoint '/app/navidrome' docker.io/deluan/navidrome:latest
docker network connect 'navidrome_default' 'Navidrome' 2>/dev/null || true
echo RUNNER-DONE-navidrome

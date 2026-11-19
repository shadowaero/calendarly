#!/bin/bash
# RECON runner for project 'pairdrop' (from DXP inspect 2026-10-11)
docker network inspect 'pairdrop_default' >/dev/null 2>&1 || docker network create 'pairdrop_default'
docker run -d --name 'pairdrop' --restart 'always' --network-alias 'pairdrop' --env 'PS1=$(whoami)@$(hostname):$(pwd)\$ ' --env 'S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0' --env 'S6_VERBOSITY=1' --env 'S6_STAGE2_HOOK=/docker-mods' --env 'VIRTUAL_ENV=/lsiopy' --env 'LSIO_FIRST_PARTY=true' --env 'NODE_ENV=production' --env 'PUID=999' --env 'PGID=10' --env 'WS_FALLBACK=false' --env 'RATE_LIMIT=true' --env 'RTC_CONFIG=false' --env 'DEBUG_MODE=false' --env 'TZ=America/New_York' --publish '3005:3000/tcp' --network 'pairdrop_default' --entrypoint '/init' lscr.io/linuxserver/pairdrop:latest
docker network connect 'pairdrop_default' 'pairdrop' 2>/dev/null || true
echo RUNNER-DONE-pairdrop

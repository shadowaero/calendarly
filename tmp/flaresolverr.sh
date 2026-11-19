#!/bin/bash
# RECON runner for project 'flaresolverr' (from DXP inspect 2026-10-11)
docker network inspect 'media_net' >/dev/null 2>&1 || docker network create 'media_net'
docker volume inspect '11c68f486839baab1d344fb0eee7afd7ae2f6c40a066ea8db2e6bf059e0dfbf3' >/dev/null 2>&1 || docker volume create '11c68f486839baab1d344fb0eee7afd7ae2f6c40a066ea8db2e6bf059e0dfbf3'  # DATA: migrate separately
docker run -d --name 'flaresolverr' --restart 'always' --network-alias 'flaresolverr' --user 'flaresolverr' --env 'LANG=C.UTF-8' --env 'GPG_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D' --env 'PYTHON_VERSION=3.11.16' --env 'PYTHON_SHA256=91bcdebfdde239a003ae93738a7fce0f9230fee5c4bc2b86f6e6e8c6f98aabe8' --env 'PGID=10' --env 'TZ=America/New_York' --env 'GUID=999' --publish '8191:8191/tcp' --volume '11c68f486839baab1d344fb0eee7afd7ae2f6c40a066ea8db2e6bf059e0dfbf3:/config' --network 'media_net' --entrypoint '/usr/bin/dumb-init --' '/usr/local/bin/python' '-u' '/app/flaresolverr.py'
docker network connect 'media_net' 'flaresolverr' 2>/dev/null || true
echo RUNNER-DONE-flaresolverr
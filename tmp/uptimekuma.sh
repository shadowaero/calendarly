#!/bin/bash
# RECON runner for project 'uptimekuma' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'uptime-kuma-dev' --restart 'always' --network-alias 'uptime-kuma' --env 'NODE_VERSION=18.20.3' --env 'YARN_VERSION=1.22.19' --env 'UPTIME_KUMA_IS_CONTAINER=1' --env 'TZ=America/New_York' --publish '3003:3001/tcp' --publish '3307:3306/tcp' --volume '/volume1/docker/uptimekuma/config/data:/app/data' --volume '/var/run/docker.sock:/var/run/docker.sock' --network 'bridge' --entrypoint '/usr/bin/dumb-init -- extra/entrypoint.sh' 'node' 'server/server.js'
docker network connect 'bridge' 'uptime-kuma-dev' 2>/dev/null || true
echo RUNNER-DONE-uptimekuma
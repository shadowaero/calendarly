#!/bin/bash
# RECON runner for project 'owncast' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'owncast-owncast-1' --restart 'always' --network-alias 'owncast' --env 'GUID=999' --env 'PGID=10' --env 'TZ=America/New_York' --publish '1935:1935/tcp' --publish '8083:8080/tcp' --volume '/volume1/docker/owncast/data:/app/data' --network 'bridge' --entrypoint '/app/owncast' owncast/owncast:latest
docker network connect 'bridge' 'owncast-owncast-1' 2>/dev/null || true
echo RUNNER-DONE-owncast

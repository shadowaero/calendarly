#!/bin/bash
# RECON runner for project 'dockge' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'dockge-dockge-1' --restart 'always' --network-alias 'dockge' --env 'DOCKGE_STACKS_DIR=/volume1/docker/dockge/stacks' --env 'NODE_VERSION=22.14.0' --env 'YARN_VERSION=1.22.22' --env 'UV_USE_IO_URING=0' --publish '5001:5001/tcp' --volume '/volume1/docker/dockge/data:/app/data' --volume '/var/run/docker.sock:/var/run/docker.sock' --volume '/volume1/docker/dockge/stacks:/volume1/docker/dockge/stacks' --network 'bridge' --entrypoint '/usr/bin/dumb-init --' 'tsx' './backend/index.ts'
docker network connect 'bridge' 'dockge-dockge-1' 2>/dev/null || true
echo RUNNER-DONE-dockge
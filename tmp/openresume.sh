#!/bin/bash
# RECON runner for project 'openresume' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'OpenResume' --restart 'always' --network-alias 'openresume' --env 'NODE_VERSION=18.17.1' --env 'YARN_VERSION=1.22.19' --publish '6155:3000/tcp' --network 'bridge' --entrypoint 'docker-entrypoint.sh' 'node' 'server.js'
docker network connect 'bridge' 'OpenResume' 2>/dev/null || true
echo RUNNER-DONE-openresume
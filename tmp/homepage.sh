#!/bin/bash
# RECON runner for project 'homepage' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'homepage' --restart 'always' --network-alias 'homepage' --user 'root' --env 'NODE_VERSION=22.22.2' --env 'YARN_VERSION=1.22.22' --env 'NODE_ENV=production' --env 'PORT=3000' --env 'PGID=10' --env 'HOMEPAGE_ALLOWED_HOSTS=192.168.76.168:3000,homepage.examininglife.com' --env 'PUID=999' --publish '3000:3000/tcp' --volume '/volume1/docker/homepage/config:/app/config' --volume '/var/run/docker.sock:/var/run/docker.sock:ro' --network 'bridge' --entrypoint 'docker-entrypoint.sh' 'node' 'server.js'
docker network connect 'bridge' 'homepage' 2>/dev/null || true
docker run -d --name 'homepage2' --restart 'always' --network-alias 'homepage2' --user 'root' --env 'NODE_VERSION=22.22.2' --env 'YARN_VERSION=1.22.22' --env 'NODE_ENV=production' --env 'PORT=3000' --env 'PGID=10' --env 'HOMEPAGE_ALLOWED_HOSTS=192.168.76.168:3010,homepage2.examininglife.com' --env 'PUID=999' --publish '3010:3000/tcp' --volume '/var/run/docker.sock:/var/run/docker.sock:ro' --volume '/volume1/docker/homepage2/config2:/app/config' --network 'bridge' --entrypoint 'docker-entrypoint.sh' 'node' 'server.js'
docker network connect 'bridge' 'homepage2' 2>/dev/null || true
echo RUNNER-DONE-homepage
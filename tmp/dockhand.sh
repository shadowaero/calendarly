#!/bin/bash
# RECON runner for project 'dockhand' (from DXP inspect 2026-10-11)
docker network inspect 'nginx_default' >/dev/null 2>&1 || docker network create 'nginx_default'
docker run -d --name 'dockhand' --restart 'always' --network-alias 'dockhand' --user '999:10' --env 'PUID=999' --env 'PGID=10' --env 'TZ=America/New_York' --env 'DATA_DIR=/volume1/docker/dockhand' --env 'SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt' --env 'NODE_ENV=production' --env 'PORT=3000' --env 'HOST=0.0.0.0' --publish '3011:3000/tcp' --volume '/var/run/docker.sock:/var/run/docker.sock' --volume '/volume1/docker:/volume1/docker' --volume '/volume1/docker/dockhand:/volume1/docker/dockhand' --network 'nginx_default' --entrypoint '/sbin/tini -- /usr/local/bin/docker-entrypoint.sh' fnsys/dockhand:latest
docker network connect 'nginx_default' 'dockhand' 2>/dev/null || true
echo RUNNER-DONE-dockhand

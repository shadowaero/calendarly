#!/bin/bash
# RECON runner for project 'bentopdf' (from DXP inspect 2026-10-11)
docker network inspect 'nginx_default' >/dev/null 2>&1 || docker network create 'nginx_default'
docker run -d --name 'bentopdf' --restart 'always' --network-alias 'bentopdf' --user '101' --env 'PUID=999' --env 'PGID=10' --env 'TZ=America/New_York' --env 'NGINX_VERSION=1.28.0' --env 'PKG_RELEASE=1' --env 'DYNPKG_RELEASE=1' --publish '8087:8080/tcp' --volume '/volume1/docker/bentopdf/config:/app/config' --volume '/volume1/docker/bentopdf/data:/app/data' --network 'nginx_default' --entrypoint '/docker-entrypoint.sh' 'nginx' '-g' 'daemon off;'
docker network connect 'nginx_default' 'bentopdf' 2>/dev/null || true
echo RUNNER-DONE-bentopdf
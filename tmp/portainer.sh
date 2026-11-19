#!/bin/bash
# RECON runner for project 'portainer' (from DXP inspect 2026-10-11)
docker network inspect 'portainer_default' >/dev/null 2>&1 || docker network create 'portainer_default'
docker run -d --name 'portainer' --restart 'unless-stopped' --network-alias 'portainer' --publish '8000:8000/tcp' --publish '9010:9000/tcp' --volume '/volume1/docker/portainer/data:/data' --volume '/var/run/docker.sock:/var/run/docker.sock' --network 'portainer_default' --entrypoint '/portainer' portainer/portainer-ce:latest
docker network connect 'portainer_default' 'portainer' 2>/dev/null || true
echo RUNNER-DONE-portainer

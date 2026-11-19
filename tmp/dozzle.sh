#!/bin/bash
# RECON runner for project 'dozzle' (from DXP inspect 2026-10-11)
docker network inspect 'bridge' >/dev/null 2>&1 || docker network create 'bridge'
docker run -d --name 'dozzle' --restart 'always' --network-alias 'dozzle' --publish '8100:8080/tcp' --volume '/var/run/docker.sock:/var/run/docker.sock' --network 'bridge' --entrypoint '/dozzle' amir20/dozzle:latest
docker network connect 'bridge' 'dozzle' 2>/dev/null || true
echo RUNNER-DONE-dozzle

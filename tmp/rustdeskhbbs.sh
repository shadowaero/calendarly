#!/bin/bash
# RECON runner for project 'rustdeskhbbs' (from DXP inspect 2026-10-11)
docker network inspect 'rustdeskhbbs_rustdesk-net' >/dev/null 2>&1 || docker network create 'rustdeskhbbs_rustdesk-net'
docker run -d --name 'Rustdesk-HBBR' --restart 'always' --network-alias 'hbbr' --publish '21117:21117/tcp' --publish '21119:21119/tcp' --volume '/volume1/docker/rustdeskhbbr:/root' --network 'rustdeskhbbs_rustdesk-net' 'hbbr'
docker network connect 'rustdeskhbbs_rustdesk-net' 'Rustdesk-HBBR' 2>/dev/null || true
docker run -d --name 'Rustdesk-HBBS' --restart 'always' --network-alias 'hbbs' --publish '21115:21115/tcp' --publish '21116:21116/tcp' --publish '21116:21116/udp' --publish '21118:21118/tcp' --volume '/volume1/docker/rustdeskhbbs:/root' --network 'rustdeskhbbs_rustdesk-net' 'hbbs' '-r' 'rustdesk.examininglife.com:21117'
docker network connect 'rustdeskhbbs_rustdesk-net' 'Rustdesk-HBBS' 2>/dev/null || true
echo RUNNER-DONE-rustdeskhbbs
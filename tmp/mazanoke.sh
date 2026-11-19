#!/bin/bash
# RECON runner for project 'mazanoke' (from DXP inspect 2026-10-11)
docker network inspect 'mazanoke_default' >/dev/null 2>&1 || docker network create 'mazanoke_default'
docker run -d --name 'Mazanoke' --restart 'always' --network-alias 'mazanoke' --env 'NGINX_VERSION=1.29.8' --env 'PKG_RELEASE=1' --env 'DYNPKG_RELEASE=1' --env 'NJS_VERSION=0.9.6' --env 'NJS_RELEASE=1' --env 'ACME_VERSION=0.3.1' --publish '3474:80/tcp' --network 'mazanoke_default' --entrypoint '/docker-entrypoint.sh' '/bin/sh' '-c' '/usr/local/bin/basicauth.sh; nginx -g ''daemon off;'''
docker network connect 'mazanoke_default' 'Mazanoke' 2>/dev/null || true
echo RUNNER-DONE-mazanoke
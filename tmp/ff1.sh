#!/bin/bash
echo ==IMAGES
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.CreatedSince}}' | grep -Ei 'firefly|mariadb' || echo none-yet
echo ==COMPOSE-BACKUP-EDIT
cd /volume1/docker/firefly
cp -a docker-compose.yml docker-compose.yml.bak-fireflyfwd-20261023
sed -i 's#APP_URL: https://firefly.examininglife.com:8086#APP_URL: https://firefly.examininglife.com#' docker-compose.yml
grep -q 'AUTHENTICATION_GUARD:' docker-compose.yml || sed -i '/SITE_OWNER: sittingducks@duck.com/a\      AUTHENTICATION_GUARD: remote_user_guard\n      AUTHENTICATION_GUARD_HEADER: HTTP_X_AUTHENTIK_EMAIL' docker-compose.yml
grep -nE 'APP_URL|AUTHENTICATION_GUARD' docker-compose.yml
echo ==NETWORK-RM
docker network rm firefly_firefly_iii || echo already-gone
echo ==DB-DIR-SWAP
if [ -d db ] && [ ! -d db.bak-preimport-20261023 ]; then mv db db.bak-preimport-20261023; fi
mkdir -p db
ls -la
echo ==PULL
docker pull fireflyiii/core:latest >/tmp/ffpull.log 2>&1 && echo app-pull-ok || tail -5 /tmp/ffpull.log
docker pull mariadb:lts >/tmp/mdbpull.log 2>&1 && echo db-pull-ok || tail -5 /tmp/mdbpull.log
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.CreatedSince}}' | grep -Ei 'firefly|mariadb'
echo ==UPDB
docker compose up -d db
sleep 20
docker ps --format '{{.Names}} {{.Status}}' | grep -i firefly
#!/bin/bash
for i in $(seq 1 12); do
  if docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" -e "select 1;"' >/dev/null 2>&1; then
    echo READY-after-$((i*10))s
    break
  fi
  sleep 10
done
docker logs firefly_iii_db --tail 8 2>&1
echo ==AUTH
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" -e "select version(); show databases;"' 2>&1 | tail -8
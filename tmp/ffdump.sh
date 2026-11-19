#!/bin/bash
echo ==CLIENTBIN
BIN=$(docker exec firefly_iii_db sh -c 'command -v mariadb-dump 2>/dev/null || command -v mysqldump')
echo "BIN=$BIN"
echo ==USERS
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly -e "select id,email,left(data,120) from users;"' 2>&1 | head -6
echo ==MFACTYLE
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly -e "select count(*) from preferences where name like '%mfa%' or name like '%two%';"' 2>&1 | head -3
echo ==DUMP
docker exec firefly_iii_db sh -c 'mariadb-dump --user=firefly --password="$MYSQL_PASSWORD" --single-transaction --skip-lock-tables firefly' > /volume1/docker/firefly/dump-firefly-20261023.sql 2>/volume1/docker/firefly/dump-err.log
echo ==DUMPEOF
ls -la /volume1/docker/firefly/dump-firefly-20261023.sql
md5sum /volume1/docker/firefly/dump-firefly-20261023.sql
head -c 200 /volume1/docker/firefly/dump-firefly-20261023.sql
echo
gzip -f /volume1/docker/firefly/dump-firefly-20261023.sql
ls -la /volume1/docker/firefly/dump-firefly-20261023.sql.gz
md5sum /volume1/docker/firefly/dump-firefly-20261023.sql.gz
cat /volume1/docker/firefly/dump-err.log 2>/dev/null | head -5
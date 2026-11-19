#!/bin/bash
cd /volume1/docker/firefly
echo ==GUNZIP
gunzip -f dump-firefly-20261023.sql.gz
md5sum dump-firefly-20261023.sql
echo ==IMPORT
docker exec -i firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly' < dump-firefly-20261023.sql
echo ==IMPORT-DONE
echo ==VERIFY
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly -N -e "select count(*) from transactions; select count(*) from transaction_journals; select count(*) from users; select email from users; select count(*) from accounts;"' 2>&1
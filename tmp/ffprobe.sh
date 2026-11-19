#!/bin/bash
echo ===OIDC-HITS
docker exec firefly_iii_app sh -c "grep -rni oidc /var/www/html/app /var/www/html/routes /var/www/html/config 2>/dev/null | head -5; echo GREPRC=\$?"
echo ===REQUIRE
docker exec firefly_iii_app sh -c "sed -n '/\"require\"/,/}/p' /var/www/html/composer.json | head -30"
echo ===USERS
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly -e "select id,email,blocked from users;"' 2>/dev/null || echo SQLFAIL
echo ===TABLES
docker exec firefly_iii_db sh -c 'mariadb --user=firefly --password="$MYSQL_PASSWORD" firefly -e "show tables;"' 2>/dev/null | head -8
echo ===IMG
docker inspect --format '{{range .RepoDigests}}{{.}}{{end}}' firefly_iii_app
docker inspect --format '{{.Config.Image}} created={{.Created}}' firefly_iii_app
echo ===APPSIZE
du -sh /volume1/docker/firefly/db
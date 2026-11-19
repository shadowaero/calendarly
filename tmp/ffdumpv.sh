#!/bin/bash
Q() { docker exec firefly_iii_db sh -c "mariadb --user=firefly --password=\"\$MYSQL_PASSWORD\" firefly -N -e \"$1\"" 2>&1; }
echo ==TABLES
Q 'show tables'
echo ==COUNTS
echo -n 'transactions: '; Q 'select count(*) from transactions'
echo -n 'journals: '; Q 'select count(*) from transaction_journals'
echo -n 'accounts: '; Q 'select count(*) from accounts'
echo -n 'users: '; Q 'select count(*) from users'
echo -n 'categories: '; Q 'select count(*) from categories'
echo -n 'recurrences: '; Q 'select count(*) from recurrences'
echo -n 'attachments: '; Q 'select count(*) from attachments'
echo -n 'bills: '; Q 'select count(*) from bills'
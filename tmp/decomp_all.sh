#!/bin/bash
cd /home/flayva/tmp
for i in 1 2 3 4 5; do mkdir -p db$i; done
export PYTHONUSERBASE=/home/flayva/.local
nohup env HOME=/home/flayva/tmp/db1 PYTHONUSERBASE=/home/flayva/.local python3 decompile16.py dex2/classes6.dex Lcom/squareup/api/ > api6.out 2>&1 &
nohup env HOME=/home/flayva/tmp/db2 PYTHONUSERBASE=/home/flayva/.local python3 decompile16.py dex2/classes31.dex Lcom/squareup/api/ > api31a.out 2>&1 &
nohup env HOME=/home/flayva/tmp/db3 PYTHONUSERBASE=/home/flayva/.local python3 decompile16.py dex2/classes31.dex Lcom/squareup/ui/ > api31b.out 2>&1 &
nohup env HOME=/home/flayva/tmp/db4 PYTHONUSERBASE=/home/flayva/.local python3 decompile16.py dex2/classes18.dex Lcom/squareup/api/ > api18.out 2>&1 &
nohup env HOME=/home/flayva/tmp/db5 PYTHONUSERBASE=/home/flayva/.local python3 decompile16.py dex2/classes29.dex Lcom/squareup/settings/server/migrated/PaymentsTerminalApiActivityApplet > api29.out 2>&1 &
echo RELAUNCHED-USERBASE

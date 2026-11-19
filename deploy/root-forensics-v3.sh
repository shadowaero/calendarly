#!/bin/sh
# ROOT forensics v3 - actor attribution (UGREEN host-side docker app + full syslog window)
{
echo "ROOT_FORENSICS v3 run at $(date -Is)"
echo "==SYSLOG 10:00-10:09 EST ALL daemons (Nov 11)="
grep -ah "^2026-11-11T10:0" /var/log/syslog* 2>/dev/null | head -250
echo "==SYSLOG 10:10-10:19 EST NON-dockerd daemons="
grep -ah "^2026-11-11T10:1" /var/log/syslog* 2>/dev/null | grep -avE " dockerd" | head -250
echo "==JOURNAL ALL-UNITS 10:00-10:25 local (full system view)="
journalctl --since "2026-11-11 10:00:00" --until "2026-11-11 10:25:00" --no-pager 2>/dev/null | head -300
echo "==UGREEN/UGOS/DOCKER/COMPOSE SERVICE UNITS="
systemctl list-units --type=service --all --no-pager 2>/dev/null | grep -aiE "ugreen|ugos|docker|compose" | head -20
echo "==GREEN HOST-SIDE DOCKER APP DATA HUNT="
find /usr/local /volume1/.@plugins /volume1/@appdata /volume1/@app_conf /volume1/.ugreen /volume1/.@root -maxdepth 5 -iname "*docker*" 2>/dev/null | head -25
echo "==DONE="
} > /volume1/docker/.maintenance/root-forensics-v3-20261111.log 2>&1
chmod 666 /volume1/docker/.maintenance/root-forensics-v3-20261111.log

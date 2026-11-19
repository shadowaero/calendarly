#!/bin/sh
# ROOT forensics v2 - actor attribution for the 2026-11-11 ~10:05-10:15 LOCAL(EST) incident
# v1 bug: journal/syslog windows were given in UTC strings against local-time logs.
{
echo "ROOT_FORENSICS v2 run at $(date -Is)"
echo "==JOURNAL-DOCKER local window 10:00-10:25 EST (the incident)="
journalctl -u docker --since "2026-11-11 10:00:00" --until "2026-11-11 10:25:00" --no-pager 2>/dev/null | head -140
echo "==JOURNAL-DOCKER UTC window (in case journald stamps UTC)="
journalctl -u docker --since "2026-11-11 15:00:00 UTC" --until "2026-11-11 15:25:00 UTC" --no-pager 2>/dev/null | head -60
echo "==AUTH ACCEPTED SSH SESSIONS (all retained logs)="
grep -ah "Accepted" /var/log/auth.log* 2>/dev/null | tail -30
echo "==LAST -F (login sessions around 10:00EST)="
last -F 2>/dev/null | head -25
echo "==ROOT BASH HISTORY (compose/gluetun/docke lines)="
grep -anE "compose|gluetun|docker" /root/.bash_history 2>/dev/null | tail -30
echo "==HOME BASH HISTORIES (readable only)="
grep -anE "compose|gluetun" /home/*/.bash_history 2>/dev/null | tail -20
echo "==UGOS/UGREEN task+db hunt="
find /volume1/@appdata /volume1/@app_conf /usr/local -maxdepth 4 -type f \( -name "*.db" -o -name "*.sqlite*" -o -iname "*task*" \) 2>/dev/null | grep -aiE "task|sched|cron" | head -20
echo "==SYSTEMD TIMERS (non-stock suspects)="
systemctl list-timers --all --no-pager 2>/dev/null | head -30
echo "==DONE="
} > /volume1/docker/.maintenance/root-forensics-v2-20261111.log 2>&1
chmod 666 /volume1/docker/.maintenance/root-forensics-v2-20261111.log

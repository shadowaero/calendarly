#!/bin/sh
# Idempotent watchdog starter for @reboot + every-15-min cron (v2: logs each firing).
# Safe to fire repeatedly: starts /volume1/docker/.maintenance/bookorbit-watchdog.sh
# only if no instance (end-anchored pgrep) is already running.
L=/volume1/docker/.maintenance/bookorbit-watchdog.log
echo "$(date -Is) launcher-fire" >> "$L"
sleep 120
pgrep -f "watchdog\.sh$" >/dev/null 2>&1 && exit 0
echo "$(date -Is) launcher: watchdog NOT running -> starting" >> "$L"
nohup sh /volume1/docker/.maintenance/bookorbit-watchdog.sh >/dev/null 2>&1 &

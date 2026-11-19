#!/bin/sh
# Bookorbit netns-drift watchdog v3 (rootless). Checks every 5 min, heartbeat hourly.
# WHY: bookorbit-app runs with network_mode: service:gluetun = it SHARES gluetun's
# network namespace. If the gluetun container is ever recreated (by anyone), the old
# netns dies and a plain `docker compose up -d app` is a silent NO-OP for bookorbit -
# it keeps riding the DEAD namespace (outbound = "bad address") while still showing
# "Up (healthy)". Only `up -d --force-recreate app` re-attaches it. This watchdog:
#  - compares netns inodes (readlink /proc/1/ns/net inside both containers)
#  - equal        -> quiet (hourly "OK" heartbeat line in the log)
#  - differ       -> DRIFT: force-recreate bookorbit-app, then verify + log POST-HEAL
#  - both missing -> silent (docker/stack starting, e.g. after NAS reboot)
LOG=/volume1/docker/.maintenance/bookorbit-watchdog.log
N=0
while true
do
  G=$(docker exec gluetun sh -c "readlink /proc/1/ns/net" 2>/dev/null)
  B=$(docker exec bookorbit-app sh -c "readlink /proc/1/ns/net" 2>/dev/null)
  if [ -z "$G" ] && [ -z "$B" ]; then
    :
  elif [ -z "$G" ]; then
    echo "$(date -Is) WARN gluetun absent (bookorbit=$B); waiting" >> "$LOG"
  elif [ -z "$B" ]; then
    echo "$(date -Is) NOTE bookorbit-app absent (gluetun=$G); waiting" >> "$LOG"
  elif [ "$G" != "$B" ]; then
    echo "$(date -Is) DRIFT gluetun=$G bookorbit=$B -> force-recreate bookorbit-app" >> "$LOG"
    if cd /volume1/docker/bookorbit 2>>"$LOG"; then
      docker compose up -d --force-recreate app >>"$LOG" 2>&1
      sleep 20
      NB=$(docker exec bookorbit-app sh -c "readlink /proc/1/ns/net" 2>/dev/null)
      echo "$(date -Is) POST-HEAL bookorbit=$NB (gluetun was $G)" >> "$LOG"
    else
      echo "$(date -Is) ERROR cd /volume1/docker/bookorbit failed" >> "$LOG"
    fi
  elif [ $((N % 12)) -eq 0 ]; then
    echo "$(date -Is) OK netns=$G" >> "$LOG"
  fi
  N=$((N+1))
  sleep 300
done

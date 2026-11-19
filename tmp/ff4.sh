#!/bin/bash
cd /volume1/docker/firefly
echo ==UP
docker compose up -d 2>&1 | tail -6
echo ==WAIT
for i in $(seq 1 12); do
  docker ps --format '{{.Names}} {{.Status}}' | grep firefly
  if docker inspect --format '{{.State.Health.Status}}' firefly_iii_app 2>/dev/null | grep -q healthy; then
    echo APP-HEALTHY-after-$((i*10))s
    break
  fi
  sleep 10
done
echo ==APPLOGS
docker logs firefly_iii_app 2>&1 | tail -25
echo ==HTTP-PROBE
python3 - <<'PYEOF'
import urllib.request
for u in ['http://127.0.0.1:8086/', 'http://127.0.0.1:8086/healthcheck']:
    try:
        r=urllib.request.urlopen(u)
        print(u, r.status, 'loc=', r.headers.get('Location'), 'ct=', r.headers.get('Content-Type'), 'len=', r.headers.get('Content-Length'))
    except Exception as e:
        print(u, 'ERR', e)
PYEOF
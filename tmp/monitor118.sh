#!/bin/bash
# Monitor order #118 (ord_1794692402468_hjsw99) until PAID or timeout
OID=ord_1794692402468_hjsw99
L=/home/flayva/tmp/mon118.log
echo "start $(date +%H:%M:%S)" > "$L"
for i in $(seq 1 60); do
  ST=$(curl -s -m 5 http://localhost:5005/api/orders/$OID/payment-status)
  echo "[$(date +%H:%M:%S)] poll$i: $ST" >> "$L"
  echo "$ST" | grep -q '"status":"PAID"' && { echo "PAID!" >> "$L"; break; }
  sleep 5
done
journalctl --user -u flayva-thymme --since '16:39' --no-pager 2>/dev/null | grep -i 'SQCB\|square-pos' | tail -14 >> "$L"
echo "DONE $(date +%H:%M:%S)" >> "$L"

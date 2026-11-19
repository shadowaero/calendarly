echo '== stopping service for cleanup =='
systemctl --user stop flayva-thymme
sleep 2
python3 - <<'PYEOF'
import json
FN = '/home/flayva/flayva-thymme/data/menu.json'
d = json.load(open(FN))
before = len(d.get('orders') or [])
d['orders'] = [o for o in (d.get('orders') or []) if not (isinstance(o.get('orderNumber'), int) and o.get('orderNumber') >= 117 and o.get('orderNumber') <= 125)]
after = len(d['orders'])
# drop the test menu item if present
if 'items' in d and isinstance(d['items'], dict) and 'livetest1' in d['items']:
    del d['items']['livetest1']
    print('removed livetest1 menu item')
json.dump(d, open(FN, 'w'), indent=2, ensure_ascii=False)
print('orders:', before, '->', after)
PYEOF
grep -c '"livetest1"\|Tap-to-Pay Live Test\|Probe Patty' /home/flayva/flayva-thymme/data/menu.json || echo no-test-refs
systemctl --user start flayva-thymme
sleep 3
systemctl --user is-active flayva-thymme
curl -s http://localhost:5005/api/orders/1/payment-status
echo
curl -s -o /dev/null -w 'menu-api: %{http_code}\n' http://localhost:5005/api/menu
adb -s 10.42.0.153:5555 shell dumpsys window 2>/dev/null | grep mCurrentFocus | tail -1
echo '== done =='

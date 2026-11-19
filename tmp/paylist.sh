echo '== list Square payments today =='
python3 - <<'PYEOF'
import json, urllib.request, datetime, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
cfg = d.get('ordering', {}).get('squareConfig', {})
tok = (cfg.get('accessToken') or '').strip()
base = 'https://connect.squareupsandbox.com' if cfg.get('environment') == 'sandbox' else 'https://connect.squareup.com'
now = datetime.datetime.now(datetime.timezone.utc)
begin = (now - datetime.timedelta(days=2)).strftime('%Y-%m-%dT%H:%M:%SZ')
end = now.strftime('%Y-%m-%dT%H:%M:%SZ')
url = base + '/v2/payments?begin_time=' + begin + '&end_time=' + end + '&sort_order=DESC&limit=10'
req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + tok})
try:
    j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode())
    for p in j.get('payments', []):
        print(p.get('id'), '|', p.get('status'), '|', p.get('amount_money', {}).get('amount'), '|', p.get('created_at'), '|', p.get('order_id'), '|', p.get('location_id'))
except urllib.error.HTTPError as e:
    print('HTTP', e.code, e.read().decode()[:400])
except Exception as e:
    print('ERROR', type(e).__name__, str(e)[:200])
PYEOF
echo '== manual-verify + restorePosKioskApp bodies =='
M=$(grep -n "manual-verify" /home/flayva/flayva-thymme/server/index.js | head -1 | cut -d: -f1); sed -n "$((M-3)),$((M+28))p" /home/flayva/flayva-thymme/server/index.js
R=$(grep -n "function restorePosKioskApp" /home/flayva/flayva-thymme/server/index.js | head -1 | cut -d: -f1); sed -n "${R},$((R+20))p" /home/flayva/flayva-thymme/server/index.js
echo '== done =='

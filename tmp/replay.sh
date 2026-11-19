echo '== journal since callback =='
journalctl _SYSTEMD_USER_UNIT=flayva-thymme.service --no-pager --since '2026-11-15 12:04:53' 2>/dev/null | tail -25
echo '== replay transaction check with real token =='
python3 - <<'PYEOF'
import json, urllib.request
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
cfg = d.get('ordering', {}).get('squareConfig', {})
tok = (cfg.get('accessToken') or '').strip()
env = cfg.get('environment')
print('env:', env, 'token present:', bool(tok))
base = 'https://connect.squareupsandbox.com' if env == 'sandbox' else 'https://connect.squareup.com'
txid = 'YqlcUfPAicxKfOmds4SERFPi2mOZY'
req = urllib.request.Request(base + '/v2/transactions/' + txid, headers={'Authorization': 'Bearer ' + tok})
try:
    r = urllib.request.urlopen(req, timeout=15)
    j = json.loads(r.read().decode())
    tx = j.get('transaction', {})
    print('HTTP', r.status)
    print('tenders:', json.dumps(tx.get('tenders', []))[:500])
    print('amount:', tx.get('amount_money'))
except Exception as e:
    body = ''
    try:
        body = e.read().decode()[:700]
    except Exception:
        pass
    print('ERROR:', type(e).__name__, str(e)[:200], body)
PYEOF
echo '== done =='

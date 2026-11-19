python3 - <<'PYEOF'
import json
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
for o in (d.get('orders') or []):
    if o.get('id') in ('ord_1794762477135_btb6uv', 'ord_1794762183487_m1qjrl'):
        sp = o.get('squarePos') or {}
        print('---', o.get('orderNumber'), o.get('id'))
        print('  status:', o.get('paymentStatus'), 'pm:', o.get('paymentMethod'))
        print('  state:', sp.get('state'))
        print('  deepLink CLIENT_TX:', (sp.get('deepLink') or '')[120:260])
PYEOF
echo '== done =='

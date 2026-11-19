echo '== orders overview =='
python3 - <<'PYEOF'
import json
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
for o in (d.get('orders') or []):
    items = o.get('items') or []
    print(o.get('orderNumber'), '|', o.get('id', '')[-14:], '|', o.get('paymentStatus'), '|', o.get('customerName', ''), '|', [i.get('name') for i in items][:2])
print('total orders:', len(d.get('orders') or []))
# find livetest item + cart structures
def scan(obj, path=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == 'livetest1':
                print('LIVETEST ITEM at:', path + '/' + k)
            if 'cart' in str(k).lower() or 'cart' in str(v).lower()[:40] if isinstance(v, str) else False:
                print('CART-ish key at:', path + '/' + k)
            scan(v, path + '/' + str(k))
    elif isinstance(obj, list):
        for idx, v in enumerate(obj[:400]):
            scan(v, path + '/' + str(idx))
scan(d)
import subprocess
PYEOF
echo '== cart raw grep =='
grep -o '"cart[^}]*' /home/flayva/flayva-thymme/data/menu.json | head -4
echo '== mon118 process =='
ps aux | grep -E 'mon118|watch.*118' | grep -v grep
echo '== done =='

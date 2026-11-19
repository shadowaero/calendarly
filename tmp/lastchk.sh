python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
BASE = 'https://connect.squareup.com/v2'
def lst(path):
    req = urllib.request.Request(BASE + path, headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'ERROR': e.code, 'BODY': e.read().decode()[:220]}

for t in ('MODIFIER_LIST', 'OPTION'):
    r = lst('/catalog/list?types=' + t)
    if 'ERROR' in r: print(t, '->', r['ERROR'], r.get('BODY', ''))
    else: print(t, 'count:', len(r.get('objects', [])), [o.get(t.lower()+'_data', {}).get('name') for o in r.get('objects', [])][:6])

feastid = 'PEPBRLB3CQJB6NFRSPOKSBFI'
r = lst('/catalog/object/' + feastid)
if 'ERROR' not in r:
    o = r.get('object', {}); print('PEPBRL object type:', o.get('type'), '| data keys:', list((o.get('category_data') or o.get('menu_data') or {}).keys()))
    cd = o.get('category_data') or {}
    print('category name:', cd.get('name'))
cur = None; items = []
for _ in range(6):
    path = '/catalog/list?types=ITEM' + (('&cursor=' + cur) if cur else '')
    r = lst(path)
    if 'ERROR' in r: print('ITEM list err:', r['ERROR'], r.get('BODY', '')); break
    items += r.get('objects', [])
    cur = r.get('cursor')
    if not cur: break
print('total ITEMS:', len(items))
feast = [o for o in items if feastid in (o['item_data'].get('category_id', '') or '')]
print('feast-category items:', len(feast))
withmod = [(o['item_data'].get('name'), o['item_data'].get('modifier_list_info')) for o in items if o['item_data'].get('modifier_list_info')]
print('items with modifier_list_info:', len(withmod), withmod[:4])
withopt = [(o['item_data'].get('name'), o['item_data'].get('item_options')) for o in items if o['item_data'].get('item_options')]
print('items with item_options:', len(withopt), withopt[:4])
if feast:
    it = feast[0]['item_data']
    print('sample feast item:', it.get('name'), '| keys:', list(it.keys()))
    for v in (it.get('variations') or []):
        vd = v.get('item_variation_data', {})
        print(' variation:', vd.get('name'), vd.get('pricing_type'), (vd.get('price_money') or {}).get('amount'))
PYEOF
echo '== done =='

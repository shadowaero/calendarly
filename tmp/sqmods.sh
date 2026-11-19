python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
cfg = d['ordering']['squareConfig']
tok = cfg.get('accessToken') or cfg.get('token') or ''
print('squareConfig keys:', [k for k in cfg.keys()])
print('has token:', bool(tok))
BASE = 'https://connect.squareup.com/v2'

def api(path, body, method='POST'):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), method=method,
        headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'ERROR': e.read().decode()[:300]}

mods = api('/catalog/search-catalog-objects', {'object_types': ['MODIFIER_LIST'], 'include_all_related_objects': False})
if 'ERROR' in mods:
    print('modifier fetch ERROR:', mods['ERROR']); raise SystemExit
mlist = [o['modifier_list_data'] for o in mods.get('objects', [])]
print('MODIFIER LISTS in catalog:', len(mlist))
for ml in mlist:
    opts = ml.get('modifiers', [])
    print('-', ml['name'], '| options:', len(opts), '|', [(m['name'], (m.get('modifier_data') or {}).get('price_money', {}).get('amount')) for m in opts][:8])
# items with modifier attachment
cur = None; attached = []
for page in range(3):
    body = {'object_types': ['ITEM'], 'include_all_related_objects': True}
    if cur: body['cursor'] = cur
    objs = api('/catalog/search-catalog-objects', body)
    if 'ERROR' in objs:
        print('items fetch ERROR:', objs['ERROR']); break
    for o in objs.get('objects', []):
        it = o.get('item_data', {})
        mli = it.get('modifier_list_info') or []
        if mli:
            names = []
            for x in mli:
                mlid = x.get('modifier_list_id')
                n = next((m['name'] for m in mlist if m['id'] == mlid), mlid)
                names.append(n)
            attached.append((it.get('name'), names))
    cur = objs.get('cursor')
    if not cur: break
print('ITEMS WITH MODIFIERS:', len(attached))
for a in attached[:30]:
    print(' *', a[0], '->', a[1])
PYEOF
echo '== done =='

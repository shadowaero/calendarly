python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
BASE = 'https://connect.squareup.com/v2'
def api(path, body=None):
    method = 'POST' if body is not None else 'GET'
    req = urllib.request.Request(BASE + path, data=(json.dumps(body).encode() if body is not None else None),
        method=method, headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'ERROR': e.code, 'BODY': e.read().decode()[:220]}

r = api('/catalog/search-catalog-objects', {'object_types': ['ITEM'], 'text_query': 'Jerk Chicken', 'include_all_related_objects': True})
if 'ERROR' in r: print('item search err:', r['ERROR'], r.get('BODY', ''))
else:
    for o in r.get('objects', [])[:2]:
        it = o['item_data']
        print('ITEM:', it.get('name'), '| cat:', it.get('category_id', '')[12:], '| item_data keys:', list(it.keys()))
        print('  modifier_list_info:', it.get('modifier_list_info', 'NONE'), '| item_options:', it.get('item_options', 'NONE'))
        for v in (it.get('variations') or []):
            vd = v.get('item_variation_data', {})
            print('  variation:', vd.get('name'), vd.get('pricing_type'), vd.get('price_money'))
ro = api('/catalog/search-catalog-objects', {'object_types': ['OPTION']})
if 'ERROR' in ro: print('OPTION search err:', ro['ERROR'], ro.get('BODY', ''))
else: print('OPTION objects:', [(o.get('option_data', {}).get('name')) for o in ro.get('objects', [])])
PYEOF
echo '== done =='

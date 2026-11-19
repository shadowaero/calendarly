python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
req0 = lambda path: urllib.request.Request('https://connect.squareup.com' + path,
    headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})

def get(path):
    try:
        with urllib.request.urlopen(req0(path), timeout=15) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'ERROR': e.code, 'BODY': e.read().decode()[:260]}

info = get('/v2/catalog/info')
if 'ERROR' in info:
    print('catalog/info:', info['ERROR'], info.get('BODY', ''))
else:
    print('catalog/info:', json.dumps(info)[:400])
menu = get('/v2/catalog/object/PEPBRLB3CQJB6NFRSPOKSBFI?include_all_related_objects=true')
if 'ERROR' in menu:
    print('menu object:', menu['ERROR'], menu.get('BODY', ''))
else:
    md = (menu.get('object') or {}).get('menu_data', {})
    print('menu name:', md.get('name'), '| menu refs:', [ (ri.get('type'), ri.get('id')[:10]) for ri in (md.get('image_ids') or []) ][:3])
    print('menu_data keys:', list(md.keys()))
    gs = md.get('menu_groups') or []
    print('menu groups:', [g.get('id', '')[10:] for g in gs][:8])
listed = get('/v2/catalog/list?types=CATEGORY')
if 'ERROR' in listed:
    print('catalog/list CATEGORY:', listed['ERROR'], listed.get('BODY', ''))
else:
    print('categories objects:', [(o.get('category_data', {}).get('name')) for o in listed.get('objects', [])][:12])
PYEOF
echo '== done =='

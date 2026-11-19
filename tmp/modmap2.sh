python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
def lst(path):
    req = urllib.request.Request('https://connect.squareup.com/v2' + path,
        headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'ERROR': e.code, 'BODY': e.read().decode()[:200]}

mls = {}
cur = None
while True:
    r = lst('/catalog/list?types=MODIFIER_LIST' + (('&cursor=' + cur) if cur else ''))
    if 'ERROR' in r: print('ml err', r.get('BODY', '')); break
    for o in r.get('objects', []):
        md = o.get('modifier_list_data') or {}
        mid = md.get('id') or ''
        if not mid: continue
        mls[mid] = (md.get('name', '?'), [(m.get('modifier_data', {}).get('name', '?'),
            (m.get('modifier_data', {}).get('price_money') or {}).get('amount'), m.get('modifier_data', {}).get('on_by_default')) for m in md.get('modifiers', [])])
    cur = r.get('cursor')
    if not cur: break
print('modifier lists loaded:', len(mls))
for mid, (n, opts) in sorted(mls.items()):
    detail = ', '.join('%s%s%s' % (on, '$%.2f' % (pa/100.0) if pa else '', '*' if obd else '') for on, pa, obd in opts)
    print('  %-30s -> %s' % (n, detail))

items = {}
cur = None
while True:
    r = lst('/catalog/list?types=ITEM' + (('&cursor=' + cur) if cur else ''))
    if 'ERROR' in r: print('item err', r.get('BODY', '')); break
    for o in r.get('objects', []):
        oid = o.get('id') or ''
        if oid: items[oid] = o.get('item_data', {})
    cur = r.get('cursor')
    if not cur: break
import sys
feast = next((m for m in d['squareMenus'] if m.get('id') == 'PEPBRLB3CQJB6NFRSPOKSBFI'), None)
if not feast: print('feast menu row missing'); sys.exit(0)
print('FEAST ITEM RESOLUTION:')
for g in feast['menuGroups']:
    print('[%s]' % g['name'])
    for it in (g.get('items') or []):
        cd = items.get(it.get('id')) or next((iv for k, iv in items.items() if iv.get('name') == it.get('name')), None)
        if not cd:
            print('  %-24s -> NOT IN CATALOG' % it.get('name')); continue
        parts = []
        for x in (cd.get('modifier_list_info') or []):
            n2, opts = mls.get(x.get('modifier_list_id'), ('?' + str(x.get('modifier_list_id'))[-6:], []))
            if not x.get('enabled', True): parts.append(n2 + '(OFF)')
            else: parts.append('%s{%s<%d>:%d}' % (n2, x.get('min_selected_modifiers', 0), x.get('max_selected_modifiers', 0), len(opts)))
        for oo in (cd.get('item_options') or []):
            parts.append('OPTID ' + str(oo.get('item_option_id')))
        vs = cd.get('variations') or []
        var = ' VARS:' + ','.join('%s@$%.2f' % (v['item_variation_data'].get('name', '?'), (v['item_variation_data'].get('price_money') or {}).get('amount', 0)/100.0) for v in vs) if len(vs) > 1 else ''
        print('  %-24s %s%s' % (it.get('name'), ((' MODS: ' + ' + '.join(parts)) if parts else '-'), var))
PYEOF
echo '== done =='

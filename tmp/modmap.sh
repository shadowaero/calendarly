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

# modifier lists
mls = {}
cur = None
while True:
    r = lst('/catalog/list?types=MODIFIER_LIST' + (('&cursor=' + cur) if cur else ''))
    if 'ERROR' in r: print('ml err', r.get('BODY', '')); break
    for o in r.get('objects', []):
        md = o['modifier_list_data']
        mls[md['id']] = (md.get('name'),
            [(m['modifier_data'].get('name'), (m['modifier_data'].get('price_money') or {}).get('amount'), m['modifier_data'].get('on_by_default')) for m in md.get('modifiers', [])])
    cur = r.get('cursor')
    if not cur: break
print('modifier lists:', len(mls))
for k, (n, opts) in mls.items():
    print(' LIST %-28s -> %s' % (n, ', '.join('%s%s' % (o[0], ('$%.2f' % (o[1]/100.0)) if o[1] else '') for o in opts[:6])))

# catalog items
items = {}
cur = None
while True:
    r = lst('/catalog/list?types=ITEM' + (('&cursor=' + cur) if cur else ''))
    if 'ERROR' in r: print('item err', r.get('BODY', '')); break
    for o in r.get('objects', []): items[o['id']] = o['item_data']
    cur = r.get('cursor')
    if not cur: break
print('catalog items:', len(items))

feast = next(m for m in d['squareMenus'] if m['id'] == 'PEPBRLB3CQJB6NFRSPOKSBFI')
print('\n=== FEAST KITCHEN POP IN - EUSTIS: 28 items with modifiers ===')
for g in feast['menuGroups']:
    print('\n[%s]' % g['name'])
    for it in (g.get('items') or []):
        cd = items.get(it['id']) or next((iv for k, iv in items.items() if iv.get('name') == it['name']), None)
        if not cd:
            print('  %-22s -> not found in catalog' % it['name']); continue
        parts = []
        info = cd.get('modifier_list_info') or []
        for x in info:
            n, opts = mls.get(x['modifier_list_id'], ('?'+x['modifier_list_id'][-6:], []))
            flag = '' if x.get('enabled', True) else ' (OFF)'
            parts.append('%s%s [%d opts]' % (n, flag, len(opts)))
        for oo in (cd.get('item_options') or []):
            parts.append('OPTION ' + oo['item_option_id'][-6:])
        vs = cd.get('variations') or []
        var = (' vars:' + ','.join(v['item_variation_data'].get('name', '') + ' $' + str((v['item_variation_data'].get('price_money') or {}).get('amount', 0)/100.0) for v in vs)) if len(vs) > 1 else ''
        print('  %-22s $%6.2f %s%s' % (it['name'], (it.get('priceAmount') or 0)/100.0, ('MOD: ' + ' + '.join(parts)) if parts else '-', var))
PYEOF
echo '== done =='

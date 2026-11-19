python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
def lst(path):
    req = urllib.request.Request('https://connect.squareup.com/v2' + path,
        headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'ERROR': e.code, 'BODY': e.read().decode()[:150]}

mls = {}
r = lst('/catalog/list?types=MODIFIER_LIST')
for o in r.get('objects', []):
    md = o.get('modifier_list_data') or {}
    mls[o['id']] = (md.get('name', '?'),
        [(m.get('modifier_data', {}).get('name', '?'),
          (m.get('modifier_data', {}).get('price_money') or {}).get('amount'),
          m.get('modifier_data', {}).get('on_by_default', False)) for m in md.get('modifiers', [])])
opt = lst('/catalog/list?types=ITEM_OPTION')
if 'ERROR' in opt:
    print('ITEM_OPTION via list:', opt.get('ERROR', ''), opt.get('BODY', ''))
else:
    for o in opt.get('objects', []):
        od = o.get('option_data') or {}
        print('ITEM_OPTION:', od.get('name'), '| vals:', [(v.get('item_option_value_data', {}).get('name', ''), (v.get('item_option_value_data', {}).get('price_money') or {}).get('amount', 0)/100.0) for v in od.get('item_option_values', [])])

items = {}
cur = None
while True:
    r2 = lst('/catalog/list?types=ITEM' + (('&cursor=' + cur) if cur else ''))
    if 'ERROR' in r2: print('item err', r2.get('BODY', '')); break
    for o in r2.get('objects', []): items[o['id']] = o.get('item_data', {})
    cur = r2.get('cursor')
    if not cur: break
feast = next((m for m in d['squareMenus'] if m.get('id') == 'PEPBRLB3CQJB6NFRSPOKSBFI'), None)
for g in feast['menuGroups']:
    if not g.get('items'): continue
    print('\n[%s]' % g['name'])
    for it in g['items']:
        cd = items.get(it.get('id')) or next((iv for k, iv in items.items() if iv.get('name') == it.get('name')), None)
        if not cd:
            print('  %-26s -> NOT IN CATALOG' % it.get('name')); continue
        parts = []
        for x in (cd.get('modifier_list_info') or []):
            n2, opts = mls.get(x.get('modifier_list_id'), ('?' + str(x.get('modifier_list_id'))[-6:], []))
            mark = '(OFF)' if not x.get('enabled', True) else ''
            rng = '' if (x.get('min_selected_modifiers', -1) in (-1, 0) and x.get('max_selected_modifiers', -1) == -1) else ' [%s..%s]' % (max(x.get('min_selected_modifiers', -1), 0), x.get('max_selected_modifiers', -1))
            odet = ', '.join('%s%s%s' % (on, '$%.2f' % (pa/100.0) if pa else '', '(dflt)' if obd else '') for on, pa, obd in opts)
            parts.append('%s%s%s: %s' % (n2, mark, rng, odet))
        vs = cd.get('variations') or []
        var = ' VARS:' + ','.join('%s@$%.2f' % (v['item_variation_data'].get('name', '?'), (v['item_variation_data'].get('price_money') or {}).get('amount', 0)/100.0) for v in vs) if len(vs) > 1 else ''
        print('  %-26s%s' % (it.get('name'), ((' MODS: ' + ' | '.join(parts)) if parts else ''), ) if not var else print('  %-26s%s%s' % (it.get('name'), ((' MODS: ' + ' | '.join(parts)) if parts else ''), var)) if False else None)
        print('  %-26s %s%s' % (it.get('name') if False else it.get('name'), (('MODS: ' + ' | '.join(parts)) if parts else '-'), var))
PYEOF
echo '== end of mapping =='

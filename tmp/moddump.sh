python3 - <<'PYEOF'
import json
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
raw = open('/home/flayva/flayva-thymme/data/menu.json').read()
print('modifier-like key mentions:', raw.count('modifier'), '| addon:', raw.count('addon'), '| subcategorie:', raw.count('subcategor'), '| option:', raw.count('option'))
# active screen
for s in d['screens']:
    if s.get('isLive'):
        print('LIVE SCREEN:', s.get('name'), '| squareMenuId:', s.get('squareMenuId'))
# squareMenus overview
for m in d['squareMenus']:
    print('MENU:', m.get('id'), '|', m.get('name'), '| items:', m.get('itemCount'), '| groups:', [g.get('name') for g in (m.get('menuGroups') or [])][:6])
# feast menu structure
feast = next((m for m in d['squareMenus'] if 'Feast' in str(m.get('name'))), None)
if feast:
    g0 = (feast.get('menuGroups') or [])[0]
    print('group keys:', list(g0.keys()))
    its = g0.get('items') or []
    print('group items n=', len(its), 'item keys:', (list(its[0].keys()) if its else []))
    if its:
        it0 = its[0]
        for kk in it0.keys():
            v = it0[kk]
            if isinstance(v, (list, dict)) and v:
                print(' non-scalar field:', kk, '->', json.dumps(v)[:300])
# flat items: full key union for a feast item
fl = [i for i in d['items'] if i.get('name') == 'Jerk Chicken']
if fl:
    print('flat item keys:', list(fl[0].keys()))
    extras = {k: v for k, v in fl[0].items() if k not in ('id','categoryId','menuGroup','name','description','price','priceAmount','image','sortOrder','available','sku')}
    s = json.dumps(extras, ensure_ascii=False)[:500]
    print('flat extras:', s)
PYEOF
echo '== done =='

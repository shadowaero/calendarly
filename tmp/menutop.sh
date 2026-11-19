python3 - <<'PYEOF'
import json
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
print('top-level keys:', list(d.keys()))
# find menu structures
for k in d.keys():
    v = d[k]
    if isinstance(v, dict):
        sub = list(v.keys())[:12]
        print(' ', k, '-> dict keys:', sub)
    elif isinstance(v, list):
        print(' ', k, '-> list len', len(v), 'sample keys:', (list(v[0].keys())[:12] if v and isinstance(v[0], dict) else v[:3]))
PYEOF
echo '== done =='

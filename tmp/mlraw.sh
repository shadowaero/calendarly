python3 - <<'PYEOF'
import json, urllib.request, urllib.error
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
tok = d['ordering']['squareConfig'].get('accessToken', '')
def lst(path):
    req = urllib.request.Request('https://connect.squareup.com/v2' + path,
        headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json', 'Square-Version': '2023-09-25'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read().decode()
            return raw
    except urllib.error.HTTPError as e:
        return 'ERR ' + str(e.code) + ' ' + e.read().decode()[:150]

raw = lst('/catalog/list?types=MODIFIER_LIST')
print('RAW first 300:', raw[:300])
print('RAW last 200:', raw[-200:])
try:
    j = json.loads(raw)
    print('top keys:', list(j.keys()), '| objects:', len(j.get('objects', [])), '| cursor:', j.get('cursor'))
    md = j.get('objects', [])
    for o in md:
        mdd = o.get('modifier_list_data') or {}
        print('  -', mdd.get('id', '?')[:12], '|', mdd.get('name'), '| opts:', len(mdd.get('modifiers', [])))
except Exception as e:
    print('parse fail:', e)
PYEOF
echo '== done =='

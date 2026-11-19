echo '== menu.json config structure around posWebCallbackBase =='
python3 - <<'PYEOF'
import json
d = json.load(open('/home/flayva/flayva-thymme/data/menu.json'))
def find_path(obj, needle, path=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = path + '/' + str(k)
            if 'posWebCallbackBase' == str(k):
                print('FOUND KEY PATH:', p, '=>', json.dumps(v)[:120])
            find_path(v, needle, p)
    elif isinstance(obj, list):
        for idx, v in enumerate(obj[:3]):
            find_path(v, needle, path + '/' + str(idx))
find_path(d if isinstance(d.get('config', {}), dict) else d, 'posWebCallbackBase')
print('config keys:', list(d.get('config', {}).keys())[:20])
print('squareConfig keys:', list(d.get('config', {}).get('squareConfig', {}).keys())[:20])
PYEOF
echo '== done =='

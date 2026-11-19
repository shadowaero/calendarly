#!/usr/bin/env python3
# rtl_433 JSON-line feeder -> family-dashboard /api/sensors/ingest
# Tails the rtl_433 JSON output, dedupes, POSTs each reading with the ingest token.
import json, os, sys, time, urllib.request

TOKEN = os.environ.get('FDW_TOKEN', '')
BASE = os.environ.get('FDW_BASE', 'http://127.0.0.1:3000')
SRC = os.environ.get('FDW_RTL_JSON', '/var/run/rtl433.json')

def post(reading):
    body = {
        'token': TOKEN,
        'sensor_id': '%s:%s' % (reading.get('model', 'unknown'), reading.get('id', '0')),
        'model': reading.get('model'),
        'channel': reading.get('channel'),
        'tempC': reading.get('temperature_C'),
        'humidity': reading.get('humidity'),
        'battery': reading.get('battery_ok'),
        'rssi': reading.get('rssi'),
    }
    if body['tempC'] is None:
        return  # rtl_433 line without a temperature is not a sensor reading
    data = json.dumps(body).encode()
    req = urllib.request.Request(BASE + '/api/sensors/ingest', data=data,
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            r.read()
    except Exception as e:
        print('POST failed:', e, file=sys.stderr)

def main():
    # wait for rtl_433 output to exist
    while not os.path.exists(SRC):
        time.sleep(5)
    pos = 0
    key = ''
    while True:
        size = os.path.getsize(SRC)
        if size < pos:  # truncated/rotated
            pos = 0
        with open(SRC, 'rb') as f:
            f.seek(pos)
            chunk = f.read()
            pos = f.tell()
        for line in chunk.splitlines():
            s = line.decode('utf-8', 'replace').strip()
            if not s or s == key:
                continue
            key = s
            try:
                post(json.loads(s))
            except Exception as e:
                print('bad line:', s[:80], e, file=sys.stderr)
        time.sleep(5)

if __name__ == '__main__':
    main()
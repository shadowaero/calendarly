# ZIGBEE — ZBDongle-E as Home Assistant coordinator on IDX6011 (NAS .188)

First set up 2026-11-22/23 (UGOS-app era); re-done 2026-11-24 on the self-managed container —
see "Current setup" below. Companion docs: `SSH-ACCESS.md` (that "NAS" entry = the
IDX6011: `ssh ShadowAero@192.168.76.188`, passwordless via `id_ed25519`; `scp` needs `-O`).

## Hardware facts (as observed)
- Stick: SONOFF Zigbee 3.0 USB Dongle Plus **V2** descriptor — user-supplied model
  **ZBDongle-E** (EFR32MG21, EmberZNet/EZSP stock firmware). USB: path `3-3`,
  `VID:PID 10c4:ea60`, `cp210x` driver → `/dev/ttyUSB0` (`root:dialout`, 660).
- Stable host path (safe if replugged into a different port):
  `/dev/serial/by-id/usb-Itead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_V2_d62826dfc278f0118d6af8eba7772636-if00-port0`
- NAS kernel 6.18.15 (Debian 12), `cp210x` driver present out of the box.

## Current setup (2026-11-24 — self-managed HA container)
The UGOS HA app and its junk state were removed; HA now runs as the self-managed container
in `/volume1/docker/homeassistant/` (live `docker-compose.yml` = `tmp/ha-docker-compose.yml`
in this repo, shipped md5-verified). The dongle mapping is enabled directly in it:

```yaml
    devices:
      - /dev/serial/by-id/usb-Itead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_V2_d62826dfc278f0118d6af8eba7772636-if00-port0:/dev/ttyUSB0
      - /dev/serial/by-id/usb-Itead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_V2_d62826dfc278f0118d6af8eba7772636-if00-port0:/dev/serial/by-id/usb-Itead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_V2_d62826dfc278f0118d6af8eba7772636-if00-port0
```

- Apply/refresh: `cd /volume1/docker/homeassistant && docker compose up -d`
- Verified 2026-11-24 after a physical unplug/replug of the stick: by-id path re-created on
  the host, `docker inspect` shows both mappings, both nodes present inside the container,
  HA healthy (HTTP 200).
- ZHA usage is unchanged — see the last section (serial `/dev/ttyUSB0` or the by-id entry,
  radio type **EZSP**, baud **115200**).
- If the stick is unplugged for good, comment the `devices:` block out before restarting the
  container (start fails on a missing mapped device node).

## Historical: UGOS-app era (2026-11-22/23) — the UGOS HA app has since been removed

### What was changed on the IDX6011
UGreen's HA app (`homeassistant-app-1`, compose project `homeassistant`, service `app`)
ships **without any USB device mapping** (`Devices: null`, `Privileged: false`) and the
UGreen app GUI offers no device option, so the compose was edited at the shell level:

- `/volume1/@appstore/com.ugreen.docker.homeassistant/docker-compose.yaml`
- `/volume1/@appstore/com.ugreen.docker.homeassistant/docker-compose.tmpl` (template the
  app daemon regenerates from on app reconfig — patched too so the mapping survives app
  setting changes; only an app **package reinstall** can rewrite it — see Re-apply below)

Both got a `devices:` block on service `app` (two mappings, same host by-id path:
`→ /dev/ttyUSB0` and `→ /dev/serial/by-id/<same-name>` inside the container — both show
up in the ZHA port dropdown). Everything else byte-identical to UGreen's original
(image `ugreen/home-assistant:2026.8.3`, TZ US/Eastern, `/volume1/docker/homeassistant:/config`,
ports 8123, host network, restart always, grace 60s).

- Backups: `docker-compose.yaml.bak-zigbee-20261122` and `docker-compose.tmpl.bak-zigbee-20261122`
  (original UGreen versions, same folder).
- Edit method: `ShadowAero` has no sudo but IS docker-group (root-equivalent), so the
  root-owned files were replaced through a throwaway mount:
  `docker run --rm -v /:/host --entrypoint sh ugreen/home-assistant:2026.8.3 -c "cd /host/volume1/@appstore/com.ugreen.docker.homeassistant && cp -a docker-compose.yaml docker-compose.yaml.bak-zigbee-20261122 && cp -a docker-compose.tmpl docker-compose.tmpl.bak-zigbee-20261122 && cp /tmp/ha-compose.new.yaml docker-compose.yaml && chmod 644 docker-compose.yaml"`
  (staged files live in this repo at `tmp/ha-compose.new.yaml` + `tmp/ha-compose.tmpl.new`).
- Recreated: `cd /volume1/@appstore/com.ugreen.docker.homeassistant && docker compose -p homeassistant -f docker-compose.yaml up -d`

## Verified after recreate
- `docker inspect` → `Devices` has both by-id mappings (`rwm`).
- Inside container: `/dev/ttyUSB0` and `/dev/serial/by-id/<name>` nodes present.
- HA web UI `http://127.0.0.1:8123/` → HTTP 200; s6 startup log clean.

## Rollback
```sh
ssh ShadowAero@192.168.76.188 'docker run --rm -v /:/host --entrypoint sh ugreen/home-assistant:2026.8.3 -c "cd /host/volume1/@appstore/com.ugreen.docker.homeassistant && cp -a docker-compose.yaml.bak-zigbee-20261122 docker-compose.yaml && cp -a docker-compose.tmpl.bak-zigbee-20261122 docker-compose.tmpl && chmod 644 docker-compose.yaml"'
ssh ShadowAero@192.168.76.188 'cd /volume1/@appstore/com.ugreen.docker.homeassistant && docker compose -p homeassistant -f docker-compose.yaml up -d'
```

## Re-apply (only if the HA app package is reinstalled / mapping disappears)
1. `scp -O tmp/ha-compose.new.yaml tmp/ha-compose.tmpl.new ShadowAero@192.168.76.188:/tmp/`
2. Same helper-container cp pattern as above (adapt backup names).
3. Compose `up -d` as above.

## Using it in Home Assistant (ZHA — recommended, zero extra deps)
Settings → Devices & Services → **+ Add integration** → **Zigbee Home Automation (ZHA)**
→ serial port: pick `/dev/ttyUSB0` (or the `/dev/serial/by-id/...` entry) → radio type
**EZSP** (auto-detects on the ZBDongle-E; baud 115200). Done — stick works on stock
firmware, **no firmware flashing required**.

Notes / gotchas:
- The same physical port must not be shared by two integrations (ZHA + Zigbee2MQTT
  simultaneously = conflict). 
- Zigbee2MQTT alternative: needs an MQTT broker (e.g. Mosquitto container; none was
  present on .188 at setup time) and Z2M `adapter: ember` (Z2M ≥ 2.x) for the ZBDongle-E.
- RF hygiene on a NAS: keep the dongle out of a powered USB-3 hub / away from spinning
  drives; a 30cm extension cable fixes most 2.4GHz interference.
- Dongle LED states: solid red at boot = normal; it is not an "error" light.

# SSH ACCESS MAP — canonical reference (updated 2026-11-18)

> Future sessions: if you need to SSH anywhere in the 192.168.76.x LAN, this is the source of
> truth alongside `C:\Users\xxtoo\.ssh\config` (aliases). **Passwords are deliberately not
> recorded here** — passwordless access works via keys for every host below.

## Kiosk Pi (Family Dashboard / calendarly — Weather Station host)
- IP **192.168.76.36**, hostname `Pi4Kiosk`, user **`xxtoon`**
- Simplest: `ssh pi4kiosk "<cmd>"`  (alias in `~/.ssh/config`, StrictHostKeyChecking accept-new)
- Explicit: `ssh -i C:/Users/xxtoo/.ssh/id_ed25519 xxtoon@192.168.76.36`
- Host identity (pin): `SHA256:Vn6s6Hs5Fq7qzUp6XNdnsduDbvkn/rf+Zd8B1PiAIdA`
- **Passwordless since 2026-11-18** — verified pubkey-only login:
  `ssh -o BatchMode=yes -o PubkeyAuthentication=yes -o PasswordAuthentication=no pi4kiosk 'hostname'` → `Pi4Kiosk`
- Key installed in `/home/xxtoon/.ssh/authorized_keys` (perms: `.ssh` 700, file 600, owner xxtoon):
  - `t2aMoteiyIjzmhOB4OXRYp9o0j8owsm6wsdptVMGxWE  xxtoo@9800x3d-nas`  ← `id_ed25519.pub` (canonical automation key)
  - `0yY7SuF1/3dsc/ofYCKguyUuUU9gIYWaxhTaLMiWeTs  xxtoo@9800x3d`      ← `id_rsa_n5pro.pub` (user's own key)
- App facts you'll want next: calendarly runs at `/opt/calendarly` (`server/src`, `client/dist`,
  `data/dashboard.sqlite`), systemd unit `calendarly.service`, kiosk = `kiosk.sh` → Chromium
  `http://127.0.0.1:3000/?mode=display`. Weather deployment state: `wave4/fd_weather/DEPLOY-NOTES.md`.
- Sudo remotely (silent file-stdin pattern since 2026-11-19 - nothing typed in chat or logs):
  - The current xxtoon sudo password lives ONLY in a local file outside this repo:
    `C:\Users\xxtoo\pinew.txt` (line 1 = password; intentionally kept for future
    sudo automation - do not move it into the repo or chat).
  - Run a remote sudo cmd silently (streams the file content straight into the sudo prompt):
    `Get-Content C:\Users\xxtoo\pinew.txt | ssh pi4kiosk "sudo -S -p '' -k true && echo SUDO_OK"`
  - Rotate the password (new pw goes through the same file; helper streams it to the Pi
    /tmp with chmod 600, feeds chpasswd via the old-pw sudo prompt, then `sudo -k` + a fresh
    sudo with the new pw to verify, then removes the remote temp file):
    `node tmp/pi-passwd-rotate2.cjs [pwfile-path]`
    (untracked tmp helper - update its OLD password constant to the then-current value before reusing it).

### How the Pi key was installed (recovery recipe if key access is ever lost)
One-time bootstrap with a live password (used plink 0.85, cached at `%TEMP%\fdw-pi\plink.exe`):
```pwsh
plink -ssh -batch -hostkey "SHA256:Vn6s6Hs5Fq7qzUp6XNdnsduDbvkn/rf+Zd8B1PiAIdA" -pw <PW> xxtoon@192.168.76.36 "mkdir -p ~/.ssh; grep -qF '<PUBKEY-STRING>' ~/.ssh/authorized_keys 2>/dev/null || echo '<PUBKEY-STRING>' >> ~/.ssh/authorized_keys; chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys"
```
- Password alternative: physical console on the kiosk display (Ctrl+Alt+F2, login xxtoon), then
  paste that same one-liner.
- If the Pi is re-provisioned or keys are wiped: rerun the above with a fresh pub key, then
  update this file + `~/.ssh/config` if the key name changes.

## NAS (docker host, family-dashboard :3080)
- IP **192.168.76.188**, user **`ShadowAero`**, passwordless via the same `id_ed25519` (t2aMote…)
- `ssh ShadowAero@192.168.76.188 "docker exec family-dashboard <cmd>"`

## Other hosts (see ~/.ssh/config for the rest)
- VPin cabinet: `nzxti7`/192.168.76.199 via `vpin_id_ed25519` (uwoOPd…)
- FlayvaThymme prod/backup + hk-kiosks via `flayva` — **DO NOT TOUCH during kiosk work.**

## House rules
- Never put passwords in repo files or notes; keys + one-time prompts only. Rotate any password
  that was shared in chat immediately after use (Pi password was rotated after bootstrap,
  and again 2026-11-19; sudo access is now supplied silently via the local pw-file pattern above).
- Deploy/verify scripts pattern: local file → base64 → `ssh <host> 'echo <b64> | base64 -d > /tmp/x && …'`.
- Related docs: `wave4/fd_weather/DEPLOY-NOTES.md` (top section = Pi deployment state).

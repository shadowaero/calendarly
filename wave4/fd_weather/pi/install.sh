#!/bin/bash
# AcuRite 433MHz via RTL-SDR v5 -> family-dashboard sensor feed (Pi 4 kiosk)
# Run on the Pi: sudo FDW_TOKEN=<token> bash install.sh
set -e
TOKEN_DEFAULT='TOKEN_GOES_HERE'
TOKEN="${FDW_TOKEN:-$TOKEN_DEFAULT}"
echo "== 1. packages =="
apt-get update -qq
apt-get install -y rtl-sdr rtl-433 || apt-get install -y rtl-sdr
rtl_433 -V || /usr/bin/rtl_433 -V || true
echo "== 2. DVB-T blacklist (frees the SDR) =="
if [ ! -f /etc/modprobe.d/rtl-sdr-blacklist.conf ]; then
  printf 'blacklist dvb_usb_rtl28xxu\nblacklist rtl2832\nblacklist rtl2830\n' > /etc/modprobe.d/rtl-sdr-blacklist.conf
fi
echo "== 3. install feeder =="
install -m 0644 rtl433.service /etc/systemd/system/rtl433.service
install -m 0644 rtl433-feed.service /etc/systemd/system/rtl433-feed.service
install -m 0755 rtl433-feed.py /usr/local/bin/rtl433-feed.py
grep -q . /etc/systemd/system/rtl433-feed.service && true
sed -i "s/FDW_TOKEN_REPLACE/$TOKEN/" /etc/systemd/system/rtl433-feed.service
echo "== 4. enable =="
systemctl daemon-reload
systemctl enable --now rtl433.service
systemctl enable --now rtl433-feed.service
sleep 3
systemctl --no-pager -l status rtl433.service | head -5
systemctl --no-pager -l status rtl433-feed.service | head -5
echo "== done; watch: journalctl -u rtl433-feed -f =="
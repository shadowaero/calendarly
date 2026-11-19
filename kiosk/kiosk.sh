#!/usr/bin/env bash
# ==============================================================================
# Raspberry Pi Kiosk Setup Script for Elo Touchscreen & Display Kiosks
# Compatible with Raspberry Pi OS (Bookworm / Bullseye, ARM64 & ARM32)
# ==============================================================================

# Target Dashboard URLs:
# Interactive Pi 4 with Elo Touchscreen: http://<SERVER_IP>:3080/ (or http://<SERVER_IP>:3080/?mode=touch)
# Display-only Pi 5:                     http://<SERVER_IP>:3080/?mode=display

SERVER_URL="http://192.168.76.188:3080" # Update with your idx6011pro server IP / hostname

# 1. Disable Screen Blanking & Sleep
xset s off
xset -dpms
xset s noblank

# 2. Hide mouse cursor on touch/display screen after 0.5 seconds of inactivity
unclutter -idle 0.5 -root &

# 3. Clean Chromium crash state to prevent "Restore Pages" bubble
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences 2>/dev/null || true
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences 2>/dev/null || true

# 4. Launch Chromium in Kiosk Mode with Elo Touchscreen Flags
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  --disable-session-crashed-bubble \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --touch-events=enabled \
  --enable-features=TouchEvents,OverlayScrollbar \
  --enable-viewport \
  --force-device-scale-factor=1 \
  --autoplay-policy=no-user-gesture-required \
  --disable-translate \
  --no-first-run \
  --fast \
  --fast-start \
  --disable-features=Translate \
  "$SERVER_URL"

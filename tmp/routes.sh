#!/bin/bash
# Inspect square-pos routes, release function, manual-verify options in deployed server
F=/home/flayva/flayva-thymme/server/index.js
echo '== square-pos routes =='
grep -n "app.post('/api/payments/square-pos" "$F"
grep -n "app.get('/api/payments/square-pos" "$F"
echo '== releaseToKitchen refs =='
grep -n "releaseToKitchen" "$F" | head -8
echo '== manual verify candidates =='
grep -nE "manualVerify|manual-verify|verifyManual|adminVerify|forceVerify" "$F" | head -10
echo '== order release fields on PAID (context 2680-2700) =='
sed -n '2680,2700p' "$F"
echo '== repush + callback regions =='
sed -n '2520,2570p' "$F"

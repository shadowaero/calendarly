echo '== verifySquarePosTransaction body =='
grep -n "verifySquarePosTransaction" /home/flayva/flayva-thymme/server/index.js | head -3
V=$(grep -n "async function verifySquarePosTransaction" /home/flayva/flayva-thymme/server/index.js | head -1 | cut -d: -f1)
sed -n "${V},$((V+45))p" /home/flayva/flayva-thymme/server/index.js
echo '== Square API reachability from Pi =='
for H in connect.squareup.com api.squareup.com; do curl -s -o /dev/null -m 8 -w \"$H: %{http_code} in %{time_total}s\\n\" https://$H/v2/payments || echo \"$H: FAILED\"; done
echo '== done =='

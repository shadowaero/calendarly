F=/home/flayva/flayva-thymme/server/index.js
echo '== posWebCallbackBase usage =='
grep -n "posWebCallbackBase" "$F" | head -6
echo '== admin/config routes =='
grep -nE "app.(post|put).*api/(admin|config|settings)" "$F" | head -8
echo '== done =='
